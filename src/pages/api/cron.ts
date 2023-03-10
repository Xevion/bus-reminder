import { getMatchingTime } from '@/timing';
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { getDistance } from '@/location';
import { env } from '@/env/server.mjs';
import monitorAsync from '@/monitor';
import { sendNotification } from '@/notify';
import { checkIdentifier, fetchConfiguration, markIdentifier } from '@/db';
import { localNow } from '@/utils/timezone';

type ResponseData = {
	diff: number;
	inRange: boolean;
};

type StatusData = { status: ResponseStatus; key?: string };

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
	if (req.query.key != env.API_KEY) {
		// auth failed
		res.status(401).json({ status: 'unauthorized' });
		return;
	}

	async function innerFunction(): Promise<{
		status: ResponseStatus;
		key?: string;
	}> {
		const now = localNow();

		const config = await fetchConfiguration();
		const matching = await getMatchingTime(config, now);

		// No matching time - no notification to send.
		if (matching == null) return { status: 'no-matching-time' };

		// Check if I am in range of the center
		const distanceToCenter = await getDistance();
		if (distanceToCenter > 280) return { status: 'out-of-range' };

		// Check if I have already been notified
		const { marked, key } = await checkIdentifier(matching.name, now);
		if (marked) return { status: 'already-notified', key };

		// Send notification, mark
		await sendNotification(`${matching.message} (${matching.name})`);
		await markIdentifier(matching.name, true, 60 * 60 * 24 * 31, now);

		return { status: 'notified', key };
	}

	try {
		let result;
		if (
			process.env.NODE_ENV === 'production' &&
			(req.query.report ?? 'true') === 'true'
		)
			result = await monitorAsync(innerFunction);
		else result = await innerFunction();
		res.status(200).json({ status: result.status, key: result.key });
	} catch (e) {
		console.error(e);
		res.status(500).json({ status: 'error' });
	}
}
