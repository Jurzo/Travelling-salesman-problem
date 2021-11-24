/**
 * 
 * @param {number} length 
 * @param {number} bounds 
 * @returns an array of size "length" with points with values from "-bounds" to "bounds"
 */
export const generateNodes = (length: number, bounds: number): [number, number][] => {
  const nodes: [number, number][] = [];
  for (let i = 0; i < length; i++) {
    const x = Math.random() * bounds * 2 - bounds;
    const y = Math.random() * bounds * 2 - bounds;
    nodes.push([x, y]);
  }
  return nodes;
}

/**
 * 
 * @param {[number, number]} start 
 * @param {[number, number]} end 
 * @returns distance between start and end
 */
const distanceTo = (start: [number, number], end: [number, number]): number => {
  const xDiff = end[0] - start[0];
  const yDiff = end[1] - start[1];
  return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
}

/**
 * Generate a a distance lookup matrix based on input array of nodes
 * @param {[number, number][]} nodes 
 * @returns matrix of size nodes.length * nodes.length
 */
export const generateMatrix = (nodes: [number, number][]): number[][] => {
  const size = nodes.length;
  const matrix = [];
  for (let i = 0; i < size; i++) {
    const row = [];
    for (let j = 0; j < size; j++) {
      if (i === j) {
        row.push(0);
      } else row.push(distanceTo(nodes[i], nodes[j]));
    }
    matrix.push(row);
  }
  return matrix;
}

export const generateEmptyMatrix = (sideLength: number): number[][] => {
  const matrix = [];
  for (let i = 0; i < sideLength; i++) {
    const row = [];
    for (let j = 0; j < sideLength; j++) {
      row.push(0);
    }
    matrix.push(row);
  }
  return matrix;
}

export const fillMatrix = (matrix: number[][], num: number): void => {
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix.length; j++) {
      if (i === j) continue;
      matrix[i][j] = num;
    }
  }
}

// https://stackoverflow.com/a/20871714
/**
 * returns all permutations from input array
 * @param {number[]} inputArr 
 * @returns list of permutations
 */
export const permutator = (inputArr: number[]): number[][] => {
  let result: number[][] = [];

  const permute = (arr: any[], m: any[] = []) => {
    if (arr.length === 0) {
      result.push(m);
    } else {
      for (let i = 0; i < arr.length; i++) {
        let curr = arr.slice();
        let next = curr.splice(i, 1);
        permute(curr.slice(), m.concat(next));
      }
    }
  }

  permute(inputArr);

  return result;
}

export const nodesToLines = (nodes: [number, number][], scale: number): number[] => {
  const arr: number[] = [];
  nodes.forEach(node => {
    arr.push(node[0] / scale);
    arr.push(node[1] / scale);
  });
  return arr;
}

export const getMatrixWeights =
(m: number[][], pairs: [number, number][]): {
  weights: number[],
  indices: number[]
} => {
  const weights: number[] = [];
  const indices: number[] = [];
  let max = 0;
  for (const pair of pairs) {
    const sum = m[pair[0]][pair[1]] + m[pair[1]][pair[0]];
    if (sum > max) max = sum;
    weights.push(sum);
    indices.push(...pair);
  }
  return {
    weights: scaleArray(weights, 1 / max),
    indices: indices
  };
}

export const getMatrixPaths = (m: number[][]): [number, number][] => {
  const nodes: [number, number][] = [];
  const length = m.length;

  for (let i = 0; i < length; i++) {
    for (let j = i + 1; j < length; j++) {
      nodes.push([i, j]);
    }
  }

  return nodes;
}

const scaleArray = (arr: number[], scale: number): number[] => {
  return arr.map(num => num * scale);
}