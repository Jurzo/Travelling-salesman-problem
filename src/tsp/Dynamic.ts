interface Memo {
  [key: number]: number
}

/**
 * Solves the tour and modifies memo with distance values for
 * subsets.
 * @param {number[][]} m 
 * @param {Memo[]} memo 
 * @param {number} S 
 * @param {number} N 
 */
const solveDynamic = (m: number[][], memo: Memo[], S: number, N: number): void => {
  // start from 3 due to setup solving all subsets up to size 2
  for (let r = 3; r <= N; r++) {
    // generate all subsets of size r
    // with N possible bit flags
    for (const subset of combinations(r, N)) {
      if (notIn(S, subset)) continue;
      for (let next = 0; next < N; next++) {
        if (next === S || notIn(next, subset)) continue;
        // get the smaller subset without next
        const state = subset ^ (1 << next);
        let minDist = Infinity;
        // check for the node with the best path to next
        for (let endNode = 0; endNode < N; endNode++) {
          if (endNode === S || endNode === next || notIn(endNode, subset)) continue;
          const newDistance = memo[endNode][state] + m[endNode][next];
          if (newDistance < minDist) minDist = newDistance;
        }
        // store the distance shortest distance to next 
        // with specified subset
        memo[next][subset] = minDist;
      }
    }
  }
}

/**
 * Set the initial cost values from start for
 * subpaths of length 2
 * @param {number[][]} m 
 * @param {Memo[]} memo 
 * @param {number} S 
 * @param {number} N 
 */
const setup = (m: number[][], memo: Memo[], S: number, N: number): void => {
  for (let i = 0; i < N; i++) {
    if (i === S) continue;
    // setting the bitflags for S and i
    memo[i][(1 << S) | (1 << i)] = m[S][i];
  }
}

/**
 * Calculates the minimum cost to complete tour. Requires the
 * tour to be solved first.
 * @param {number[][]} m 
 * @param {Memo[]} memo 
 * @param {number} S 
 * @param {number} N 
 * @returns the minimal cost to complete tour
 */
const findMinCost = (m: number[][], memo: Memo[], S: number, N: number): number => {
  // creates an integer with all N bits set to 1
  const endState = (1 << N) - 1;
  let minTourCost = Infinity;

  for (let endNode = 0; endNode < N; endNode++) {
    if (endNode === S) continue;
    const tourCost = memo[endNode][endState] + m[endNode][S];
    if (tourCost < minTourCost) minTourCost = tourCost;
  }

  return minTourCost;
}

/**
 * Generates the optimal tour. Requires the tour to be solved first.
 * @param {number[][]} m 
 * @param {Memo[]} memo 
 * @param {number} S 
 * @param {number} N 
 * @returns the tour with the minimal cost.
 */
const findOptimalTour = (m: number[][], memo: Memo[], S: number, N: number): number[] => {
  let lastIndex = S;
  // creates an integer with all N bits set to 1
  let state = (1 << N) - 1;
  let tour: number[] = [];

  for (let i = N - 1; i >= 1; i--) {
    let index = -1;
    // loop over all candidates for the next node
    for (let j = 0; j < N; j++) {
      // skip if j equals start node or j is not part of state (available nodes)
      if (j === S || notIn(j, state)) continue;
      if (index === -1) index = j;
      // get the cost of the previous best candidate
      const prevDist = memo[index][state] + m[index][lastIndex];
      // get the cost of the current candidate
      const newDist = memo[j][state] + m[j][lastIndex];
      // if new is better, set it as new best candidate
      if (newDist < prevDist) index = j;
    }

    // set the best candidate in tour and remove it from state to
    // not choose it again later
    tour[i] = index;
    state ^= (1 << index);
    lastIndex = index;
  }

  // add starting node as the first and last node for the tour
  tour[0] = S;
  tour[N] = S;
  return tour;
}

/**
 * 
 * @param {number} r 
 * @param {number} N 
 * @returns a list of all integer combinations that have **r** bit flags set from **N** possibilities
 */
const combinations = (r: number, N: number): number[] => {
  const subsets: number[] = [];
  genCombinations(0, 0, r, N, subsets);
  return subsets;
}

const genCombinations = (set: number, at: number, r: number, N: number, subsets: number[]): number | void => {
  const elementsLeft = N - at;
  if (elementsLeft < r) return;

  // r bits set to 1 -> push to array
  if (r === 0) {
    subsets.push(set);
  } else {
    for (let i = at; i < N; i++) {
      set ^= (1 << i);
      genCombinations(set, i + 1, r - 1, N, subsets);
      set ^= (1 << i);
    }
  }
}

/**
 * 
 * @param {number} i 
 * @param {number} subset 
 * @returns whether the **i**:th bit is set in **subset**.
 */
const notIn = (i: number, subset: number): boolean => {
  return ((1 << i) & subset) === 0;
}

export const getPathDynamic =
  (m: number[][], S: number): {
    cost: number,
    route: number[]
  } | null => {
    const length = m.length;
    const memo: Memo[] = [];
    for (let i = 0; i < length; i++) {
      memo.push({});
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