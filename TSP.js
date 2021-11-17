import { getPathDynamic } from "./Dynamic.js";
import { getPathBrute } from "./Brute.js";
import { generateMatrix, generateNodes } from "./Util.js";
import { AntColony } from "./Ant.js";
//const { performance } = require('perf_hooks');


// distance matrix for 4 nodes
const distMat = [
  //0   1   2   3
  [0, 4, 1, 9], // 0
  [9, 0, 6, 11], // 1
  [4, 1, 0, 2], // 2
  [6, 5, -4, 0], // 3
];

const nodes = generateNodes(10, 30);
const mat = generateMatrix(nodes);
const colony = new AntColony(10, mat);
colony.initTour();
/* let start = performance.now();
console.log(getPathBrute(mat, 3, mat.length));
let now = performance.now();
console.log(`Brute force took ${(now-start).toFixed(2)} milliseconds`);
start = now;
console.log(getPathDynamic(mat, 3));
now = performance.now();
console.log(`Dynamic took ${(now-start).toFixed(2)} milliseconds`); */
