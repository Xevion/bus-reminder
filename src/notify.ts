import { Client, Events, GatewayIntentBits } from 'discord.js';
import { env } from '@/env/server.mjs';

export async function sendNotification(message: string): Promise<void> {
	const client = new Client({
		intents: []
	});

	try {
		await client.login(env.DISCORD_TOKEN);
	} catch (e) {
		throw new Error(
			`Failed while logging in to Discord: ${
				e instanceof Error ? e.message : e
			}`
		);
	}

	try {
		await client.users.send(env.DISCORD_TARGET_USER_ID, message);
	} catch (e) {
		throw new Error(
			`Failed while sending message: ${e instanceof Error ? e.message : e}`
		);
	}
}
