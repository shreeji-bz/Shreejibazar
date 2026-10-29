import { useEffect, useMemo, useState } from 'react';
import { Coins, Loader2 } from 'lucide-react';
import { reportsService } from '../../services/reports.service';
import { Button } from '../../components/common/Button';
import { Table, TableRow, TableCell } from '../../components/common/Table';
import { Select } from '../../components/common/Select';
import { Input } from '../../components/common/Input';
import type { PaginatedPaymentsResponse, Payment } from '../../types/payment.types';

const METHOD_OPTIONS = ['all', 'upi', 'bank_transfer', 'paytm', 'phonepe', 'cash', 'points', 'admin'];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const formatDateTime = (dateStr: string) =>
  new Date(dateStr).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const dayKey = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const AddFundReportPage = () => {
  const [data, setData] = useState<PaginatedPaymentsResponse | null>(null);
  const [method, setMethod] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await reportsService.getAddFundReport({ method, from, to, page: 1, limit: 500 });
      setData(result);
    } catch (e: any) {
      setError(e?.message || 'Failed to load add fund report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [method, from, to]);

  const payments: Payment[] = data?.data ?? [];

  const totals = useMemo(() => {
    const amount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    return { amount, count: payments.length };
  }, [payments]);

  const byDay = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    payments.forEach((p) => {
      const key = dayKey(p.createdAt);
      const entry = map.get(key) ?? { count: 0, total: 0 };
      entry.count += 1;
      entry.total += p.amount || 0;
      map.set(key, entry);
    });
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [payments]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Coins size={22} className="text-gold-bright" />
        <h1 className="text-2xl font-bold text-text-primary">Add Fund Report</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error text-error text-sm">{error}</div>
      )}

      <div className="bg-card border border-border rounded-xl p-5 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Method</label>
            <Select value={method} onChange={(e) => setMethod(e.target.value)} disabled={loading}>
              {METHOD_OPTIONS.map((m) => (
                <option key={m} value={m}>{m === 'all' ? 'All methods' : m.replace('_', ' ')}</option>
              ))}
            </Select>
          </div>
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
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-gold-bright" />
          <span className="ml-3 text-text-secondary">Loading report...</span>
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-5 text-center py-12 text-text-muted">
          No deposits found for the selected filters
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-text-muted text-sm">Total Deposited</p>
              <p className="text-2xl font-bold text-text-primary mt-1">{formatCurrency(totals.amount)}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-text-muted text-sm">Deposit Count</p>
              <p className="text-2xl font-bold text-text-primary mt-1">{totals.count}</p>
            </div>
          </div>

          <h2 className="text-lg font-semibold text-text-primary mb-3">By Day</h2>
          <div className="mb-6">
            <Table headers={['Date', 'Deposits', 'Total Amount']}>
              {byDay.map(([date, entry]) => (
                <TableRow key={date}>
                  <TableCell className="font-medium text-text-primary">{date}</TableCell>
                  <TableCell>{entry.count}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(entry.total)}</TableCell>
                </TableRow>
              ))}
            </Table>
          </div>

          <h2 className="text-lg font-semibold text-text-primary mb-3">Deposits</h2>
          <Table headers={['User', 'Mobile', 'Amount', 'Method', 'Status', 'Reference', 'Date']}>
            {payments.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium text-text-primary">{p.userName}</TableCell>
                <TableCell className="text-text-muted">{p.userMobile}</TableCell>
                <TableCell className="font-medium">{formatCurrency(p.amount)}</TableCell>
                <TableCell className="capitalize">{p.method}</TableCell>
                <TableCell>
                  <span className="px-2 py-0.5 rounded text-xs font-medium capitalize bg-card-tertiary text-text-secondary">{p.status}</span>
                </TableCell>
                <TableCell className="text-xs text-text-muted">{p.referenceId || '-'}</TableCell>
                <TableCell className="text-xs text-text-muted whitespace-nowrap">{formatDateTime(p.createdAt)}</TableCell>
              </TableRow>
            ))}
          </Table>

          <div className="flex items-center justify-between mt-4 text-sm text-text-muted">
            <span>Showing {payments.length} of {data?.total ?? 0} deposits</span>
            <span>Page {data?.page ?? 1} of {data?.totalPages ?? 1}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default AddFundReportPage;
