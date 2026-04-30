import api from './api';
import type { MaintenanceTicket } from '@/lib/mock-data';

export interface CreateTicketRequest {
  assetId: number;
  issueDescription: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface UpdateTicketRequest {
  status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  resolutionDetails?: string;
  technician?: string;
}

const maintenanceService = {
  getAll: () =>
    api.get<MaintenanceTicket[]>('/maintenance/tickets'),

  getById: (id: number) =>
    api.get<MaintenanceTicket>(`/maintenance/tickets/${id}`),

  create: (data: CreateTicketRequest) =>
    api.post<MaintenanceTicket>('/maintenance/tickets', data),

  update: (id: number, data: UpdateTicketRequest) =>
    api.put<MaintenanceTicket>(`/maintenance/tickets/${id}`, data),

  addNote: (id: number, note: string) =>
    api.post(`/maintenance/tickets/${id}/notes`, { note }),

  getByAsset: (assetId: number) =>
    api.get<MaintenanceTicket[]>(`/maintenance/tickets/asset/${assetId}`),

  getMyTickets: () =>
    api.get<MaintenanceTicket[]>('/maintenance/tickets/my'),
};

export default maintenanceService;
