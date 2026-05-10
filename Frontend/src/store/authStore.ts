import { create } from 'zustand';

export type UserRole = 'ADMIN' | 'ASSET_MANAGER' | 'EMPLOYEE';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  token: string;
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const stored = localStorage.getItem('ats_user');
const initialUser = stored
  ? (() => {
      const parsed = JSON.parse(stored) as Partial<User>;
      if (!parsed.token && !parsed.accessToken) return null;
      return {
        id: parsed.id ?? 0,
        name: parsed.name ?? '',
        email: parsed.email ?? '',
        role: (parsed.role as UserRole) ?? 'EMPLOYEE',
        token: parsed.token ?? parsed.accessToken ?? '',
        accessToken: parsed.accessToken ?? parsed.token ?? '',
        refreshToken: parsed.refreshToken ?? '',
      };
    })()
  : null;

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  isAuthenticated: !!initialUser,
  login: (user: User) => {
    const normalizedUser: User = {
      ...user,
      token: user.token || user.accessToken,
      accessToken: user.accessToken || user.token,
      refreshToken: user.refreshToken || '',
    };
    localStorage.setItem('ats_user', JSON.stringify(normalizedUser));
    set({ user: normalizedUser, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('ats_user');
    set({ user: null, isAuthenticated: false });
  },
}));

export const useAuth = useAuthStore;
