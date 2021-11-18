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

const nodes = generateNodes(19, 30);
const mat = generateMatrix(nodes);
const colony = new AntColony(100, mat);
let start = performance.now();
let now: number;
const dynamicRes = getPathDynamic(mat, 0);
now = performance.now();
console.log(`Dynamic took ${(now - start).toFixed(2)} milliseconds`);
start = now;
outer: while (true) {
  colony.initTour();
  generation: while (true) {
    if (colony.travel()) {
      break generation;
    }
  }
  colony.finishTour();
  const antBest = colony.getBest();
  if (dynamicRes !== null) {
    const diff = (antBest.cost / dynamicRes.cost) - 1;
    if (diff < 0.05) {
      console.log(antBest, dynamicRes);
      now = performance.now();
      console.log(`Ants took ${(now - start).toFixed(2)} milliseconds`);
      break outer;
    }
  }

  //console.log(colony.pheromoneTrail);
}

/* let now = performance.now();
console.log(`Ants took ${(now-start).toFixed(2)} milliseconds`);
console.log(colony.getBest());
console.log(getPathDynamic(mat, 0)); */
/* let start = performance.now();
console.log(getPathBrute(mat, 3, mat.length));
let now = performance.now();
console.log(`Brute force took ${(now-start).toFixed(2)} milliseconds`);
start = now;
console.log(getPathDynamic(mat, 3));
console.log(`Dynamic took ${(now-start).toFixed(2)} milliseconds`); */
