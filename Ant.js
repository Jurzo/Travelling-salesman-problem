import { generateEmptyMatrix, generateMatrix, generateNodes } from "./Util.js";

const PH = 1.0;
const DST = 1.0;

export class AntColony {
  constructor(numAnts, distMatrix) {
    this.numAnts = numAnts;
    this.m = distMatrix;
    this.size = distMatrix.length;
    this.ants = [];
    this.pheromoneTrail = generateMatrix(generateNodes(this.size, 1));
    this.pheromoneDelta = generateEmptyMatrix(this.size);
    this.best = {
      idx: -1,
      cost: Infinity
    };
    this.stage = 0;
  }

  getBest() {
    return this.ants[this.best.idx];
  }

  /**
   * Initialize ants for travelling through nodes.
   */
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

  /**
   * Each ant travels to a node they have not yet been to.
   * @returns whether the tour is complete.
   */
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

  /**
   * Choose a node for given ant it has not been to yet
   * based on the desirability of the node.
   * @param {*} ant 
   * @returns index of chosen node.
   */
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

  /**
   * Wrap up the tour by calculating the best tour from every ant
   * and add *pheromones* to pheromoneDelta based on ant fitness.
   */
  finishTour() {
    for (let i = 0; i < this.ants.length; i++) {
      const ant = this.ants[i];
      if (ant.cost < this.best.cost) {
        this.best.cost = ant.cost;
        this.best.idx = i;
      }
    }

    for (const ant of this.ants) {
      for (let i = 1; i < ant.tour.length; i++) {
        const trail = this.best.cost / ant.cost;
        this.pheromoneDelta[ant.tour[i - 1]][ant.tour[i]] += (trail * trail) / this.ants.length;
      }
    }
    this.stage = 0;
  }

  /**
   * Fade pheromone trail and add new pheromones to it.
   */
  updatePheromone() {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (i === j) continue;

        this.pheromoneTrail[i][j] *= 0.5;
        this.pheromoneTrail[i][j] += this.pheromoneDelta[i][j];
        this.pheromoneDelta[i][j] = 0;

      }
    }
  }

  /**
   * Calculates *desirability* based on distance to target node
   * and the strength of the pheromone trail.
   * @param {number} startNode 
   * @param {number} endNode 
   * @returns *desirability*
   */
  desirability(startNode, endNode) {
    const pheromone = Math.pow(this.pheromoneTrail[startNode][endNode], PH);
    const distance = Math.pow(1 / this.m[startNode][endNode], DST);
    return pheromone * distance;
  }

}