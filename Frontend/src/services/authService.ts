import api from './api';
import type { AuthTokens, UserRole } from '@/types/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}

const authService = {
  login: (data: LoginRequest) =>
    api.post<AuthTokens>('/auth/login', data),

  register: (data: RegisterRequest) =>
    api.post<AuthTokens>('/auth/register', data),

  refreshToken: (refreshToken: string) =>
    api.post<AuthTokens>('/auth/refresh', { refreshToken }),

  logout: () =>
    api.post('/auth/logout'),
};

export default authService;
