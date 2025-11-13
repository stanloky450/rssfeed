import { createClient } from 'redis';

let redisClient = null;

const connectRedis = async () => {
  try {
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
      },
      password: process.env.REDIS_PASSWORD || undefined,
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis Client Connected');
    });

    redisClient.on('ready', () => {
      console.log('✅ Redis Client Ready');
    });

    redisClient.on('reconnecting', () => {
      console.log('⚠️  Redis Client Reconnecting');
    });

    await redisClient.connect();

    return redisClient;
  } catch (error) {
    console.error('❌ Error connecting to Redis:', error.message);
    console.log('⚠️  Application will continue without Redis caching');
    return null;
  }
};

const getRedisClient = () => {
  return redisClient;
};

export { connectRedis, getRedisClient };
