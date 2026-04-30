import { useState } from 'react';
import { mockAssets, mockStaff } from '@/lib/mock-data';
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

  const assignedAssets = mockAssets.filter(a => a.status === 'ASSIGNED');
  const availableAssets = mockAssets.filter(a => a.status === 'AVAILABLE');
  const employees = mockStaff.filter(s => s.role === 'EMPLOYEE');

  const handleAssign = () => {
    setDialogOpen(false);
    setSelectedAsset('');
    setSelectedStaff('');
  };

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
              <TableHead>Asset Tag</TableHead>
              <TableHead>Asset</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignedAssets.map(asset => (
              <TableRow key={asset.id}>
                <TableCell className="font-mono text-xs">{asset.assetTag}</TableCell>
                <TableCell className="font-medium">{asset.name}</TableCell>
                <TableCell className="text-muted-foreground">{asset.type}</TableCell>
                <TableCell>{asset.assignedTo}</TableCell>
                <TableCell><StatusBadge status={asset.status} /></TableCell>
                <TableCell className="text-muted-foreground">{asset.addDate}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="text-destructive">
                    <UserMinus className="w-4 h-4 mr-1" />Revoke
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {assignedAssets.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No active assignments</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
