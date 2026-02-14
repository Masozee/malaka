import { create } from 'zustand';
import { authApi, masterdataApi } from '@/services/api';
import { decodeJwt, isTokenExpired } from '@/utils/jwt';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  /** Attempt login with email/password. Throws on failure. */
  login: (email: string, password: string) => Promise<void>;

  /** Logout: clear token + state */
  logout: () => Promise<void>;

  /** Bootstrap: check stored token on app start */
  bootstrap: () => Promise<void>;

  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    const token: string = res.data.token;
    await authApi.setToken(token);

    // Decode JWT for basic user info
    const claims = decodeJwt(token);
    const user: User = {
      id: claims?.sub ?? '',
      email: claims?.email ?? email,
      role: claims?.role ?? '',
      name: '',
      department: '',
      position: '',
      employeeId: '',
    };

    // Try to fetch full profile
    try {
      const profileRes = await masterdataApi.getCurrentUser();
      const d = profileRes.data?.data ?? profileRes.data;
      if (d) {
        user.name = d.full_name || d.username || '';
        user.department = d.department || '';
        user.id = d.id || user.id;
        user.role = d.role || user.role;
      }
    } catch {
      // /users/me might not exist — use JWT claims
      user.name = email.split('@')[0];
    }

    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    await authApi.clearToken();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  bootstrap: async () => {
    try {
      const token = await authApi.getToken();
      if (!token || isTokenExpired(token)) {
        await authApi.clearToken();
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      // Token exists and is valid — decode claims
      const claims = decodeJwt(token);
      const user: User = {
        id: claims?.sub ?? '',
        email: claims?.email ?? '',
        role: claims?.role ?? '',
        name: '',
        department: '',
        position: '',
        employeeId: '',
      };

      // Try to fetch full profile
      try {
        const profileRes = await masterdataApi.getCurrentUser();
        const d = profileRes.data?.data ?? profileRes.data;
        if (d) {
          user.name = d.full_name || d.username || '';
          user.department = d.department || '';
          user.id = d.id || user.id;
          user.role = d.role || user.role;
        }
      } catch {
        user.name = claims?.email?.split('@')[0] ?? '';
      }

      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      await authApi.clearToken();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user) => set({ user }),
}));
