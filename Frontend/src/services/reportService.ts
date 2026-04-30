import api from './api';
import type { AssetHistoryItem } from '@/lib/mock-data';

export interface DashboardStats {
  totalAssets: number;
  assigned: number;
  available: number;
  maintenance: number;
  retired: number;
}

const reportService = {
  getAuditLog: () =>
    api.get<AssetHistoryItem[]>('/reports/audit-log'),

  getDashboardStats: () =>
    api.get<DashboardStats>('/reports/dashboard'),

  getAssetReport: (format: 'json' | 'csv' = 'json') =>
    api.get(`/reports/assets`, { params: { format } }),

  getAssignmentReport: () =>
    api.get('/reports/assignments'),
};

export default reportService;
