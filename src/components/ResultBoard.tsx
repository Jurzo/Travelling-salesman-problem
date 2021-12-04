import { useEffect, useState } from "react";
import { Results } from "./Solver";

interface MyProps {
  results: Results;
  loops: number;
}

function ResultBoard(props: MyProps) {
  const [results, setResults] = useState<Results>({});


  useEffect(() => {
    setResults(props.results);
  }, [props.results, props.loops]);

  return (
    <div style={{ display: 'block' }}>
      <table>
        <tbody>
          <tr>
            <th>Type</th>
            <th>Cost</th>
            <th>Time spent calculating</th>
            <th>Iterations</th>
          </tr>
          {Object.keys(results).map(r => {
            const result = results[r];
            if (!result) return null;
            return (
              <tr key={result.type}>
                <td>{result.type}</td>
                <td>{result.cost.toFixed(4)}</td>
                <td>{result.time.toFixed(3)}</td>
                <td>{result.iteration}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  )
}

export default ResultBoard;