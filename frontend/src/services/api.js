const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Standard HTTP fetch wrapper with authorization header injection
 */
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('visionguard_token');
  const headers = {
    ...(options.headers || {}),
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is not FormData, ensure Content-Type is application/json
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.error?.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.code = data?.error?.code || 'UNKNOWN_ERROR';
    error.details = data?.error?.details;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  register: (body) => apiRequest('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => apiRequest('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => apiRequest('/api/auth/me'),

  // Analyses
  uploadMedia: (formData) => apiRequest('/api/analyses', { method: 'POST', body: formData }),
  getAnalyses: (params = '') => apiRequest(`/api/analyses${params ? '?' + params : ''}`),
  getAnalysisById: (id) => apiRequest(`/api/analyses/${id}`),

  // Incidents
  getIncidents: (params = '') => apiRequest(`/api/incidents${params ? '?' + params : ''}`),
  getIncidentById: (id) => apiRequest(`/api/incidents/${id}`),
  updateIncidentStatus: (id, body) => apiRequest(`/api/incidents/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  }),

  // Dashboard
  getStats: () => apiRequest('/api/dashboard/stats'),

  // Health
  getHealth: () => apiRequest('/api/health'),

  // Media
  getMediaUrl,
};

/**
 * Safely resolves a media file path (such as /uploads/...) to a valid URL
 * supporting local Vite proxy (/uploads/...) and external API bases (https://.../uploads/...).
 */
export function getMediaUrl(filePath) {
  if (!filePath) return '';
  if (
    filePath.startsWith('http://') ||
    filePath.startsWith('https://') ||
    filePath.startsWith('blob:') ||
    filePath.startsWith('data:')
  ) {
    return filePath;
  }
  const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
  if (API_BASE_URL) {
    const trimmedBase = API_BASE_URL.replace(/\/+$/, '');
    return `${trimmedBase}${cleanPath}`;
  }
  return cleanPath;
}
