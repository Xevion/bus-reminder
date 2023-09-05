import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchConfiguration, setConfiguration } from '@/db';
import { Configuration, ConfigurationSchema } from '@/timing';
import { unauthorized } from '@/utils/helpers';

type StatusData = { status: ResponseStatus };

type ResponseStatus = 'unauthorized' | 'invalid' | 'failed' | 'success';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<StatusData | Configuration>
) {
	if (unauthorized(req, res)) return;

	if (req.method == 'GET') {
		try {
			const configuration = await fetchConfiguration();
			res.status(200).json(configuration);
		} catch (e) {
			res.status(500).json({ status: 'failed' });
		}
	} else if (req.method == 'POST') {
		const json = JSON.parse(req.body);
		const parsed = ConfigurationSchema.safeParse(json);
		if (parsed.success) {
			try {
				await setConfiguration(json);
				res.status(200).json({ status: 'success' });
			} catch (e) {
				console.error(e);
				res.status(500).json({ status: 'failed' });
			}
		} else res.status(400).json({ status: 'invalid' });
	}
}
