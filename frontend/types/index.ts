export interface Article {
  _id: string;
  title: string;
  description: string;
  content?: string;
  fullContent?: string;
  textContent?: string;
  excerpt?: string;
  link: string;
  image?: string;
  images?: string[];
  contentScraped?: boolean;
  scrapedAt?: string;
  pubDate: string;
  source: string;
  sourceName: string;
  topic: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number;
  tags: string[];
  author?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedSource {
  _id: string;
  name: string;
  url: string;
  topic: string;
  description?: string;
  isActive: boolean;
  lastFetchedAt?: string;
  fetchStatus: 'success' | 'failed' | 'pending';
  fetchError?: string;
  articleCount: number;
  metadata?: {
    feedTitle?: string;
    feedDescription?: string;
    feedLink?: string;
    feedImage?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasMore: boolean;
}

export interface ArticlesResponse {
  success: boolean;
  cached?: boolean;
  data: {
    articles: Article[];
    pagination: Pagination;
  };
}

export interface TopicCount {
  topic: string;
  count: number;
}

export interface TagCount {
  tag: string;
  count: number;
}

export interface AdminStats {
  totalArticles: number;
  totalFeeds: number;
  activeFeeds: number;
  recentArticles: number;
  feedStatus: { _id: string; count: number }[];
  topTopics: { _id: string; count: number }[];
  sentimentDistribution: { _id: string; count: number }[];
  failedFeeds: FeedSource[];
}

export interface FilterOptions {
  topic?: string;
  sentiment?: string;
  search?: string;
  tags?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}
