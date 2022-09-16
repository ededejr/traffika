import TaskTracker from '@ededejr/task-tracker';
import { faker } from '@faker-js/faker';
import axios from 'axios';
import chalk from 'chalk';
import randomatic from 'randomatic';
import Logger from './logger';
import Telemetry from './telemetry';

type Params = {
	target: string;
	logger: Logger;
	tag?: string;
};

export async function sendRequest(params: Params) {
	const { target, tag, logger } = params;
	const requestTag = makeRequestId(tag);

	const f = async () => {
		const url = makeTargetUrl(target, requestTag);
		const messages: {
			[Property in keyof typeof logger]?: string;
		} = {};

		try {
			const res = await axios.get(url, {
				headers: {
					'User-Agent': faker.internet.userAgent(),
				}
			});
			const statusString = res.status.toString();
			const formatter =
				statusString.startsWith('4') || statusString.startsWith('5')
					? chalk.red
					: statusString.startsWith('2')
					? chalk.green
					: chalk.yellow;
			messages.verbose = `sent: ${chalk.bold(formatter(res.status))} GET ${url}`;
		} catch (error: any) {
			messages.error = error.message;
		}

		for (const key in messages) {
			const typedKey = key as keyof typeof logger;
			const maybeLogFn = logger[typedKey];
			const maybeMessage = messages[typedKey];
			
			if (typeof maybeLogFn === 'function' && maybeMessage) {
				maybeLogFn.bind(logger)(maybeMessage);
			}
		}
	};

	return await tracker.run(f, {
		name: requestTag,
	});
}

const tracker = new TaskTracker({
	name: 'trafikka',
	maxHistorySize: 100,
	persistEntry: async ({ index, ...entry }) => {
		Telemetry.history.set(index, entry);
	},
});

function makeTargetUrl(target: string, id: string) {
	const url = new URL(target);
	url.searchParams.append('tfk', id);
	return url.toString();
}

function makeRequestId(tag?: string) {
	const suffix = tag ? `-${tag}` : '';
	return `${process.pid}-${randomatic('A0', 16)}${suffix}`;
}
