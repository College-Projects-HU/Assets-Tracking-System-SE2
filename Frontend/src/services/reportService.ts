import api from './api';
import type { AuditLogRecord, DashboardStatsRecord, PageResponse } from '@/types/api';

const reportService = {
  getAuditLog: (params?: { startDate?: string; endDate?: string; actor?: string; page?: number; size?: number }) =>
    api.get<PageResponse<AuditLogRecord>>('/reports/audit-log', { params }),

  getDashboardStats: () =>
    api.get<DashboardStatsRecord>('/reports/dashboard-stats'),

  getFullInventory: (params?: { startDate?: string; endDate?: string; category?: string; status?: string }) =>
    api.get<Record<string, unknown>[]>('/reports/full-inventory', { params }),

  exportFullInventory: (params?: { startDate?: string; endDate?: string; category?: string; status?: string }) =>
    api.get('/reports/full-inventory/export', { params, responseType: 'blob' }),

  getMaintenanceSummary: (params?: { startDate?: string; endDate?: string }) =>
    api.get<Record<string, unknown>[]>('/reports/maintenance-summary', { params }),

  exportMaintenanceSummary: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/reports/maintenance-summary/export', { params, responseType: 'blob' }),

  getWarrantyExpiry: (days = 30) =>
    api.get<Record<string, unknown>[]>('/reports/warranty-expiry', { params: { days } }),

  exportWarrantyExpiry: (days = 30) =>
    api.get('/reports/warranty-expiry/export', { params: { days }, responseType: 'blob' }),
};

export default reportService;
