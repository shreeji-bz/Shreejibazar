import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { getUsers, updateUserStatus } from '../../services/authService';
import { Table, TableRow, TableCell } from '../../components/common/Table';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';

interface User { id: string; name: string; mobile: string; email: string; status: string; createdAt: string; }

export const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const loadUsers = () => {
    getUsers({ page, limit: 20, search }).then((data: any) => {
      if (data.success) { setUsers(data.data); setTotal(data.meta?.total || 0); }
    });
  };

  useEffect(() => { loadUsers(); }, [page]);

  const handleStatusChange = async (userId: string, status: string) => {
    await updateUserStatus(userId, status);
    loadUsers();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Users</h1>
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="pl-9" />
          </div>
          <Button onClick={loadUsers}>Search</Button>
        </div>
        <Table headers={['Name', 'Mobile', 'Email', 'Status', 'Joined', 'Actions']}>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.mobile}</TableCell>
              <TableCell>{user.email || '-'}</TableCell>
              <TableCell><span className={`px-2 py-0.5 rounded text-xs ${user.status === 'active' ? 'bg-success/15 text-success' : 'bg-error/15 text-error'}`}>{user.status}</span></TableCell>
              <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <select value={user.status} onChange={(e) => handleStatusChange(user.id, e.target.value)} className="bg-card-secondary border border-border rounded px-2 py-1 text-xs text-text-secondary">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspend</option>
                </select>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </div>
    </div>
  );
};

export default Users;
