import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import reportService from '@/services/reportService';
import StatusBadge from '@/components/StatusBadge';

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    reportService.getAuditLog()
      .then(res => { setHistory(res.data || []); setError(null); })
      .catch(err => { console.error('Load failed', err); setError('Failed to load audit log'); })
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Audit Log</h1>
        <p className="text-muted-foreground text-sm mt-1">Complete audit trail of all asset activities</p>
      </div>
      {error && <div className="text-sm text-destructive">{error}</div>}
      {loading && <div className="text-sm text-muted-foreground">Loading audit log...</div>}
      {!loading && !error && (
        <div className="bg-card rounded-xl border shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Tag</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Performed By</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.assetName}</TableCell>
                  <TableCell className="font-mono text-xs">{item.assetTag}</TableCell>
                  <TableCell><StatusBadge status={item.action} /></TableCell>
                  <TableCell className="text-muted-foreground">{item.performedBy}</TableCell>
                  <TableCell className="text-muted-foreground">{item.details}</TableCell>
                  <TableCell className="text-muted-foreground">{item.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
