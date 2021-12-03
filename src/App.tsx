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
  const [dynamic, setDynamic] = useState(false);
  const [loops, setLoops] = useState(0);
  const [results, setResults] = useState<Results>({
    bruteforce: null,
    dynamic: null,
    ants: null
  });
  const renderer = useRef<Renderer | null>(null);
  const solver = useRef<Solver | null>(null);

  const confirm = (): void => {
    if ((amount >= 23 && dynamic) || (amount >= 12 && !increment)) {
      const resp = window.confirm(`I do not recommend running dynamic solver above 22 cities and bruteforce non-incrementally above 11. Run the solver?`);
      if (!resp) return;
    }
    solver.current?.toggle();
    setRunning(!running);
  }

  useEffect(() => {
    const canvas: HTMLCanvasElement = document.getElementById('webgl-canvas') as HTMLCanvasElement;

    if (!renderer.current || !solver.current) {
      canvas.width = WIDTH;
      canvas.height = HEIGHT;
      renderer.current = new Renderer(canvas);
      solver.current = new Solver(renderer.current, amount, increment, dynamic, setResults, setLoops);
    } else {
      solver.current.setOptions(amount, increment, dynamic);
    }
  }, [amount, increment, dynamic]);

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
        <button onClick={confirm}>
          {running ? 'stop' : 'solve'}
        </button>
        <br />
        <input type="checkbox" id="dynamic" name="dynamic" checked={dynamic} onChange={() => setDynamic(!dynamic)} />
        <label htmlFor="dynamic">Solve path dynamically</label>
        <input type="checkbox" id="brute" name="brute" checked={increment} onChange={() => setIncrement(!increment)} />
        <label htmlFor="brute">Incrementally solve bruteforce approach</label>
      </div>
      <ResultBoard results={results} loops={loops} />
    </div>
  );
}

export default App;
