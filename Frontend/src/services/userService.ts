import api from './api';
import type { BackendUserDto, PageResponse } from '@/lib/backend';
import { mapUserDto } from '@/lib/backend';
import type { StaffMember } from '@/lib/mock-data';

export interface UpdateProfileRequest {
  fullName: string;
}

export interface UpdateRoleRequest {
  role: 'ADMIN' | 'ASSET_MANAGER' | 'EMPLOYEE';
}

const userService = {
  getAll: () =>
    api.get<BackendUserDto[]>('/users').then((response) => ({
      ...response,
      data: (response.data || []).map(mapUserDto),
    })),

  getMyProfile: () =>
    api.get<BackendUserDto>('/users/profile').then((response) => ({
      ...response,
      data: mapUserDto(response.data),
    })),

  updateMyProfile: (data: UpdateProfileRequest) =>
    api.put<BackendUserDto>('/users/profile', data).then((response) => ({
      ...response,
      data: mapUserDto(response.data),
    })),

  updateRole: (id: number, role: UpdateRoleRequest['role']) =>
    api.put<BackendUserDto>(`/users/${id}/role`, null, { params: { role } }).then((response) => ({
      ...response,
      data: mapUserDto(response.data),
    })),

  delete: (id: number) =>
    api.delete(`/users/${id}`),

  activate: (id: number) =>
    api.put<BackendUserDto>(`/users/${id}/activate`).then((response) => ({
      ...response,
      data: mapUserDto(response.data),
    })),

  getById: (id: number) =>
    api.get<BackendUserDto>('/users/profile').then((response) => ({
      ...response,
      data: mapUserDto(response.data),
    })),

  getByDepartment: (_department: string) =>
    api.get<StaffMember[]>('/users').then((response) => ({
      ...response,
      data: (response.data || []).map(mapUserDto),
    })),
};

export default userService;
