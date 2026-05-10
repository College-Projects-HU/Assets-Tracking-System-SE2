import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatusBadge from "@/components/StatusBadge";
import { Download, Package, AlertTriangle } from "lucide-react";
import reportService, { type AuditLogEntry } from "@/services/reportService";
import assetService from "@/services/assetService";
import { useAuth } from "@/lib/auth";

export default function ReportsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [assets, setAssets] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auditEntries, setAuditEntries] = useState<AuditLogEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([assetService.getAll(), reportService.getDashboardStats()])
      .then(([aRes, sRes]) => {
        setAssets(aRes.data || []);
        setStats(sRes.data || null);
        setError(null);
      })
      .catch((err) => {
        console.error("Reports load error", err);
        setError("Failed to load report data from backend");
      })
      .finally(() => setLoading(false));
    // Fetch audit entries for admin (endpoint requires ADMIN role)
    if (isAdmin) {
      setAuditLoading(true);
      reportService
        .getAuditLogEntries()
        .then((res) => setAuditEntries(res.data))
        .catch(() => setAuditEntries([]))
        .finally(() => setAuditLoading(false));
    }
  }, [isAdmin]);

  const ticketAuditEntries = useMemo(
    () => auditEntries.filter((e) => e.resourceType === "MaintenanceTicket"),
    [auditEntries],
  );

  const formatDateTime = (value?: string) => {
    if (!value) return "—";
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const warrantyThreshold = new Date();
  warrantyThreshold.setMonth(warrantyThreshold.getMonth() + 3);
  const expiringWarranty = assets.filter(
    (a) =>
      new Date(a.warrantyExpiry) <= warrantyThreshold && a.status !== "RETIRED",
  );

  const exportCSV = async (filename: string) => {
    try {
      const res = await assetService.exportCSV();
      const blob = new Blob([res.data], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">
          System-wide reports and data exports
        </p>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading reports...</div>
      ) : error ? (
        <div className="text-sm text-destructive">{error}</div>
      ) : (
        <>
          {/* Summary Cards — asset-focused only */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card rounded-xl border shadow-card p-4 text-center">
              <Package className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="text-2xl font-bold">{assets.length}</p>
              <p className="text-xs text-muted-foreground">Total Assets</p>
            </div>
            <div className="bg-card rounded-xl border shadow-card p-4 text-center">
              <AlertTriangle className="w-5 h-5 mx-auto text-destructive mb-1" />
              <p className="text-2xl font-bold">{expiringWarranty.length}</p>
              <p className="text-xs text-muted-foreground">Expiring Warranty</p>
            </div>
            <div className="bg-card rounded-xl border shadow-card p-4 text-center">
              <Package className="w-5 h-5 mx-auto text-success mb-1" />
              <p className="text-2xl font-bold">
                {assets.filter((a) => a.status === "AVAILABLE").length}
              </p>
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportCSV("asset_inventory.csv")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assets.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-mono text-xs">
                          {a.assetTag}
                        </TableCell>
                        <TableCell className="font-medium">{a.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {a.category.replace("_", " ")}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={a.status} />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {a.assignedTo || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Audit trail of all maintenance ticket operations
                </p>
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={ticketAuditEntries.length === 0}
                    onClick={() => {
                      const headers = [
                        "Ticket ID",
                        "Action",
                        "Details",
                        "Performed By",
                        "Date & Time",
                      ];
                      const rows = ticketAuditEntries.map((e) => [
                        e.resourceId,
                        e.action,
                        e.details,
                        e.actor,
                        formatDateTime(e.createdAt),
                      ]);
                      const csv = [
                        headers.join(","),
                        ...rows.map((r) =>
                          r
                            .map(
                              (c) => `"${String(c ?? "").replace(/"/g, '""')}"`,
                            )
                            .join(","),
                        ),
                      ].join("\n");
                      const blob = new Blob([csv], { type: "text/csv" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "maintenance_audit.csv";
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                )}
              </div>

              {!isAdmin ? (
                <div className="bg-card border rounded-xl p-8 text-center text-sm text-muted-foreground">
                  Maintenance ticket audit trail is available to administrators
                  only.
                </div>
              ) : auditLoading ? (
                <div className="text-sm text-muted-foreground">
                  Loading ticket audit trail...
                </div>
              ) : (
                <div className="bg-card rounded-xl border shadow-card overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-36">Ticket ID</TableHead>
                        <TableHead className="w-32">Action</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead className="w-44">Performed By</TableHead>
                        <TableHead className="w-40">Date & Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ticketAuditEntries.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-10 text-muted-foreground"
                          >
                            No maintenance ticket audit entries yet. Entries are
                            recorded automatically when tickets are created or
                            updated.
                          </TableCell>
                        </TableRow>
                      ) : (
                        ticketAuditEntries.map((e) => (
                          <TableRow key={e.id}>
                            <TableCell className="font-mono text-xs">
                              {e.resourceId || "—"}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={e.action} />
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground max-w-xs">
                              <span className="line-clamp-2" title={e.details}>
                                {e.details || "—"}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {e.actor}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                              {formatDateTime(e.createdAt)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="warranty" className="space-y-4">
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (expiringWarranty.length === 0) return;
                    const rows = expiringWarranty.map((a) => ({
                      Tag: a.assetTag,
                      Name: a.name,
                      Brand: a.brand,
                      WarrantyExpiry: a.warrantyExpiry,
                      Status: a.status,
                    }));
                    const headers = Object.keys(rows[0]);
                    const csv = [
                      headers.join(","),
                      ...rows.map((row) =>
                        headers.map((h) => `"${row[h] ?? ""}"`).join(","),
                      ),
                    ].join("\n");
                    const blob = new Blob([csv], { type: "text/csv" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "warranty_expiry.csv";
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
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
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No assets with expiring warranties
                        </TableCell>
                      </TableRow>
                    ) : (
                      expiringWarranty.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell className="font-mono text-xs">
                            {a.assetTag}
                          </TableCell>
                          <TableCell className="font-medium">
                            {a.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {a.brand}
                          </TableCell>
                          <TableCell className="text-destructive font-medium">
                            {a.warrantyExpiry}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={a.status} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
