import { permutator } from "./Util.js";


export const getPathBrute = (m, S, N) => {
  const nodes = [];
  for (let i = 0; i < N; i++) {
    if (i === S) continue;
    nodes.push(i);
  }

  const routes = permutator(nodes);
  let best;
  let minDist = Infinity;

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

const getDist = (m, route) => {
  let dist = 0;
  for (let i = 0; i < route.length - 1; i++) {
    dist += m[route[i]][route[i + 1]];
  }
  return dist;
}