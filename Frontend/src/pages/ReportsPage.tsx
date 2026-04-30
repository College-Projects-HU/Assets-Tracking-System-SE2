import { mockAssets, mockTickets, dashboardStats } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatusBadge from '@/components/StatusBadge';
import { Download, Package, Wrench, AlertTriangle } from 'lucide-react';

export default function ReportsPage() {
  const warrantyThreshold = new Date();
  warrantyThreshold.setMonth(warrantyThreshold.getMonth() + 3);
  const expiringWarranty = mockAssets.filter(a => new Date(a.warrantyExpiry) <= warrantyThreshold && a.status !== 'RETIRED');

  const exportCSV = (data: Record<string, unknown>[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csv = [headers.join(','), ...data.map(row => headers.map(h => `"${row[h] ?? ''}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">System-wide reports and data exports</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border shadow-card p-4 text-center">
          <Package className="w-5 h-5 mx-auto text-primary mb-1" />
          <p className="text-2xl font-bold">{dashboardStats.totalAssets}</p>
          <p className="text-xs text-muted-foreground">Total Assets</p>
        </div>
        <div className="bg-card rounded-xl border shadow-card p-4 text-center">
          <Wrench className="w-5 h-5 mx-auto text-warning mb-1" />
          <p className="text-2xl font-bold">{dashboardStats.openTickets + dashboardStats.inProgressTickets}</p>
          <p className="text-xs text-muted-foreground">Active Tickets</p>
        </div>
        <div className="bg-card rounded-xl border shadow-card p-4 text-center">
          <AlertTriangle className="w-5 h-5 mx-auto text-destructive mb-1" />
          <p className="text-2xl font-bold">{expiringWarranty.length}</p>
          <p className="text-xs text-muted-foreground">Expiring Warranty</p>
        </div>
        <div className="bg-card rounded-xl border shadow-card p-4 text-center">
          <Package className="w-5 h-5 mx-auto text-success mb-1" />
          <p className="text-2xl font-bold">{dashboardStats.available}</p>
          <p className="text-xs text-muted-foreground">Available</p>
        </div>
      </div>

      <Tabs defaultValue="inventory">
        <TabsList>
          <TabsTrigger value="inventory">Asset Inventory</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance Summary</TabsTrigger>
          <TabsTrigger value="warranty">Warranty Expiry</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => exportCSV(mockAssets.map(a => ({ Name: a.name, Tag: a.assetTag, Category: a.category, Type: a.type, Status: a.status, AssignedTo: a.assignedTo || '', PurchaseDate: a.purchaseDate, Cost: a.purchaseCost, Warranty: a.warrantyExpiry })), 'asset_inventory.csv')}>
              <Download className="w-4 h-4 mr-2" />Export CSV
            </Button>
          </div>
          <div className="bg-card rounded-xl border shadow-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset Tag</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAssets.map(a => (
                  <TableRow key={a.id}>
                    <TableCell className="font-mono text-xs">{a.assetTag}</TableCell>
                    <TableCell className="font-medium">{a.name}</TableCell>
                    <TableCell className="text-muted-foreground">{a.category.replace('_', ' ')}</TableCell>
                    <TableCell><StatusBadge status={a.status} /></TableCell>
                    <TableCell className="text-muted-foreground">{a.assignedTo || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">${a.purchaseCost.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => exportCSV(mockTickets.map(t => ({ TicketID: t.ticketId, Asset: t.assetName, Priority: t.priority, Status: t.status, Reporter: t.reportedBy, Created: t.createdAt, Resolved: t.resolvedAt || '' })), 'maintenance_report.csv')}>
              <Download className="w-4 h-4 mr-2" />Export CSV
            </Button>
          </div>
          <div className="bg-card rounded-xl border shadow-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Asset</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Resolved</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTickets.map(t => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs">{t.ticketId}</TableCell>
                    <TableCell className="font-medium">{t.assetName}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">{t.issueDescription}</TableCell>
                    <TableCell><StatusBadge status={t.priority} /></TableCell>
                    <TableCell><StatusBadge status={t.status} /></TableCell>
                    <TableCell className="text-muted-foreground">{t.createdAt}</TableCell>
                    <TableCell className="text-muted-foreground">{t.resolvedAt || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="warranty" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => exportCSV(expiringWarranty.map(a => ({ Tag: a.assetTag, Name: a.name, Brand: a.brand, WarrantyExpiry: a.warrantyExpiry, Status: a.status })), 'warranty_expiry.csv')}>
              <Download className="w-4 h-4 mr-2" />Export CSV
            </Button>
          </div>
          <div className="bg-card rounded-xl border shadow-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset Tag</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Warranty Expiry</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expiringWarranty.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No assets with expiring warranties</TableCell></TableRow>
                ) : expiringWarranty.map(a => (
                  <TableRow key={a.id}>
                    <TableCell className="font-mono text-xs">{a.assetTag}</TableCell>
                    <TableCell className="font-medium">{a.name}</TableCell>
                    <TableCell className="text-muted-foreground">{a.brand}</TableCell>
                    <TableCell className="text-destructive font-medium">{a.warrantyExpiry}</TableCell>
                    <TableCell><StatusBadge status={a.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
