import api from './api';
import type { BackendAuthResponse, BackendLoginRequest, BackendRegisterRequest } from '@/lib/backend';

export interface LoginRequest extends BackendLoginRequest {}

export interface RegisterRequest extends BackendRegisterRequest {}

export interface AuthResponse extends BackendAuthResponse {}

const authService = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data),

  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', data),

  refreshToken: (refreshToken: string) =>
    api.post<AuthResponse>('/auth/refresh', { refreshToken }),

  logout: () =>
    api.post('/auth/logout'),
};

export default authService;
