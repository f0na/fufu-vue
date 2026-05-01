import type { ApiMessageResponse } from '@/lib/types/api';

const ACCESS_KEY = 'fufu-access-token';
const REFRESH_KEY = 'fufu-refresh-token';

function base_url(): string {
  return import.meta.env.VITE_API_BASE_URL || '';
}

function get_access_token(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

function get_refresh_token(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

function set_tokens(access: string, refresh: string) {
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

function clear_tokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export class ApiError extends Error {
  status: number;
  code?: number;

  constructor(status: number, code?: number, message?: string) {
    super(message || `请求失败 (${status})`);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

let is_refreshing = false;
let refresh_queue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

async function do_refresh(): Promise<string> {
  const refresh = get_refresh_token();
  if (!refresh) throw new ApiError(401, undefined, 'No refresh token');

  const res = await fetch(`${base_url()}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refresh }),
  });

  if (!res.ok) {
    clear_tokens();
    throw new ApiError(res.status, undefined, 'Token refresh failed');
  }

  const data = await res.json();
  set_tokens(data.access_token, data.refresh_token);
  // Sync Pinia store so auth.access_token / auth.refresh_token stay in sync
  try {
    const { useAuthStore } = await import('@/stores/auth');
    const auth_store = useAuthStore();
    auth_store.set_tokens(data.access_token, data.refresh_token);
  } catch {
    // Pinia may not be mounted yet — localStorage is already updated
  }
  return data.access_token;
}

async function handle_refresh(): Promise<string> {
  if (is_refreshing) {
    return new Promise((resolve, reject) => {
      refresh_queue.push({ resolve, reject });
    });
  }

  is_refreshing = true;
  try {
    const token = await do_refresh();
    refresh_queue.forEach((q) => q.resolve(token));
    return token;
  } catch (err) {
    refresh_queue.forEach((q) => q.reject(err));
    throw err;
  } finally {
    refresh_queue = [];
    is_refreshing = false;
  }
}

export async function api_request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${base_url()}${path}`;
  const token = get_access_token();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(url, { ...options, headers });
  } catch {
    throw new ApiError(0, undefined, '无法连接到后端 API，请检查服务是否运行');
  }

  // Auto-refresh on 401
  if (res.status === 401 && get_refresh_token()) {
    try {
      const new_token = await handle_refresh();
      headers['Authorization'] = `Bearer ${new_token}`;
      res = await fetch(url, { ...options, headers });
    } catch {
      clear_tokens();
      window.location.href = '/admin/login';
      throw new ApiError(401, undefined, 'Session expired');
    }
  }

  if (!res.ok) {
    let code: number | undefined;
    let message: string | undefined;
    try {
      const err_body = await res.json();
      code = err_body.error?.code;
      message = err_body.error?.message;
    } catch {
      // ignore parse failure
    }
    throw new ApiError(res.status, code, message);
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

export const api = {
  get: <T>(path: string, params?: Record<string, string>) => {
    let query = '';
    if (params) {
      const sp = new URLSearchParams();
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== '') sp.set(k, v);
      }
      const qs = sp.toString();
      if (qs) query = '?' + qs;
    }
    return api_request<T>(`${path}${query}`);
  },

  post: <T>(path: string, body?: unknown) =>
    api_request<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: <T>(path: string, body?: unknown) =>
    api_request<T>(path, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(path: string, body?: unknown) =>
    api_request<T>(path, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T = ApiMessageResponse>(path: string) =>
    api_request<T>(path, { method: 'DELETE' }),
};
