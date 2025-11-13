import Article from '../models/Article.js';
import FeedSource from '../models/FeedSource.js';

/**
 * Get all articles with pagination and filtering
 * GET /api/articles?topic=tech&sentiment=positive&page=1&limit=20&search=keyword&tags=ai,ml
 */
export const getArticles = async (req, res) => {
  try {
    const {
      topic,
      sentiment,
      page = 1,
      limit = 20,
      search,
      tags,
      sortBy = 'pubDate',
      order = 'desc',
    } = req.query;

    // Build query
    const query = {};

    if (topic) {
      query.topic = topic;
    }

    if (sentiment) {
      query.sentiment = sentiment;
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      query.tags = { $in: tagArray };
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = { [sortBy]: sortOrder };

    // Execute query
    const articles = await Article.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .select('-__v')
      .lean();

    // Get total count
    const total = await Article.countDocuments(query);

    res.json({
      success: true,
      cached: false,
      data: {
        articles,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
          hasMore: skip + articles.length < total,
        },
      },
    });

  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch articles',
      message: error.message,
    });
  }
};

/**
 * Get a single article by ID
 * GET /api/articles/:id
 */
export const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id)
      .populate('feedSource', 'name url topic')
      .select('-__v')
      .lean();

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found',
      });
    }

    res.json({
      success: true,
      data: article,
    });

  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch article',
      message: error.message,
    });
  }
};

/**
 * Get all available topics
 * GET /api/topics
 */
export const getTopics = async (req, res) => {
  try {
    const topics = await Article.distinct('topic');

    // Get article count for each topic
    const topicsWithCount = await Promise.all(
      topics.map(async (topic) => {
        const count = await Article.countDocuments({ topic });
        return { topic, count };
      })
    );

    // Sort by count descending
    topicsWithCount.sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      data: topicsWithCount,
    });

  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch topics',
      message: error.message,
    });
  }
};

/**
 * Get all available tags
 * GET /api/tags
 */
export const getTags = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    // Get all unique tags
    const tags = await Article.distinct('tags');

    // Get tag counts using aggregation
    const tagCounts = await Article.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) },
      { $project: { tag: '$_id', count: 1, _id: 0 } },
    ]);

    res.json({
      success: true,
      data: tagCounts,
    });

  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tags',
      message: error.message,
    });
  }
};

/**
 * Get trending articles (most recent with positive sentiment)
 * GET /api/articles/trending
 */
export const getTrendingArticles = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const articles = await Article.find({
      pubDate: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
    })
      .sort({ pubDate: -1, sentimentScore: -1 })
      .limit(parseInt(limit))
      .select('-__v')
      .lean();

    res.json({
      success: true,
      data: articles,
    });

  } catch (error) {
    console.error('Error fetching trending articles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending articles',
      message: error.message,
    });
  }
};

/**
 * Get article statistics
 * GET /api/articles/stats
 */
export const getArticleStats = async (req, res) => {
  try {
    const totalArticles = await Article.countDocuments();
    const totalSources = await FeedSource.countDocuments({ isActive: true });

    // Sentiment distribution
    const sentimentStats = await Article.aggregate([
      { $group: { _id: '$sentiment', count: { $sum: 1 } } },
    ]);

    // Topic distribution
    const topicStats = await Article.aggregate([
      { $group: { _id: '$topic', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Recent articles count (last 24 hours)
    const recentCount = await Article.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    res.json({
      success: true,
      data: {
        totalArticles,
        totalSources,
        recentArticles: recentCount,
        sentimentDistribution: sentimentStats,
        topicDistribution: topicStats,
      },
    });

  } catch (error) {
    console.error('Error fetching article stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch article statistics',
      message: error.message,
    });
  }
};

export default {
  getArticles,
  getArticleById,
  getTopics,
  getTags,
  getTrendingArticles,
  getArticleStats,
};
