import api from './api';
import type { Asset } from '@/lib/mock-data';
import { mapAssetDto, type BackendAssetDto, type BackendAssetRequest, type PageResponse } from '@/lib/backend';

export interface CreateAssetRequest extends Omit<BackendAssetRequest, 'location'> {
  assetTag?: string;
  type: string;
  brand: string;
  serialNumber: string;
  description: string;
  purchaseCost: number;
  status: Asset['status'];
}

const toRequest = (data: CreateAssetRequest): BackendAssetRequest => ({
  name: data.name,
  category: data.category,
  location: data.description || data.type || data.brand || '',
  purchaseDate: data.purchaseDate,
  warrantyExpiry: data.warrantyExpiry,
});

const assetService = {
  getAll: (params?: { category?: string; status?: string; assignedUserId?: number }) =>
    api.get<PageResponse<BackendAssetDto>>('/assets', { params: { ...params, size: 1000 } }).then((response) => ({
      ...response,
      data: (response.data.content || []).map(mapAssetDto),
    })),

  getById: (id: number) =>
    api.get<BackendAssetDto>(`/assets/${id}`).then((response) => ({
      ...response,
      data: mapAssetDto(response.data),
    })),

  create: (data: CreateAssetRequest) =>
    api.post<BackendAssetDto>('/assets', toRequest(data)).then(async (response) => {
      const created = mapAssetDto(response.data);
      if (data.status && data.status !== created.status) {
        const statusRes = await assetService.updateStatus(created.id, data.status);
        return statusRes;
      }
      return { ...response, data: created };
    }),

  update: (id: number, data: Partial<CreateAssetRequest>) =>
    api.put<BackendAssetDto>(`/assets/${id}`, toRequest({
      name: data.name ?? '',
      category: (data.category as CreateAssetRequest['category']) || 'HARDWARE',
      type: data.type ?? '',
      brand: data.brand ?? '',
      serialNumber: data.serialNumber ?? '',
      status: (data.status as Asset['status']) || 'AVAILABLE',
      description: data.description ?? '',
      purchaseDate: data.purchaseDate ?? '',
      purchaseCost: data.purchaseCost ?? 0,
      warrantyExpiry: data.warrantyExpiry ?? '',
    })).then(async (response) => {
      const updated = mapAssetDto(response.data);
      if (data.status && data.status !== updated.status) {
        return assetService.updateStatus(id, data.status);
      }
      return { ...response, data: updated };
    }),

  updateStatus: (id: number, status: Asset['status']) =>
    api.put<BackendAssetDto>(`/assets/${id}/status`, null, { params: { status } }).then((response) => ({
      ...response,
      data: mapAssetDto(response.data),
    })),

  delete: (id: number) =>
    api.delete(`/assets/${id}`),

  getByStatus: (status: string) =>
    assetService.getAll({ status }),

  getByCategory: (category: string) =>
    assetService.getAll({ category }),

  exportCSV: () =>
    assetService.getAll().then((response) => {
      const headers = ['Asset ID', 'Name', 'Category', 'Status', 'Assigned To', 'Location', 'Purchase Date', 'Warranty Expiry'];
      const rows = response.data.map((asset) => [
        asset.id,
        asset.name,
        asset.category,
        asset.status,
        asset.assignedTo || '',
        asset.description || '',
        asset.purchaseDate,
        asset.warrantyExpiry,
      ]);
      const csv = [headers.join(','), ...rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))].join('\n');
      return { data: csv };
    }),
};

export default assetService;
