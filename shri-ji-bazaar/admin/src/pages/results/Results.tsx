import { useEffect, useState } from 'react';
import { getResults } from '../../services/authService';
import { Table, TableRow, TableCell } from '../../components/common/Table';

interface Result { id: string; gameName: string; roundNumber: string; result: string; startTime: string; }

export const Results = () => {
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => { getResults({ limit: 50 }).then((data: any) => { if (data.success) setResults(data.data); }); }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Results</h1>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-card-secondary"><tr><th className="px-4 py-3 text-left text-text-muted">Game</th><th className="px-4 py-3 text-left text-text-muted">Round</th><th className="px-4 py-3 text-left text-text-muted">Result</th><th className="px-4 py-3 text-left text-text-muted">Time</th></tr></thead>
          <tbody className="divide-y divide-border">
            {results.length === 0 ? <tr><TableCell colSpan={4}><div className="text-center py-8 text-text-muted">No results yet</div></TableCell></tr> : results.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.gameName}</TableCell>
                <TableCell>{r.roundNumber}</TableCell>
                <TableCell><span className="text-gold-bright font-bold text-lg">{r.result}</span></TableCell>
                <TableCell>{new Date(r.startTime).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Results;
