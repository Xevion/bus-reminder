import { Configuration, ConfigurationSchema } from './timing';
import { Redis } from 'ioredis';
import { env } from '@/env/server.mjs';
import { format } from 'date-fns';

const redis = new Redis(env.REDIS_URL, { maxRetriesPerRequest: 2 });

export async function fetchConfiguration(
	defaultConfig?: object,
	getParsed = true
): Promise<Configuration> {
	const config = await redis.get('config');
	if (config == null)
		if (defaultConfig != undefined)
			return ConfigurationSchema.parse(defaultConfig);
		else throw new Error('Configuration not found in Redis');

	const json = JSON.parse(config);
	const parsed = ConfigurationSchema.parse(json);
	return getParsed ? parsed : json;
}

export function getKey(identifier: string, now: Date) {
	return format(now, 'yyyy-MM-dd') + ':' + identifier;
}

export async function checkIdentifier(
	identifier: string,
	now: Date = new Date()
): Promise<boolean> {
	const key = getKey(identifier, now);
	return (await redis.get(key)) === '1';
}

export async function markIdentifier(
	identifier: string,
	value: boolean = true,
	expiry?: number,
	now: Date = new Date()
) {
	const key = getKey(identifier, now);
	if (expiry == undefined) return await redis.set(key, value ? '1' : '0');
	return await redis.set(key, value ? '1' : '0', 'EX', expiry);
}
