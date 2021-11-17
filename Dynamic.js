const solveDynamic = (m, memo, S, N) => {
  for (let r = 3; r <= N; r++) {
    for (const subset of combinations(r, N)) {
      if (notIn(S, subset)) continue;
      for (let next = 0; next < N; next++) {
        if (next === S || notIn(next, subset)) continue;
        const state = subset ^ (1 << next);
        let minDist = Infinity;
        for (let endNode = 0; endNode < N; endNode++) {
          if (endNode === S || endNode === next || notIn(endNode, subset)) continue;
          const newDistance = memo[endNode][state] + m[endNode][next];
          if (newDistance < minDist) minDist = newDistance;
        }
        memo[next][subset] = minDist;
      }
    }
  }
}

const setup = (m, memo, S, N) => {
  for (let i = 0; i < N; i++) {
    if (i === S) continue;
    memo[i][1 << S | 1 << i] = m[S][i];
  }
}

const findMinCost = (m, memo, S, N) => {
  const endState = (1 << N) - 1;
  let minTourCost = Infinity;

  for (let endNode = 0; endNode < N; endNode++) {
    if (endNode === S) continue;
    const tourCost = memo[endNode][endState] + m[endNode][S];
    if (tourCost < minTourCost) minTourCost = tourCost;
  }

  return minTourCost;
}

const findOptimalTour = (m, memo, S, N) => {
  let lastIndex = S;
  let state = (1 << N) - 1;
  let tour = [];

  for (let i = N - 1; i >= 1; i--) {
    let index = -1;
    for (let j = 0; j < N; j++) {
      if (j === S || notIn(j, state)) continue;
      if (index === -1) index = j;
      const prevDist = memo[index][state] + m[index][lastIndex];
      const newDist = memo[j][state] + m[j][lastIndex];
      if (newDist < prevDist) index = j;
    }

    tour[i] = index;
    state ^= (1 << index);
    lastIndex = index;
  }

  tour[0] = S;
  tour[N] = S;
  return tour;
}

const combinations = (r, N) => {
  const subsets = [];
  genCombinations(0, 0, r, N, subsets);
  return subsets;
}

const genCombinations = (set, at, r, N, subsets) => {
  const elementsLeft = N - at;
  if (elementsLeft < r) return;

  // r bits set to 1 -> push to array
  if (r == 0) {
    subsets.push(set);
  } else {
    for (let i = at; i < N; i++) {
      set ^= (1 << i);
      genCombinations(set, i + 1, r - 1, N, subsets);
      set ^= (1 << i);
    }
  }
}

const notIn = (i, subset) => {
  return ((1 << i) & subset) === 0;
}

export const getPathDynamic = (m, S) => {
  const length = m.length;
  const memo = [];
  for (let i = 0; i < length; i++) {
    memo.push([]);
  }
  setup(m, memo, S, length);
  solveDynamic(m, memo, S, length);

  const cost = findMinCost(m, memo, S, length);
  const path = findOptimalTour(m, memo, S, length);
  return {
    cost: cost,
    route: path
  }
}