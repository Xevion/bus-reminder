import { env } from '@/env/server.mjs';
import logger from '@/logger';
import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Check if the request is authorized. If response is provided, send a 401 response if unauthorized.

 * @param req The request object to check.
 * @param res Optional response object to send a 401 response if unauthorized.
 * @returns A boolean indicating if the request is authorized.
 */
export function unauthorized(
	req: NextApiRequest,
	res: NextApiResponse | null
): boolean {
	if (req.query.key != env.API_KEY) {
		logger.debug('Unauthorized request');
		if (res) res.status(401).json({ status: 'unauthorized' });
		return true;
	}
	logger.debug('Authorized request');
	return false;
}

/**
 * Check if the request is authorized.
 * Performs identically to `unauthorized`, but returns the opposite value.
 * 
 * @param req The request object to check.
 * @param res Optional response object to send a 401 response if unauthorized.
 * @returns A boolean indicating if the request is authorized.
 * @see unauthorized
 */
export function authorized(
	req: NextApiRequest,
	res: NextApiResponse | null
): boolean {
	return !unauthorized(req, res);
}