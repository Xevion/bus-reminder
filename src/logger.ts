import { createLogger, format, type Logger, transports } from 'winston';
import LokiTransport from 'winston-loki';
import { env } from '@/env/server.mjs';

const logger: Logger = createLogger({
	level: 'debug',
	format: format.combine(
		format.timestamp({
			format: 'YYYY-MM-DD HH:mm:ss'
		}),
		format.errors({ stack: true }),
		format.splat(),
		format.json()
	),
	defaultMeta: { service: 'api' },
	transports: [
		new LokiTransport({
			level: 'debug',
			json: true,
			host: env.LOKI_HOST,
			basicAuth: `${env.LOKI_USERNAME}:${env.LOKI_PASSWORD}`,
			labels: { service: 'bus-reminder', environment: env.NODE_ENV }
		}),
		new transports.Console({
			format: format.combine(
				format.colorize(),
				format.printf(
					({ level, message, timestamp, stack }) =>
						`${timestamp} ${level}: ${stack || message}`
				)
			)
		})
	],
	exceptionHandlers: [
		new transports.Console({
			format: format.combine(
				format.colorize(),
				format.printf(
					({ level, message, timestamp, stack }) =>
						`${timestamp} ${level}: ${stack || message}`
				)
			)
		})
	]
});

export default logger;
