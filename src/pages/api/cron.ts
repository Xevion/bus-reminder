import { getMatchingTime } from '@/timing';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getDistance } from '@/location';
import { env } from '@/env/server.mjs';
import monitorAsync from '@/monitor';
import { sendNotification } from '@/notify';
import {
	checkIdentifier,
	fetchConfiguration,
	getKey,
	markIdentifier
} from '@/db';
import { localNow } from '@/utils/timezone';
import logger from '@/logger';
import { unauthorized } from '@/utils/helpers';

type ResponseData = {
	diff: number;
	inRange: boolean;
};

type StatusData = {
	status: ResponseStatus;
	identifier?: { name: string; key?: string };
};

type ResponseStatus =
	| 'unauthorized'
	| 'out-of-range'
	| 'no-matching-time'
	| 'already-notified'
	| 'notified'
	| 'error';

const center = {
	latitude: env.CENTER_LATITUDE,
	longitude: env.CENTER_LONGITUDE
};

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<(ResponseData & StatusData) | StatusData>
) {
	if (unauthorized(req, res)) return;

	async function innerFunction(): Promise<{
		status: ResponseStatus;
		identifier?: { name: string; key?: string };
	}> {
		const now = localNow();

		const config = await fetchConfiguration();
		const matching = await getMatchingTime(config, now);

		// No matching time - no notification to send.
		if (matching == null) return { status: 'no-matching-time' };

		// Get the key for this notification (name + time)
		const key = getKey(matching.name, now);

		// Check if I am in range of the center
		const distanceToCenter = await getDistance();
		// TODO: Properly draw from environment MAX_DISTANCE
		if (distanceToCenter > 280)
			return {
				status: 'out-of-range',
				identifier: { name: matching.name, key }
			};

		// Check if I have already been notified
		const marked = await checkIdentifier(key);
		if (marked)
			return {
				status: 'already-notified',
				identifier: {
					name: matching.name,
					key
				}
			};

		// Send notification, mark
		await sendNotification(`${matching.message} (${matching.name})`);
		await markIdentifier(matching.name, true, 60 * 60 * 24 * 31, now);

		return { status: 'notified', identifier: { name: matching.name, key } };
	}

	try {
		let result;
		if (
			process.env.NODE_ENV === 'production' &&
			// TODO: Proper boolean parsing
			(req.query.report ?? 'true') === 'true'
		)
			result = await monitorAsync(innerFunction);
		else result = await innerFunction();

		logger.info('Cron evaluated.', { result });

		res
			.status(200)
			.json({ status: result.status, identifier: result.identifier });
	} catch (e) {
		logger.error(e);
		res.status(500).json({ status: 'error' });
	}
}
