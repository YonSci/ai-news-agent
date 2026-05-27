// Content Pipeline Types
export interface ContentItem {
  id: string;
  title: string;
  source: string;
  sourceType?: string;
  sourceUrl?: string;
  viralScore: number;
  relevanceScore?: number;
  summary: string;
  link: string;
  publishedAt?: string;
  category?: string;
  tags?: string[];
  dedupeHash?: string;
  itemType?: string;
  status: ContentStatus;
  platform: Platform;
  createdAt: string;
  updatedAt: string;
  scriptContent?: string;
  videoPath?: string;
  publishedUrl?: string;
  metrics?: ContentMetrics;
}

export interface NewsItem extends Omit<ContentItem, 'status' | 'platform'> {
  sourceType: string;
  sourceUrl: string;
  relevanceScore: number;
  publishedAt: string;
  category: string;
  tags: string[];
  dedupeHash: string;
  itemType: 'news';
  status: NewsStatus;
  platform: 'news';
}

export type NewsStatus = 'new' | 'tracked' | 'ignored' | 'important' | 'archived';

export type ContentStatus = 
  | 'research' 
  | 'scripting' 
  | 'review' 
  | 'production' 
  | 'approved' 
  | 'published' 
  | 'archived';

export type Platform = 'tiktok' | 'youtube_short' | 'youtube_long' | 'instagram';

export interface ContentMetrics {
  views: number;
  likes: number;
  shares: number;
  comments: number;
  retentionRate?: number;
  ctr?: number;
}

// Trending Topics Types
export interface TrendingTopic {
  id: string;
  keyword: string;
  category: string;
  volume: number;
  growth: number; // percentage
  sentiment: 'positive' | 'neutral' | 'negative';
  sources: string[];
  relatedTopics: string[];
  lastUpdated: string;
}

// Project Management Types
export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number; // 0-100
  startDate: string;
  dueDate?: string;
  tasks: Task[];
  tags: string[];
}

export type ProjectStatus = 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  assignee?: string;
  dueDate?: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalStories: number;
  newToday: number;
  avgRelevanceScore: number;
  trackedCount: number;
  importantCount: number;
  ignoredCount: number;
}