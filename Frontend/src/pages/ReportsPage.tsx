import { useEffect, useState } from 'react';
import { AlertTriangle, Download, Package, Wrench } from 'lucide-react';
import reportService from '@/services/reportService';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const extractColumns = (rows: Record<string, unknown>[]) => Array.from(new Set(rows.flatMap(row => Object.keys(row))));

async function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function ReportTable({ rows }: { rows: Record<string, unknown>[] }) {
  const columns = extractColumns(rows);

  if (rows.length === 0) {
    return <div className="text-center py-8 text-sm text-muted-foreground">No data available</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map(column => (
            <TableHead key={column}>{column}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, index) => (
          <TableRow key={index}>
            {columns.map(column => (
              <TableCell key={column} className="text-muted-foreground">{formatValue(row[column])}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function ReportsPage() {
  const [inventory, setInventory] = useState<Record<string, unknown>[]>([]);
  const [maintenance, setMaintenance] = useState<Record<string, unknown>[]>([]);
  const [warranty, setWarranty] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');

      try {
        const [inventoryResponse, maintenanceResponse, warrantyResponse] = await Promise.all([
          reportService.getFullInventory(),
          reportService.getMaintenanceSummary(),
          reportService.getWarrantyExpiry(90),
        ]);
        setInventory(inventoryResponse.data);
        setMaintenance(maintenanceResponse.data);
        setWarranty(warrantyResponse.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load reports.');
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">System-wide reports and data exports</p>
      </div>

      {error && <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border shadow-card p-4 text-center">
          <Package className="w-5 h-5 mx-auto text-primary mb-1" />
          <p className="text-2xl font-bold">{loading ? '...' : inventory.length}</p>
          <p className="text-xs text-muted-foreground">Inventory Rows</p>
        </div>
        <div className="bg-card rounded-xl border shadow-card p-4 text-center">
          <Wrench className="w-5 h-5 mx-auto text-warning mb-1" />
          <p className="text-2xl font-bold">{loading ? '...' : maintenance.length}</p>
          <p className="text-xs text-muted-foreground">Maintenance Rows</p>
        </div>
        <div className="bg-card rounded-xl border shadow-card p-4 text-center">
          <AlertTriangle className="w-5 h-5 mx-auto text-destructive mb-1" />
          <p className="text-2xl font-bold">{loading ? '...' : warranty.length}</p>
          <p className="text-xs text-muted-foreground">Expiring Warranty</p>
        </div>
        <div className="bg-card rounded-xl border shadow-card p-4 text-center">
          <Package className="w-5 h-5 mx-auto text-success mb-1" />
          <p className="text-2xl font-bold">{loading ? '...' : inventory.filter(row => String(row.status || row.assetStatus || '').toUpperCase() === 'AVAILABLE').length}</p>
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
            <Button variant="outline" size="sm" onClick={async () => downloadBlob((await reportService.exportFullInventory()).data, 'full-inventory.csv')}>
              <Download className="w-4 h-4 mr-2" />Export CSV
            </Button>
          </div>
          <div className="bg-card rounded-xl border shadow-card overflow-hidden">
            <ReportTable rows={inventory} />
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={async () => downloadBlob((await reportService.exportMaintenanceSummary()).data, 'maintenance-summary.csv')}>
              <Download className="w-4 h-4 mr-2" />Export CSV
            </Button>
          </div>
          <div className="bg-card rounded-xl border shadow-card overflow-hidden">
            <ReportTable rows={maintenance} />
          </div>
        </TabsContent>

        <TabsContent value="warranty" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={async () => downloadBlob((await reportService.exportWarrantyExpiry(90)).data, 'warranty-expiry.csv')}>
              <Download className="w-4 h-4 mr-2" />Export CSV
            </Button>
          </div>
          <div className="bg-card rounded-xl border shadow-card overflow-hidden">
            <ReportTable rows={warranty} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
