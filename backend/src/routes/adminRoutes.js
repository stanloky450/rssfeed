import express from 'express';
import {
  login,
  getMe,
  getFeedSources,
  getFeedSource,
  createFeedSource,
  updateFeedSource,
  deleteFeedSource,
  refreshAllFeeds,
  refreshFeed,
  getAdminStats,
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', login);

// Protected routes (require authentication)
router.use(protect);

router.get('/me', getMe);
router.get('/stats', getAdminStats);

// Feed source management
router.route('/feeds')
  .get(getFeedSources)
  .post(createFeedSource);

router.route('/feeds/:id')
  .get(getFeedSource)
  .put(updateFeedSource)
  .delete(deleteFeedSource);

// RSS refresh
router.post('/refresh', refreshAllFeeds);
router.post('/feeds/:id/refresh', refreshFeed);

export default router;
