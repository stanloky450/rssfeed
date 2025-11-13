import Admin from '../models/Admin.js';
import FeedSource from '../models/FeedSource.js';
import Article from '../models/Article.js';
import { generateToken } from '../middleware/auth.js';
import { fetchAllFeeds, fetchFeedById } from '../services/rssService.js';
import { invalidateArticleCache } from '../services/cacheService.js';

/**
 * Admin login
 * POST /api/admin/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password',
      });
    }

    // Find admin with password field
    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Admin account is not active',
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate token
    const token = generateToken(admin._id);

    res.json({
      success: true,
      data: {
        token,
        admin: {
          id: admin._id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message,
    });
  }
};

/**
 * Get current admin profile
 * GET /api/admin/me
 */
export const getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select('-password');

    res.json({
      success: true,
      data: admin,
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

/**
 * Get all feed sources
 * GET /api/admin/feeds
 */
export const getFeedSources = async (req, res) => {
  try {
    const { topic, isActive } = req.query;

    const query = {};
    if (topic) query.topic = topic;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const feeds = await FeedSource.find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: feeds,
    });

  } catch (error) {
    console.error('Error fetching feed sources:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch feed sources',
      message: error.message,
    });
  }
};

/**
 * Get single feed source
 * GET /api/admin/feeds/:id
 */
export const getFeedSource = async (req, res) => {
  try {
    const feed = await FeedSource.findById(req.params.id);

    if (!feed) {
      return res.status(404).json({
        success: false,
        error: 'Feed source not found',
      });
    }

    res.json({
      success: true,
      data: feed,
    });

  } catch (error) {
    console.error('Error fetching feed source:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch feed source',
      message: error.message,
    });
  }
};

/**
 * Create new feed source
 * POST /api/admin/feeds
 */
export const createFeedSource = async (req, res) => {
  try {
    const { name, url, topic, description } = req.body;

    if (!name || !url || !topic) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, url, and topic',
      });
    }

    // Check if URL already exists
    const existingFeed = await FeedSource.findOne({ url });
    if (existingFeed) {
      return res.status(400).json({
        success: false,
        error: 'Feed source with this URL already exists',
      });
    }

    const feed = await FeedSource.create({
      name,
      url,
      topic,
      description,
    });

    res.status(201).json({
      success: true,
      data: feed,
    });

  } catch (error) {
    console.error('Error creating feed source:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create feed source',
      message: error.message,
    });
  }
};

/**
 * Update feed source
 * PUT /api/admin/feeds/:id
 */
export const updateFeedSource = async (req, res) => {
  try {
    const { name, url, topic, description, isActive } = req.body;

    const feed = await FeedSource.findById(req.params.id);

    if (!feed) {
      return res.status(404).json({
        success: false,
        error: 'Feed source not found',
      });
    }

    // Update fields
    if (name) feed.name = name;
    if (url) feed.url = url;
    if (topic) feed.topic = topic;
    if (description !== undefined) feed.description = description;
    if (isActive !== undefined) feed.isActive = isActive;

    await feed.save();

    res.json({
      success: true,
      data: feed,
    });

  } catch (error) {
    console.error('Error updating feed source:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update feed source',
      message: error.message,
    });
  }
};

/**
 * Delete feed source
 * DELETE /api/admin/feeds/:id
 */
export const deleteFeedSource = async (req, res) => {
  try {
    const feed = await FeedSource.findById(req.params.id);

    if (!feed) {
      return res.status(404).json({
        success: false,
        error: 'Feed source not found',
      });
    }

    // Delete associated articles
    await Article.deleteMany({ feedSource: feed._id });

    await feed.deleteOne();

    // Invalidate cache
    await invalidateArticleCache();

    res.json({
      success: true,
      message: 'Feed source and associated articles deleted',
    });

  } catch (error) {
    console.error('Error deleting feed source:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete feed source',
      message: error.message,
    });
  }
};

/**
 * Trigger manual RSS refresh for all feeds
 * POST /api/admin/refresh
 */
export const refreshAllFeeds = async (req, res) => {
  try {
    // Start refresh in background
    fetchAllFeeds().catch(error => {
      console.error('Background refresh error:', error);
    });

    res.json({
      success: true,
      message: 'RSS refresh started in background',
    });

  } catch (error) {
    console.error('Error triggering refresh:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger refresh',
      message: error.message,
    });
  }
};

/**
 * Refresh specific feed
 * POST /api/admin/feeds/:id/refresh
 */
export const refreshFeed = async (req, res) => {
  try {
    const result = await fetchFeedById(req.params.id);

    res.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error('Error refreshing feed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh feed',
      message: error.message,
    });
  }
};

/**
 * Get admin dashboard stats
 * GET /api/admin/stats
 */
export const getAdminStats = async (req, res) => {
  try {
    const totalArticles = await Article.countDocuments();
    const totalFeeds = await FeedSource.countDocuments();
    const activeFeeds = await FeedSource.countDocuments({ isActive: true });

    // Articles added in last 24 hours
    const recentArticles = await Article.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    // Feed status distribution
    const feedStatus = await FeedSource.aggregate([
      { $group: { _id: '$fetchStatus', count: { $sum: 1 } } },
    ]);

    // Top topics
    const topTopics = await Article.aggregate([
      { $group: { _id: '$topic', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Sentiment distribution
    const sentimentStats = await Article.aggregate([
      { $group: { _id: '$sentiment', count: { $sum: 1 } } },
    ]);

    // Recent feeds with errors
    const failedFeeds = await FeedSource.find({ fetchStatus: 'failed' })
      .sort({ lastFetchedAt: -1 })
      .limit(5)
      .select('name url fetchError lastFetchedAt')
      .lean();

    res.json({
      success: true,
      data: {
        totalArticles,
        totalFeeds,
        activeFeeds,
        recentArticles,
        feedStatus,
        topTopics,
        sentimentStats,
        failedFeeds,
      },
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admin statistics',
      message: error.message,
    });
  }
};

export default {
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
};
