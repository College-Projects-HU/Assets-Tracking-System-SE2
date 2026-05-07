export { useAuthStore as useAuth, type User, type UserRole } from '@/store/authStore';
export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Role permission helpers
export const canManageAssets = (role: string) => role === 'ADMIN' || role === 'ASSET_MANAGER';
export const canManageUsers = (role: string) => role === 'ADMIN';
export const canManageTickets = (role: string) => role === 'ADMIN' || role === 'ASSET_MANAGER';
export const canViewReports = (role: string) => role === 'ADMIN' || role === 'ASSET_MANAGER';
