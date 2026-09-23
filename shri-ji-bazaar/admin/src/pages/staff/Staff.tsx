import { useEffect, useState } from 'react';
import { Search, Plus, Edit3, Trash2, UserCheck, UserX } from 'lucide-react';
import { getStaff, createStaff, updateStaff, deleteStaff, toggleStaffStatus, type StaffMember, type CreateStaffInput } from '../../services/staff.service';
import { Table, TableRow, TableCell } from '../../components/common/Table';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { ConfirmModal } from '../../components/modals/ConfirmModal';

interface FormData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'super_admin' | 'moderator';
}

const emptyForm: FormData = { name: '', email: '', password: '', role: 'admin' };

export const Staff = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  const [form, setForm] = useState<FormData>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const loadStaff = () => {
    setLoading(true);
    setError(null);
    getStaff()
      .then((data: StaffMember[]) => {
        setStaff(data);
      })
      .catch((err: any) => {
        const message = err?.message || 'Failed to load staff';
        if (message.includes('401') || message.toLowerCase().includes('unauthorized')) {
          setError('Admin authorization required. Please log in again.');
        } else {
          setError(message);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadStaff(); }, []);

  const displayStaff = Array.isArray(staff) ? staff : [];
  const filteredStaff = displayStaff.filter((s) => {
    const term = search.toLowerCase();
    return s.name.toLowerCase().includes(term) || s.email.toLowerCase().includes(term) || s.role.toLowerCase().includes(term);
  });

  const openCreate = () => { setForm(emptyForm); setError(null); setIsCreateOpen(true); };
  const openEdit = (member: StaffMember) => {
    setSelectedStaff(member);
    setForm({ name: member.name, email: member.email, password: '', role: member.role });
    setError(null);
    setIsEditOpen(true);
  };
  const openDelete = (member: StaffMember) => { setSelectedStaff(member); setIsDeleteOpen(true); };

  const handleCreate = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError('Name, email and password are required');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    try {
      await createStaff({ email: form.email.trim(), password: form.password, name: form.name.trim(), role: form.role });
      setIsCreateOpen(false);
      setForm(emptyForm);
      loadStaff();
    } catch (err: any) {
      setError(err.message || 'Failed to create staff');
    }
  };

  const handleEdit = async () => {
    if (!selectedStaff) return;
    if (!form.name.trim() || !form.email.trim()) {
      setError('Name and email are required');
      return;
    }
    try {
      const payload: any = { name: form.name.trim(), email: form.email.trim(), role: form.role };
      if (form.password.trim()) {
        if (form.password.length < 6) {
          setError('Password must be at least 6 characters');
          return;
        }
        payload.password = form.password;
      }
      await updateStaff(selectedStaff.id, payload);
      setIsEditOpen(false);
      setSelectedStaff(null);
      setForm(emptyForm);
      loadStaff();
    } catch (err: any) {
      setError(err.message || 'Failed to update staff');
    }
  };

  const handleDelete = async () => {
    if (!selectedStaff) return;
    try {
      await deleteStaff(selectedStaff.id);
      setIsDeleteOpen(false);
      setSelectedStaff(null);
      loadStaff();
    } catch (err: any) {
      setError(err.message || 'Failed to delete staff');
    }
  };

  const handleToggleStatus = async (member: StaffMember) => {
    try {
      await toggleStaffStatus(member.id);
      loadStaff();
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Staff Management</h1>
        <Button onClick={openCreate}><Plus size={16} className="mr-1" /> Add Staff</Button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error text-error text-sm">{error}</div>
      )}

      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search staff by name, email or role..." className="pl-9" />
          </div>
          <Button variant="secondary" onClick={loadStaff} disabled={loading}>{loading ? 'Loading...' : 'Refresh'}</Button>
        </div>

        <Table headers={['Name', 'Email', 'Role', 'Status', 'Last Login', 'Actions']}>
          {filteredStaff.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-text-muted py-8">
                {loading ? 'Loading staff...' : 'No staff members found'}
              </TableCell>
            </TableRow>
          )}
          {filteredStaff.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="font-medium text-text-primary">{member.name}</TableCell>
              <TableCell>{member.email}</TableCell>
              <TableCell>
                <span className="px-2 py-0.5 rounded text-xs bg-card-tertiary text-text-secondary capitalize">{member.role.replace('_', ' ')}</span>
              </TableCell>
              <TableCell>
                <span className={`px-2 py-0.5 rounded text-xs ${member.status === 'active' ? 'bg-success/15 text-success' : 'bg-error/15 text-error'}`}>
                  {member.status}
                </span>
              </TableCell>
              <TableCell className="text-text-muted text-xs">
                {member.last_login ? new Date(member.last_login).toLocaleString() : '-'}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(member)} title="Edit">
                    <Edit3 size={14} />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleToggleStatus(member)} title={member.status === 'active' ? 'Deactivate' : 'Activate'}>
                    {member.status === 'active' ? <UserX size={14} /> : <UserCheck size={14} />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openDelete(member)} title="Delete" className="!border-error/40 hover:!text-error">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Add Staff Member</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-text-muted hover:text-text-primary">✕</button>
            </div>
            {error && <div className="mb-3 p-2 rounded bg-error/10 text-error text-xs">{error}</div>}
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Full Name</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter full name" />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Email</label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Enter email address" />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Password</label>
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min. 6 characters" />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Role</label>
                <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as FormData['role'] })}>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="moderator">Moderator</option>
                </Select>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Create Staff</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Edit Staff Member</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-text-muted hover:text-text-primary">✕</button>
            </div>
            {error && <div className="mb-3 p-2 rounded bg-error/10 text-error text-xs">{error}</div>}
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Full Name</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Email</label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">New Password (leave blank to keep current)</label>
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min. 6 characters" />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Role</label>
                <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as FormData['role'] })}>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="moderator">Moderator</option>
                </Select>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button onClick={handleEdit}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        title="Delete Staff Member"
        message={`Are you sure you want to delete ${selectedStaff?.name}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => { setIsDeleteOpen(false); setSelectedStaff(null); }}
      />
    </div>
  );
};
