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

export function parseBoolean(
	value: string | string[] | undefined | null
): boolean {
	if (value == undefined) return false;
	if (Array.isArray(value)) return false;
	value = value.toLowerCase();
	return value === 'true' || value === '1' || value === 'yes';
}
