import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchWagers, setFilters, clearError } from '../../store/wager.slice';
import type { Wager, WagerFilters } from '../../types/wager.types';
import { Table, TableRow, TableCell } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Input, Select } from '../../components/common';
import { Pagination } from '../../components/tables/Pagination';
import { AdminStatsCard } from '../../components/common/StatsCard';
import { wagerService } from '../../services/wager.service';

const PLAY_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  open: { bg: 'bg-info/15', text: 'text-info' },
  close: { bg: 'bg-warning/15', text: 'text-warning' },
};

const WAGER_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-warning/15', text: 'text-warning' },
  active: { bg: 'bg-info/15', text: 'text-info' },
  won: { bg: 'bg-success/15', text: 'text-success' },
  lost: { bg: 'bg-error/15', text: 'text-error' },
  void: { bg: 'bg-text-muted/15', text: 'text-text-muted' },
};

export const Wagers = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { list, loading, error, filters, pagination } = useSelector(
    (state: RootState) => state.wager
  );

  const [games, setGames] = useState<{ id: string; name: string }[]>([]);
  const [localSearch, setLocalSearch] = useState(filters.search || '');

  useEffect(() => {
    wagerService
      .getWagers({ page: 1, limit: 100 })
      .then((data) => {
        const g = (data.data as any[]).map((w) => ({ id: w.gameId, name: w.gameName }));
        const unique = Array.from(new Map(g.map((item) => [item.id, item])).values());
        setGames(unique);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    dispatch(clearError());
    dispatch(fetchWagers(filters as WagerFilters));
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setFilters({ search: localSearch || undefined, page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch]);

  const handleGameChange = (gameId: string) => {
    dispatch(setFilters({ gameId: gameId || undefined, page: 1 }));
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

  const handlePageChange = (page: number) => {
    dispatch(setFilters({ page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalStaked = list.reduce((sum, w) => sum + w.stake, 0);
  const totalPayouts = list.reduce((sum, w) => sum + w.potentialPayout, 0);
  const pendingSettlements = list.filter((w) => w.status === 'active' || w.status === 'pending').length;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Wagers</h1>

      {error && (
        <div className="mb-4 px-4 py-3 bg-error/15 text-error rounded-lg text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <AdminStatsCard title="Total Wagers" value={pagination.total} icon={DollarSign} />
        <AdminStatsCard title="Total Staked" value={`${totalStaked.toLocaleString('en-IN')}`} icon={TrendingUp} />
        <AdminStatsCard title="Total Payouts" value={`${totalPayouts.toLocaleString('en-IN')}`} icon={TrendingUp} />
        <AdminStatsCard title="Pending Settlements" value={pendingSettlements} icon={Clock} />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search by user or selection..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-64"
          />
          <Select value={filters.gameId || ''} onChange={(e) => handleGameChange(e.target.value)} className="w-48">
            <option value="">All Games</option>
            {games.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </Select>
          <Select value={filters.status || ''} onChange={(e) => handleStatusChange(e.target.value)} className="w-40">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
            <option value="void">Void</option>
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
          {(filters.status || filters.gameId || filters.dateFrom || filters.dateTo || filters.search) && (
            <Button
              variant="outline"
              onClick={() => {
                dispatch(setFilters({ status: undefined, gameId: undefined, dateFrom: undefined, dateTo: undefined, search: undefined, page: 1 }));
                setLocalSearch('');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>

        <Table headers={['ID', 'User', 'Game', 'Round', 'Play Type', 'Selection', 'Stake', 'Potential Payout', 'Status', 'Result', 'Date', 'Actions']}>
          {loading ? (
            <TableRow>
              <TableCell colSpan={12}>
                <div className="text-center py-8 text-text-muted">Loading wagers...</div>
              </TableCell>
            </TableRow>
          ) : list.length === 0 ? (
            <TableRow>
              <TableCell colSpan={12}>
                <div className="text-center py-8 text-text-muted">No wagers found</div>
              </TableCell>
            </TableRow>
          ) : (
            list.map((w) => (
              <TableRow key={w.id}>
                <TableCell className="font-mono text-xs">{w.id.slice(0, 8)}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-text-primary text-sm">{w.userName}</p>
                    <p className="text-xs text-text-muted">{w.userMobile}</p>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{w.gameName}</TableCell>
                <TableCell className="text-sm">#{String(w.roundNumber).padStart(3, '0')}</TableCell>
                <TableCell>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PLAY_TYPE_COLORS[w.playType]?.bg ?? 'bg-text-muted/15'} ${PLAY_TYPE_COLORS[w.playType]?.text ?? 'text-text-muted'}`}>
                    {w.playType}
                  </span>
                </TableCell>
                <TableCell className="text-sm">{w.selection}{w.number ? ` - ${w.number}` : ''}</TableCell>
                <TableCell className="text-sm">{w.stake.toLocaleString('en-IN')}</TableCell>
                <TableCell className="text-sm">{w.potentialPayout.toLocaleString('en-IN')}</TableCell>
                <TableCell>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${WAGER_STATUS_COLORS[w.status]?.bg ?? 'bg-text-muted/15'} ${WAGER_STATUS_COLORS[w.status]?.text ?? 'text-text-muted'}`}>
                    {w.status}
                  </span>
                </TableCell>
                <TableCell className="text-sm">{w.resultStatus || '-'}</TableCell>
                <TableCell className="text-xs text-text-muted">{new Date(w.createdAt).toLocaleDateString('en-IN')}</TableCell>
                <TableCell>
                  <Link to={`/wagers/${w.id}`}>
                    <Button variant="outline" className="text-xs px-3 py-1.5">View</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </Table>

        {pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default Wagers;
