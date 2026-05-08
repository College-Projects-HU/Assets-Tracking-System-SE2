import api from './api';
import type { AssignmentRecord } from '@/types/api';

export interface CreateAssignmentRequest {
  assetId: number;
  assigneeUserId: number;
  notes?: string;
}

const assignmentService = {
  create: (data: CreateAssignmentRequest) =>
    api.post<AssignmentRecord>('/assignments', data),

  returnAsset: (id: number) =>
    api.post<AssignmentRecord>(`/assignments/${id}/return`),

  getAssetHistory: (assetId: number) =>
    api.get<AssignmentRecord[]>(`/assignments/asset/${assetId}`),

  getActiveForUser: (userId: number) =>
    api.get<AssignmentRecord[]>(`/assignments/user/${userId}/active`),
};

export default assignmentService;
