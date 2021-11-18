import { permutator } from "./Util.js";


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