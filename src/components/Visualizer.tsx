import { useEffect, useRef } from "react";
import { AntColony } from "../tsp/Ant";
import { getPathDynamic } from "../tsp/Dynamic";
import { generateMatrix, generateNodes, getMatrixPaths, getMatrixWeights, nodesToLines } from "../tsp/Util";
import { Engine } from "./Engine";

const SCALE = 1;

interface Size {
  width: number,
  height: number,
}

function Visualizer({ width, height }: Size): JSX.Element {
  const engine = useRef<Engine | null>(null);
  const colony = useRef<AntColony | null>(null);
  const nodes = generateNodes(40, SCALE);
  const mat = generateMatrix(nodes);
  const matPaths = getMatrixPaths(mat);
  let bestTour: number[] = [];
  let bestCost = Infinity;

  useEffect(() => {
    const canvas: HTMLCanvasElement = document.getElementById('webgl-canvas') as HTMLCanvasElement;
    canvas.width = width;
    canvas.height = height;
    engine.current = new Engine(canvas);
    engine.current.start();
    colony.current = new AntColony(10, mat);
    //console.log(getPathDynamic(mat, 0));
  }, [height, mat, width]);

  const start = () => {
    if (engine.current && colony.current) {
      colony.current.initTour();
      while (true) {
        if (colony.current.travel()) break;
      }
      colony.current.finishTour();
      const { tour, cost } = colony.current.getBest();
      if (cost < bestCost) {
        bestCost = cost;
        bestTour = tour;
      }
      const trail = getMatrixWeights(colony.current.getTrail(),  matPaths);
      engine.current.genRouteVAO(nodesToLines(nodes, SCALE), bestTour);
      engine.current.setWeights(trail.weights);
      engine.current.genTrailVAO(nodesToLines(nodes, SCALE), trail.indices);
      console.log(cost);
      //requestAnimationFrame(start);
    }
  }

  return (
    <div>
      <canvas id='webgl-canvas' style={{ backgroundColor: 'black' }} />
      <button onClick={start}>piu</button>
    </div>
  );
}

export default Visualizer;