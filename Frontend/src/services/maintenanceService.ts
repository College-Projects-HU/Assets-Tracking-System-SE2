import api from './api';
import type { MaintenanceTicketRecord, TicketPriority, TicketStatus } from '@/types/api';

export interface CreateTicketRequest {
  assetId: number;
  issueDescription: string;
  priority: TicketPriority;
  scheduledAt?: string;
}

export interface UpdateTicketRequest {
  status: TicketStatus;
  resolutionDetails?: string;
  technicianUserId?: number;
  maintenanceCost?: number;
}

const maintenanceService = {
  getAll: () =>
    api.get<MaintenanceTicketRecord[]>('/maintenance'),

  getById: (id: number) =>
    api.get<MaintenanceTicketRecord>(`/maintenance/${id}`),

  create: (data: CreateTicketRequest) =>
    api.post<MaintenanceTicketRecord>('/maintenance', data),

  update: (id: number, data: UpdateTicketRequest) =>
    api.put<MaintenanceTicketRecord>(`/maintenance/${id}/status`, data),

  addNote: (id: number, note: string) =>
    api.post(`/maintenance/${id}/notes`, { note }),

  getMyTickets: () =>
    api.get<MaintenanceTicketRecord[]>('/maintenance/my'),
};

export default maintenanceService;
