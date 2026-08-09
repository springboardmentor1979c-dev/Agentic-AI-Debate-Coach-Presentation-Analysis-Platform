const API_BASE = '/api/v1';

export const getAuthToken = () => localStorage.getItem('token');
export const setAuthToken = (token) => localStorage.setItem('token', token);
export const removeAuthToken = () => localStorage.removeItem('token');

export const getCurrentRole = () => localStorage.getItem('user_role') || 'Learner';
export const setCurrentRole = (role) => localStorage.setItem('user_role', role);

const request = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'API Error' }));
      throw new Error(err.detail || 'Request failed');
    }
    return await res.json();
  } catch (err) {
    console.warn(`API endpoint ${endpoint} failed:`, err.message);
    throw err;
  }
};

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  oauth2Google: () => request('/auth/oauth2/google'),
  
  // User Profile
  getProfile: (userId) => request(`/users/profile/${userId}`),
  updateProfile: (userId, data) => request(`/users/profile/${userId}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Engines
  analyzeArgument: (text, context_topic) => request('/arguments/analyze', { method: 'POST', body: JSON.stringify({ text, context_topic }) }),
  detectFallacies: (text) => request('/fallacies/detect', { method: 'POST', body: JSON.stringify({ text }) }),
  generateCounterarguments: (argument_text, topic, perspective) => request('/counterarguments/generate', { method: 'POST', body: JSON.stringify({ argument_text, topic, perspective }) }),
  analyzeSpeech: (transcript, title, domain, duration_seconds) => request('/presentations/analyze-speech', { method: 'POST', body: JSON.stringify({ transcript, title, domain, duration_seconds }) }),
  submitDebateTurn: (payload) => request('/simulation/turn', { method: 'POST', body: JSON.stringify(payload) }),
  calculateScore: (scores) => request('/scoring/calculate', { method: 'POST', body: JSON.stringify(scores) }),

  // Coaching & Dashboards
  getCoachingRecommendations: () => request('/coaching/recommendations'),
  getLearnerDashboard: () => request('/dashboards/learner'),
  getCoachDashboard: () => request('/dashboards/coach'),
  getEducatorDashboard: () => request('/dashboards/educator'),
  getAdminDashboard: () => request('/dashboards/admin'),
  getNotifications: () => request('/notifications'),

  // Admin APIs (Dynamic User CRUD & System Controls)
  getAdminMetrics: () => request('/admin/metrics'),
  getAdminUsers: () => request('/admin/users'),
  createAdminUser: (data) => request('/admin/users', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminUser: (id, data) => request(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
  updateSystemConfig: (config) => request('/admin/system/config', { method: 'POST', body: JSON.stringify(config) }),

  // Export URLs
  getPdfReportUrl: (sessionId = 1) => `${API_BASE}/exports/pdf/session/${sessionId}`,
  getExcelAnalyticsUrl: () => `${API_BASE}/exports/excel/class-analytics`
};
