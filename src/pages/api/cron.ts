import {
	checkIdentifier,
	fetchConfiguration,
	getKey,
	markIdentifier
} from '@/db';
import { getDistance } from '@/location';
import logger from '@/logger';
import monitorAsync from '@/monitor';
import { sendNotification } from '@/notify';
import { getMatchingTime } from '@/timing';
import { parseBoolean } from '@/utils/client';
import { unauthorized } from '@/utils/server';
import { localNow } from '@/utils/timezone';
import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
	diff: number;
	inRange: boolean;
};

type StatusData = {
	status: ResponseStatus;
	identifier?: Identifier;
};

type Identifier = {
	name: string;
	key?: string;
};

type ResponseStatus =
	| 'unauthorized'
	| 'out-of-range'
	| 'no-matching-time'
	| 'already-notified'
	| 'notified'
	| 'error';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<(ResponseData & StatusData) | StatusData>
) {
	if (unauthorized(req, res)) return;

	async function innerFunction(): Promise<{
		status: ResponseStatus;
		identifier?: Identifier;
	}> {
		const now = localNow();

		const config = await fetchConfiguration();
		const matching = await getMatchingTime(config, now);

		// No matching time - no notification to send.
		if (matching == null) {
			logger.info('No matching time.', { time: now });
			return { status: 'no-matching-time' };
		}

		// Get the key for this notification (name + time)
		const key = getKey(matching.name, now);
		const identifier = { name: matching.name, key };

		// Check if I am in range of the center
		const distanceResult = await getDistance();
		if (distanceResult.isErr) {
			logger.error(distanceResult.error);
			return { status: 'error', identifier };
		}

		// TODO: Properly draw from environment MAX_DISTANCE
		const distance = distanceResult.value;
		if (distance > 280) {
			logger.debug('Distance is out of range.', { distance });
			return {
				status: 'out-of-range',
				identifier
			};
		}

		// Check if I have already been notified
		const marked = await checkIdentifier(key);
		if (marked)
			return {
				status: 'already-notified',
				identifier
			};

		// Send notification, mark (expire in 1 month)
		logger.info('Sending notification, marking identifier.', { identifier });
		await sendNotification(`${matching.message} (${matching.name})`);
		await markIdentifier(key, true, 60 * 60 * 24 * 31);

		return { status: 'notified', identifier };
	}

	try {
		logger.debug('Evaluating cron...');

		let result;
		if (
			process.env.NODE_ENV === 'production' &&
			parseBoolean(req.query.report ?? 'true')
		)
			result = await monitorAsync(innerFunction);
		else result = await innerFunction();

		logger.info('Cron evaluated.', { result });

		if (result.status === 'error') res.status(500).json({ status: 'error' });
		else
			res
				.status(200)
				.json({ status: result.status, identifier: result.identifier });
	} catch (e) {
		logger.error(e);
		res.status(500).json({ status: 'error' });
	}
}
