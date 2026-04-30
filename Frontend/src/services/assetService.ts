import api from './api';
import type { Asset } from '@/lib/mock-data';

export interface CreateAssetRequest {
  name: string;
  assetTag?: string;
  category: 'HARDWARE' | 'SOFTWARE_LICENSE';
  type: string;
  brand: string;
  serialNumber: string;
  status: Asset['status'];
  description: string;
  purchaseDate: string;
  purchaseCost: number;
  warrantyExpiry: string;
}

const assetService = {
  getAll: () =>
    api.get<Asset[]>('/assets'),

  getById: (id: number) =>
    api.get<Asset>(`/assets/${id}`),

  create: (data: CreateAssetRequest) =>
    api.post<Asset>('/assets', data),

  update: (id: number, data: Partial<CreateAssetRequest>) =>
    api.put<Asset>(`/assets/${id}`, data),

  delete: (id: number) =>
    api.delete(`/assets/${id}`),

  getByStatus: (status: string) =>
    api.get<Asset[]>(`/assets/status/${status}`),

  getByCategory: (category: string) =>
    api.get<Asset[]>(`/assets/category/${category}`),

  assign: (assetId: number, userId: number) =>
    api.post(`/assets/${assetId}/assign/${userId}`),

  unassign: (assetId: number) =>
    api.post(`/assets/${assetId}/unassign`),

  retire: (assetId: number, reason: string) =>
    api.post(`/assets/${assetId}/retire`, { reason }),

  exportCSV: () =>
    api.get('/assets/export', { responseType: 'blob' }),
};

export default assetService;
