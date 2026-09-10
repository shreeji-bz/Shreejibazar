import { useEffect, useState } from 'react';
import { getResults } from '../../services/authService';
import { Table, TableRow, TableCell } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';
import type { Result } from '../../types/result.types';

export const Results = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);
    getResults({ limit: 50 })
      .then((data: any) => {
        if (data.success) setResults(data.data);
        else setError(data.message || 'Failed to load results');
      })
      .catch(() => setError('Failed to load results'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Results</h1>

      {error && (
        <div className="mb-4 px-4 py-3 bg-error/15 text-error rounded-lg text-sm">{error}</div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex justify-end">
          <Button variant="primary" onClick={() => navigate('/results/declare')}>
            Declare Result
          </Button>
        </div>

        <Table headers={['Game', 'Round', 'Result', 'Declared At']}>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4}>
                <div className="text-center py-8 text-text-muted">Loading results...</div>
              </TableCell>
            </TableRow>
          ) : results.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4}>
                <div className="text-center py-8 text-text-muted">No results yet</div>
              </TableCell>
            </TableRow>
          ) : (
            results.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium text-text-primary">{r.gameName}</TableCell>
                <TableCell>#{String(r.roundNumber).padStart(3, '0')}</TableCell>
                <TableCell>
                  {r.result ? (
                    <span className="text-gold-bright font-bold text-lg">{r.result}</span>
                  ) : (
                    <span className="text-text-muted">-</span>
                  )}
                </TableCell>
                <TableCell>{r.declaredAt ? new Date(r.declaredAt).toLocaleString('en-IN') : '-'}</TableCell>
              </TableRow>
            ))
          )}
        </Table>
      </div>
    </div>
  );
};

export default Results;
