import React, { useEffect } from 'react';
import './App.css';
import { getPathDynamic } from './tsp/Dynamic';
import { AntColony } from './tsp/Ant';
import * as Util from './tsp/Util';
import Visualizer from './components/Visualizer';

function App() {

  useEffect(() => {
    /* const mat = Util.generateMatrix(Util.generateNodes(100, 1));
    const colony = new AntColony(400, mat);
    for (let i = 0; i < 100; i++) {
      colony.initTour();
      while (true) {
        if (colony.travel()) break;
      }
      console.log(`${i} -- ${colony.getTrailAvg()}`);
      colony.finishTour();
      console.log(colony.getBest().cost);
    }
    //console.log(getPathDynamic(mat, 0)); */
  }, []);

  return (
    <Visualizer width={600} height={600} />
  );
}

export default App;
