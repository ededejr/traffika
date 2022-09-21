import TaskTracker from '@ededejr/task-tracker';
import { faker } from '@faker-js/faker';
import axios from 'axios';
import chalk from 'chalk';
import randomatic from 'randomatic';
import Logger from './logger';
import Telemetry, { HistoryEntryMetadata } from './telemetry';

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

		const metadata: HistoryEntryMetadata = {};
		
		let res;

		try {
			res = await axios.get(url, {
				headers: {
					'User-Agent': faker.internet.userAgent(),
				}
			});
		} catch (error: any) {
			res = error.response;

			if (!res) {
				messages.error = error.message;
			}
		} finally {
			
			if (res) {
				const statusString = res.status.toString();
				const formatter =
					statusString.startsWith('4') || statusString.startsWith('5')
						? chalk.red
						: statusString.startsWith('2')
						? chalk.green
						: chalk.yellow;
				messages.verbose = `sent: ${chalk.bold(formatter(res.status))} GET ${url}`;

				metadata.statusString = statusString;
				metadata.ua = res['config']['headers']['User-Agent'];
			}

			if (Object.keys(metadata).length) {
				Cache.set(requestTag, metadata);
			}
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

	return await Tracker.run(f, {
		name: requestTag,
	});
}

const Cache = new Map();

const Tracker = new TaskTracker({
	name: 'trafikka',
	maxHistorySize: 100,
	persistEntry: async ({ index, ...entry }) => {
		const found = entry.data.match(Telemetry.entryRgx);
		let metadata = undefined;

		if (found) {
			const { id, duration } = found.groups || {};
			if (Cache.has(id)) {
				metadata = {
					...Cache.get(id),
					duration,
					id
				};
				Cache.delete(id);
			}
		}

		Telemetry.history.set(index, {
			...entry,
			metadata,
		});
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
