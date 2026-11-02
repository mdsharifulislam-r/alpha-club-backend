import { redisClient } from "../../config/redis";

const redisSet = async (key: string, value: any, query?: Record<string, any>, ttl: number=60) => {
  try {
    const queryString = new URLSearchParams(query as Record<string, string>).toString();
    await redisClient.set(`${key}:${queryString||'1'}`, JSON.stringify(value), "EX",ttl);
  } catch {
    return false;
  }
  return false;
};

const redisGet = async (key: string, query?: Record<string, any>) => {
  try {
    const queryString = new URLSearchParams(query as Record<string, string>).toString();
    const raw = await redisClient.get(`${key}:${queryString||'1'}`);
    if (!raw) return null;
    const data = JSON.parse(raw);

    if (Array.isArray(data) && !data.length) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
};

const redisHset = async (key: string, query: Record<string, any>, value: any, ttl: number=60) => {
  const field = new URLSearchParams(query as Record<string, string>).toString();
  await redisClient.hset(key, field, JSON.stringify(value), "EX",ttl);
};

const redisHget = async (key: string, query: Record<string, any>) => {
  const field = new URLSearchParams(query as Record<string, string>).toString();
  const data = JSON.parse(await redisClient.hget(key, field) || "[]");
  if (Array.isArray(data) && !data.length) {
    return null;
  }
  return data;
};

const keyDelete = async (pattern: string) => {
  try {
    const keys = await redisClient.scanStream({ match: pattern }).toArray();

    if (!keys?.flat().length) return;

    const pipeline = redisClient.multi();
    keys.forEach((key) =>{
      if(key.length) pipeline.del(key);
    });
    await pipeline.exec();
  } catch {
    return;
  }
};

const bust = async (...patterns: string[]) => {
  await Promise.all(patterns.map(pattern => keyDelete(pattern)));
};

// ✅ Fixed HKeyDelete function
const HKeyDelete = async (key: string) => {
  const fields = await redisClient.hkeys(key);
  console.log('Fields to delete:', fields);
  
  if (!fields.length) return;

  await redisClient.hdel(key, ...fields);
};

export const RedisHelper = {
  redisSet,
  redisGet,
  redisHset,
  redisHget,
  keyDelete,
  HKeyDelete,
  bust,
};
