import { useEffect, useRef, useState } from 'react';
import './App.css';
import Visualizer from './components/Visualizer';
import { Renderer } from './util/Renderer';

const WIDTH = 600;
const HEIGHT = 600;


function App() {
  const [amount, setAmount] = useState(8);
  const [running, setRunning] = useState(false);
  const renderer = useRef<Renderer | null>(null);
  const visualizer = useRef<Visualizer | null>(null);

  useEffect(() => {
    const canvas: HTMLCanvasElement = document.getElementById('webgl-canvas') as HTMLCanvasElement;
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    renderer.current = new Renderer(canvas);
    visualizer.current = new Visualizer(renderer.current, amount);
  }, []);

  return (
    <div>
      <canvas id='webgl-canvas' style={{ width: WIDTH, height: HEIGHT }} />
      <input
        type="number"
        value={amount}
        onChange={(e) => {
          const num = parseInt(e.target.value);
          setAmount(num);
        }}
      ></input>
      <button onClick={() => {
        visualizer.current?.loop();
        setRunning(!running);
        visualizer.current?.toggle(!running);
        }}>
        {running ? 'stop' : 'start'}
      </button>
    </div>
  );
}

export default App;
