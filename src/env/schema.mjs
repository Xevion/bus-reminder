// @ts-check
import { z } from 'zod';

// If this line fails, you're not running Node v18 or higher. Please upgrade.
const TimezoneSchema = z.enum(Intl.supportedValuesOf("timeZone"));

/**
 * Specify your server-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 */
export const serverSchema = z.object({
	API_KEY: z.string(),
	CRONITOR_ACCOUNT_ID: z.string(),
	CRONITOR_JOB_ID: z.string(),
	LIFE360_USERNAME: z.string(),
	LIFE360_PASSWORD: z.string(),
	LIFE360_MEMBER_ID: z.string(),
	MAX_DISTANCE: z.coerce.number().positive(),
	CENTER_LATITUDE: z.coerce.number().min(-90).max(90),
	CENTER_LONGITUDE: z.coerce.number().min(-180).max(180),
	REDIS_URL: z.string().url(),
	DISCORD_TOKEN: z.string(),
	DISCORD_TARGET_USER_ID: z.string(),
	TIMEZONE: TimezoneSchema
});
