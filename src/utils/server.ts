import { env } from '@/env/server.mjs';
import logger from '@/logger';
import { NextApiRequest, NextApiResponse } from 'next';

export function unauthorized(
	req: NextApiRequest,
	res: NextApiResponse
): boolean {
	if (req.query.key != env.API_KEY) {
		logger.debug('Unauthorized request');
		res.status(401).json({ status: 'unauthorized' });
		return true;
	}
	return false;
}