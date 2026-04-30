import api from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'ASSET_MANAGER' | 'EMPLOYEE';
}

export interface AuthResponse {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'ASSET_MANAGER' | 'EMPLOYEE';
  token: string;
}

const authService = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data),

  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', data),

  validateToken: () =>
    api.get<{ valid: boolean }>('/auth/validate'),

  refreshToken: () =>
    api.post<{ token: string }>('/auth/refresh'),

  logout: () =>
    api.post('/auth/logout'),
};

export default authService;
