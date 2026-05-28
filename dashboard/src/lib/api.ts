import axios from 'axios';
import type {
  ContentItem,
  ContentStatus,
  TrendingTopic,
  Project,
  DashboardStats,
  NewsItem,
  NewsStatus,
  HydrationHealth,
  CoverageEvent,
} from '@/types';

const DEFAULT_LOCAL_API_URL = 'http://localhost:5000/api';
const API_URL_STORAGE_KEY = 'dashboard-api-url';
const GITHUB_TOKEN_STORAGE_KEY = 'dashboard-github-token';

function normalizeApiBaseUrl(rawUrl?: string) {
  if (!rawUrl) return DEFAULT_LOCAL_API_URL;

  const trimmed = rawUrl.trim().replace(/\/+$/, '');
  if (!trimmed) return DEFAULT_LOCAL_API_URL;
  if (trimmed.endsWith('/api')) return trimmed;
  return `${trimmed}/api`;
}

function getEnvApiUrl() {
  return normalizeApiBaseUrl(import.meta.env.VITE_API_URL);
}

function getStoredApiUrl() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(API_URL_STORAGE_KEY) || '';
}

function resolveInitialApiBaseUrl() {
  const stored = getStoredApiUrl();
  if (stored) return normalizeApiBaseUrl(stored);

  const isLocalHost = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
  if (isLocalHost) {
    return DEFAULT_LOCAL_API_URL;
  }

  return getEnvApiUrl();
}

function getStoredGitHubToken() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(GITHUB_TOKEN_STORAGE_KEY) || '';
}

function applyGitHubTokenHeader(token: string) {
  if (token) {
    api.defaults.headers.common['X-GitHub-Token'] = token;
  } else {
    delete api.defaults.headers.common['X-GitHub-Token'];
  }
}

const API_BASE_URL = resolveInitialApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

applyGitHubTokenHeader(getStoredGitHubToken());

export function getCurrentApiBaseUrl() {
  return api.defaults.baseURL || API_BASE_URL;
}

export function getSuggestedLocalApiBaseUrl() {
  return DEFAULT_LOCAL_API_URL;
}

export function getSuggestedProductionApiBaseUrl() {
  return getEnvApiUrl();
}

export function setApiBaseUrl(rawUrl: string) {
  const normalized = normalizeApiBaseUrl(rawUrl);
  api.defaults.baseURL = normalized;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(API_URL_STORAGE_KEY, normalized);
  }
  return normalized;
}

export function resetApiBaseUrlToDefault() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(API_URL_STORAGE_KEY);
  }
  const resolved = resolveInitialApiBaseUrl();
  api.defaults.baseURL = resolved;
  return resolved;
}

export function getCurrentGitHubToken() {
  return getStoredGitHubToken();
}

export function setGitHubToken(token: string) {
  const trimmed = token.trim();
  if (typeof window !== 'undefined') {
    if (trimmed) {
      window.localStorage.setItem(GITHUB_TOKEN_STORAGE_KEY, trimmed);
    } else {
      window.localStorage.removeItem(GITHUB_TOKEN_STORAGE_KEY);
    }
  }
  applyGitHubTokenHeader(trimmed);
}

// Content API
export const contentApi = {
  getAll: () => api.get<ContentItem[]>('/content'),
  getById: (id: string) => api.get<ContentItem>(`/content/${id}`),
  create: (data: Partial<ContentItem>) => api.post<ContentItem>('/content', data),
  update: (id: string, data: Partial<ContentItem>) => api.put<ContentItem>(`/content/${id}`, data),
  updateStatus: (id: string, status: ContentStatus) =>
    api.patch<ContentItem>(`/content/${id}/status`, { status }),
  delete: (id: string) => api.delete(`/content/${id}`),
};

// News API
export const newsApi = {
  getAll: (params?: {
    source?: string;
    category?: string;
    status?: string;
    q?: string;
    topic?: string;
    region?: string;
    startDate?: string;
    endDate?: string;
  }) =>
    api.get<NewsItem[]>('/news', { params }),
  updateStatus: (id: string, status: NewsStatus) =>
    api.patch<{ id: string; status: NewsStatus }>(`/news/${id}/status`, { status }),
};

// Trending API
export const trendingApi = {
  getTopics: () => api.get<TrendingTopic[]>('/trending'),
  getTopicDetails: (id: string) => api.get<TrendingTopic>(`/trending/${id}`),
};

// Projects API
export const projectApi = {
  getAll: () => api.get<Project[]>('/projects'),
  getById: (id: string) => api.get<Project>(`/projects/${id}`),
  create: (data: Partial<Project>) => api.post<Project>('/projects', data),
  update: (id: string, data: Partial<Project>) => api.put<Project>(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

// Stats API
export const statsApi = {
  getDashboard: () => api.get<DashboardStats>('/stats/dashboard'),
  getPerformance: (days: number = 30) => api.get(`/stats/performance?days=${days}`),
};

export const healthApi = {
  getHydration: () => api.get<HydrationHealth>('/health/hydration'),
};

export const coverageApi = {
  getAll: () => api.get<CoverageEvent[]>('/coverage/events'),
  create: (data: Partial<CoverageEvent>) => api.post('/coverage/events', data),
  update: (id: string, data: Partial<CoverageEvent>) => api.patch(`/coverage/events/${id}`, data),
  delete: (id: string) => api.delete(`/coverage/events/${id}`),
};

export const integrationApi = {
  getGitHubStatus: (token?: string) =>
    api.get<{
      connected: boolean;
      source: 'none' | 'header' | 'env';
      remaining?: number;
      limit?: number;
      reset?: number;
      message: string;
    }>('/integrations/github/status', {
      headers: token?.trim() ? { 'X-GitHub-Token': token.trim() } : undefined,
    }),
};
