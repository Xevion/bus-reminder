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

export async function setConfiguration(config: any): Promise<'OK'> {
	return redis.set('config', JSON.stringify(config));
}

export function getKey(identifier: string, now: Date) {
	return format(now, 'yyyy-MM-dd') + ':' + identifier;
}

export async function checkIdentifier(key: string): Promise<boolean> {
	return (await redis.get(key)) === '1';
}

export async function markIdentifier(
	identifier: string,
	value: boolean = true,
	expiry?: number,
	now: Date = new Date()
): Promise<{ key: string }> {
	const key = getKey(identifier, now);

	if (expiry == undefined) await redis.set(key, value ? '1' : '0');
	else await redis.set(key, value ? '1' : '0', 'EX', expiry);

	return { key };
}
