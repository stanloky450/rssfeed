import cron from 'node-cron';
import { fetchAllFeeds } from '../services/rssService.js';

/**
 * Initialize cron job for RSS feed refresh
 */
export const initScheduler = () => {
  try {
    const cronExpression = process.env.RSS_REFRESH_CRON || '0 * * * *'; // Default: every hour

    console.log(`\n⏰ Initializing RSS refresh scheduler...`);
    console.log(`   Cron expression: ${cronExpression}`);

    // Validate cron expression
    if (!cron.validate(cronExpression)) {
      console.error('❌ Invalid cron expression');
      return;
    }

    // Schedule the task
    const task = cron.schedule(cronExpression, async () => {
      console.log('\n⏰ Scheduled RSS refresh triggered');
      try {
        await fetchAllFeeds();
      } catch (error) {
        console.error('❌ Scheduled refresh error:', error.message);
      }
    });

    console.log('✅ RSS refresh scheduler initialized successfully');

    return task;
  } catch (error) {
    console.error('❌ Error initializing scheduler:', error.message);
  }
};

/**
 * Run initial feed fetch on startup
 */
export const runInitialFetch = async () => {
  try {
    console.log('\n🚀 Running initial RSS feed fetch...');
    await fetchAllFeeds();
  } catch (error) {
    console.error('❌ Initial fetch error:', error.message);
  }
};

export default {
  initScheduler,
  runInitialFetch,
};
