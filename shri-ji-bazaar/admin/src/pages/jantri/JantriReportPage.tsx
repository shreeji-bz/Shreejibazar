import { useCallback, useEffect, useMemo, useState } from 'react';
import { BarChart3, Loader2 } from 'lucide-react';
import { reportsService, type JantriReportRow } from '../../services/reports.service';
import { Button } from '../../components/common/Button';
import { Table, TableRow, TableCell } from '../../components/common/Table';
import { Input } from '../../components/common/Input';

const toDateInput = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const lastSevenDays = () => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 6);
  return { from: toDateInput(from), to: toDateInput(to) };
};

export const JantriReportPage = () => {
  const defaults = useMemo(lastSevenDays, []);
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);
  const [rows, setRows] = useState<JantriReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportsService.getJantriReport(from, to);
      setRows(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load jantri report');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    load();
  }, [load]);

  const grid = useMemo(() => {
    const dates = [...new Set(rows.map((r) => r.date))].sort();
    const games = [...new Map(rows.map((r) => [r.game, r.gameName])).entries()].map(([slug, name]) => ({ slug, name }));
    const lookup = new Map(rows.map((r) => [`${r.date}|${r.game}`, r.count]));
    return { dates, games, lookup };
  }, [rows]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 size={22} className="text-gold-bright" />
        <h1 className="text-2xl font-bold text-text-primary">Jantri Report</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error text-error text-sm">{error}</div>
      )}

      <div className="bg-card border border-border rounded-xl p-5 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">From</label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} disabled={loading} />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">To</label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} disabled={loading} />
          </div>
          <div className="flex items-end">
            <Button variant="secondary" onClick={load} disabled={loading} className="w-full">
              {loading ? 'Loading...' : 'Load Report'}
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-gold-bright" />
          <span className="ml-3 text-text-secondary">Loading report...</span>
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-5 text-center py-12 text-text-muted">
          No declared results in the selected range
        </div>
      ) : (
        <>
          <h2 className="text-lg font-semibold text-text-primary mb-3">Declared Results (date × game)</h2>
          <div className="bg-card border border-border rounded-xl p-5 overflow-x-auto">
            <table className="text-sm min-w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Game</th>
                  {grid.dates.map((d) => (
                    <th key={d} className="px-4 py-3 text-right font-medium text-text-muted whitespace-nowrap">{d}</th>
                  ))}
                  <th className="px-4 py-3 text-right font-medium text-text-muted">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {grid.games.map((g) => (
                  <tr key={g.slug}>
                    <td className="px-4 py-3 font-medium text-text-primary">{g.name}</td>
                    {grid.dates.map((d) => (
                      <td key={d} className="px-4 py-3 text-right text-text-secondary">
                        {grid.lookup.get(`${d}|${g.slug}`) ?? 0}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right font-medium">
                      {grid.dates.reduce((sum, d) => sum + (grid.lookup.get(`${d}|${g.slug}`) ?? 0), 0)}
                    </td>
                  </tr>
                ))}
                <tr className="font-medium text-text-primary">
                  <td className="px-4 py-3">Total</td>
                  {grid.dates.map((d) => (
                    <td key={d} className="px-4 py-3 text-right">
                      {grid.games.reduce((sum, g) => sum + (grid.lookup.get(`${d}|${g.slug}`) ?? 0), 0)}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">{rows.reduce((sum, r) => sum + r.count, 0)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-lg font-semibold text-text-primary mt-6 mb-3">Details</h2>
          <Table headers={['Date', 'Game', 'Count']}>
            {rows
              .slice()
              .sort((a, b) => (a.date === b.date ? a.gameName.localeCompare(b.gameName) : a.date < b.date ? 1 : -1))
              .map((r, i) => (
                <TableRow key={`${r.date}|${r.game}|${i}`}>
                  <TableCell className="font-medium text-text-primary">{r.date}</TableCell>
                  <TableCell>{r.gameName}</TableCell>
                  <TableCell>{r.count}</TableCell>
                </TableRow>
              ))}
          </Table>
        </>
      )}
    </div>
  );
};

export default JantriReportPage;
