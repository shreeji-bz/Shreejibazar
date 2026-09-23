import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownToLine, ArrowUpFromLine, Clock } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchPayments, setFilters, clearError } from '../../store/payment.slice';
import type { PaymentFilters } from '../../types/payment.types';
import { Table, TableRow, TableCell } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Input, Select } from '../../components/common';
import { Pagination } from '../../components/tables/Pagination';
import { AdminStatsCard } from '../../components/common/StatsCard';

const PAYMENT_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  deposit: { bg: 'bg-success/15', text: 'text-success' },
  withdrawal: { bg: 'bg-warning/15', text: 'text-warning' },
};

const PAYMENT_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-warning/15', text: 'text-warning' },
  approved: { bg: 'bg-success/15', text: 'text-success' },
  rejected: { bg: 'bg-error/15', text: 'text-error' },
  completed: { bg: 'bg-info/15', text: 'text-info' },
};

export const Payments = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { list, loading, error, filters, pagination } = useSelector(
    (state: RootState) => state.payment
  );

  const [localSearch, setLocalSearch] = useState(filters.search || '');

  useEffect(() => {
    dispatch(clearError());
    dispatch(fetchPayments(filters as PaymentFilters));
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setFilters({ search: localSearch || undefined, page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch]);

  const handleTypeChange = (type: string) => {
    dispatch(setFilters({ type: type || undefined, page: 1 }));
  };

  const handleStatusChange = (status: string) => {
    dispatch(setFilters({ status: status || undefined, page: 1 }));
  };

  const handleDateFromChange = (dateFrom: string) => {
    dispatch(setFilters({ dateFrom: dateFrom || undefined, page: 1 }));
  };

  const handleDateToChange = (dateTo: string) => {
    dispatch(setFilters({ dateTo: dateTo || undefined, page: 1 }));
  };

  const totalDeposits = (list || [])
    .filter((p) => p.type === 'deposit' && (p.status === 'approved' || p.status === 'completed'))
    .reduce((sum, p) => sum + p.amount, 0);
  const totalWithdrawals = (list || [])
    .filter((p) => p.type === 'withdrawal' && (p.status === 'approved' || p.status === 'completed'))
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingApprovals = (list || []).filter((p) => p.status === 'pending').length;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Payments</h1>

      {error && (
        <div className="mb-4 px-4 py-3 bg-error/15 text-error rounded-lg text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <AdminStatsCard title="Total Deposits" value={`${totalDeposits.toLocaleString('en-IN')}`} icon={ArrowDownToLine} />
        <AdminStatsCard title="Total Withdrawals" value={`${totalWithdrawals.toLocaleString('en-IN')}`} icon={ArrowUpFromLine} />
        <AdminStatsCard title="Pending Approvals" value={pendingApprovals} icon={Clock} />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search by user or reference..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-64"
          />
          <Select value={filters.type || 'all'} onChange={(e) => handleTypeChange(e.target.value)} className="w-40">
            <option value="all">All Types</option>
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
          </Select>
          <Select value={filters.status || 'all'} onChange={(e) => handleStatusChange(e.target.value)} className="w-40">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </Select>
          <input
            type="date"
            value={filters.dateFrom || ''}
            onChange={(e) => handleDateFromChange(e.target.value)}
            className="w-40 px-3 py-2 bg-card-secondary border border-border rounded-lg text-text-primary text-sm"
            placeholder="From"
          />
          <input
            type="date"
            value={filters.dateTo || ''}
            onChange={(e) => handleDateToChange(e.target.value)}
            className="w-40 px-3 py-2 bg-card-secondary border border-border rounded-lg text-text-primary text-sm"
            placeholder="To"
          />
          {(filters.type || filters.status || filters.dateFrom || filters.dateTo || filters.search) && (
            <Button
              variant="outline"
              onClick={() => {
                dispatch(setFilters({ type: undefined, status: undefined, dateFrom: undefined, dateTo: undefined, search: undefined, page: 1 }));
                setLocalSearch('');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>

        <Table headers={['ID', 'User', 'Type', 'Amount', 'Method', 'Status', 'Reference ID', 'Date', 'Actions']}>
          {loading ? (
            <TableRow>
              <TableCell colSpan={9}>
                <div className="text-center py-8 text-text-muted">Loading payments...</div>
              </TableCell>
            </TableRow>
          ) : !list || list.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9}>
                <div className="text-center py-8 text-text-muted">No payments found</div>
              </TableCell>
            </TableRow>
          ) : (
            list.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-xs">{p.id ? p.id.slice(0, 8) : '-'}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-text-primary text-sm">{p.userName || '-'}</p>
                    <p className="text-xs text-text-muted">{p.userMobile || '-'}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PAYMENT_TYPE_COLORS[p.type]?.bg ?? 'bg-text-muted/15'} ${PAYMENT_TYPE_COLORS[p.type]?.text ?? 'text-text-muted'}`}>
                    {p.type || '-'}
                  </span>
                </TableCell>
                <TableCell className="text-sm font-semibold">{(p.amount ?? 0).toLocaleString('en-IN')}</TableCell>
                <TableCell className="text-sm">{p.method || '-'}</TableCell>
                <TableCell>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PAYMENT_STATUS_COLORS[p.status]?.bg ?? 'bg-text-muted/15'} ${PAYMENT_STATUS_COLORS[p.status]?.text ?? 'text-text-muted'}`}>
                    {p.status || '-'}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-xs">{p.referenceId || '-'}</TableCell>
                <TableCell className="text-xs text-text-muted">{p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : '-'}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {p.id ? (
                      <Link to={`/payments/${p.id}`}>
                        <Button variant="outline" className="text-xs px-3 py-1.5">View</Button>
                      </Link>
                    ) : null}
                    {p.status === 'pending' && p.id ? (
                      <>
                        <Link to={`/payments/${p.id}?action=approve`}>
                          <Button variant="primary" className="text-xs px-3 py-1.5">Approve</Button>
                        </Link>
                        <Link to={`/payments/${p.id}?action=reject`}>
                          <Button variant="outline" className="text-xs px-3 py-1.5 border-error/30 text-error hover:bg-error/10">Reject</Button>
                        </Link>
                      </>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </Table>

        {pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(page) => dispatch(setFilters({ page }))}
          />
        )}
      </div>
    </div>
  );
};

export default Payments;
