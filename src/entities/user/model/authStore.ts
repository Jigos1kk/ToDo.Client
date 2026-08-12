import { create } from 'zustand';

import { setOnUnauthorized } from '@/shared/api/httpClient';
import { tokenStorage } from '@/shared/lib/storage';

import { authApi } from '../api/authApi';
import type { LoginRequest, RoleName, User } from './types';

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'anonymous';

interface AuthState {
  user: User | null;
  status: AuthStatus;
  /** Проверяет сохранённую сессию при старте приложения. */
  bootstrap: () => Promise<void>;
  login: (request: LoginRequest) => Promise<User>;
  logout: () => void;
  hasRole: (role: RoleName) => boolean;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  status: 'idle',

  bootstrap: async () => {
    if (!tokenStorage.getAccessToken()) {
      set({ status: 'anonymous', user: null });
      return;
    }
    set({ status: 'loading' });
    try {
      // Если access-токен протух, интерсептор сам обновит его и повторит запрос
      const user = await authApi.me();
      set({ status: 'authenticated', user });
    } catch {
      tokenStorage.clear();
      set({ status: 'anonymous', user: null });
    }
  },

  login: async (request) => {
    const response = await authApi.login(request);
    tokenStorage.setTokens({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      accessTokenExpiresAt: response.accessTokenExpiresAt,
    });
    set({ status: 'authenticated', user: response.user });
    return response.user;
  },

  logout: () => {
    tokenStorage.clear();
    set({ status: 'anonymous', user: null });
  },

  hasRole: (role) => get().user?.roles.includes(role) ?? false,
}));

// Refresh-токен стал недействителен — разлогиниваем, guard'ы сами
// перенаправят на страницу входа.
setOnUnauthorized(() => useAuthStore.getState().logout());

export function useUser(): User | null {
  return useAuthStore((state) => state.user);
}

export function useIsAuthenticated(): boolean {
  return useAuthStore((state) => state.status === 'authenticated');
}
