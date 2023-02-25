import { getMatchingTime } from '@/timing';
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { getDistance } from '@/location';
import { env } from '@/env/server.mjs';
import monitorAsync from '@/monitor';
import { sendNotification } from '@/notify';
import { fetchConfiguration, checkIdentifier, markIdentifier } from '@/db';

type ResponseData = {
	diff: number;
	inRange: boolean;
};

type StatusData = { status: ResponseStatus };

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

	async function innerFunction(): Promise<ResponseStatus> {
		const now = new Date();

		const config = await fetchConfiguration({
			times: [
				{
					time: '03:13',
					maxLate: '00:10',
					message: 'The bus is leaving soon.',
					days: [
						'monday',
						'tuesday',
						'wednesday',
						'thursday',
						'friday',
						'saturday',
						'sunday'
					],
					name: 'B'
				},
				{
					name: 'A',
					message: 'The bus is leaving soon.',
					time: '23:26',
					maxLate: '00:10',
					days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
				}
			]
		});
		const matching = await getMatchingTime(config, now);

		// No matching time - no notification to send.
		if (matching == null) return 'no-matching-time';

		// Check if I am in range of the center
		const distanceToCenter = await getDistance();
		if (distanceToCenter > 280) return 'out-of-range';

		// Check if I have already been notified
		if (await checkIdentifier(matching.name, now)) return 'already-notified';

		// Send notification, mark
		await sendNotification(`${matching.message} (${matching.name})`);
		await markIdentifier(matching.name, true, 60 * 60 * 24 * 31, now);

		return 'notified';
	}

	try {
		let result;
		if (process.env.NODE_ENV === 'production')
			result = await monitorAsync(innerFunction);
		else result = await innerFunction();
		res.status(200).json({ status: result });
	} catch (e) {
		console.error(e);
		res.status(500).json({ status: 'error' });
	}
}
