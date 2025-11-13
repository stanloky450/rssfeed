import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';
import { connectRedis } from './config/redis.js';
import { configureCloudinary } from './config/cloudinary.js';
import { initScheduler, runInitialFetch } from './utils/scheduler.js';
import Admin from './models/Admin.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

/**
 * Create default admin user if not exists
 */
const createDefaultAdmin = async () => {
  try {
    const adminCount = await Admin.countDocuments();

    if (adminCount === 0) {
      const defaultAdmin = await Admin.create({
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        name: 'Admin',
        role: 'super-admin',
      });

      console.log(`✅ Default admin created: ${defaultAdmin.email}`);
      console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
      console.log('   ⚠️  Please change the default password!');
    }
  } catch (error) {
    console.error('❌ Error creating default admin:', error.message);
  }
};

/**
 * Start the server
 */
const startServer = async () => {
  try {
    console.log('\n🚀 Starting RSS Feed Aggregator Server...\n');

    // Connect to MongoDB
    await connectDB();

    // Connect to Redis (optional)
    await connectRedis();

    // Configure Cloudinary
    configureCloudinary();

    // Create default admin user
    await createDefaultAdmin();

    // Initialize cron scheduler
    initScheduler();

    // Run initial feed fetch (optional - comment out if you don't want to fetch on startup)
    // await runInitialFetch();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`\n✅ Server running on port ${PORT}`);
      console.log(`   API: http://localhost:${PORT}`);
      console.log(`   Health: http://localhost:${PORT}/health`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('\n📡 Server is ready to accept requests!\n');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Start the server
startServer();
