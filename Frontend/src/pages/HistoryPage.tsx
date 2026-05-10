import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Filter, Search } from "lucide-react";
import reportService, { type AuditLogEntry } from "@/services/reportService";
import StatusBadge from "@/components/StatusBadge";

const RESOURCE_TYPES = [
  { value: "ALL", label: "All Types" },
  { value: "Asset", label: "Asset" },
  { value: "Assignment", label: "Assignment" },
  { value: "MaintenanceTicket", label: "Maintenance Ticket" },
];

const formatDateTime = (value?: string) => {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default function HistoryPage() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [actorFilter, setActorFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    reportService
      .getAuditLogEntries()
      .then((res) => {
        setEntries(res.data);
        setError(null);
      })
      .catch(() => setError("Failed to load audit log from backend"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = entries.filter((e) => {
    if (typeFilter !== "ALL" && e.resourceType !== typeFilter) return false;
    if (
      actorFilter &&
      !e.actor.toLowerCase().includes(actorFilter.toLowerCase())
    )
      return false;
    return true;
  });

  const exportCSV = () => {
    if (filtered.length === 0) return;
    const headers = [
      "ID",
      "Type",
      "Resource ID",
      "Action",
      "Details",
      "Performed By",
      "Date & Time",
    ];
    const rows = filtered.map((e) => [
      e.id,
      e.resourceType,
      e.resourceId,
      e.action,
      e.details,
      e.actor,
      formatDateTime(e.createdAt),
    ]);
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit_log.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Audit Log</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Complete audit trail of all asset and maintenance operations
            captured via AOP
          </p>
        </div>
        {!loading && !error && (
          <Button
            variant="outline"
            onClick={exportCSV}
            disabled={filtered.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        )}
      </div>

      {/* Filters */}
      {!loading && !error && (
        <div className="flex flex-wrap items-center gap-3 bg-card border rounded-xl p-3">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />

          {/* Resource type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-sm border rounded-md px-3 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {RESOURCE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          {/* Actor search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter by user..."
              value={actorFilter}
              onChange={(e) => setActorFilter(e.target.value)}
              className="text-sm border rounded-md pl-8 pr-3 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-primary w-48"
            />
          </div>

          <span className="text-xs text-muted-foreground ml-auto">
            {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
          </span>
        </div>
      )}

      {/* States */}
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">
          {error}
        </div>
      )}
      {loading && (
        <div className="text-sm text-muted-foreground">
          Loading audit log...
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="bg-card rounded-xl border shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-36">Type</TableHead>
                <TableHead className="w-28">Resource ID</TableHead>
                <TableHead className="w-32">Action</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="w-44">Performed By</TableHead>
                <TableHead className="w-40">Date & Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-12 text-muted-foreground"
                  >
                    {entries.length === 0
                      ? "No audit entries yet. Entries are recorded automatically when assets or tickets are changed."
                      : "No entries match the current filters."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((entry) => (
                  <TableRow key={entry.id}>
                    {/* Resource type badge */}
                    <TableCell>
                      <StatusBadge status={entry.resourceType} />
                    </TableCell>

                    {/* Resource ID */}
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {entry.resourceId || "—"}
                    </TableCell>

                    {/* Action badge */}
                    <TableCell>
                      <StatusBadge status={entry.action} />
                    </TableCell>

                    {/* Details */}
                    <TableCell className="text-sm text-muted-foreground max-w-xs">
                      <span className="line-clamp-2" title={entry.details}>
                        {entry.details || "—"}
                      </span>
                    </TableCell>

                    {/* Performed by */}
                    <TableCell className="text-sm text-muted-foreground">
                      {entry.actor}
                    </TableCell>

                    {/* Date & time */}
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDateTime(entry.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
