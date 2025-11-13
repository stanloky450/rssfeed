import axios from 'axios';
import type {
  Article,
  ArticlesResponse,
  TopicCount,
  TagCount,
  FeedSource,
  AdminStats,
  FilterOptions,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Public API calls

export const getArticles = async (filters?: FilterOptions): Promise<ArticlesResponse> => {
  const response = await api.get('/articles', { params: filters });
  return response.data;
};

export const getArticleById = async (id: string): Promise<Article> => {
  const response = await api.get(`/articles/${id}`);
  return response.data.data;
};

export const getTrendingArticles = async (limit = 10): Promise<Article[]> => {
  const response = await api.get('/articles/trending', { params: { limit } });
  return response.data.data;
};

export const getTopics = async (): Promise<TopicCount[]> => {
  const response = await api.get('/topics');
  return response.data.data;
};

export const getTags = async (limit = 50): Promise<TagCount[]> => {
  const response = await api.get('/tags', { params: { limit } });
  return response.data.data;
};

export const getArticleStats = async () => {
  const response = await api.get('/articles/stats');
  return response.data.data;
};

// Admin API calls

export const adminLogin = async (email: string, password: string) => {
  const response = await api.post('/admin/login', { email, password });
  return response.data;
};

export const getAdminProfile = async () => {
  const response = await api.get('/admin/me');
  return response.data.data;
};

export const getFeedSources = async (filters?: { topic?: string; isActive?: boolean }): Promise<FeedSource[]> => {
  const response = await api.get('/admin/feeds', { params: filters });
  return response.data.data;
};

export const getFeedSource = async (id: string): Promise<FeedSource> => {
  const response = await api.get(`/admin/feeds/${id}`);
  return response.data.data;
};

export const createFeedSource = async (data: {
  name: string;
  url: string;
  topic: string;
  description?: string;
}): Promise<FeedSource> => {
  const response = await api.post('/admin/feeds', data);
  return response.data.data;
};

export const updateFeedSource = async (id: string, data: Partial<FeedSource>): Promise<FeedSource> => {
  const response = await api.put(`/admin/feeds/${id}`, data);
  return response.data.data;
};

export const deleteFeedSource = async (id: string): Promise<void> => {
  await api.delete(`/admin/feeds/${id}`);
};

export const refreshAllFeeds = async () => {
  const response = await api.post('/admin/refresh');
  return response.data;
};

export const refreshFeed = async (id: string) => {
  const response = await api.post(`/admin/feeds/${id}/refresh`);
  return response.data;
};

export const getAdminStats = async (): Promise<AdminStats> => {
  const response = await api.get('/admin/stats');
  return response.data.data;
};

export default api;
