const DEFAULT_PRODUCTION_BACKEND = 'https://music-production-03ab.up.railway.app/api';

const getRawBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }
  // Automatic production Railway fallback if VITE_API_URL is omitted on Vercel or cloud hosts
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return DEFAULT_PRODUCTION_BACKEND;
  }
  return 'http://localhost:3000/api';
};

const BASE_URL = getRawBaseUrl();

export function getApiBaseUrl() {
  return BASE_URL;
}

/**
 * Resolves any relative API or image URL into a fully-qualified backend production URL.
 * Ensures relative asset paths like "/api/images/song/21" or "/api/songs/21/stream"
 * are consistently resolved against the Railway backend URL (e.g. "https://music-production-03ab.up.railway.app/api").
 */
export function resolveApiUrl(url) {
  if (!url || typeof url !== 'string') return url;
  const trimmed = url.trim();

  // Keep data: or blob: unchanged
  if (/^(data:|blob:)/i.test(trimmed)) {
    return trimmed;
  }

  const base = getRawBaseUrl(); // e.g. "https://music-production-03ab.up.railway.app/api"
  let resolved = trimmed;

  if (!/^(https?:)/i.test(trimmed)) {
    if (trimmed.startsWith('/api/')) {
      resolved = base.endsWith('/api') ? `${base.slice(0, -4)}${trimmed}` : `${base}${trimmed}`;
    } else if (trimmed.startsWith('api/')) {
      resolved = base.endsWith('/api') ? `${base.slice(0, -4)}/${trimmed}` : `${base}/${trimmed}`;
    } else {
      const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
      resolved = base.endsWith('/api') ? `${base}${cleanPath}` : `${base}/api${cleanPath}`;
    }
  }

  // Append cache buster v=2 for image URLs so client browsers fetch fresh real artwork
  if (resolved.includes('/api/images/') && !resolved.includes('v=')) {
    const sep = resolved.includes('?') ? '&' : '?';
    resolved = `${resolved}${sep}v=2`;
  }

  return resolved;
}

export function getToken() {
  return localStorage.getItem('app_auth_token');
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('app_auth_token', token);
  } else {
    localStorage.removeItem('app_auth_token');
  }
}

async function request(endpoint, options = {}) {
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (cleanEndpoint.startsWith('/api/')) {
    cleanEndpoint = cleanEndpoint.slice(4);
  }
  const url = `${BASE_URL}${cleanEndpoint}`;
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    // Handle 401 or 403 (invalid/expired token)
    if (response.status === 401 || response.status === 403) {
      setToken(null);
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      error.details = data.details || data.errors;
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err);
    throw err;
  }
}

export const apiClient = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  del: (endpoint) => request(endpoint, { method: 'DELETE' }),
};
