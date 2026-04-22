import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { Redis } from '@upstash/redis';

const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
if (!url || !token) {
  console.error('Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (or KV_REST_*).');
  process.exit(1);
}

const redis = new Redis({ url, token });
const raw = await redis.get('nl:subscribers_txt');
const content = raw == null ? '' : String(raw);
const file = path.join(process.cwd(), 'data', 'newsletter-subscribers.txt');
await mkdir(path.dirname(file), { recursive: true });
await writeFile(file, content, 'utf8');
console.log(`Wrote ${file} (${content.split(/\r?\n/).filter(Boolean).length} lines).`);
