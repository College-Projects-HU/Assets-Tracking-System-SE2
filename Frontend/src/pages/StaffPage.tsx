import { useState, useEffect } from 'react';
import { StaffMember, UserRole } from '@/lib/mock-data';
import authService from '@/services/authService';
import userService from '@/services/userService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search } from 'lucide-react';

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'EMPLOYEE' as UserRole, department: '' });

  const filtered = staff.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'ALL' || s.role === filterRole;
    return matchSearch && matchRole;
  });

  const handleCreate = () => {
    authService.register({ fullName: form.name, email: form.email, password: form.password, role: form.role })
      .then(() => userService.getAll())
      .then(res => {
        setStaff(res.data || []);
        setDialogOpen(false);
        setForm({ name: '', email: '', password: '', role: 'EMPLOYEE', department: '' });
      })
      .catch(err => {
        console.error('Create user failed', err);
      });
  };

  useEffect(() => {
    let mounted = true;
    userService.getAll()
      .then(res => { if (mounted) setStaff(res.data); })
      .catch(err => { console.warn('Failed to load staff from backend, falling back to empty list', err); });
    return () => { mounted = false; };
  }, []);

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
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="user@company.com" />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Create a password" />
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
              <div className="space-y-2">
                <Label>Department</Label>
                <Input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="e.g. IT, Engineering" />
              </div>
              <Button onClick={handleCreate} className="w-full" disabled={!form.name || !form.email || !form.password}>Create User</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
              <TableHead>Department</TableHead>
              <TableHead>Assets</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(member => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell className="text-muted-foreground">{member.email}</TableCell>
                <TableCell>
                  <Badge variant={roleBadgeVariant(member.role)}>
                    {member.role.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{member.department}</TableCell>
                <TableCell className="text-muted-foreground">{member.assetsCount}</TableCell>
                <TableCell>
                  <Badge variant={member.status === 'ACTIVE' ? 'default' : 'secondary'}>{member.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  {member.status === 'ACTIVE' && (
                    <Button variant="outline" size="sm" onClick={() => {
                      userService.delete(member.id)
                        .then(() => setStaff(staff.map(item => item.id === member.id ? { ...item, status: 'INACTIVE' } : item)))
                        .catch(err => console.error('Deactivate user failed', err));
                    }}>
                      Deactivate
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
