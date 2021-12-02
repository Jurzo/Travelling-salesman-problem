import { AntColony } from "../tsp/Ant";
import { BruteForceSolver } from "../tsp/Brute";
import { getPathDynamic } from "../tsp/Dynamic";
import { generateMatrix, generateNodes, getMatrixPaths, getMatrixWeights, nodesToLines } from "../tsp/Util";
import { Renderer } from "../util/Renderer";

const SCALE = 20;

export class Visualizer {
  private nodes: [number, number][];
  private mat: number[][];
  private matPaths: [number,number][];
  private colony: AntColony;
  private renderer: Renderer;
  private running: boolean;
  private bruteSolver: BruteForceSolver;

  private routeVAO: WebGLVertexArrayObject;
  private pheromoneVAO: WebGLVertexArrayObject;
  private bruteVAO: WebGLVertexArrayObject;

  constructor(renderer: Renderer, amount: number) {
    this.nodes = generateNodes(amount, SCALE);
    this.mat = generateMatrix(this.nodes);
    this.matPaths = getMatrixPaths(this.mat);
    this.colony = new AntColony(40, this.mat);
    this.bruteSolver = new BruteForceSolver(this.mat, amount);
    this.renderer = renderer;
    this.running = false;

    const verts = nodesToLines(this.nodes, SCALE);
    this.routeVAO = this.renderer.genVAO(verts);
    this.pheromoneVAO = this.renderer.genVAO(verts);
    this.bruteVAO = this.renderer.genVAO(verts);
  }

  toggle(state: boolean): void {
    this.running = state;
    state && this.loop();
  }

  loop = (): void => {
      this.colony.initTour();
      let start = performance.now();
      while (true) {
        if (this.colony.travel()) break;
      }
      this.colony.finishTour();
      let end = performance.now();
      let diff = end - start;
      const tour = this.colony.getBestTour();
      const trail = getMatrixWeights(this.colony.getTrail(),  this.matPaths);

      start = performance.now();
      while (end - start <= diff) {
        this.bruteSolver.next();
        end = performance.now();
      }

      this.renderer.genIndexData(this.routeVAO, tour);
      this.renderer.genIndexData(this.pheromoneVAO, trail.indices);
      this.renderer.genIndexData(this.bruteVAO, this.bruteSolver.bestTour.tour);
      this.renderer.clear();
      this.renderer.drawRoute(this.routeVAO, tour.length, [0.5, 0.5], 0.5);
      this.renderer.drawPheromones(this.pheromoneVAO, trail.indices.length, trail.weights, [-0.5, 0.5], 0.5);
      this.renderer.drawRoute(this.bruteVAO, tour.length, [-0.5, -0.5], 0.5);

      /* this.renderer.genRouteVAO(nodesToLines(this.nodes, SCALE), this.colony.getBestTour());
      this.renderer.setWeights(trail.weights);
      this.renderer.genTrailVAO(nodesToLines(this.nodes, SCALE), trail.indices);
      this.renderer.draw(); */
      this.running && requestAnimationFrame(this.loop.bind( this ));
      console.log(this.bruteSolver.next().value);
      console.log(this.colony.getBestCost());
    }
}

export default Visualizer;