import { generateEmptyMatrix, fillMatrix } from "./Util";

const PHEROMONE_POW = 1;
const DIST_POW = 2;
const FADE = 0.5;

const MAX_ITER = 200;

interface Ant {
  current: number;
  cost: number;
  tour: number[];
  visited: {
    [key: number]: number;
  }
}

export class AntColony {
  private numAnts: number;
  private m: number[][];
  private size: number;
  private ants: Ant[];
  private pheromoneTrail: number[][];
  private pheromoneDelta: number[][];
  private stage: number;
  private genBest: {
    idx: number,
    cost: number
  };
  private bestCost: number;
  private bestTour: number[];

  constructor(numAnts: number, distMatrix: number[][]) {
    this.bestCost = Infinity;
    this.bestTour = [];
    this.numAnts = numAnts;
    this.m = distMatrix;
    this.size = distMatrix.length;
    this.ants = [];
    this.pheromoneTrail = generateEmptyMatrix(this.size);
    fillMatrix(this.pheromoneTrail, 1);
    this.pheromoneDelta = generateEmptyMatrix(this.size);
    this.genBest = {
      idx: -1,
      cost: Infinity
    };
    this.stage = 0;
  }

  public getBestAnt(): Ant {
    return this.ants[this.genBest.idx];
  }

  public getBestTour(): number[] {
    return this.bestTour;
  }

  public getBestCost(): number {
    return this.bestCost;
  }

  public getTrail(): number[][] {
    return this.pheromoneTrail;
  }

  public getTrailAvg(): number {
    let sum = 0;
    let count = 0;
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (j === i) continue;
        sum += this.pheromoneTrail[i][j];
        count++;
      }
    }
    return sum / count;
  }

  /**
   * Initialize ants for travelling through nodes.
   */
  public initTour(): void {
    for (let i = 0; i < this.numAnts; i++) {
      const S = Math.floor(Math.random() * this.size);
      const ant: Ant = {
        current: S,
        cost: 0,
        tour: [S],
        visited: {
          [S]: 1
        }
      }
      this.ants[i] = ant;
    }
    this.stage++;
  }

  /**
   * Each ant travels to a node they have not yet been to.
   * @returns whether the tour is complete.
   */
  public travel(): boolean {
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
   * @param {Ant} ant 
   * @returns index of chosen node.
   */
  private chooseNode(ant: Ant): number {
    let total = 0;
    for (let n = 0; n < this.size; n++) {
      if (ant.visited[n] === 1) continue;
      total += this.desirability(ant.current, n);
    }
    let next = 0;
    let iter = 0;
    while (true) {
      next++;
      iter++;
      if (next >= this.size) {
        next = 0;
      };
      if (ant.visited[next] === 1) continue;

      const weight  = this.desirability(ant.current, next) / total;
      const rand = Math.random();
      if (rand < weight || iter >= MAX_ITER) {
        break;
      };
    }
    return next;
  }

  /**
   * Wrap up the tour by calculating the best tour from every ant
   * and add *pheromones* to pheromoneDelta based on ant fitness.
   */
  public finishTour(): void {
    for (let i = 0; i < this.ants.length; i++) {
      const ant = this.ants[i];
      if (ant.cost < this.genBest.cost) {
        this.genBest.cost = ant.cost;
        this.genBest.idx = i;
      }
    }

    if (this.genBest.cost < this.bestCost) {
      this.bestCost = this.genBest.cost;
      this.bestTour = this.ants[this.genBest.idx].tour;
    };

    for (const ant of this.ants) {
      for (let i = 1; i < ant.tour.length; i++) {
        const trail = this.bestCost / ant.cost;
        this.pheromoneDelta[ant.tour[i - 1]][ant.tour[i]] += trail;
      }
    }
    this.stage = 0;

    this.updatePheromone();
  }

  /**
   * Fade pheromone trail and add new pheromones to it.
   */
  private updatePheromone(): void {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (i === j) continue;

        this.pheromoneTrail[i][j] *= FADE;
        const half = this.pheromoneDelta[i][j] / 2;
        this.pheromoneTrail[i][j] += half;
        this.pheromoneTrail[j][i] += half;
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
  desirability(startNode: number, endNode: number): number {
    const pheromone = Math.pow(this.pheromoneTrail[startNode][endNode], PHEROMONE_POW);
    const distance = Math.pow(1 / this.m[startNode][endNode], DIST_POW);
    return pheromone * distance;
  }
}