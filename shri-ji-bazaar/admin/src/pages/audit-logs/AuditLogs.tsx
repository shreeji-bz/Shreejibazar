import { useEffect, useState } from 'react';
import { getAuditLogs } from '../../services/authService';
import { TableRow, TableCell } from '../../components/common/Table';

interface AuditLog { id: string; adminName: string; action: string; entity: string; metadata: any; createdAt: string; }

export const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  useEffect(() => { getAuditLogs({ limit: 50 }).then((data: any) => { if (data.success) setLogs(data.data); }); }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Audit Logs</h1>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-card-secondary"><tr><th className="px-4 py-3 text-left text-text-muted">Admin</th><th className="px-4 py-3 text-left text-text-muted">Action</th><th className="px-4 py-3 text-left text-text-muted">Entity</th><th className="px-4 py-3 text-left text-text-muted">Date</th></tr></thead>
          <tbody className="divide-y divide-border">
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{log.adminName}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>{log.entity}</TableCell>
                <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogs;
