import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { queryClient } from '@/lib/query-client';

export interface User {
  sub: string;
  role: string;
  schoolId: string;
  userId?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export function isValidJwtPayload(payload: unknown): payload is User {
  return typeof payload === 'object' && payload !== null &&
    'sub' in payload && typeof (payload as User).sub === 'string' &&
    'role' in payload && typeof (payload as User).role === 'string' &&
    'schoolId' in payload && typeof (payload as User).schoolId === 'string';
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => {
        queryClient.clear();
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
