let accessToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
let refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
let refreshInFlight: Promise<void> | null = null;

export const setTokens = (access: string, refresh?: string | null) => {
  accessToken = access;
  localStorage.setItem('access_token', access);
  if (refresh) {
    refreshToken = refresh;
    localStorage.setItem('refresh_token', refresh);
  }
};

export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export const isAuthenticated = () => !!accessToken;

function apiUrl(endpoint: string) {
  if (endpoint.startsWith('/api/')) return endpoint;
  return `/api/ivy${endpoint}`;
}

async function doRefresh() {
  if (!refreshToken) throw new Error('Your session has expired. Please sign in again.');
  const res = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!res.ok) {
    clearTokens();
    throw new Error('Your session has expired. Please sign in again.');
  }
  const data = await res.json();
  if (!data.access_token) {
    clearTokens();
    throw new Error('The refresh response did not include an access token.');
  }
  setTokens(data.access_token, data.refresh_token);
}

async function refreshSession() {
  if (!refreshInFlight) {
    refreshInFlight = doRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  const request = () => fetch(apiUrl(endpoint), { ...options, headers });
  let res = await request();
  
  if (res.status === 401 && refreshToken && endpoint !== '/auth/login') {
    try {
      await refreshSession();
      headers.set('Authorization', `Bearer ${accessToken}`);
      res = await request();
    } catch (error) {
      if (typeof window !== 'undefined') window.location.assign('/login');
      throw error;
    }
  }

  return res;
}
