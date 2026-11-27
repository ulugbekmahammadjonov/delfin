import { API_BASE_URL, tokenStorage } from './config';

export interface ApiEnvelope<T = unknown> {
  success: boolean;
  code: string;
  message: string;
  errors: Record<string, unknown> | string[] | string | null;
  data: T;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  errors?: unknown;

  constructor(message: string, status: number, code?: string, errors?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

let refreshPromise: Promise<string | null> | null = null;
let onUnauthorizedCallback: (() => void) | null = null;

export const registerUnauthorizedHandler = (handler: () => void) => {
  onUnauthorizedCallback = handler;
};

function extractErrorMessage(payload: any, fallback: string): string {
  if (!payload || typeof payload !== 'object') return fallback;

  if (typeof payload.detail === 'string' && payload.detail.trim()) {
    return payload.detail;
  }

  if (payload.errors) {
    if (typeof payload.errors === 'string') return payload.errors;
    if (Array.isArray(payload.errors) && payload.errors.length > 0) {
      return String(payload.errors[0]);
    }
    if (typeof payload.errors === 'object') {
      const firstKey = Object.keys(payload.errors)[0];
      if (firstKey) {
        const val = payload.errors[firstKey];
        if (Array.isArray(val) && val.length > 0) return String(val[0]);
        if (typeof val === 'string') return val;
      }
    }
  }

  if (typeof payload.message === 'string' && payload.message.trim() && payload.message !== 'Error') {
    return payload.message;
  }

  return fallback;
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refresh = tokenStorage.getRefreshToken();
    if (!refresh) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ refresh }),
      });

      if (!response.ok) {
        tokenStorage.clear();
        return null;
      }

      const json = (await response.json()) as ApiEnvelope<{ access: string; refresh?: string }>;
      const access = json?.data?.access;
      const newRefresh = json?.data?.refresh;

      if (!access) {
        tokenStorage.clear();
        return null;
      }

      tokenStorage.setTokens(access, newRefresh);
      return access;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  _retried?: boolean;
}

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiEnvelope<T>> {
  const { skipAuth = false, _retried = false, headers: customHeaders, ...rest } = options;
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(customHeaders);
  if (!headers.has('Content-Type') && !(rest.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Accept', 'application/json');

  if (!skipAuth) {
    const token = tokenStorage.getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(url, {
    ...rest,
    headers,
  });

  if (response.status === 401 && !skipAuth && !_retried) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      return apiRequest<T>(endpoint, { ...options, _retried: true });
    }
    tokenStorage.clear();
    onUnauthorizedCallback?.();
  }

  let payload: any = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || (payload && payload.success === false)) {
    const message = extractErrorMessage(
      payload,
      `Server xatosi (${response.status})`
    );
    throw new ApiError(message, response.status, payload?.code, payload?.errors);
  }

  return payload as ApiEnvelope<T>;
}
