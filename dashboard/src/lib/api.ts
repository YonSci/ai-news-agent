import axios from 'axios';
import type { ContentItem, ContentStatus, TrendingTopic, Project, DashboardStats, NewsItem, NewsStatus } from '@/types';

const DEFAULT_LOCAL_API_URL = 'http://localhost:5000/api';
const API_BASE_URL = import.meta.env.VITE_API_URL || DEFAULT_LOCAL_API_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
