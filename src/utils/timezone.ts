import { utcToZonedTime } from 'date-fns-tz';
import { z } from 'zod';
import { env } from '@/env/server.mjs';

// @ts-ignore TS2339 -- TODO: Figure out why Intl.supportedValuesOf isn't seen by Typescript
export const TimezoneSchema = z.enum(Intl.supportedValuesOf('timeZone'));
export type Timezone = z.infer<typeof TimezoneSchema>;

export function localNow(now?: Date, zone?: Timezone): Date {
	zone = zone ?? env.TIMEZONE;
	now = now ?? new Date();
	return utcToZonedTime(now, zone);
}
