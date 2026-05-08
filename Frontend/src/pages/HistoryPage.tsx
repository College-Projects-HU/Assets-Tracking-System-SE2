import { useEffect, useState } from 'react';
import reportService from '@/services/reportService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import StatusBadge from '@/components/StatusBadge';
import type { AuditLogRecord } from '@/types/api';

const formatDate = (value: string) => new Date(value).toLocaleString();

export default function HistoryPage() {
  const [items, setItems] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await reportService.getAuditLog({ size: 50 });
        setItems(response.data.content);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load audit log.');
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Audit Log</h1>
        <p className="text-muted-foreground text-sm mt-1">Complete audit trail of recorded system activity</p>
      </div>

      {error && <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <div className="bg-card rounded-xl border shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Resource ID</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading audit log...</TableCell></TableRow>
            )}
            {!loading && items.map(item => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.actor}</TableCell>
                <TableCell><StatusBadge status={item.action} /></TableCell>
                <TableCell className="text-muted-foreground">{item.resourceType}</TableCell>
                <TableCell className="font-mono text-xs">{item.resourceId || '—'}</TableCell>
                <TableCell className="text-muted-foreground">{item.details}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(item.createdAt)}</TableCell>
              </TableRow>
            ))}
            {!loading && items.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No audit records found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
