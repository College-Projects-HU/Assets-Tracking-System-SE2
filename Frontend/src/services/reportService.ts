import type { AssetHistoryItem } from '@/lib/mock-data';
import assetService from './assetService';
import assignmentService from './assignmentService';
import maintenanceService from './maintenanceService';
import { buildHistoryFromAssets, mapAssignmentDto } from '@/lib/backend';

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

const reportService = {
  getAuditLog: () =>
    Promise.all([assetService.getAll(), assignmentService.getAll(), maintenanceService.getAll()]).then(([assetsRes, assignmentsRes, ticketsRes]) => {
      const assetHistory = buildHistoryFromAssets(assetsRes.data);
      const assignmentHistory = assignmentsRes.data.map(mapAssignmentDto);
      const ticketHistory: AssetHistoryItem[] = ticketsRes.data.map((ticket) => ({
        id: ticket.id,
        assetName: ticket.assetName,
        assetTag: ticket.assetTag,
        action: ticket.status,
        performedBy: ticket.reportedBy,
        date: ticket.createdAt,
        details: ticket.issueDescription,
      }));

      return {
        data: [...assignmentHistory, ...assetHistory, ...ticketHistory].slice(0, 50),
      };
    }),

  getDashboardStats: () =>
    Promise.all([assetService.getAll(), maintenanceService.getAll()]).then(([assetsRes, ticketsRes]) => {
      const assets = assetsRes.data;
      const tickets = ticketsRes.data;

      const stats: DashboardStats = {
        totalAssets: assets.length,
        assigned: assets.filter((asset) => asset.status === 'ASSIGNED').length,
        available: assets.filter((asset) => asset.status === 'AVAILABLE').length,
        underMaintenance: assets.filter((asset) => asset.status === 'UNDER_MAINTENANCE').length,
        maintenance: assets.filter((asset) => asset.status === 'UNDER_MAINTENANCE').length,
        retired: assets.filter((asset) => asset.status === 'RETIRED').length,
        lostStolen: assets.filter((asset) => asset.status === 'LOST_STOLEN').length,
        openTickets: tickets.filter((ticket) => ticket.status === 'OPEN').length,
        inProgressTickets: tickets.filter((ticket) => ticket.status === 'IN_PROGRESS').length,
        resolvedTickets: tickets.filter((ticket) => ticket.status === 'RESOLVED').length,
        closedTickets: tickets.filter((ticket) => ticket.status === 'CLOSED').length,
      };

      return { data: stats };
    }),

  getAssetReport: (format: 'json' | 'csv' = 'json') =>
    assetService.getAll().then((response) => ({
      data: format === 'json' ? response.data : response.data,
    })),

  getAssignmentReport: () =>
    assignmentService.getAll().then((response) => ({
      data: response.data,
    })),
};

export default reportService;
