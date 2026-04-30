import { create } from 'zustand';

export type UserRole = 'ADMIN' | 'ASSET_MANAGER' | 'EMPLOYEE';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  token: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const stored = localStorage.getItem('ats_user');
const initialUser = stored ? JSON.parse(stored) : null;

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  isAuthenticated: !!initialUser,
  login: (user: User) => {
    localStorage.setItem('ats_user', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('ats_user');
    set({ user: null, isAuthenticated: false });
  },
}));

export const useAuth = useAuthStore;
