import { useEffect, useMemo, useState } from 'react';
import { UserMinus, UserPlus } from 'lucide-react';
import assignmentService from '@/services/assignmentService';
import assetService from '@/services/assetService';
import reportService from '@/services/reportService';
import userService from '@/services/userService';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import StatusBadge from '@/components/StatusBadge';
import type { AssetRecord, ReportAssignmentSummary, UserRecord } from '@/types/api';

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleString() : '—');

export default function AssignmentsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [employees, setEmployees] = useState<UserRecord[]>([]);
  const [activeAssignments, setActiveAssignments] = useState<ReportAssignmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [assetsResponse, usersResponse, statsResponse] = await Promise.all([
        assetService.getAll({ size: 200 }),
        userService.getAll({ role: 'EMPLOYEE', active: true }),
        reportService.getDashboardStats(),
      ]);

      setAssets(assetsResponse.data.content);
      setEmployees(usersResponse.data.filter(user => user.role === 'EMPLOYEE' && user.active));
      setActiveAssignments(statsResponse.data.activeAssignments);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load assignments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const assetMap = useMemo(() => new Map(assets.map(asset => [asset.id, asset])), [assets]);
  const assignedAssetIds = new Set(activeAssignments.map(item => item.assetId));
  const availableAssets = assets.filter(asset => asset.status === 'AVAILABLE' && !assignedAssetIds.has(asset.id));

  const handleAssign = async () => {
    setSubmitting(true);
    setError('');

    try {
      await assignmentService.create({
        assetId: Number(selectedAsset),
        assigneeUserId: Number(selectedStaff),
      });
      setDialogOpen(false);
      setSelectedAsset('');
      setSelectedStaff('');
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturn = async (assignmentId: number) => {
    try {
      await assignmentService.returnAsset(assignmentId);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to return asset.');
    }
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
                    {availableAssets.map(asset => (
                      <SelectItem key={asset.id} value={String(asset.id)}>{asset.name} ({asset.assetTag})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assign To Employee</Label>
                <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                  <SelectTrigger><SelectValue placeholder="Choose an employee" /></SelectTrigger>
                  <SelectContent>
                    {employees.map(employee => (
                      <SelectItem key={employee.id} value={String(employee.id)}>{employee.fullName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => void handleAssign()} className="w-full" disabled={!selectedAsset || !selectedStaff || submitting}>
                {submitting ? 'Assigning...' : 'Confirm Assignment'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <div className="bg-card rounded-xl border shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset Tag</TableHead>
              <TableHead>Asset</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading assignments...</TableCell></TableRow>
            )}
            {!loading && activeAssignments.map(assignment => {
              const asset = assetMap.get(assignment.assetId);
              return (
                <TableRow key={assignment.id}>
                  <TableCell className="font-mono text-xs">{asset?.assetTag || '—'}</TableCell>
                  <TableCell className="font-medium">{asset?.name || `Asset #${assignment.assetId}`}</TableCell>
                  <TableCell className="text-muted-foreground">{asset?.category?.replace('_', ' ') || '—'}</TableCell>
                  <TableCell>{assignment.assigneeName}</TableCell>
                  <TableCell><StatusBadge status={assignment.status} /></TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(asset?.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => void handleReturn(assignment.id)}>
                      <UserMinus className="w-4 h-4 mr-1" />Revoke
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {!loading && activeAssignments.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No active assignments</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
