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

const TimeConfigSchema = z.object({
	// A short name to be included in notifications
	name: z.string(),
	// The time this notification is intended for. e.g. "12:00", 24 hour time
	time: z.string().refine((time) => {
		const { hours, minutes } = parseTime(time);
		return isValidTime({ hours, minutes });
	}, 'Invalid time format'),
	// The days this configuration is active on.
	days: z.preprocess((v) => {
		const parsedArray = z.any().array().parse(v);
		return new Set(parsedArray);
	}, z.set(DayEnumSchema).nonempty()),
	// If a notification isn't delivery within 10 minutes e.g. "00:30", 24 hour time
	maxLate: z
		.string()
		.optional()
		.refine((duration) => {
			if (duration == undefined) return true;
			const { hours, minutes } = parseTime(duration);
			return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
		}, 'Invalid duration format')
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
 * @param {ParsedTime} a A time to compare
 * @param {ParsedTime} b A time to compare
 * @returns {-1 | 0 | 1} The relative order of the two times in terms of -1, 0, or 1.
 */
function compareTime(a: ParsedTime, b: ParsedTime): -1 | 0 | 1 {
	if (a.hours < b.hours) return -1;
	if (a.hours > b.hours) return 1;
	if (a.minutes < b.minutes) return -1;
	if (a.minutes > b.minutes) return 1;
	return 0;
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
			const maxLateTime = addTime(
				parseTime(time.time),
				parseTime(time.maxLate!)
			);

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
		rememberedTimes.sort((a, b) =>
			compareTime(parseTime(a.time), parseTime(b.time))
		);

		// Validate that no rules are overlapping from maxLate.
		rememberedTimes.forEach((time, index) => {
			if (index === 0) return false;
			const previous = times[index - 1];
			if (previous.maxLate == undefined) return false;

			// If the days don't overlap, there's no need to check the time.
			if (intersection(time.days, previous.days).size < 1) return false;

			const previousEndTime = addTime(
				parseTime(previous.time),
				parseTime(previous.maxLate)
			);

			// If the previous rule's end time is greater than the current rule's start time, add an issue.
			const startTime = parseTime(time.time);
			if (compareTime(startTime, previousEndTime) < 1) {
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
