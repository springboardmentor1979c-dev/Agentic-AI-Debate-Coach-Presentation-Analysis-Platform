import axios, { AxiosError } from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_id');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// ── Convenience API helpers ──────────────────────────────────────────────────

export const authAPI = {
  register: (data: { name: string; email: string; password: string; role: string }) =>
    apiClient.post('/auth/register', data),
  login: (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    return apiClient.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },
  me: () => apiClient.get('/auth/me'),
};

export const profileAPI = {
  get: () => apiClient.get('/profile/'),
  update: (data: Record<string, string>) => apiClient.put('/profile/', data),
};

export const debatesAPI = {
  create: (data: { topic: string; format?: string; scheduled_at?: string }) =>
    apiClient.post('/debates/', data),
  list: () => apiClient.get('/debates/'),
  get: (id: number) => apiClient.get(`/debates/${id}`),
  updateStatus: (id: number, status: string) =>
    apiClient.patch(`/debates/${id}/status?status=${status}`),
};

export const argumentsAPI = {
  create: (data: {
    session_id: number;
    content: string;
    claim?: string;
    evidence?: string;
    position?: string;
  }) => apiClient.post('/arguments/', data),
  getBySession: (sessionId: number) => apiClient.get(`/arguments/session/${sessionId}`),
  getFallacies: (argId: number) => apiClient.get(`/arguments/${argId}/fallacies`),
  getCounterarguments: (argId: number) => apiClient.get(`/arguments/${argId}/counterarguments`),
  fullAnalysis: (argId: number) => apiClient.post(`/arguments/${argId}/full-analysis`),
};

export const presentationsAPI = {
  create: (data: { title: string; transcript: string }) =>
    apiClient.post('/presentations/', data),
  upload: (data: { title: string; transcript: string; audio: File }) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('transcript', data.transcript);
    formData.append('audio', data.audio);
    return apiClient.post('/presentations/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  list: () => apiClient.get('/presentations/'),
  get: (id: number) => apiClient.get(`/presentations/${id}`),
  getCoaching: (id: number) => apiClient.get(`/presentations/${id}/coaching`),
};

export const aiDebateAPI = {
  start: (data: { topic: string; user_position?: string; debate_format?: string }) =>
    apiClient.post('/ai-debate/start', data),
  turn: (session_id: number, user_argument: string) =>
    apiClient.post('/ai-debate/turn', { session_id, user_argument }),
  end: (session_id: number) => apiClient.post(`/ai-debate/end/${session_id}`),
  history: () => apiClient.get('/ai-debate/history'),
};

export const scoringAPI = {
  getSessionScores: (sessionId: number) => apiClient.get(`/scores/debate/${sessionId}`),
  getRecommendations: (sessionId: number, userId: number) =>
    apiClient.get(`/scores/recommendations/${sessionId}/${userId}`),
};

export const dashboardAPI = {
  learner: () => apiClient.get('/dashboard/learner'),
  coach: () => apiClient.get('/dashboard/coach'),
  admin: () => apiClient.get('/dashboard/admin'),
};

export const coachingAPI = {
  getPlan: () => apiClient.get('/coaching/plan'),
  getSkills: () => apiClient.get('/coaching/skills'),
  getLeaderboard: () => apiClient.get('/coaching/leaderboard'),
};

export const notificationsAPI = {
  list: () => apiClient.get('/notifications/'),
  markRead: (id: number) => apiClient.patch(`/notifications/${id}/read`),
  markAllRead: () => apiClient.patch('/notifications/read-all'),
};

export const searchAPI = {
  searchArguments: (q: string, top_k: number = 5) => apiClient.get(`/search/arguments?q=${encodeURIComponent(q)}&top_k=${top_k}`),
  searchDebates: (q: string) => apiClient.get(`/search/debates?q=${encodeURIComponent(q)}`),
};

export const analyticsAPI = {
  performance: (days: number = 30) => apiClient.get(`/analytics/performance?days=${days}`),
  class: () => apiClient.get('/analytics/class'),
  platform: () => apiClient.get('/analytics/platform'),
};

export const reportsAPI = {
  debatePDF: (sessionId: number) =>
    apiClient.get(`/reports/debate/${sessionId}/pdf`, { responseType: 'blob' }),
  debateExcel: (sessionId: number) =>
    apiClient.get(`/reports/debate/${sessionId}/excel`, { responseType: 'blob' }),
  presentationPDF: (presentationId: number) =>
    apiClient.get(`/reports/presentation/${presentationId}/pdf`, { responseType: 'blob' }),
};

