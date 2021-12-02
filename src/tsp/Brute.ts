import { permutator } from "./Util";
import { PermutationIterator } from "../util/PermutationIterator";

interface TourResult {
  dist: number;
  tour: number[];
  current: number;
  last: number;
}

export class BruteForceSolver implements Iterator<TourResult>{
  private m: number[][];
  private iterator: PermutationIterator<number>;
  private best: TourResult;

  constructor(m: number[][], N: number) {
    this.m = m;
    const nodes: number[] = [];
    let last = 1;
    for (let i = 1; i < N; i++) {
      nodes.push(i);
      last *= i;
    }
    this.iterator = new PermutationIterator<number>(nodes);
    this.best = {
      dist: Infinity,
      tour: [],
      current: 0,
      last: last
    };
  }

  get bestTour(): TourResult {
    return this.best;
  }

  public next(): IteratorResult<TourResult, TourResult> {
    const { value, done } = this.iterator.next();
    if (done) {
      return {
        value: this.best,
        done: done
      }
    }
    this.best.current++;
    const tour = this.addStart(value);
    const dist = getDist(this.m, tour);
    if (dist < this.best.dist) {
      this.best.dist = dist;
      this.best.tour = tour;
    }
    return {
      value: this.best,
      done: false
    }
  }

  private addStart(tour: number[]): number[] {
    const complete: number[] = [];
    complete.push(0);
    tour.forEach(node => complete.push(node));
    complete.push(0);
    return complete;
  }
}

export const getPathBrute =
  (m: number[][], S: number, N: number): {
    cost: number,
    route: number[]
  } => {
    const nodes: number[] = [];
    for (let i = 0; i < N; i++) {
      if (i === S) continue;
      nodes.push(i);
    }

    const routes: number[][] = permutator(nodes);
    let best: number[] = [];
    let minDist: number = Infinity;

    for (const route of routes) {
      route.unshift(S);
      route.push(S);
      const dist = getDist(m, route);
      if (dist < minDist) {
        minDist = dist;
        best = route;
      }
    }

    return {
      cost: minDist,
      route: best
    };
  }

const getDist = (m: number[][], route: number[]): number => {
  let dist = 0;
  for (let i = 0; i < route.length - 1; i++) {
    dist += m[route[i]][route[i + 1]];
  }
  return dist;
}