import { useState, useEffect } from 'react';
import { StaffMember } from '@/lib/mock-data';
import userService from '@/services/userService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

export default function ApprovalPage() {
  const [pendingUsers, setPendingUsers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isApplying, setIsApplying] = useState<Record<number, boolean>>({});
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    loadPending();
  }, []);

  const loadPending = () => {
    setLoading(true);
    userService.getAll()
      .then(res => {
        const inactive = res.data.filter(u => u.status === 'INACTIVE' && u.role === 'ASSET_MANAGER');
        setPendingUsers(inactive);
      })
      .catch(err => console.error('Failed to load pending users', err))
      .finally(() => setLoading(false));
  };

  const handleApprove = async (id: number) => {
    if (!window.confirm('Approve this Asset Manager account?')) return;
    setActionError(null);
    setIsApplying(prev => ({ ...prev, [id]: true }));
    try {
      await userService.activate(id);
      setPendingUsers(pendingUsers.filter(u => u.id !== id));
    } catch (err) {
      console.error('Approval failed', err);
      setActionError('Failed to approve user');
    } finally {
      setIsApplying(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleReject = async (id: number) => {
    if (!window.confirm('Reject and deactivate this account request?')) return;
    setActionError(null);
    setIsApplying(prev => ({ ...prev, [id]: true }));
    try {
      await userService.delete(id);
      setPendingUsers(pendingUsers.filter(u => u.id !== id));
    } catch (err) {
      console.error('Rejection failed', err);
      setActionError('Failed to reject user');
    } finally {
      setIsApplying(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Pending Approvals</h1>
        <p className="text-muted-foreground text-sm mt-1">Approve or reject new Asset Manager registrations</p>
      </div>
      {actionError && <div className="text-sm text-destructive">{actionError}</div>}

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading pending requests...</div>
      ) : pendingUsers.length === 0 ? (
        <div className="bg-card rounded-xl border shadow-card p-8 text-center text-muted-foreground">
          No pending approvals found.
        </div>
      ) : (
        <div className="bg-card rounded-xl border shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{user.role.replace('_', ' ')}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleApprove(user.id)}
                        disabled={isApplying[user.id]}
                      >
                        <Check className="w-4 h-4 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(user.id)}
                        disabled={isApplying[user.id]}
                      >
                        <X className="w-4 h-4 mr-1" /> Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
