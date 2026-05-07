import api from './api';
import type { BackendAssignmentDto, BackendAssignmentRequest, PageResponse } from '@/lib/backend';

const assignmentService = {
  getAll: () =>
    api.get<PageResponse<BackendAssignmentDto>>('/assignments').then((response) => ({
      ...response,
      data: response.data.content || [],
    })),

  create: (data: BackendAssignmentRequest) =>
    api.post<BackendAssignmentDto>('/assignments', data),

  returnAsset: (id: number) =>
    api.put<BackendAssignmentDto>(`/assignments/${id}/return`),
};

export default assignmentService;
