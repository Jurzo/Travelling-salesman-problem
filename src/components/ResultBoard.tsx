import { useEffect, useState } from "react";
import { Results } from "./Solver";

interface MyProps {
  results: Results;
  loops: number;
}

function ResultBoard(props: MyProps) {
  const [results, setResults] = useState<Results>({});
  const [loops, setLoops] = useState(0);

  useEffect(() => {
    setResults(props.results);
    setLoops(props.loops);
  }, [props.results, props.loops]);

  return (
    <div style={{ display: 'block' }}>
      <table>
        <tr>
          <th>Type</th>
          <th>Cost</th>
          <th>Time</th>
          <th>Iterations out of {loops}</th>
        </tr>
        {Object.keys(results).map(r => {
          const result = results[r];
          if (!result) return null;
          return(
            <tr>
              <td>{result.type}</td>
              <td>{result.cost.toFixed(4)}</td>
              <td>{result.time.toFixed(3)}</td>
              <td>{result.iteration}</td>
            </tr>
          );
        })}
      </table>
    </div>
  )
}

export default ResultBoard;