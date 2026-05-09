import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Audit Log</h1>
          <p className="text-muted-foreground text-sm mt-1">Complete audit trail of all asset activities</p>
        </div>
        {!loading && !error && (
          <Button variant="outline" onClick={() => {
            if (history.length === 0) return;
            const rows = history.map(h => ({ Asset: h.assetName, Tag: h.assetTag, Action: h.action, PerformedBy: h.performedBy, Details: h.details, Date: h.date }));
            const headers = Object.keys(rows[0]);
            const csv = [headers.join(','), ...rows.map(row => headers.map(h => `"${row[h] ?? ''}"`).join(','))].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'audit_log.csv'; a.click(); URL.revokeObjectURL(url);
          }}>
            <Download className="w-4 h-4 mr-2" />Export CSV
          </Button>
        )}
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
