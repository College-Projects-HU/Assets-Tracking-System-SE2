import api from './api';
import type { AssetHistoryItem } from '@/lib/mock-data';
import {
  buildHistoryFromAssets,
  mapAssignmentDto,
  mapAssetDto,
  mapTicketDto,
  type BackendAssetDto,
  type BackendAssignmentDto,
  type BackendMaintenanceTicketDto,
  type PageResponse,
} from '@/lib/backend';

export interface DashboardStats {
  totalAssets: number;
  assigned: number;
  available: number;
  underMaintenance: number;
  maintenance: number;
  retired: number;
  lostStolen: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
}

// Fetch assets directly — no nested service calls
const fetchAssets = () =>
  api
    .get<PageResponse<BackendAssetDto>>('/assets', { params: { size: 1000 } })
    .then((r) => (r.data.content || []).map(mapAssetDto));

// Fetch maintenance tickets directly — no nested service calls
const fetchTickets = () =>
  api
    .get<PageResponse<BackendMaintenanceTicketDto>>('/maintenance', { params: { size: 1000 } })
    .then((r) =>
      (r.data.content || []).map((t) =>
        mapTicketDto(
          t,
          `Asset #${t.assetId}`,
          `ASSET-${String(t.assetId).padStart(3, '0')}`,
          t.reportedByUserId ? `User ${t.reportedByUserId}` : 'System',
        ),
      ),
    )
    .catch(() => [] as ReturnType<typeof mapTicketDto>[]);

// Fetch assignments directly — no nested service calls
const fetchAssignments = () =>
  api
    .get<PageResponse<BackendAssignmentDto>>('/assignments', { params: { size: 1000 } })
    .then((r) => r.data.content || [])
    .catch(() => [] as BackendAssignmentDto[]); // assignments may 403 for some roles — degrade gracefully

const reportService = {
  /**
   * Dashboard stats: computed from assets + tickets fetched directly.
   * Does NOT nest maintenanceService or assetService to avoid cascade failures.
   */
  getDashboardStats: () =>
    Promise.all([fetchAssets(), fetchTickets()]).then(([assets, tickets]) => {
      const stats: DashboardStats = {
        totalAssets: assets.length,
        assigned: assets.filter((a) => a.status === 'ASSIGNED').length,
        available: assets.filter((a) => a.status === 'AVAILABLE').length,
        underMaintenance: assets.filter((a) => a.status === 'UNDER_MAINTENANCE').length,
        maintenance: assets.filter((a) => a.status === 'UNDER_MAINTENANCE').length,
        retired: assets.filter((a) => a.status === 'RETIRED').length,
        lostStolen: assets.filter((a) => a.status === 'LOST_STOLEN').length,
        openTickets: tickets.filter((t) => t.status === 'OPEN').length,
        inProgressTickets: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
        resolvedTickets: tickets.filter((t) => t.status === 'RESOLVED').length,
        closedTickets: tickets.filter((t) => t.status === 'CLOSED').length,
      };
      return { data: stats };
    }),

  /**
   * Audit log: assembled from assets, assignments, and tickets fetched directly.
   * Assignments degrade gracefully if the endpoint is forbidden for this role.
   */
  getAuditLog: () =>
    api.get<PageResponse<{
      id: number;
      actor: string;
      action: string;
      details: string;
      resourceType: string;
      resourceId: string;
      createdAt: string;
    }>>('/reports/audit-log', { params: { page: 0, size: 1000 } }).then((response) => ({
      ...response,
      data: (response.data.content || []).map((log) => ({
        id: log.id,
        assetName: log.resourceType || 'Resource',
        assetTag: log.resourceId || '-',
        action: log.action,
        performedBy: log.actor,
        date: log.createdAt,
        details: log.details,
      } as AssetHistoryItem)),
    })),

  getAssetReport: (format: 'json' | 'csv' = 'json') =>
    fetchAssets().then((data) => ({ data: format === 'json' ? data : data })),

  getAssignmentReport: () =>
    fetchAssignments().then((data) => ({ data })),
};

export default reportService;
