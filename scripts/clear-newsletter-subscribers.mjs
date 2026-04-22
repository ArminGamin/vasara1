import { Redis } from '@upstash/redis';

const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
if (!url || !token) {
  console.error('Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (or KV_REST_*).');
  process.exit(1);
}

const redis = new Redis({ url, token });
const keys = await redis.keys('nl:email:*');
if (keys.length === 0) {
  console.log('No nl:email:* keys in Redis.');
  process.exit(0);
}
await redis.del(...keys);
console.log(`Deleted ${keys.length} key(s).`);
