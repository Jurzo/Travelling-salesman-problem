import { useEffect, useRef, useState } from 'react';
import './App.css';
import ResultBoard from './components/ResultBoard';
import Solver, { Results } from './components/Solver';
import { Renderer } from './util/Renderer';

const WIDTH = 900;
const HEIGHT = 600;

function App() {
  const [running, setRunning] = useState(false);
  const [amount, setAmount] = useState(10);
  const [increment, setIncrement] = useState(false);
  const [loops, setLoops] = useState(0);
  const [results, setResults] = useState<Results>({
    bruteforce: null,
    dynamic: null,
    ants: null
  });
  const renderer = useRef<Renderer | null>(null);
  const solver = useRef<Solver | null>(null);

  const confirm = (type: string): void => {
    if (!solver.current) return;

    if ((type === 'brute' && amount >= 12) || (type === 'dynamic' && amount >= 23)) {
      const resp = window.confirm(`I do not recommend running dynamic solver above 22 cities and bruteforce non-incrementally above 11. Run the solver?`);
      if (!resp) return;
    }
    (type === 'brute') && solver.current.bruteSolve();
    (type === 'dynamic') && solver.current.dynamicSolve();
  }

  const startLoop = (): void => {
    if (!solver.current) return;
    solver.current.toggle();
    setRunning(!running);
  }

  useEffect(() => {
    const canvas: HTMLCanvasElement = document.getElementById('webgl-canvas') as HTMLCanvasElement;
    
    if (!renderer.current || !solver.current) {
      canvas.width = WIDTH;
      canvas.height = HEIGHT;
      renderer.current = new Renderer(canvas);
      solver.current = new Solver(renderer.current, amount, increment, setResults, setLoops);
    } else {
      solver.current.setOptions(amount, increment);
    }
  }, [amount, increment]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <canvas id='webgl-canvas' style={{ width: WIDTH, height: HEIGHT }} />
      <div style={{ display: 'flex' }}>
        <input
          type="number"
          value={amount}
          onChange={(e) => {
            const num = parseInt(e.target.value);
            setAmount(num);
          }} />
        <button onClick={startLoop}>
          {running ? 'stop' : 'iterate'}
        </button>
        <input type="checkbox" id="brute" name="brute" checked={increment} onChange={() => setIncrement(!increment)} />
        <label htmlFor="brute">Incrementally solve bruteforce approach</label>

        <button onClick={() => confirm('brute')}>
          solve bruteforce
        </button>
        <button onClick={() => confirm('dynamic')}>
          solve dynamic
        </button>
      </div>
      <ResultBoard results={results} loops={loops} />
      <div>
        <p>Colors</p>
        <ul>
          <li>Green - Dynamic</li>
          <li>Red - Bruteforce</li>
          <li>Blue - Ants</li>
          <li>Pink - Ant pheromone trail</li>
        </ul>
      </div>
    </div>
  );
}

export default App;
