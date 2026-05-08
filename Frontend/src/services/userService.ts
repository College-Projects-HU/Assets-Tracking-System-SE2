import api from './api';
import type { UserRecord, UserRole } from '@/types/api';

export interface UpdateProfileRequest {
  fullName: string;
}

export interface UpdateRoleRequest {
  role: UserRole;
}

const userService = {
  getProfile: () =>
    api.get<UserRecord>('/users/profile'),

  getAll: (params?: { role?: UserRole; active?: boolean; q?: string }) =>
    api.get<UserRecord[]>('/users', { params }),

  getById: (id: number) =>
    api.get<UserRecord>(`/users/${id}`),

  updateProfile: (data: UpdateProfileRequest) =>
    api.put<UserRecord>('/users/profile', data),

  updateRole: (id: number, data: UpdateRoleRequest) =>
    api.put<UserRecord>(`/users/${id}/role`, data),

  deactivate: (id: number) =>
    api.delete(`/users/${id}`),
};

export default userService;
