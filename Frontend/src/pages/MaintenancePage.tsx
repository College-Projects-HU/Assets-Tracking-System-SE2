import { useEffect, useMemo, useState } from 'react';
import { Eye, MessageSquare, Plus, Search } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import assignmentService from '@/services/assignmentService';
import assetService from '@/services/assetService';
import maintenanceService from '@/services/maintenanceService';
import userService from '@/services/userService';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { AssetRecord, MaintenanceTicketRecord, TicketPriority, TicketStatus, UserRecord } from '@/types/api';

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleString() : '—');

export default function MaintenancePage() {
  const { user } = useAuth();
  const isManager = user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER';
  const [tickets, setTickets] = useState<MaintenanceTicketRecord[]>([]);
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [createOpen, setCreateOpen] = useState(false);
  const [detailTicket, setDetailTicket] = useState<MaintenanceTicketRecord | null>(null);
  const [noteText, setNoteText] = useState('');
  const [form, setForm] = useState({ assetId: '', issueDescription: '', priority: 'MEDIUM' as TicketPriority });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      if (isManager) {
        const [ticketsResponse, assetsResponse, usersResponse] = await Promise.all([
          maintenanceService.getAll(),
          assetService.getAll({ size: 200 }),
          userService.getAll({ active: true }),
        ]);
        setTickets(ticketsResponse.data);
        setAssets(assetsResponse.data.content);
        setUsers(usersResponse.data);
      } else {
        const [ticketsResponse, assetsResponse, assignmentsResponse] = await Promise.all([
          maintenanceService.getMyTickets(),
          assetService.getAll({ size: 200 }),
          assignmentService.getActiveForUser(user.id),
        ]);
        const assignedIds = new Set(assignmentsResponse.data.map(item => item.assetId));
        setTickets(ticketsResponse.data);
        setAssets(assetsResponse.data.content.filter(asset => assignedIds.has(asset.id)));
        setUsers([{ id: user.id, fullName: user.name, email: user.email, role: user.role, active: true }]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load maintenance data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [isManager, user?.id]);

  const assetMap = useMemo(() => new Map(assets.map(asset => [asset.id, asset])), [assets]);
  const userMap = useMemo(() => new Map(users.map(member => [member.id, member])), [users]);

  const filtered = tickets.filter(ticket => {
    const asset = assetMap.get(ticket.assetId);
    const matchSearch =
      ticket.ticketCode.toLowerCase().includes(search.toLowerCase()) ||
      ticket.issueDescription.toLowerCase().includes(search.toLowerCase()) ||
      (asset?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (asset?.assetTag || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || ticket.status === filterStatus;
    const matchPriority = filterPriority === 'ALL' || ticket.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  const assignableAssets = assets.filter(asset => asset.status !== 'RETIRED' && asset.status !== 'LOST_STOLEN');

  const handleCreate = async () => {
    setSubmitting(true);
    setError('');

    try {
      await maintenanceService.create({
        assetId: Number(form.assetId),
        issueDescription: form.issueDescription,
        priority: form.priority,
      });
      setCreateOpen(false);
      setForm({ assetId: '', issueDescription: '', priority: 'MEDIUM' });
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create maintenance ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (ticket: MaintenanceTicketRecord, newStatus: TicketStatus) => {
    try {
      await maintenanceService.update(ticket.id, { status: newStatus });
      await loadData();
      if (detailTicket?.id === ticket.id) {
        setDetailTicket(current => (current ? { ...current, status: newStatus } : current));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update ticket status.');
    }
  };

  const handleAddNote = async () => {
    if (!detailTicket || !noteText.trim()) return;

    try {
      await maintenanceService.addNote(detailTicket.id, noteText.trim());
      setNoteText('');
      await loadData();
      const refreshed = await maintenanceService.getById(detailTicket.id);
      setDetailTicket(refreshed.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add ticket note.');
    }
  };

  const nextStatus: Record<TicketStatus, TicketStatus | null> = {
    OPEN: 'IN_PROGRESS',
    IN_PROGRESS: 'RESOLVED',
    RESOLVED: 'CLOSED',
    CLOSED: null,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Maintenance & Repair</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isManager ? 'Manage maintenance tickets and repairs' : 'Submit and track your maintenance requests'}
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />New Ticket</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Submit Maintenance Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Asset</Label>
                <Select value={form.assetId} onValueChange={v => setForm({ ...form, assetId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select asset" /></SelectTrigger>
                  <SelectContent>
                    {assignableAssets.map(asset => (
                      <SelectItem key={asset.id} value={String(asset.id)}>{asset.name} ({asset.assetTag})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Issue Description</Label>
                <Textarea value={form.issueDescription} onChange={e => setForm({ ...form, issueDescription: e.target.value })} placeholder="Describe the issue in detail..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v as TicketPriority })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => void handleCreate()} className="w-full" disabled={!form.assetId || !form.issueDescription || submitting}>
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Priority</SelectItem>
            <SelectItem value="CRITICAL">Critical</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-xl border shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket ID</TableHead>
              <TableHead>Asset</TableHead>
              <TableHead>Issue</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reported By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading tickets...</TableCell></TableRow>
            )}
            {!loading && filtered.map(ticket => {
              const asset = assetMap.get(ticket.assetId);
              const reporter = userMap.get(ticket.reportedByUserId);
              return (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium font-mono text-xs">{ticket.ticketCode}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{asset?.name || `Asset #${ticket.assetId}`}</p>
                      <p className="text-xs text-muted-foreground">{asset?.assetTag || '—'}</p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">{ticket.issueDescription}</TableCell>
                  <TableCell><StatusBadge status={ticket.priority} /></TableCell>
                  <TableCell><StatusBadge status={ticket.status} /></TableCell>
                  <TableCell className="text-muted-foreground">{reporter?.fullName || (ticket.reportedByUserId === user?.id ? user.name : `User #${ticket.reportedByUserId}`)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDate(ticket.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setDetailTicket(ticket)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      {isManager && nextStatus[ticket.status] && (
                        <Button variant="outline" size="sm" onClick={() => void handleStatusChange(ticket, nextStatus[ticket.status]!)}>
                          → {nextStatus[ticket.status]?.replace('_', ' ')}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {!loading && filtered.length === 0 && (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No tickets found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!detailTicket} onOpenChange={(open) => !open && setDetailTicket(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Ticket {detailTicket?.ticketCode}</DialogTitle>
          </DialogHeader>
          {detailTicket && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Asset:</span> <span className="font-medium">{assetMap.get(detailTicket.assetId)?.name || `Asset #${detailTicket.assetId}`}</span></div>
                <div><span className="text-muted-foreground">Tag:</span> <span className="font-mono">{assetMap.get(detailTicket.assetId)?.assetTag || '—'}</span></div>
                <div className="flex items-center gap-2"><span className="text-muted-foreground">Priority:</span> <StatusBadge status={detailTicket.priority} /></div>
                <div className="flex items-center gap-2"><span className="text-muted-foreground">Status:</span> <StatusBadge status={detailTicket.status} /></div>
                <div><span className="text-muted-foreground">Reported by:</span> {userMap.get(detailTicket.reportedByUserId)?.fullName || `User #${detailTicket.reportedByUserId}`}</div>
                <div><span className="text-muted-foreground">Created:</span> {formatDate(detailTicket.createdAt)}</div>
                {detailTicket.technicianUserId && <div><span className="text-muted-foreground">Technician:</span> {userMap.get(detailTicket.technicianUserId)?.fullName || `User #${detailTicket.technicianUserId}`}</div>}
                {detailTicket.resolvedAt && <div><span className="text-muted-foreground">Resolved:</span> {formatDate(detailTicket.resolvedAt)}</div>}
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Issue Description</p>
                <p className="text-sm bg-muted rounded-lg p-3">{detailTicket.issueDescription}</p>
              </div>
              {detailTicket.resolutionDetails && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Resolution</p>
                  <p className="text-sm bg-success/10 rounded-lg p-3">{detailTicket.resolutionDetails}</p>
                </div>
              )}
              {detailTicket.notes.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Notes</p>
                  <div className="space-y-2">
                    {detailTicket.notes.map(note => (
                      <p key={note.id} className="text-sm bg-muted rounded-lg p-2 pl-3 border-l-2 border-primary">
                        {note.note}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              {detailTicket.status !== 'CLOSED' && (
                <div className="flex gap-2">
                  <Input placeholder="Add a note..." value={noteText} onChange={e => setNoteText(e.target.value)} className="flex-1" />
                  <Button onClick={() => void handleAddNote()} disabled={!noteText.trim()} size="sm">Add Note</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
