import type { NextApiRequest, NextApiResponse } from 'next';
import { unauthorized } from '@/utils/helpers';

type StatusData = { status: ResponseStatus };

type ResponseStatus = 'unauthorized' | 'success';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<StatusData>
) {
	if (unauthorized(req, res)) return;

	res.status(200).json({ status: 'success' });
}
