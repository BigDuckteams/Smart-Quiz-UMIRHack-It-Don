import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const ADMIN_TOKEN_KEY = 'smart_quiz_admin_token';

const client = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

function authHeaders() {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function setAdminToken(token) {
  if (token) localStorage.setItem(ADMIN_TOKEN_KEY, token);
  else localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function hasAdminToken() {
  return Boolean(localStorage.getItem(ADMIN_TOKEN_KEY));
}

export async function adminLogin(username, password) {
  const response = await client.post('/api/admin/login', { username, password });
  if (response.data?.token) setAdminToken(response.data.token);
  return response.data;
}

export async function adminMe() {
  const response = await client.get('/api/admin/me', { headers: authHeaders() });
  return response.data;
}

export async function adminLogout() {
  await client.post('/api/admin/logout', {}, { headers: authHeaders() });
  setAdminToken('');
}

export async function submitQuiz(payload) {
  let attempt = 0;
  while (attempt < 2) {
    try {
      const response = await client.post('/api/quiz/submit', payload);
      return response.data;
    } catch (error) {
      attempt += 1;
      if (attempt >= 2 || error?.response?.status < 500) throw error;
    }
  }
}

export async function fetchAnalytics() {
  const response = await client.get('/api/quiz/analytics', { headers: authHeaders() });
  return response.data.data;
}

export async function fetchSubmissions(filters = {}) {
  const response = await client.get('/api/quiz/submissions', { params: filters, headers: authHeaders() });
  return response.data.data;
}

export function trackEvent(event, params = {}) {
  if (typeof window !== 'undefined' && Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event, ...params });
  } else {
    console.info('[analytics]', event, params);
  }
}
