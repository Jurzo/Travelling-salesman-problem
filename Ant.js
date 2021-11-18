import { generateMatrix, generateNodes } from "./Util.js";

const PH = 1.0;
const DST = 1.0;

export class AntColony {
  constructor(numAnts, distMatrix) {
    this.numAnts = numAnts;
    this.m = distMatrix;
    this.size = distMatrix.length;
    this.ants = [];
    this.pheromoneTrail = generateMatrix(generateNodes(this.size, 1));
    this.stage = 0;
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
    this.stage++;
  }

  travel() {
    if (this.stage < this.size) {
      for (const ant of this.ants) {
        const next = this.chooseNode(ant);
        ant.cost += this.m[ant.current][next];
        ant.current = next;
        ant.visited[next] = 1;
        ant.tour.push(next);
      }
      this.stage++;
      return false;
    } else {
      for (const ant of this.ants) {
        const next = ant.tour[0];
        ant.cost += this.m[ant.current][next];
        ant.current = next;
        ant.visited[next] = 1;
        ant.tour.push(next);
      }
      return true;
    }
  }

  chooseNode(ant) {
    let total = 0;
    for (let n = 0; n < this.size; n++) {
      if (ant.visited[n] === 1) continue;
      total += this.desirability(ant.current, n);
    }
    let next = 0;
    while (true) {
      next++;
      if (next >= this.size) {
        next = 0;
      };
      if (ant.visited[next] === 1) continue;

      const weight = this.desirability(ant.current, next);
      const rand = Math.random();
      if (rand < weight) break;
    }

    return next;
  }

  desirability(startNode, endNode) {
    const pheromone = Math.pow( this.pheromoneTrail[startNode][endNode], PH );
    const distance = Math.pow( 1 / this.m[startNode][endNode], DST );
    return pheromone * distance;
  }

}