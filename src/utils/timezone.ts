import { utcToZonedTime } from 'date-fns-tz';
import { z } from 'zod';
import { env } from '@/env/server.mjs';

// If this line fails in Typescript, then install typescript@^5.1.3
export const TimezoneSchema = z.enum(
	// 'as' to assume at least one element
	Intl.supportedValuesOf('timeZone') as [string, ...string[]]
);
export type Timezone = z.infer<typeof TimezoneSchema>;

export function localNow(now?: Date, zone?: Timezone): Date {
	zone = zone ?? env.TIMEZONE;
	now = now ?? new Date();
	return utcToZonedTime(now, zone);
}
