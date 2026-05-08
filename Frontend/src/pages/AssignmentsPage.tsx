import { useState, useEffect } from 'react';
import assetService from '@/services/assetService';
import userService from '@/services/userService';
import assignmentService from '@/services/assignmentService';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import StatusBadge from '@/components/StatusBadge';
import { UserPlus, UserMinus } from 'lucide-react';

export default function AssignmentsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');

  const [assets, setAssets] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([assignmentService.getAll(), assetService.getAll(), userService.getAll()])
      .then(([assignmentRes, assetRes, staffRes]) => {
        setAssignments(assignmentRes.data || []);
        setAssets(assetRes.data || []);
        setStaff(staffRes.data || []);
        setError(null);
      })
      .catch(err => { console.error('Load failed', err); setError('Failed to load data'); })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const availableAssets = assets.filter(a => a.status === 'AVAILABLE');
  const employees = staff.filter(s => s.role === 'EMPLOYEE');

  const handleAssign = () => {
    const asset = assets.find(a => String(a.id) === selectedAsset);
    const user = staff.find(s => String(s.id) === selectedStaff);
    if (!asset || !user) return;

    assignmentService.create({
      assetId: asset.id,
      userId: user.id,
      userName: user.name,
    }).then(() => {
      setDialogOpen(false);
      setSelectedAsset('');
      setSelectedStaff('');
      loadData();
    }).catch(err => {
      console.error('Assignment failed', err);
      setError('Failed to create assignment');
    });
  };

  const handleReturn = (id: number) => {
    assignmentService.returnAsset(id)
      .then(() => loadData())
      .catch(err => {
        console.error('Return failed', err);
        setError('Failed to return asset');
      });
  };

  const rows = assignments.filter(a => a.status !== 'RETURNED');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Asset Assignments</h1>
          <p className="text-muted-foreground text-sm mt-1">Assign and revoke assets to employees</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><UserPlus className="w-4 h-4 mr-2" />New Assignment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Assign Asset to Employee</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Select Available Asset</Label>
                <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                  <SelectTrigger><SelectValue placeholder="Choose an available asset" /></SelectTrigger>
                  <SelectContent>
                    {availableAssets.map(a => (
                      <SelectItem key={a.id} value={String(a.id)}>{a.name} ({a.assetTag})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assign To Employee</Label>
                <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                  <SelectTrigger><SelectValue placeholder="Choose an employee" /></SelectTrigger>
                  <SelectContent>
                    {employees.map(s => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.name} — {s.department}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAssign} className="w-full" disabled={!selectedAsset || !selectedStaff}>
                Confirm Assignment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-xl border shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(assignment => {
              return (
              <TableRow key={assignment.id}>
                <TableCell className="font-medium">{assignment.assetName}</TableCell>
                <TableCell>{assignment.userName}</TableCell>
                <TableCell><StatusBadge status={assignment.status} /></TableCell>
                <TableCell className="text-muted-foreground">{assignment.assignedDate || '—'}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleReturn(assignment.id)}>
                    <UserMinus className="w-4 h-4 mr-1" />Revoke
                  </Button>
                </TableCell>
              </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No active assignments</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
