import express from 'express';
import {
  getArticles,
  getArticleById,
  getTopics,
  getTags,
  getTrendingArticles,
  getArticleStats,
} from '../controllers/articleController.js';
import { cacheMiddleware } from '../services/cacheService.js';

const router = express.Router();

// Public routes with caching
router.get('/articles', cacheMiddleware(3600), getArticles);
router.get('/articles/trending', cacheMiddleware(1800), getTrendingArticles);
router.get('/articles/stats', cacheMiddleware(3600), getArticleStats);
router.get('/articles/:id', cacheMiddleware(7200), getArticleById);
router.get('/topics', cacheMiddleware(3600), getTopics);
router.get('/tags', cacheMiddleware(3600), getTags);

export default router;
