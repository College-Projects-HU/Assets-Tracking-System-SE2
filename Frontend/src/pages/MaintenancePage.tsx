import { useState } from 'react';
import { mockTickets, mockAssets, MaintenanceTicket, TicketPriority, TicketStatus } from '@/lib/mock-data';
import { useAuth } from '@/lib/auth';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Eye, MessageSquare } from 'lucide-react';

export default function MaintenancePage() {
  const { user } = useAuth();
  const isManager = user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER';
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(mockTickets);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [createOpen, setCreateOpen] = useState(false);
  const [detailTicket, setDetailTicket] = useState<MaintenanceTicket | null>(null);
  const [noteText, setNoteText] = useState('');
  const [form, setForm] = useState({ assetId: '', issueDescription: '', priority: 'MEDIUM' as TicketPriority });

  // Employees see only their tickets
  const visibleTickets = isManager ? tickets : tickets.filter(t => t.reportedById === user?.id);

  const filtered = visibleTickets.filter(t => {
    const matchSearch = t.assetName.toLowerCase().includes(search.toLowerCase()) || t.ticketId.toLowerCase().includes(search.toLowerCase()) || t.issueDescription.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || t.status === filterStatus;
    const matchPriority = filterPriority === 'ALL' || t.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  // Assets assigned to current user (for employees) or all (for managers)
  const assignableAssets = isManager
    ? mockAssets.filter(a => a.status !== 'RETIRED' && a.status !== 'LOST_STOLEN')
    : mockAssets.filter(a => a.assignedToId === user?.id);

  const handleCreate = () => {
    const asset = mockAssets.find(a => a.id === Number(form.assetId));
    if (!asset || !user) return;
    const newTicket: MaintenanceTicket = {
      id: Date.now(),
      ticketId: `TKT-${String(tickets.length + 1).padStart(3, '0')}`,
      assetId: asset.id,
      assetName: asset.name,
      assetTag: asset.assetTag,
      reportedBy: user.name,
      reportedById: user.id,
      issueDescription: form.issueDescription,
      priority: form.priority,
      status: 'OPEN',
      notes: [],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setTickets([newTicket, ...tickets]);
    setCreateOpen(false);
    setForm({ assetId: '', issueDescription: '', priority: 'MEDIUM' });
  };

  const handleStatusChange = (ticket: MaintenanceTicket, newStatus: TicketStatus) => {
    setTickets(tickets.map(t => t.id === ticket.id ? {
      ...t,
      status: newStatus,
      updatedAt: new Date().toISOString().split('T')[0],
      ...(newStatus === 'RESOLVED' ? { resolvedAt: new Date().toISOString().split('T')[0] } : {}),
      ...(newStatus === 'CLOSED' ? { closedAt: new Date().toISOString().split('T')[0] } : {}),
    } : t));
    if (detailTicket?.id === ticket.id) {
      setDetailTicket({ ...ticket, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] });
    }
  };

  const handleAddNote = () => {
    if (!detailTicket || !noteText.trim()) return;
    const updated = { ...detailTicket, notes: [...detailTicket.notes, noteText.trim()], updatedAt: new Date().toISOString().split('T')[0] };
    setTickets(tickets.map(t => t.id === updated.id ? updated : t));
    setDetailTicket(updated);
    setNoteText('');
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
                    {assignableAssets.map(a => (
                      <SelectItem key={a.id} value={String(a.id)}>{a.name} ({a.assetTag})</SelectItem>
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
              <Button onClick={handleCreate} className="w-full" disabled={!form.assetId || !form.issueDescription}>
                Submit Ticket
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
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

      {/* Table */}
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
            {filtered.map(ticket => (
              <TableRow key={ticket.id}>
                <TableCell className="font-medium font-mono text-xs">{ticket.ticketId}</TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium">{ticket.assetName}</p>
                    <p className="text-xs text-muted-foreground">{ticket.assetTag}</p>
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">{ticket.issueDescription}</TableCell>
                <TableCell><StatusBadge status={ticket.priority} /></TableCell>
                <TableCell><StatusBadge status={ticket.status} /></TableCell>
                <TableCell className="text-muted-foreground">{ticket.reportedBy}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{ticket.createdAt}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setDetailTicket(ticket)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    {isManager && nextStatus[ticket.status] && (
                      <Button variant="outline" size="sm" onClick={() => handleStatusChange(ticket, nextStatus[ticket.status]!)}>
                        → {nextStatus[ticket.status]?.replace('_', ' ')}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No tickets found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Ticket Detail Dialog */}
      <Dialog open={!!detailTicket} onOpenChange={(open) => !open && setDetailTicket(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Ticket {detailTicket?.ticketId}</DialogTitle>
          </DialogHeader>
          {detailTicket && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Asset:</span> <span className="font-medium">{detailTicket.assetName}</span></div>
                <div><span className="text-muted-foreground">Tag:</span> <span className="font-mono">{detailTicket.assetTag}</span></div>
                <div className="flex items-center gap-2"><span className="text-muted-foreground">Priority:</span> <StatusBadge status={detailTicket.priority} /></div>
                <div className="flex items-center gap-2"><span className="text-muted-foreground">Status:</span> <StatusBadge status={detailTicket.status} /></div>
                <div><span className="text-muted-foreground">Reported by:</span> {detailTicket.reportedBy}</div>
                <div><span className="text-muted-foreground">Created:</span> {detailTicket.createdAt}</div>
                {detailTicket.technician && <div><span className="text-muted-foreground">Technician:</span> {detailTicket.technician}</div>}
                {detailTicket.resolvedAt && <div><span className="text-muted-foreground">Resolved:</span> {detailTicket.resolvedAt}</div>}
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
                    {detailTicket.notes.map((note, i) => (
                      <p key={i} className="text-sm bg-muted rounded-lg p-2 pl-3 border-l-2 border-primary">{note}</p>
                    ))}
                  </div>
                </div>
              )}
              {isManager && detailTicket.status !== 'CLOSED' && (
                <div className="flex gap-2">
                  <Input placeholder="Add a note..." value={noteText} onChange={e => setNoteText(e.target.value)} className="flex-1" />
                  <Button onClick={handleAddNote} disabled={!noteText.trim()} size="sm">Add Note</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
