import yargs from 'yargs';
import Logger from '../utils/logger';
import { sendRequest } from '../utils/sendRequest';
import Telemetry from '../utils/telemetry';

export const command = 'run <target>';
export const desc = 'send requests to target';
export const builder: yargs.CommandBuilder = {
	target: {
		describe: 'target url',
		type: 'string',
		demandOption: true,
	},
	verbose: {
		alias: 'v',
		describe: 'enable verbose logs',
		type: 'boolean',
		default: false,
	},
	debug: {
		describe: 'enable debug logs',
		type: 'boolean',
		default: false,
	},
	limit: {
		alias: 'l',
		describe: 'limit requests',
		type: 'number',
		default: 1000,
	},
	duration: {
		alias: 'd',
		describe: 'duration in milliseconds',
		type: 'number',
	},
	maxWait: {
		alias: 'w',
		describe: 'max delay in milliseconds',
		type: 'number',
		default: 200,
	},
	sync: {
		alias: 's',
		describe: 'run requests synchronously',
		type: 'boolean',
		default: false,
	},
};

interface CliArgs {
	target: string;
	limit: number;
	maxWait: number;
	duration?: number;
	help?: boolean;
	verbose?: boolean;
	debug?: boolean;
	sync?: boolean;
}

export const handler = async (args: CliArgs) => {
	const { maxWait, limit, target, duration, sync, verbose, debug } = args;

	const logger = new Logger('run', { verbose, debug });

	if (!target) {
		logger.warn('no target specified');
		process.exit(1);
	}

	exitAfterDuration(args);

	if (sync) {
		await makeRequestsInSeries();
	} else {
		await makeRequestsInParallel();
	}

	process.on('beforeExit', () => {
		Telemetry.outputStats();
	});

	async function makeRequestsInParallel() {
		let count = 0;

		const makeRequest = async () => {
			if (shouldExit(count)) {
				return;
			}

			await sendRequest({ target, logger });
			count++;
		};

		async function batch() {
			if (shouldExit(count)) {
				return;
			}

			await Promise.all(Array(Math.min(limit, 100)).fill(0).map(makeRequest));
			await batch();
		}

		await batch();
	}

	async function makeRequestsInSeries() {
		const getTimeout = () => {
			if (maxWait) {
				return Math.max(100, Math.random() * maxWait);
			} else {
				return 100;
			}
		};

		let timeout = setTimeout(makeRequest, getTimeout());

		let count = 0;

		async function makeRequest() {
			if (shouldExit(count)) {
				return;
			}

			await sendRequest({ target, logger });
			count++;
			timeout = setTimeout(makeRequest, getTimeout());
		}

		process.on('exit', () => {
			if (timeout) {
				clearTimeout(timeout);
			}
		});
	}

	function shouldExit(count: number) {
		return !duration && count >= limit;
	}
};

function exitAfterDuration({ duration }: CliArgs) {
	if (duration) {
		// start an unrefed timeout so that
		// if the duration is reached, the process
		// will exit
		setTimeout(() => {
			Telemetry.outputStats();
			process.exit(0);
		}, duration).unref();
	}
}
