const Redis = require('ioredis');
require('dotenv').config();


const redis = new Redis({
  host: new URL(process.env.REDIS_URL).hostname,
  port: 6379,
  password: process.env.REDIS_TOKEN,
  tls: {},  
});

redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection failed:', err.message);
});

module.exports = redis;