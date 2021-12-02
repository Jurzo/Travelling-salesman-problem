import { AntColony } from "../tsp/Ant";
import { BruteForceSolver, getPathBrute } from "../tsp/Brute";
import { getPathDynamic } from "../tsp/Dynamic";
import { generateMatrix, generateNodes, getMatrixPaths, getMatrixWeights, nodesToLines } from "../tsp/Util";
import { Renderer } from "../util/Renderer";

const SCALE = 20;

export class Visualizer {
  private size: number;
  private nodes: [number, number][];
  private mat: number[][];
  private matPaths: [number, number][];
  private colony: AntColony;
  private renderer: Renderer;
  private running: boolean;

  private bruteSolver: BruteForceSolver;
  private incrementBrute: boolean;
  private bruteSolved: boolean;

  private dynamic: boolean;

  private routeVAO: WebGLVertexArrayObject;
  private pheromoneVAO: WebGLVertexArrayObject;
  private bruteVAO: WebGLVertexArrayObject;
  private dynamicVAO: WebGLVertexArrayObject;

  constructor(renderer: Renderer, amount: number, increment: boolean, dynamic: boolean) {
    this.size = amount;
    this.nodes = generateNodes(amount, SCALE);
    this.mat = generateMatrix(this.nodes);
    this.matPaths = getMatrixPaths(this.mat);

    this.colony = new AntColony(40, this.mat);
    this.bruteSolver = new BruteForceSolver(this.mat, amount);
    this.incrementBrute = increment;
    this.bruteSolved = false;

    this.dynamic = dynamic;

    this.renderer = renderer;
    this.running = false;

    const verts = nodesToLines(this.nodes, SCALE);
    this.routeVAO = this.renderer.genVAO(verts);
    this.pheromoneVAO = this.renderer.genVAO(verts);
    this.bruteVAO = this.renderer.genVAO(verts);
    this.dynamicVAO = this.renderer.genVAO(verts);
  }

  public toggle(): void {
    if ((this.dynamic && this.size >= 23) || (!this.incrementBrute && this.size >= 12)) {
      const resp = window.confirm(`I do not recommend running dynamic solver above 22 cities and brute force non incrementally above 11. Run the solver?`);
      if (!resp) return;
    }

    this.running = !this.running;
    if (this.running) {
      this.loop();
      (!this.bruteSolved && !this.incrementBrute) && this.bruteSolve();
    }
  }

  private bruteSolve() {
    const { tour, cost } = getPathBrute(this.mat, 0, this.size);
    this.renderer.genIndexData(this.bruteVAO, tour);
  }

  private loop = (): void => {
    let start = performance.now();
    let end = start;

    if (this.incrementBrute) {
      while (end - start <= 1 / 60000) {
        this.bruteSolver.next();
        end = performance.now();
      }
      this.renderer.genIndexData(this.bruteVAO, this.bruteSolver.bestTour.tour);
    }

    this.colony.initTour();
    while (true) {
      if (this.colony.travel()) break;
    }
    this.colony.finishTour();
    const tour = this.colony.getBestTour();
    const trail = getMatrixWeights(this.colony.getTrail(), this.matPaths);

    this.renderer.genIndexData(this.routeVAO, tour);
    this.renderer.genIndexData(this.pheromoneVAO, trail.indices);
    this.renderer.clear();
    this.renderer.drawRoute(this.routeVAO, tour.length, [0.5, 0.5], 0.5);
    this.renderer.drawPheromones(this.pheromoneVAO, trail.indices.length, trail.weights, [-0.5, 0.5], 0.5);
    this.renderer.drawRoute(this.bruteVAO, tour.length, [-0.5, -0.5], 0.5);

    /* this.renderer.genRouteVAO(nodesToLines(this.nodes, SCALE), this.colony.getBestTour());
    this.renderer.setWeights(trail.weights);
    this.renderer.genTrailVAO(nodesToLines(this.nodes, SCALE), trail.indices);
    this.renderer.draw(); */
    this.running && requestAnimationFrame(this.loop.bind(this));
    console.log(this.colony.getBestCost());
  }
}

export default Visualizer;