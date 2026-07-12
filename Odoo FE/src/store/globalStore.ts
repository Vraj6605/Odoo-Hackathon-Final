import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/common';

interface GlobalState {
  user: User | null;
  token: string | null;
  sidebarOpen: boolean;
  
  // Actions
  setAuth: (user: User | null, token: string | null) => void;
  clearAuth: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      sidebarOpen: true,

      setAuth: (user, token) => {
        if (token) {
          localStorage.setItem('auth_token', token);
        } else {
          localStorage.removeItem('auth_token');
        }
        set({ user, token });
      },
      
      clearAuth: () => {
        localStorage.removeItem('auth_token');
        set({ user: null, token: null });
      },
      
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'enterprise-app-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);
