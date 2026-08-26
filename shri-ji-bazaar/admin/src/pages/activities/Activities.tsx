import { Table, TableRow, TableCell } from '../../components/common/Table';

export const Activities = () => {
  const data: any[] = [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Activities</h1>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-card-secondary"><tr><th className="px-4 py-3 text-left text-text-muted">User</th><th className="px-4 py-3 text-left text-text-muted">Game</th><th className="px-4 py-3 text-left text-text-muted">Type</th><th className="px-4 py-3 text-left text-text-muted">Selection</th><th className="px-4 py-3 text-left text-text-muted">Points</th><th className="px-4 py-3 text-left text-text-muted">Result</th></tr></thead>
          <tbody className="divide-y divide-border">
            {data.length === 0 ? <tr><td colSpan={6}><div className="text-center py-8 text-text-muted">No activities yet</div></td></tr> : data.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3 text-text-secondary">{a.userName}</td>
                <td className="px-4 py-3 text-text-secondary">{a.gameName}</td>
                <td className="px-4 py-3 text-text-secondary">{a.playType}</td>
                <td className="px-4 py-3 text-text-secondary">{a.selection}</td>
                <td className="px-4 py-3"><span className="text-gold-bright font-semibold">{a.points}</span></td>
                <td className="px-4 py-3 text-text-secondary">{a.result || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Activities;
