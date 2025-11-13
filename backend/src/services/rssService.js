import Parser from 'rss-parser';
import Article from '../models/Article.js';
import FeedSource from '../models/FeedSource.js';
import { analyzeArticle } from './sentimentService.js';
import { uploadImageToCloudinary, extractImageFromRSSItem } from '../utils/uploadImage.js';
import { invalidateArticleCache } from './cacheService.js';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; RSS-Aggregator-Bot/1.0)',
  },
  customFields: {
    item: [
      ['media:content', 'media:content'],
      ['media:thumbnail', 'media:thumbnail'],
      ['content:encoded', 'contentEncoded'],
    ],
  },
});

/**
 * Parse a single RSS feed and save articles to database
 * @param {Object} feedSource - FeedSource document
 * @returns {Promise<Object>} - { success, articlesAdded, errors }
 */
export const parseFeed = async (feedSource) => {
  const results = {
    success: false,
    articlesAdded: 0,
    articlesSkipped: 0,
    errors: [],
  };

  try {
    console.log(`\n📡 Fetching feed: ${feedSource.name} (${feedSource.url})`);

    // Parse the RSS feed
    const feed = await parser.parseURL(feedSource.url);

    console.log(`📰 Found ${feed.items.length} items in feed`);

    // Update feed metadata
    feedSource.metadata = {
      feedTitle: feed.title || feedSource.name,
      feedDescription: feed.description || '',
      feedLink: feed.link || '',
      feedImage: feed.image?.url || feed.itunes?.image || '',
    };

    // Process each item
    for (const item of feed.items) {
      try {
        // Check if article already exists
        const existingArticle = await Article.findOne({ link: item.link });
        if (existingArticle) {
          results.articlesSkipped++;
          continue;
        }

        // Extract image
        let imageUrl = extractImageFromRSSItem(item);

        // Upload to Cloudinary if image exists
        if (imageUrl) {
          imageUrl = await uploadImageToCloudinary(imageUrl);
        }

        // Create article object
        const articleData = {
          title: item.title || 'Untitled',
          description: item.contentSnippet || item.summary || '',
          content: item.contentEncoded || item.content || item.description || '',
          link: item.link,
          image: imageUrl,
          pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
          source: feedSource.url,
          sourceName: feedSource.name,
          topic: feedSource.topic,
          author: item.creator || item.author || 'Unknown',
          feedSource: feedSource._id,
        };

        // Analyze sentiment and extract keywords
        const analysis = analyzeArticle(articleData);
        articleData.sentiment = analysis.sentiment;
        articleData.sentimentScore = analysis.sentimentScore;
        articleData.tags = analysis.tags;

        // Save article
        const article = new Article(articleData);
        await article.save();

        results.articlesAdded++;
        console.log(`✅ Added: ${article.title.substring(0, 60)}...`);

      } catch (itemError) {
        if (itemError.code === 11000) {
          results.articlesSkipped++;
        } else {
          console.error(`❌ Error processing item:`, itemError.message);
          results.errors.push(itemError.message);
        }
      }
    }

    // Update feed source status
    await feedSource.updateFetchStatus('success');
    feedSource.articleCount = await Article.countDocuments({ feedSource: feedSource._id });
    await feedSource.save();

    results.success = true;
    console.log(`\n✅ Feed processed: ${results.articlesAdded} added, ${results.articlesSkipped} skipped`);

    // Invalidate cache after adding new articles
    if (results.articlesAdded > 0) {
      await invalidateArticleCache();
    }

  } catch (error) {
    console.error(`❌ Error parsing feed ${feedSource.name}:`, error.message);
    results.errors.push(error.message);
    await feedSource.updateFetchStatus('failed', error.message);
  }

  return results;
};

/**
 * Fetch and parse all active RSS feeds
 * @returns {Promise<Object>} - Aggregated results
 */
export const fetchAllFeeds = async () => {
  const aggregateResults = {
    totalFeeds: 0,
    successfulFeeds: 0,
    failedFeeds: 0,
    totalArticlesAdded: 0,
    totalArticlesSkipped: 0,
    errors: [],
  };

  try {
    console.log('\n🚀 Starting RSS feed aggregation...\n');

    // Get all active feed sources
    const feedSources = await FeedSource.find({ isActive: true });

    if (feedSources.length === 0) {
      console.log('⚠️  No active feed sources found');
      return aggregateResults;
    }

    aggregateResults.totalFeeds = feedSources.length;
    console.log(`📋 Found ${feedSources.length} active feed sources\n`);

    // Process each feed
    for (const feedSource of feedSources) {
      const result = await parseFeed(feedSource);

      if (result.success) {
        aggregateResults.successfulFeeds++;
      } else {
        aggregateResults.failedFeeds++;
      }

      aggregateResults.totalArticlesAdded += result.articlesAdded;
      aggregateResults.totalArticlesSkipped += result.articlesSkipped;
      aggregateResults.errors.push(...result.errors);
    }

    console.log('\n🎉 RSS feed aggregation completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Feeds processed: ${aggregateResults.totalFeeds}`);
    console.log(`   - Successful: ${aggregateResults.successfulFeeds}`);
    console.log(`   - Failed: ${aggregateResults.failedFeeds}`);
    console.log(`   - Articles added: ${aggregateResults.totalArticlesAdded}`);
    console.log(`   - Articles skipped: ${aggregateResults.totalArticlesSkipped}`);

  } catch (error) {
    console.error('❌ Error in fetchAllFeeds:', error.message);
    aggregateResults.errors.push(error.message);
  }

  return aggregateResults;
};

/**
 * Fetch a specific feed by ID
 * @param {string} feedId - FeedSource ID
 * @returns {Promise<Object>} - Results
 */
export const fetchFeedById = async (feedId) => {
  try {
    const feedSource = await FeedSource.findById(feedId);

    if (!feedSource) {
      throw new Error('Feed source not found');
    }

    if (!feedSource.isActive) {
      throw new Error('Feed source is not active');
    }

    return await parseFeed(feedSource);
  } catch (error) {
    console.error('Error fetching feed by ID:', error.message);
    throw error;
  }
};

export default {
  parseFeed,
  fetchAllFeeds,
  fetchFeedById,
};
