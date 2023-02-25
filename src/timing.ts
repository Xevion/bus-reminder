import { z } from 'zod';
import { intersection } from '@/sets';

type ParsedTime = {
	hours: number;
	minutes: number;
};

const DayEnumSchema = z.enum([
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
	'sunday'
]);
type DayEnum = z.infer<typeof DayEnumSchema>;

const TimeConfigSchema = z.object({
	// A short name to be included in notifications
	name: z.string(),
	// The time this notification is intended for. e.g. "12:00", 24 hour time
	time: z.string().transform((time, ctx) => {
		if (!time.match(/^[0-9]{2}:[0-9]{2}$/)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Time must be in the format "HH:MM" e.g. "12:00"'
			});
			return z.NEVER;
		}

		const parsed = parseTime(time);

		if (!isValidTime(parsed)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message:
					'Invalid time format. Max 23 hours, 59 minutes. Positives only.'
			});
			return z.NEVER;
		}

		return parsed;
	}),
	// The days this configuration is active on.
	days: z.preprocess((v) => {
		const parsedArray = z.any().array().parse(v);
		return new Set(parsedArray);
	}, z.set(DayEnumSchema).nonempty()),
	// If a notification isn't delivery within 10 minutes e.g. "00:30", 24 hour time
	maxLate: z
		.string()
		.optional()
		.transform((duration, ctx) => {
			if (duration == undefined) return undefined;

			if (!duration.match(/^[0-9]{2}:[0-9]{2}$/)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Duration must be in the format "HH:MM" e.g. "12:00"'
				});
				return z.NEVER;
			}

			const parsed = parseTime(duration);

			if (!isValidTime(parsed)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message:
						'Invalid duration format. Max 23 hours, 59 minutes. Positives only.'
				});
				return z.NEVER;
			}

			return parsed;
		})
});
type TimeConfig = z.infer<typeof TimeConfigSchema>;

/**
 * Parses a time or duration string (hours & minutes only) into separate attributes.
 * @param time A time in the format "HH:MM" e.g. "12:00"
 * @returns The separate hour & minute attributes parsed.
 */
const parseTime = (time: string): ParsedTime => {
	const [hours, minutes] = time.split(':');
	return {
		hours: parseInt(hours, 10),
		minutes: parseInt(minutes, 10)
	};
};

/**
 * A predicate function to compare two times.
 * If {primary} is before {secondary}, returns -1.
 * If {primary} is after {secondary}, returns 1.
 * If {primary} is equal to {secondary}, returns 0.
 * @param {ParsedTime} primary A time to compare. The return value will be relative to this time.
 * @param {ParsedTime} secondary A time to compare.
 * @returns {-1 | 0 | 1} The relative order of {primary} in relation to {secondary} as a value of -1, 0, or 1.
 */
function compareTime(primary: ParsedTime, secondary: ParsedTime): -1 | 0 | 1 {
	if (primary.hours < secondary.hours) return -1;
	if (primary.hours > secondary.hours) return 1;
	if (primary.minutes < secondary.minutes) return -1;
	if (primary.minutes > secondary.minutes) return 1;
	return 0; // Identical
}

/**
 * Returns the sum of the two given times. May be invalid without modulo applied.
 * @param {boolean} modulo If true, the hours will be modulo'd to keep valid.
 * @returns {ParsedTime} The sum of the two given times.
 */
function addTime(a: ParsedTime, b: ParsedTime, modulo = false): ParsedTime {
	const minutes = a.minutes + b.minutes;
	const hours = a.hours + b.hours + Math.floor(minutes / 60);

	return {
		hours: modulo ? hours % 24 : hours,
		minutes: minutes % 60
	};
}

/**
 * Determines whether or not a time is valid (must be atomic, i.e. 0 <= hours <= 23, 0 <= minutes <= 59).
 * @returns {boolean} True if the given time is valid.
 */
function isValidTime(time: ParsedTime): boolean {
	return (
		time.hours >= 0 &&
		time.hours <= 23 &&
		time.minutes >= 0 &&
		time.minutes <= 59
	);
}

export const ConfigurationSchema = z.object({
	times: z.array(TimeConfigSchema).superRefine((times, ctx) => {
		if (times.length === 0) return;

		// Validate for each rule that it does not occur within the last 10 minutes of the day.
		times.forEach((time, index) => {
			// If there's no maxLate, there's nothing to validate.
			if (time.maxLate == undefined) return;

			// Get the computed maxLate time.
			const maxLateTime = addTime(time.time, time.maxLate!);

			// If the computed maxLate time is invalid, add an issue.
			if (!isValidTime(maxLateTime))
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ['maxLate', index],
					message: `A maxLate's value cannot place it outside of the given day (${maxLateTime.hours
						.toString()
						.padStart(2, '0')}:${maxLateTime.minutes
						.toString()
						.padStart(2, '0')})`
				});
		});

		// If there's only one rule, there's nothing more to validate.
		if (times.length < 2) return;

		// Add the original index to each time so we can reference it later.
		const rememberedTimes: (TimeConfig & { originalIndex: number })[] =
			times.map((time, index) => ({ ...time, originalIndex: index }));

		// Sort the values to make validation easier.
		rememberedTimes.sort((a, b) => compareTime(a.time, b.time));

		// Validate that no rules are overlapping from maxLate.
		rememberedTimes.forEach((time, index) => {
			if (index === 0) return false;
			const previous = rememberedTimes[index - 1];
			if (previous.maxLate == undefined) return false;

			// If the days don't overlap, there's no need to check the time.
			if (intersection(time.days, previous.days).size < 1) return false;

			const previousEndTime = addTime(previous.time, previous.maxLate);

			// If the previous rule's end time is greater than the current rule's start time, add an issue.
			// The times cannot overlap at all as multiple rules cannot be active at the same time.
			if (compareTime(time.time, previousEndTime) <= 0) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ['time', time.originalIndex],
					message: 'No two rules can be overlap from maxLate.'
				});
			}
		});

		// TODO: Validate that no rule overlaps with another using the maxLate property.
	})
});
export type Configuration = z.infer<typeof ConfigurationSchema>;

const dayAsNumber: Record<string, DayEnum> = {
	1: 'monday',
	2: 'tuesday',
	3: 'wednesday',
	4: 'thursday',
	5: 'friday',
	6: 'saturday',
	0: 'sunday'
};

export async function getMatchingTime(
	config: Configuration,
	now = new Date()
): Promise<TimeConfig | null> {
	const times = config.times.filter((time) => {
		// If the day doesn't match, skip.
		if (!time.days.has(dayAsNumber[now.getDay().toString()])) return false;

		const startTime = time.time;
		const endTime = addTime(
			time.time,
			time.maxLate ?? { hours: 0, minutes: 0 }
		);

		const nowTime = { hours: now.getHours(), minutes: now.getMinutes() };

		return (
			compareTime(nowTime, startTime) >= 0 && compareTime(nowTime, endTime) <= 0
		);
	});

	// This shouldn't be thrown, if I did my job right.
	if (times.length > 1)
		throw new Error(
			"Multiple rules matched the current time. This shouldn't happen."
		);

	return times[0];
}
