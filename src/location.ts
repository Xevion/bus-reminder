import { env } from '@/env/server.mjs';
// @ts-ignore
import * as life360 from 'life360-node-api';

const center = {
	longitude: env.CENTER_LONGITUDE,
	latitude: env.CENTER_LATITUDE
};
const MILES_PER_NAUTICAL_MILE = 1.15078;
const KILOMETERS_PER_MILE = 1.60934;

export type Position = {
	longitude: number;
	latitude: number;
};

// K = Kilometers, N = Nautical Miles, M = Miles (default: M)
export function distance(
	a: Position,
	b: Position,
	unit: 'K' | 'N' | 'M' = 'M'
) {
	if (a.latitude == b.latitude && a.longitude == b.longitude) {
		return 0;
	} else {
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
}

/**
 * @returns The distance in meters between me and the center
 */
export async function getDistance(): Promise<number> {
	let client;
	try {
		// Setup the Life360 API client
		client = await life360.login(env.LIFE360_USERNAME, env.LIFE360_PASSWORD);
	} catch (e) {
		throw new Error(
			`Failed while logging in to Life360: ${
				e instanceof Error ? e.message : e
			}`
		);
	}

	let me;
	try {
		// Get my current location
		const circles = await client.listCircles();
		const myCircle = circles[0];
		const members = await myCircle.listMembers();
		me = members.findById(env.LIFE360_MEMBER_ID);
	} catch (e) {
		throw new Error(
			`Failed while getting my location from Life360: ${
				e instanceof Error ? e.message : e
			}`
		);
	}

	// Parse my location into latitude and longitude
	const current = {
		latitude: parseFloat(me.location.latitude),
		longitude: parseFloat(me.location.longitude)
	};

	// Calculate the distance between my location and the center
	const difference = distance(current, center, 'K') * 1000;

	return difference;
}
