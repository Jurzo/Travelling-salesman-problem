/**
 * 
 * @param {number} length 
 * @param {number} bounds 
 * @returns an array of size "length" with points with values from "-bounds" to "bounds"
 */
export const generateNodes = (length, bounds) => {
  const nodes = [];
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
const distanceTo = (start, end) => {
  const xDiff = end[0] - start[0];
  const yDiff = end[1] - start[1];
  return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
}

/**
 * Generatea a distance lookup matrix based on input array of nodes
 * @param {number[][]} nodes 
 * @returns matrix of size nodes.length * nodes.length
 */
export const generateMatrix = (nodes) => {
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

// https://stackoverflow.com/a/20871714
/**
 * returns all permutations from input array
 * @param {[*]} inputArr 
 * @returns list of permutations
 */
export const permutator = (inputArr) => {
  let result = [];

  const permute = (arr, m = []) => {
    if (arr.length === 0) {
      result.push(m)
    } else {
      for (let i = 0; i < arr.length; i++) {
        let curr = arr.slice();
        let next = curr.splice(i, 1);
        permute(curr.slice(), m.concat(next))
      }
    }
  }

  permute(inputArr)

  return result;
}