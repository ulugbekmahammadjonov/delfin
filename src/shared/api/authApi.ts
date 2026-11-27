import { apiRequest, ApiEnvelope } from './httpClient';

export interface TokenPair {
  access: string;
  refresh: string;
}

export const authApi = {
  /**
   * POST /api/auth/token/
   * Login with username & password -> returns access & refresh tokens
   */
  login(username: string, password: string): Promise<ApiEnvelope<TokenPair>> {
    return apiRequest<TokenPair>('/api/auth/token/', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({ username, password }),
    });
  },

  /**
   * POST /api/auth/token/refresh/
   * Refresh access token using refresh token
   */
  refresh(refresh: string): Promise<ApiEnvelope<TokenPair>> {
    return apiRequest<TokenPair>('/api/auth/token/refresh/', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({ refresh }),
    });
  },

  /**
   * POST /api/auth/token/verify/
   * Verify if access/refresh token is valid
   */
  verify(token: string): Promise<ApiEnvelope<Record<string, never>>> {
    return apiRequest<Record<string, never>>('/api/auth/token/verify/', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({ token }),
    });
  },

  /**
   * POST /api/auth/logout/
   * Blacklist refresh token on the server
   */
  logout(refresh: string): Promise<ApiEnvelope<Record<string, never>>> {
    return apiRequest<Record<string, never>>('/api/auth/logout/', {
      method: 'POST',
      body: JSON.stringify({ refresh }),
    });
  },
};
