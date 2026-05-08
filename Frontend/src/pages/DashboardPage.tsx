import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Archive, CheckCircle, Package, ShieldAlert, Users, Wrench } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import assignmentService from '@/services/assignmentService';
import assetService from '@/services/assetService';
import maintenanceService from '@/services/maintenanceService';
import reportService from '@/services/reportService';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import type { AssetRecord, DashboardStatsRecord, MaintenanceTicketRecord } from '@/types/api';

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleString() : '—');

export default function DashboardPage() {
  const { user } = useAuth();
  const isManager = user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER';
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [tickets, setTickets] = useState<MaintenanceTicketRecord[]>([]);
  const [stats, setStats] = useState<DashboardStatsRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      setLoading(true);
      setError('');

      try {
        if (isManager) {
          const [assetsResponse, ticketsResponse, statsResponse] = await Promise.all([
            assetService.getAll({ size: 200 }),
            maintenanceService.getAll(),
            reportService.getDashboardStats(),
          ]);
          setAssets(assetsResponse.data.content);
          setTickets(ticketsResponse.data);
          setStats(statsResponse.data);
        } else {
          const [assetsResponse, assignmentsResponse, ticketsResponse] = await Promise.all([
            assetService.getAll({ size: 200 }),
            assignmentService.getActiveForUser(user.id),
            maintenanceService.getMyTickets(),
          ]);
          const assignedIds = new Set(assignmentsResponse.data.map(item => item.assetId));
          setAssets(assetsResponse.data.content.filter(asset => assignedIds.has(asset.id)));
          setTickets(ticketsResponse.data);
          setStats(null);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [isManager, user?.id]);

  const managerCounts = useMemo(() => {
    const counts = { totalAssets: 0, assigned: 0, available: 0, underMaintenance: 0, openTickets: 0 };

    if (!stats) return counts;

    counts.totalAssets = stats.assetSummary.reduce((sum, group) => {
      const groupTotal = Object.values(group.statusCounts).reduce((inner, count) => inner + count, 0);
      return sum + groupTotal;
    }, 0);
    counts.assigned = stats.assetSummary.reduce((sum, group) => sum + (group.statusCounts.ASSIGNED || 0), 0);
    counts.available = stats.assetSummary.reduce((sum, group) => sum + (group.statusCounts.AVAILABLE || 0), 0);
    counts.underMaintenance = stats.assetSummary.reduce((sum, group) => sum + (group.statusCounts.UNDER_MAINTENANCE || 0), 0);
    counts.openTickets = tickets.filter(ticket => ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS').length;

    return counts;
  }, [stats, tickets]);

  const myOpenTickets = tickets.filter(ticket => ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS');
  const recentAssets = [...assets].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5);
  const activeTickets = tickets.filter(ticket => ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS').slice(0, 5);
  const recentActivity = [
    ...recentAssets.map(asset => ({
      id: `asset-${asset.id}`,
      title: asset.name,
      tag: asset.assetTag,
      details: `Asset status is ${asset.status.replace('_', ' ').toLowerCase()}`,
      date: asset.updatedAt,
    })),
    ...tickets.slice(0, 4).map(ticket => ({
      id: `ticket-${ticket.id}`,
      title: ticket.ticketCode,
      tag: `Asset #${ticket.assetId}`,
      details: ticket.issueDescription,
      date: ticket.updatedAt,
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, isManager ? 6 : 3);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold">Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p className="text-muted-foreground mt-1">
          {isManager ? "Here's an overview of your IT asset management system." : "Here's your personal asset and ticket summary."}
        </p>
      </div>

      {error && <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      {isManager ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Total Assets" value={loading ? '...' : managerCounts.totalAssets} icon={Package} variant="primary" />
          <StatCard title="Assigned" value={loading ? '...' : managerCounts.assigned} icon={Users} variant="accent" />
          <StatCard title="Available" value={loading ? '...' : managerCounts.available} icon={CheckCircle} variant="default" />
          <StatCard title="Under Maintenance" value={loading ? '...' : managerCounts.underMaintenance} icon={Wrench} variant="warning" />
          <StatCard title="Open Tickets" value={loading ? '...' : managerCounts.openTickets} icon={AlertTriangle} variant="warning" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="My Assets" value={loading ? '...' : assets.length} icon={Package} variant="primary" />
          <StatCard title="Open Tickets" value={loading ? '...' : myOpenTickets.length} icon={Wrench} variant="warning" />
          <StatCard title="Total Tickets" value={loading ? '...' : tickets.length} icon={Archive} variant="default" />
        </div>
      )}

      {!isManager && (
        <div className="bg-card rounded-xl border shadow-card p-5">
          <h2 className="font-display font-semibold mb-4">My Assigned Assets</h2>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading assets...</p>
          ) : assets.length === 0 ? (
            <p className="text-sm text-muted-foreground">No assets assigned to you.</p>
          ) : (
            <div className="space-y-3">
              {assets.map(asset => (
                <div key={asset.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{asset.name}</p>
                    <p className="text-xs text-muted-foreground">{asset.assetTag} · {asset.category.replace('_', ' ')}</p>
                  </div>
                  <StatusBadge status={asset.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isManager && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border shadow-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold">Recently Updated Assets</h2>
              <Archive className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading assets...</p>
              ) : recentAssets.map(asset => (
                <div key={asset.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{asset.name}</p>
                    <p className="text-xs text-muted-foreground">{asset.assetTag} · {asset.category.replace('_', ' ')}</p>
                  </div>
                  <StatusBadge status={asset.status} />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border shadow-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold">Active Maintenance Tickets</h2>
              <ShieldAlert className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading tickets...</p>
              ) : activeTickets.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active tickets.</p>
              ) : activeTickets.map(ticket => (
                <div key={ticket.id} className="flex items-start justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{ticket.ticketCode}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[250px]">{ticket.issueDescription}</p>
                    <div className="flex gap-2 mt-1">
                      <StatusBadge status={ticket.priority} />
                      <StatusBadge status={ticket.status} />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">{formatDate(ticket.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl border shadow-card p-5">
        <h2 className="font-display font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading activity...</p>
          ) : recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent activity yet.</p>
          ) : recentActivity.map(item => (
            <div key={item.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
              <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">{item.title} <span className="text-xs text-muted-foreground font-mono">({item.tag})</span></p>
                <p className="text-xs text-muted-foreground">{item.details}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{formatDate(item.date)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
