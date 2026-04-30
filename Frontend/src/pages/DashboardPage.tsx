import { Package, Users, CheckCircle, AlertTriangle, Archive, Wrench, ShieldAlert } from 'lucide-react';
import { dashboardStats, mockAssets, mockHistory, mockTickets } from '@/lib/mock-data';
import { useAuth } from '@/lib/auth';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';

export default function DashboardPage() {
  const { user } = useAuth();
  const isManager = user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER';

  // Employee-specific data
  const myAssets = mockAssets.filter(a => a.assignedToId === user?.id);
  const myTickets = mockTickets.filter(t => t.reportedById === user?.id);
  const myOpenTickets = myTickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS');

  const recentAssets = mockAssets.slice(0, 5);
  const recentHistory = mockHistory.slice(0, 4);
  const activeTickets = mockTickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold">Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p className="text-muted-foreground mt-1">
          {isManager ? "Here's an overview of your IT asset management system." : "Here's your personal asset and ticket summary."}
        </p>
      </div>

      {/* Stats — role-aware */}
      {isManager ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Total Assets" value={dashboardStats.totalAssets} icon={Package} variant="primary" />
          <StatCard title="Assigned" value={dashboardStats.assigned} icon={Users} variant="accent" />
          <StatCard title="Available" value={dashboardStats.available} icon={CheckCircle} variant="default" />
          <StatCard title="Under Maintenance" value={dashboardStats.underMaintenance} icon={Wrench} variant="warning" />
          <StatCard title="Open Tickets" value={dashboardStats.openTickets} icon={AlertTriangle} variant="warning" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="My Assets" value={myAssets.length} icon={Package} variant="primary" />
          <StatCard title="Open Tickets" value={myOpenTickets.length} icon={Wrench} variant="warning" />
          <StatCard title="Total Tickets" value={myTickets.length} icon={Archive} variant="default" />
        </div>
      )}

      {/* Employee: My Assets */}
      {!isManager && (
        <div className="bg-card rounded-xl border shadow-card p-5">
          <h2 className="font-display font-semibold mb-4">My Assigned Assets</h2>
          {myAssets.length === 0 ? (
            <p className="text-sm text-muted-foreground">No assets assigned to you.</p>
          ) : (
            <div className="space-y-3">
              {myAssets.map(asset => (
                <div key={asset.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{asset.name}</p>
                    <p className="text-xs text-muted-foreground">{asset.assetTag} · {asset.type}</p>
                  </div>
                  <StatusBadge status={asset.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Manager panels */}
      {isManager && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Assets */}
          <div className="bg-card rounded-xl border shadow-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold">Recent Assets</h2>
              <Archive className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {recentAssets.map(asset => (
                <div key={asset.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{asset.name}</p>
                    <p className="text-xs text-muted-foreground">{asset.assetTag} · {asset.type}</p>
                  </div>
                  <StatusBadge status={asset.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Active Tickets */}
          <div className="bg-card rounded-xl border shadow-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold">Active Maintenance Tickets</h2>
              <ShieldAlert className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {activeTickets.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active tickets.</p>
              ) : activeTickets.map(ticket => (
                <div key={ticket.id} className="flex items-start justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{ticket.assetName}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[250px]">{ticket.issueDescription}</p>
                    <div className="flex gap-2 mt-1">
                      <StatusBadge status={ticket.priority} />
                      <StatusBadge status={ticket.status} />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">{ticket.ticketId}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity (all roles) */}
      <div className="bg-card rounded-xl border shadow-card p-5">
        <h2 className="font-display font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {recentHistory.slice(0, isManager ? 6 : 3).map(item => (
            <div key={item.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
              <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">{item.assetName} <span className="text-xs text-muted-foreground font-mono">({item.assetTag})</span></p>
                <p className="text-xs text-muted-foreground">{item.details}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
