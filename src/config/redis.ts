import Redis from 'ioredis'
import config from '../config'
export const redisClient = new Redis({ host: config.redis.host || 'localhost', port: Number(config.redis.port || 6379) });
