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
  private iterating: boolean;

  private colony: AntColony;
  private colonyTotalTime: number;

  private bruteSolver: BruteForceSolver;
  private bruteTotalTime: number;

  private incrementBrute: boolean;
  private bruteSolved: boolean;

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

  constructor(renderer: Renderer, amount: number, increment: boolean, setResults: (r: Results) => void, setLoops: (x: number) => void) {
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

    this.dynamicSolved = false;

    this.renderer = renderer;
    this.iterating = false;

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

    this.loop();
  }

  public toggle(): void {
    this.iterating = !this.iterating;
  }

  public setOptions(amount: number, increment: boolean): void {
    if (amount !== this.size) {
      this.dynamicSolved = false;
      this.bruteSolved = false;
      this.size = amount;
      this.nodes = generateNodes(amount, SCALE);
      this.mat = generateMatrix(this.nodes);
      this.matPaths = getMatrixPaths(this.mat);

      this.colony = new AntColony(40, this.mat);
      this.colonyTotalTime = 0;

      this.bruteSolver = new BruteForceSolver(this.mat, amount);
      this.bruteTotalTime = 0;

      this.bruteSolved = false;

      const verts = nodesToLines(this.nodes, SCALE);
      this.routeVAO = this.renderer.genVAO(verts);
      this.pheromoneVAO = this.renderer.genVAO(verts);
      this.bruteVAO = this.renderer.genVAO(verts);
      this.dynamicVAO = this.renderer.genVAO(verts);

      this.results = {
        bruteforce: null,
        dynamic: null,
        ants: null
      };
      this.setResults(this.results);
    }
    this.incrementBrute = increment;
  }

  private addResult(newResult: Result): void {
    this.results[newResult.type] = newResult;
  }

  private updateResults(): void {
    this.setResults(this.results);
    this.setLoops(this.loops);
  }

  public bruteSolve(): void {
    if (this.bruteSolved) return;
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

  public dynamicSolve(): void {
    if (this.dynamicSolved) return;
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
    this.renderer.genIndexData(this.dynamicVAO, tour);
  }

  private bruteIterate(): void {
    let start = performance.now();
    let end = start;
    let diff = 0;
    let iteration = 0;
    while (diff <= 1 / 60000 && !this.bruteSolved) {
      const { done } = this.bruteSolver.next();
      done && (this.bruteSolved = true);
      end = performance.now();
      diff = end - start;
      iteration++;
    }
    this.bruteTotalTime += (end - start) * 0.001;
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

  private antsIterate(): void {
    let start = performance.now();
    let end = start;
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
  }

  private loop = (): void => {
    this.loops++;

    if (this.incrementBrute && !this.bruteSolved && this.iterating) {
      this.bruteIterate();
    }

    if (this.iterating) {
      this.antsIterate();
    }
    
    const tour = this.colony.getBestTour();
    const trail = getMatrixWeights(this.colony.getTrail(), this.matPaths);

    this.renderer.genIndexData(this.routeVAO, tour);
    this.renderer.genIndexData(this.pheromoneVAO, trail.indices);

    this.renderer.clear();
    this.renderer.drawPheromones(this.pheromoneVAO, trail.indices.length, trail.weights, [-0.5, 0.5], 0.45);
    this.renderer.drawRoute(this.routeVAO, tour.length, [0.5, 0.5], 0.45, [0, 0, 1]);

    this.results['bruteforce'] && this.renderer.drawRoute(this.bruteVAO, this.size + 1, [-0.5, -0.5], 0.45, [1, 0, 0]);
    this.dynamicSolved && this.renderer.drawRoute(this.dynamicVAO, this.size + 1, [0.5, -0.5], 0.45, [0, 1, 0]);

    const now = performance.now();
    if (now - this.lastUpdate >= 100) {
      this.updateResults();
      this.lastUpdate = now;
    }
    requestAnimationFrame(this.loop.bind(this));
  }
}

export default Solver;