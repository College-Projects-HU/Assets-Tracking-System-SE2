import { cn } from '@/lib/utils';

const statusConfig: Record<string, { className: string; label: string }> = {
  AVAILABLE: { className: 'bg-success/10 text-success border-success/20', label: 'Available' },
  ASSIGNED: { className: 'bg-primary/10 text-primary border-primary/20', label: 'Assigned' },
  UNDER_MAINTENANCE: { className: 'bg-warning/10 text-warning border-warning/20', label: 'Under Maintenance' },
  MAINTENANCE: { className: 'bg-warning/10 text-warning border-warning/20', label: 'Maintenance' },
  RETIRED: { className: 'bg-muted text-muted-foreground border-border', label: 'Retired' },
  LOST_STOLEN: { className: 'bg-destructive/10 text-destructive border-destructive/20', label: 'Lost/Stolen' },
  ADDED: { className: 'bg-info/10 text-info border-info/20', label: 'Added' },
  MAINTENANCE_RESOLVED: { className: 'bg-success/10 text-success border-success/20', label: 'Maintenance Resolved' },
  // Ticket statuses
  OPEN: { className: 'bg-info/10 text-info border-info/20', label: 'Open' },
  IN_PROGRESS: { className: 'bg-warning/10 text-warning border-warning/20', label: 'In Progress' },
  RESOLVED: { className: 'bg-success/10 text-success border-success/20', label: 'Resolved' },
  CLOSED: { className: 'bg-muted text-muted-foreground border-border', label: 'Closed' },
  // Priority
  LOW: { className: 'bg-muted text-muted-foreground border-border', label: 'Low' },
  MEDIUM: { className: 'bg-info/10 text-info border-info/20', label: 'Medium' },
  HIGH: { className: 'bg-warning/10 text-warning border-warning/20', label: 'High' },
  CRITICAL: { className: 'bg-destructive/10 text-destructive border-destructive/20', label: 'Critical' },
};

export default function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { className: 'bg-muted text-muted-foreground border-border', label: status };
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', config.className)}>
      {config.label}
    </span>
  );
}
