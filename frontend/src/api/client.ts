import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
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

export const authAPI = {
  register: (email: string, password: string) =>
    apiClient.post<{ accessToken: string }>('/auth/register', {
      email,
      password,
    }),
  login: (email: string, password: string) =>
    apiClient.post<{ accessToken: string }>('/auth/login', { email, password }),
};

export const attemptsAPI = {
  getAll: () => apiClient.get<Attempt[]>('/attempts'),
  send: (email: string, subject?: string, content?: string) =>
    apiClient.post<Attempt>('/attempts/send', { email, subject, content }),
};
