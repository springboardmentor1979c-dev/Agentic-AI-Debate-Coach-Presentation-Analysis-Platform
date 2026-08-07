const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getToken() {
  return localStorage.getItem('debate_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const d = await res.json(); msg = d.detail || JSON.stringify(d); } catch {}
    throw new Error(msg);
  }
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────
export async function login(email, password) {
  const body = new URLSearchParams({ username: email, password });
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.detail || 'Login failed');
  }
  const data = await res.json();
  localStorage.setItem('debate_token', data.access_token);
  return data;
}

export async function register(name, email, password, role = 'learner') {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, role }),
  });
}

export async function getMe() {
  return request('/auth/me');
}

export function logout() {
  localStorage.removeItem('debate_token');
}

// ── Profile ───────────────────────────────────────────────────────────────
export async function getProfile() {
  return request('/profile/me');
}

export async function updateProfile(data) {
  return request('/profile/me', { method: 'PUT', body: JSON.stringify(data) });
}

// ── Debate Sessions ───────────────────────────────────────────────────────
export async function createSession(data) {
  return request('/debates/', { method: 'POST', body: JSON.stringify(data) });
}

export async function getSessions() {
  return request('/debates/');
}

export async function getSession(id) {
  return request(`/debates/${id}`);
}

export async function updateSessionStatus(id, status) {
  return request(`/debates/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
}

export async function submitArgument(sessionId, content, argument_type = 'opening') {
  return request(`/debates/${sessionId}/arguments`, {
    method: 'POST',
    body: JSON.stringify({ content, argument_type }),
  });
}

// ── Analysis ──────────────────────────────────────────────────────────────
export async function analyzeArgument(argument, topic) {
  return request('/analysis/argument', { method: 'POST', body: JSON.stringify({ argument, topic }) });
}

export async function detectFallacies(argument) {
  return request('/analysis/fallacy', { method: 'POST', body: JSON.stringify({ argument }) });
}

export async function generateCounterarguments(argument, topic) {
  return request('/analysis/counterargument', { method: 'POST', body: JSON.stringify({ argument, topic }) });
}

export async function analyzePresentation(transcript, duration_minutes) {
  return request('/analysis/presentation', { method: 'POST', body: JSON.stringify({ transcript, duration_minutes }) });
}

// ── Simulation ────────────────────────────────────────────────────────────
export async function startSimulation(data) {
  return request('/simulation/start', { method: 'POST', body: JSON.stringify(data) });
}

export async function respondToSimulation(sessionId, human_text) {
  return request(`/simulation/${sessionId}/respond`, { method: 'POST', body: JSON.stringify({ human_text }) });
}

export async function endSimulation(sessionId) {
  return request(`/simulation/${sessionId}/end`, { method: 'POST' });
}

// ── Scoring ───────────────────────────────────────────────────────────────
export async function submitDebateScore(data) {
  return request('/scoring/debate', { method: 'POST', body: JSON.stringify(data) });
}

export async function submitPresentationScore(data) {
  return request('/scoring/presentation', { method: 'POST', body: JSON.stringify(data) });
}

export async function getScoreHistory() {
  return request('/scoring/history');
}

// ── Coaching ──────────────────────────────────────────────────────────────
export async function getCoaching() {
  return request('/coaching/recommendations');
}

export async function autoCoaching() {
  return request('/coaching/auto');
}

// ── Dashboard ─────────────────────────────────────────────────────────────
export async function getLearnerDashboard() {
  return request('/dashboard/learner');
}

export async function getCoachDashboard() {
  return request('/dashboard/coach');
}

export async function getAdminDashboard() {
  return request('/dashboard/admin');
}

// ── Notifications ─────────────────────────────────────────────────────────
export async function getNotifications() {
  return request('/notifications/');
}

export async function markNotificationRead(id) {
  return request(`/notifications/${id}/read`, { method: 'PUT' });
}

export async function markAllRead() {
  return request('/notifications/read-all', { method: 'PUT' });
}

// ── Reports ───────────────────────────────────────────────────────────────
export async function getMyReport() {
  return request('/reports/my-performance');
}

export async function getDebateReport(sessionId) {
  return request(`/reports/debate/${sessionId}`);
}
