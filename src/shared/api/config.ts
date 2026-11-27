export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'https://pectin-condone-tarnish.ngrok-free.dev'
).replace(/\/+$/, '');

const ACCESS_TOKEN_KEY = 'delfin_access_token';
const REFRESH_TOKEN_KEY = 'delfin_refresh_token';
const AUTH_USER_KEY = 'delfin_auth_user';

export interface StoredAuthUser {
  username: string;
  userId?: string | number;
  role?: string;
}

export const tokenStorage = {
  getAccessToken(): string | null {
    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setTokens(access: string, refresh?: string): void {
    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, access);
      if (refresh) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
      }
    } catch (e) {
      console.warn('Token saqlashda xatolik:', e);
    }
  },

  getUser(): StoredAuthUser | null {
    try {
      const raw = localStorage.getItem(AUTH_USER_KEY);
      return raw ? (JSON.parse(raw) as StoredAuthUser) : null;
    } catch {
      return null;
    }
  },

  setUser(user: StoredAuthUser): void {
    try {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn('Foydalanuvchi ma\'lumotini saqlashda xatolik:', e);
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
    } catch (e) {
      console.warn('Tokenlarni tozalashda xatolik:', e);
    }
  },
};
