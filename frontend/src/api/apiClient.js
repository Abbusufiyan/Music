const getRawBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
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
 * are correctly resolved against VITE_API_URL (e.g. "https://music-production-03ab.up.railway.app/api").
 */
export function resolveApiUrl(url) {
  if (!url || typeof url !== 'string') return url;
  const trimmed = url.trim();

  // Keep absolute URLs (http://, https://, data:, blob:) unchanged
  if (/^(https?:|data:|blob:)/i.test(trimmed)) {
    return trimmed;
  }

  const base = getRawBaseUrl(); // e.g. "https://music-production-03ab.up.railway.app/api"

  if (trimmed.startsWith('/api/')) {
    if (base.endsWith('/api')) {
      const rootOrigin = base.slice(0, -4);
      return `${rootOrigin}${trimmed}`;
    }
    return `${base}${trimmed}`;
  }

  if (trimmed.startsWith('api/')) {
    if (base.endsWith('/api')) {
      const rootOrigin = base.slice(0, -4);
      return `${rootOrigin}/${trimmed}`;
    }
    return `${base}/${trimmed}`;
  }

  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  if (base.endsWith('/api')) {
    return `${base}${cleanPath}`;
  }
  return `${base}/api${cleanPath}`;
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
  const url = `${BASE_URL}${endpoint}`;
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

