import { Redis } from 'ioredis';
import { env } from '@/env/server.mjs';
import { format } from 'date-fns';

console.log(env.REDIS_URL);
const redis = new Redis(env.REDIS_URL, { maxRetriesPerRequest: 2 });

export async function test() {
	const now = new Date();
	const key = format(now, 'yyyy-MM-dd');

	const current = await redis.incr(key);
	return current;
}
