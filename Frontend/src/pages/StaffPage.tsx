import { useEffect, useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import authService from '@/services/authService';
import reportService from '@/services/reportService';
import userService from '@/services/userService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { UserRecord, UserRole } from '@/types/api';

export default function StaffPage() {
  const [staff, setStaff] = useState<UserRecord[]>([]);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'EMPLOYEE' as UserRole });
  const [assignmentCounts, setAssignmentCounts] = useState<Record<number, number>>({});

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [usersResponse, statsResponse] = await Promise.all([
        userService.getAll(),
        reportService.getDashboardStats(),
      ]);

      const counts = statsResponse.data.activeAssignments.reduce<Record<number, number>>((acc, item) => {
        acc[item.assigneeId] = (acc[item.assigneeId] || 0) + 1;
        return acc;
      }, {});

      setStaff(usersResponse.data);
      setAssignmentCounts(counts);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load staff.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filtered = useMemo(
    () =>
      staff.filter(member => {
        const matchSearch =
          member.fullName.toLowerCase().includes(search.toLowerCase()) ||
          member.email.toLowerCase().includes(search.toLowerCase());
        const matchRole = filterRole === 'ALL' || member.role === filterRole;
        return matchSearch && matchRole;
      }),
    [filterRole, search, staff],
  );

  const handleCreate = async () => {
    setSubmitting(true);
    setError('');

    try {
      await authService.register(form);
      setDialogOpen(false);
      setForm({ fullName: '', email: '', password: '', role: 'EMPLOYEE' });
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (id: number, role: UserRole) => {
    try {
      await userService.updateRole(id, { role });
      setStaff(current => current.map(member => (member.id === id ? { ...member, role } : member)));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update role.');
    }
  };

  const handleDeactivate = async (id: number) => {
    try {
      await userService.deactivate(id);
      setStaff(current => current.map(member => (member.id === id ? { ...member, active: false } : member)));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to deactivate user.');
    }
  };

  const roleBadgeVariant = (role: string) => {
    if (role === 'ADMIN') return 'default';
    if (role === 'ASSET_MANAGER') return 'secondary';
    return 'outline';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">User & Staff Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage user accounts and role assignments</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Add User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Create User Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="Full name" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="user@company.com" />
              </div>
              <div className="space-y-2">
                <Label>Temporary Password</Label>
                <Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={form.role} onValueChange={v => setForm({ ...form, role: v as UserRole })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMPLOYEE">Employee</SelectItem>
                    <SelectItem value="ASSET_MANAGER">Asset Manager</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => void handleCreate()} className="w-full" disabled={!form.fullName || !form.email || form.password.length < 6 || submitting}>
                {submitting ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="ASSET_MANAGER">Asset Manager</SelectItem>
            <SelectItem value="EMPLOYEE">Employee</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-xl border shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Active Assignments</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading users...</TableCell></TableRow>
            )}
            {!loading && filtered.map(member => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.fullName}</TableCell>
                <TableCell className="text-muted-foreground">{member.email}</TableCell>
                <TableCell>
                  <Badge variant={roleBadgeVariant(member.role)}>
                    {member.role.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{assignmentCounts[member.id] || 0}</TableCell>
                <TableCell>
                  <Badge variant={member.active ? 'default' : 'secondary'}>{member.active ? 'ACTIVE' : 'INACTIVE'}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Select value={member.role} onValueChange={value => void handleRoleChange(member.id, value as UserRole)}>
                      <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EMPLOYEE">Employee</SelectItem>
                        <SelectItem value="ASSET_MANAGER">Asset Manager</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    {member.active && <Button variant="outline" size="sm" onClick={() => void handleDeactivate(member.id)}>Deactivate</Button>}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!loading && filtered.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No users found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
