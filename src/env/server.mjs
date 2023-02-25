// @ts-check
/**
 * This file is included in `/next.config.mjs` which ensures the app isn't built with invalid env vars.
 * It has to be a `.mjs`-file to be imported there.
 */
import { serverSchema } from './schema.mjs';
import { formatErrors } from './util.mjs';

const _serverEnv = serverSchema.safeParse({
	API_KEY: process.env.API_KEY,
	CRONITOR_ACCOUNT_ID: process.env.CRONITOR_ACCOUNT_ID,
	CRONITOR_JOB_ID: process.env.CRONITOR_JOB_ID,
	LIFE360_USERNAME: process.env.LIFE360_USERNAME,
	LIFE360_PASSWORD: process.env.LIFE360_PASSWORD,
	LIFE360_MEMBER_ID: process.env.LIFE360_MEMBER_ID,
	MAX_DISTANCE: process.env.MAX_DISTANCE,
	CENTER_LATITUDE: process.env.CENTER_LATITUDE,
	CENTER_LONGITUDE: process.env.CENTER_LONGITUDE,
	EDGE_CACHE_TIME_SECONDS: process.env.EDGE_CACHE_TIME_SECONDS,
	REDIS_URL: process.env.REDIS_URL
});

if (_serverEnv.success === false) {
	console.error(
		'❌ Invalid environment variables:\n',
		...formatErrors(_serverEnv.error.format())
	);
	throw new Error('Invalid environment variables');
}

/**
 * Validate that server-side environment variables are not exposed to the client.
 */
for (let key of Object.keys(_serverEnv.data)) {
	if (key.startsWith('NEXT_PUBLIC_')) {
		console.warn('❌ You are exposing a server-side env-variable:', key);

		throw new Error('You are exposing a server-side env-variable');
	}
}

export const env = { ..._serverEnv.data };
