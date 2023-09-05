import { env } from '@/env/server.mjs';
// @ts-ignore
import * as life360 from 'life360-node-api';
import logger from '@/logger';
import Result, { err, ok } from 'true-myth/result';

const targetCenter = {
	longitude: env.CENTER_LONGITUDE,
	latitude: env.CENTER_LATITUDE
};

const MILES_PER_NAUTICAL_MILE = 1.15078;
const KILOMETERS_PER_MILE = 1.60934;

export type Position = {
	longitude: number;
	latitude: number;
};

/**
 *
 * Calculate the distance between two points using the Haversine formula
 *
 * K = Kilometers, N = Nautical Miles, M = Miles (default: M)
 *
 * @param a
 * @param b
 * @param unit
 */
export function distance(
	a: Position,
	b: Position,
	unit: 'K' | 'N' | 'M' = 'M'
) {
	// TODO: Handle floating point precision errors
	// Edge case: same point
	if (a.latitude == b.latitude && a.longitude == b.longitude) {
		return 0;
	}

	const radlat1 = (Math.PI * a.latitude) / 180;
	const radlat2 = (Math.PI * b.latitude) / 180;
	const theta = a.longitude - b.longitude;
	const radtheta = (Math.PI * theta) / 180;
	let dist =
		Math.sin(radlat1) * Math.sin(radlat2) +
		Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);

	if (dist > 1) dist = 1;

	dist = Math.acos(dist);
	dist = (dist * 180) / Math.PI;
	dist = dist * 60 * MILES_PER_NAUTICAL_MILE; // Convert to miles

	// Convert to the specified unit
	switch (unit) {
		case 'K':
			return dist * KILOMETERS_PER_MILE;
		case 'N':
			return dist / MILES_PER_NAUTICAL_MILE;
		case 'M':
		default:
			return dist;
	}
}

/**
 * @returns The distance in meters between me and the center
 */
export async function getDistance(): Promise<Result<number, string>> {
	let client;
	try {
		// Set up the Life360 API client
		client = await life360.login(env.LIFE360_USERNAME, env.LIFE360_PASSWORD);
	} catch (e) {
		return err(
			`Failed while logging in to Life360 (${
				e instanceof Error ? e.message : e
			})`
		);
	}
	logger.debug(`Logged in to Life360 (${env.LIFE360_USERNAME}).`);

	// Get my current location
	let me;
	try {
		const circles = await client.listCircles();
		// Assumed only in one circle (the first)
		const myCircle = circles[0];
		logger.debug(`${circles.length} circles found, using first.`, {
			circle: myCircle
		});
		const members = await myCircle.listMembers();

		me = members.findById(env.LIFE360_MEMBER_ID);
	} catch (e) {
		return err(
			`Failed while getting my location from Life360: ${
				e instanceof Error ? e.message : e
			}`
		);
	}

	if (me == undefined)
		return err(
			`Failed to find member with ID ${env.LIFE360_MEMBER_ID} in Life360`
		);

	// Parse my latitude and longitude into floats
	const current = {
		latitude: parseFloat(me.location.latitude),
		longitude: parseFloat(me.location.longitude)
	};

	// Calculate the distance between my location and the center, multiply x1000 for meters
	return ok(distance(current, targetCenter, 'K') * 1000);
}
