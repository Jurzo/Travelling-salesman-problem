import { useEffect, useRef } from "react";
import { AntColony } from "../tsp/Ant";
import { getPathDynamic } from "../tsp/Dynamic";
import { generateMatrix, generateNodes, nodesToSingleArray } from "../tsp/Util";
import { Engine } from "./Engine";

interface Size {
  width: number,
  height: number,
}

function Visualizer({ width, height }: Size): JSX.Element {
  const engine = useRef<Engine | null>(null);
  const colony = useRef<AntColony | null>(null);
  const nodes = generateNodes(20, 1);
  const mat = generateMatrix(nodes);

  useEffect(() => {
    const canvas: HTMLCanvasElement = document.getElementById('webgl-canvas') as HTMLCanvasElement;
    canvas.width = width;
    canvas.height = height;
    engine.current = new Engine(canvas);
    engine.current.start();
    colony.current = new AntColony(200, mat);

  }, []);

  const start = () => {
    if (engine.current && colony.current) {
      colony.current.initTour();
      while (true) {
        if (colony.current.travel()) break;
      }
      colony.current.finishTour();
      const { tour, cost } = colony.current.getBest();
      /* const {route} =  getPathDynamic(mat, 0)!; */
      engine.current.genVAO(nodesToSingleArray(nodes), tour);
      console.log(cost);
      console.log('---', colony.current.getTrailAvg());
    }
  }

  return (
    <div>
      <canvas id='webgl-canvas' />
      <button onClick={start}>piu</button>
    </div>
  );
}

export default Visualizer;