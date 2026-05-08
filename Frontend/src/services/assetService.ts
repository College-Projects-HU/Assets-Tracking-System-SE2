import api from './api';
import type { AssetCategory, AssetRecord, AssetStatus, PageResponse } from '@/types/api';

export interface CreateAssetRequest {
  assetTag: string;
  name: string;
  category: AssetCategory;
  serialNumber?: string;
  purchaseDate?: string;
  purchaseCost: number;
  location?: string;
  notes?: string;
}

export interface UpdateAssetRequest {
  name?: string;
  category?: AssetCategory;
  serialNumber?: string;
  purchaseDate?: string;
  purchaseCost?: number;
  location?: string;
  notes?: string;
}

export interface AssetListParams {
  q?: string;
  status?: AssetStatus;
  category?: AssetCategory;
  page?: number;
  size?: number;
}

const assetService = {
  getAll: (params?: AssetListParams) =>
    api.get<PageResponse<AssetRecord>>('/assets', { params }),

  getById: (id: number) =>
    api.get<AssetRecord>(`/assets/${id}`),

  create: (data: CreateAssetRequest) =>
    api.post<AssetRecord>('/assets', data),

  update: (id: number, data: UpdateAssetRequest) =>
    api.put<AssetRecord>(`/assets/${id}`, data),

  delete: (id: number) =>
    api.delete(`/assets/${id}`),

  changeStatus: (id: number, status: AssetStatus, reason?: string) =>
    api.post<AssetRecord>(`/assets/${id}/status`, { status, reason }),

  exportCSV: () =>
    api.get('/reports/full-inventory/export', { responseType: 'blob' }),
};

export default assetService;
