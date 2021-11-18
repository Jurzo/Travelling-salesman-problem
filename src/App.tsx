import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { getPathDynamic } from './tsp/Dynamic';
import { AntColony } from './tsp/Ant';
import * as Util from './tsp/Util';

function App() {

  useEffect(() => {
    const mat = Util.generateMatrix(Util.generateNodes(20, 30));
    const colony = new AntColony(100, mat);
    for (let i = 0; i < 100; i++) {
      colony.initTour();
      while (true) {
        if (colony.travel()) break;
      }
      console.log(`${i} -- ${colony.getTrailAvg()}`);
      colony.finishTour();
      console.log(colony.getBest());
    }
    console.log(getPathDynamic(mat, 0));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
