import axios from 'axios';

/**
 * Base URL for management API. Avoid logging this value in production builds because it may reveal internal endpoints.
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  // ⚠️ Sensitive: JWT tokens stored in localStorage must never be exposed in logs or error messages.
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export interface Attempt {
  _id: string;
  email: string;
  subject?: string;
  content?: string;
  status: 'pending' | 'sent' | 'clicked' | 'failed';
  createdAt: string;
  sentAt?: string;
  clickedAt?: string;
}

/**
 * Authentication API wrappers for registration and login flows.
 */
export const authAPI = {
  /**
   * Register a new administrator account and return a JWT access token.
   */
  register: (email: string, password: string) =>
    apiClient.post<{ accessToken: string }>('/auth/register', {
      email,
      password,
    }),
  /**
   * Authenticate an existing administrator and return a JWT access token.
   */
  login: (email: string, password: string) =>
    apiClient.post<{ accessToken: string }>('/auth/login', { email, password }),
};

/**
 * Phishing attempts API wrappers for retrieving and creating simulation attempts.
 */
export const attemptsAPI = {
  /**
   * Fetch all phishing attempts visible to the authenticated administrator.
   */
  getAll: () => apiClient.get<Attempt[]>('/attempts'),
  /**
   * Proxy send request to the simulation server via the management backend.
   */
  send: (email: string, subject?: string, content?: string) =>
    apiClient.post<Attempt>('/attempts/send', { email, subject, content }),
};
