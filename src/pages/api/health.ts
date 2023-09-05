import { env } from '@/env/server.mjs';
import { authorized } from '@/utils/server';
import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
	now: number;
	status: string;
	timezone: string;
};

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<ResponseData>
) {
	const isAuthorized = authorized(req, null);

	res.status(200).json({
		now: new Date().getTime(),
		status: isAuthorized ? 'authorized' : 'unauthorized',
		timezone: env.TIMEZONE
	});
}
