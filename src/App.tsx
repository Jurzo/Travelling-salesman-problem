import { useEffect, useRef, useState } from 'react';
import './App.css';
import Visualizer from './components/Visualizer';
import { Renderer } from './util/Renderer';

const WIDTH = 900;
const HEIGHT = 600;


function App() {
  const [amount, setAmount] = useState(10);
  const [increment, setIncrement] = useState(false);
  const [dynamic, setDynamic] = useState(false);
  const renderer = useRef<Renderer | null>(null);
  const visualizer = useRef<Visualizer | null>(null);

  useEffect(() => {
    const canvas: HTMLCanvasElement = document.getElementById('webgl-canvas') as HTMLCanvasElement;

    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    renderer.current = new Renderer(canvas);
    visualizer.current = new Visualizer(renderer.current, amount, increment, dynamic);
  }, [amount, increment]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <canvas id='webgl-canvas' style={{ width: WIDTH, height: HEIGHT }} />
      <div style={{ display: 'block' }}>
        <p>Number of "cities"</p>
        <input
          type="number"
          value={amount}
          onChange={(e) => {
            const num = parseInt(e.target.value);
            setAmount(num);
          }} />
        <button onClick={() => {
          visualizer.current?.toggle();
        }}>
          toggle
        </button>
        <br />
        <input type="checkbox" id="dynamic" name="dynamic" checked={dynamic} onChange={() => setDynamic(!dynamic)} />
        <label htmlFor="dynamic">Solve path dynamically</label>
        <input type="checkbox" id="brute" name="brute" checked={increment} onChange={() => setIncrement(!increment)} />
        <label htmlFor="brute">Incrementally solve bruteforce approach</label>
      </div>
    </div>
  );
}

export default App;
