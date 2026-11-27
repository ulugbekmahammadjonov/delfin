import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  authApi,
  tokenStorage,
  registerUnauthorizedHandler,
  StoredAuthUser,
} from '@/shared/api';

export interface AuthContextType {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  user: StoredAuthUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const jsonStr = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

function buildUserFromToken(access: string, fallbackUsername?: string): StoredAuthUser {
  const payload = decodeJwtPayload(access);
  const existing = tokenStorage.getUser();
  return {
    username:
      payload?.username ||
      fallbackUsername ||
      existing?.username ||
      'Administrator',
    userId: payload?.user_id ?? existing?.userId,
    role: payload?.role ?? existing?.role,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredAuthUser | null>(() => tokenStorage.getUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  const clearSession = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    registerUnauthorizedHandler(clearSession);
  }, [clearSession]);

  // Verify / refresh token on initial app mount
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const access = tokenStorage.getAccessToken();
      const refresh = tokenStorage.getRefreshToken();

      if (!access && !refresh) {
        if (isMounted) {
          setIsAuthenticated(false);
          setIsAuthLoading(false);
        }
        return;
      }

      try {
        if (access) {
          try {
            await authApi.verify(access);
            if (isMounted) {
              const authUser = buildUserFromToken(access);
              tokenStorage.setUser(authUser);
              setUser(authUser);
              setIsAuthenticated(true);
            }
            return;
          } catch {
            // Access token invalid or expired -> try refresh below
          }
        }

        if (refresh) {
          const refreshRes = await authApi.refresh(refresh);
          const newAccess = refreshRes.data?.access;
          const newRefresh = refreshRes.data?.refresh;

          if (newAccess) {
            tokenStorage.setTokens(newAccess, newRefresh);
            if (isMounted) {
              const authUser = buildUserFromToken(newAccess);
              tokenStorage.setUser(authUser);
              setUser(authUser);
              setIsAuthenticated(true);
            }
            return;
          }
        }

        if (isMounted) {
          clearSession();
        }
      } catch {
        if (isMounted) {
          clearSession();
        }
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [clearSession]);

  const login = async (username: string, password: string) => {
    const res = await authApi.login(username, password);
    const access = res.data?.access;
    const refresh = res.data?.refresh;

    if (!access || !refresh) {
      throw new Error('Serverdan token olinmadi');
    }

    tokenStorage.setTokens(access, refresh);
    const authUser = buildUserFromToken(access, username);
    tokenStorage.setUser(authUser);
    setUser(authUser);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    const refresh = tokenStorage.getRefreshToken();
    try {
      if (refresh) {
        await authApi.logout(refresh);
      }
    } catch (e) {
      // Even if blacklist API fails or token already expired, clear local session
      console.warn('Logout API xatoligi:', e);
    } finally {
      clearSession();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAuthLoading,
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
