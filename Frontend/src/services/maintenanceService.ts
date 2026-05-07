import api from './api';
import type { MaintenanceTicket } from '@/lib/mock-data';
import assetService from './assetService';
import { formatDate, mapTicketDto, splitNotes, type BackendMaintenanceNoteRequest, type BackendMaintenanceRequest, type BackendMaintenanceTicketDto, type PageResponse } from '@/lib/backend';

export interface CreateTicketRequest {
  assetId: number;
  issueDescription: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  scheduledDate?: string;
}

export interface UpdateTicketRequest {
  status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  resolutionDetails?: string;
  technician?: string;
}

const maintenanceService = {
  getAll: () =>
    Promise.all([assetService.getAll(), api.get<PageResponse<BackendMaintenanceTicketDto>>('/maintenance')]).then(([assetsRes, ticketsRes]) => {
      const assetLookup = new Map(assetsRes.data.map((asset) => [asset.id, asset]));
      return {
        ...ticketsRes,
        data: (ticketsRes.data.content || []).map((ticket) => {
          const asset = assetLookup.get(ticket.assetId);
          return mapTicketDto(ticket, asset?.name || `Asset #${ticket.assetId}`, asset?.assetTag || `ASSET-${String(ticket.assetId).padStart(3, '0')}`, ticket.reportedByUserId ? `User ${ticket.reportedByUserId}` : 'System');
        }),
      };
    }),

  getById: (id: number) =>
    api.get<BackendMaintenanceTicketDto>(`/maintenance/${id}`).then((response) => ({
      ...response,
      data: mapTicketDto(response.data, `Asset #${response.data.assetId}`, `ASSET-${String(response.data.assetId).padStart(3, '0')}`, response.data.reportedByUserId ? `User ${response.data.reportedByUserId}` : 'System'),
    })),

  create: (data: CreateTicketRequest) =>
    api.post<BackendMaintenanceTicketDto>('/maintenance', {
      assetId: data.assetId,
      priority: data.priority,
      description: data.issueDescription,
      scheduledDate: data.scheduledDate,
    } as BackendMaintenanceRequest).then(async (response) => {
      const asset = await assetService.getById(data.assetId);
      return {
        ...response,
        data: mapTicketDto(response.data, asset.data.name, asset.data.assetTag, 'You'),
      };
    }),

  update: (id: number, data: UpdateTicketRequest) => {
    if (data.status) {
      return api.put<BackendMaintenanceTicketDto>(`/maintenance/${id}/status`, null, { params: { status: data.status } }).then((response) => ({
        ...response,
        data: mapTicketDto(response.data, `Asset #${response.data.assetId}`, `ASSET-${String(response.data.assetId).padStart(3, '0')}`, response.data.reportedByUserId ? `User ${response.data.reportedByUserId}` : 'System'),
      }));
    }

    if (data.resolutionDetails || data.technician) {
      const notes = [data.resolutionDetails, data.technician && `Technician: ${data.technician}`].filter(Boolean).join(' | ');
      return api.post<BackendMaintenanceTicketDto>(`/maintenance/${id}/notes`, { notes } as BackendMaintenanceNoteRequest).then((response) => ({
        ...response,
        data: mapTicketDto(response.data, `Asset #${response.data.assetId}`, `ASSET-${String(response.data.assetId).padStart(3, '0')}`, response.data.reportedByUserId ? `User ${response.data.reportedByUserId}` : 'System'),
      }));
    }

    return Promise.reject(new Error('No maintenance update fields provided'));
  },

  addNote: (id: number, note: string) =>
    api.post<BackendMaintenanceTicketDto>(`/maintenance/${id}/notes`, { notes: note } as BackendMaintenanceNoteRequest).then((response) => ({
      ...response,
      data: mapTicketDto(response.data, `Asset #${response.data.assetId}`, `ASSET-${String(response.data.assetId).padStart(3, '0')}`, response.data.reportedByUserId ? `User ${response.data.reportedByUserId}` : 'System'),
    })),

  getByAsset: (assetId: number) =>
    api.get<BackendMaintenanceTicketDto[]>(`/maintenance/asset/${assetId}`),

  getMyTickets: () =>
    api.get<PageResponse<BackendMaintenanceTicketDto>>('/maintenance/my').then((response) => ({
      ...response,
      data: (response.data.content || []).map((ticket) => mapTicketDto(ticket, `Asset #${ticket.assetId}`, `ASSET-${String(ticket.assetId).padStart(3, '0')}`, ticket.reportedByUserId ? `User ${ticket.reportedByUserId}` : 'You')),
    })),
};

export default maintenanceService;
