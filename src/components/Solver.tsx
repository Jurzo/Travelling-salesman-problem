import { AntColony } from "../tsp/Ant";
import { BruteForceSolver, getPathBrute } from "../tsp/Brute";
import { getPathDynamic } from "../tsp/Dynamic";
import { generateMatrix, generateNodes, getMatrixPaths, getMatrixWeights, nodesToLines } from "../tsp/Util";
import { Renderer } from "../util/Renderer";

export interface Result {
  type: string;
  time: number;
  cost: number;
  tour: number[];
  iteration: number;
}

export interface Results {
  [key: string]: Result | null;
}

const SCALE = 20;

export class Solver {
  private size: number;
  private nodes: [number, number][];
  private mat: number[][];
  private matPaths: [number, number][];
  private renderer: Renderer;
  private running: boolean;

  private colony: AntColony;
  private colonyTotalTime: number;

  private bruteSolver: BruteForceSolver;
  private bruteTotalTime: number;

  private incrementBrute: boolean;
  private bruteSolved: boolean;

  private dynamic: boolean;
  private dynamicSolved: boolean;

  private routeVAO: WebGLVertexArrayObject;
  private pheromoneVAO: WebGLVertexArrayObject;
  private bruteVAO: WebGLVertexArrayObject;
  private dynamicVAO: WebGLVertexArrayObject;

  private results: Results;
  private lastUpdate: number;

  private setResults: (r: Results) => void;
  private setLoops: (x: number) => void;
  private loops: number;

  constructor(renderer: Renderer, amount: number, increment: boolean, dynamic: boolean, setResults: (r: Results) => void, setLoops: (x: number) => void) {
    this.size = amount;
    this.nodes = generateNodes(amount, SCALE);
    this.mat = generateMatrix(this.nodes);
    this.matPaths = getMatrixPaths(this.mat);

    this.colony = new AntColony(40, this.mat);
    this.colonyTotalTime = 0;

    this.bruteSolver = new BruteForceSolver(this.mat, amount);
    this.incrementBrute = increment;
    this.bruteTotalTime = 0;

    this.bruteSolved = false;

    this.dynamic = dynamic;
    this.dynamicSolved = false;

    this.renderer = renderer;
    this.running = false;

    const verts = nodesToLines(this.nodes, SCALE);
    this.routeVAO = this.renderer.genVAO(verts);
    this.pheromoneVAO = this.renderer.genVAO(verts);
    this.bruteVAO = this.renderer.genVAO(verts);
    this.dynamicVAO = this.renderer.genVAO(verts);

    this.setResults = setResults;
    this.results = {
      bruteforce: null,
      dynamic: null,
      ants: null
    };
    this.lastUpdate = performance.now();
    this.setLoops = setLoops;
    this.loops = 0;
  }

  public toggle(): void {
    this.running = !this.running;
    if (this.running) {
      (!this.dynamicSolved && this.dynamic) && this.dynamicSolve();
      (!this.bruteSolved && !this.incrementBrute) && this.bruteSolve();
      this.loop();
    }
  }

  public setOptions(amount: number, increment: boolean, dynamic: boolean): void {
    if (amount !== this.size) {
      this.size = amount;
      this.nodes = generateNodes(amount, SCALE);
      this.mat = generateMatrix(this.nodes);
      this.matPaths = getMatrixPaths(this.mat);

      this.colony = new AntColony(40, this.mat);
      this.colonyTotalTime = 0;

      this.bruteSolver = new BruteForceSolver(this.mat, amount);
      this.bruteTotalTime = 0;

      this.bruteSolved = false;

      this.dynamicSolved = false;

      const verts = nodesToLines(this.nodes, SCALE);
      this.routeVAO = this.renderer.genVAO(verts);
      this.pheromoneVAO = this.renderer.genVAO(verts);
      this.bruteVAO = this.renderer.genVAO(verts);
      this.dynamicVAO = this.renderer.genVAO(verts);
    }
    this.dynamic = dynamic;
    this.incrementBrute = increment;
  }

  private addResult(newResult: Result): void {
    this.results[newResult.type] = newResult;
  }

  private updateResults(): void {
    this.setResults(this.results);
    this.setLoops(this.loops);
  }

  private bruteSolve() {
    const start = performance.now();
    const { tour, cost, iterations } = getPathBrute(this.mat, 0, this.size);
    const time = (performance.now() - start) * 0.001;
    this.renderer.genIndexData(this.bruteVAO, tour);
    this.addResult({
      type: 'bruteforce',
      time: time,
      cost: cost,
      tour: tour,
      iteration: iterations
    });
    this.bruteSolved = true;
  }

  private dynamicSolve() {
    const start = performance.now();
    const { tour, cost } = getPathDynamic(this.mat, 0);
    const time = (performance.now() - start) * 0.001;
    this.renderer.genIndexData(this.dynamicVAO, tour);
    this.addResult({
      type: 'dynamic',
      time: time,
      cost: cost,
      tour: tour,
      iteration: 1
    });
    this.dynamicSolved = true;
  }

  private loop = (): void => {
    let start = performance.now();
    let end = start;
    this.loops++;

    if (this.incrementBrute && !this.bruteSolved) {
      let diff = 0;
      while (diff <= 1 / 60000) {
        const { done } = this.bruteSolver.next();
        done && (this.bruteSolved = true);
        end = performance.now();
        diff = end - start;
      }
      this.bruteTotalTime += (end - start) * 0.001;
      let iteration = 1;
      if (this.results['bruteforce']) {
        iteration += this.results['bruteforce'].iteration;
      }
      this.addResult({
        type: 'bruteforce',
        time: this.bruteTotalTime,
        cost: this.bruteSolver.bestTour.dist,
        tour: this.bruteSolver.bestTour.tour,
        iteration: iteration
      });
      this.renderer.genIndexData(this.bruteVAO, this.bruteSolver.bestTour.tour);
    }

    start = performance.now();
    this.colony.initTour();
    while (true) {
      if (this.colony.travel()) break;
    }
    this.colony.finishTour();
    end = performance.now();
    this.colonyTotalTime += (end - start) * 0.001;
    const tour = this.colony.getBestTour();
    let iteration = 1;
    if (this.results['ants']) {
      iteration += this.results['ants'].iteration;
    }
    this.addResult({
      type: 'ants',
      time: this.colonyTotalTime,
      cost: this.colony.getBestCost(),
      tour: tour,
      iteration: iteration
    });
    const trail = getMatrixWeights(this.colony.getTrail(), this.matPaths);

    this.renderer.genIndexData(this.routeVAO, tour);
    this.renderer.genIndexData(this.pheromoneVAO, trail.indices);

    this.renderer.clear();
    this.renderer.drawPheromones(this.pheromoneVAO, trail.indices.length, trail.weights, [-0.5, 0.5], 0.5);
    this.renderer.drawRoute(this.routeVAO, tour.length, [0.5, 0.5], 0.5, [0, 0, 1]);
    this.renderer.drawRoute(this.bruteVAO, tour.length, [-0.5, -0.5], 0.5, [1, 0, 0]);
    this.dynamic && this.renderer.drawRoute(this.dynamicVAO, tour.length, [0.5, -0.5], 0.5, [0, 1, 0]);

    const now = performance.now();
    if (now - this.lastUpdate >= 100) {
      this.updateResults();
      this.lastUpdate = now;
    }
    this.running && requestAnimationFrame(this.loop.bind(this));
  }
}

export default Solver;