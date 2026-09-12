const API_KEY = 'IVY26-DB796E086273';
const BASE_URL = 'https://solve.ivy.homes';

let accessToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
let refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;

export const setTokens = (access: string, refresh: string) => {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
};

export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export const isAuthenticated = () => !!accessToken;

async function doRefresh() {
  if (!refreshToken) throw new Error('No refresh token available');
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!res.ok) {
    clearTokens();
    throw new Error('Refresh failed');
  }
  const data = await res.json();
  setTokens(data.access_token, data.refresh_token);
}

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  headers.set('X-API-Key', API_KEY);
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const isLocal = endpoint.startsWith('/api/');
  const url = isLocal ? endpoint : `${BASE_URL}${endpoint}`;

  let res = await fetch(url, { ...options, headers });
  
  if (res.status === 401 && refreshToken) {
    // Try to refresh
    try {
      await doRefresh();
      // Retry original request
      headers.set('Authorization', `Bearer ${accessToken}`);
      res = await fetch(url, { ...options, headers });
    } catch (e) {
      if (typeof window !== 'undefined') window.location.href = '/login';
      throw e;
    }
  }

  return res;
}
