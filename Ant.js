import { generateMatrix, generateNodes } from "./Util.js";

export class AntColony {
  constructor(numAnts, distMatrix) {
    this.numAnts = numAnts;
    this.m = distMatrix;
    this.size = distMatrix.length;
    this.ants = [];
    this.pheromoneTrail = generateMatrix(generateNodes(this.size, 1));
  }

  initTour() {
    for (let i = 0; i < this.numAnts; i++) {
      if (!this.ants[i]) this.ants[i] = {};
      const ant = this.ants[i];
      const S = Math.floor(Math.random() * this.size);
      ant.current = S;
      ant.visited = {};
      ant.visited[S] = 1;
      ant.tour = [];
      ant.tour[0] = S;
      ant.cost = 0;
    }
  }

  generateTours() {

  }

}