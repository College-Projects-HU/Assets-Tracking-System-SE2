import api from './api';
import type { StaffMember } from '@/lib/mock-data';

export interface UpdateProfileRequest {
  name: string;
  department?: string;
}

const userService = {
  getAll: () =>
    api.get<StaffMember[]>('/users'),

  getById: (id: number) =>
    api.get<StaffMember>(`/users/${id}`),

  updateProfile: (id: number, data: UpdateProfileRequest) =>
    api.put<StaffMember>(`/users/${id}`, data),

  delete: (id: number) =>
    api.delete(`/users/${id}`),

  getByDepartment: (department: string) =>
    api.get<StaffMember[]>(`/users/department/${department}`),
};

export default userService;
