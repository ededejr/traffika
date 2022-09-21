import yargs from 'yargs';
import runWithCluster from '../utils/cluster/primary';

export const command = 'blast <target>';
export const desc = 'send requests to target on multiple threads';
export const builder: yargs.CommandBuilder = {
	target: {
		describe: 'target url',
		type: 'string',
		demandOption: true,
	},
	verbose: {
		alias: 'v',
		describe: 'verbose output',
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
  workers: {
		alias: 'w',
		describe: 'max number of workers to use',
		type: 'number',
	},
	batch: {
		alias: 'b',
		describe: 'batch size for requests',
		type: 'number',
		default: 100
	},
  duration: {
		alias: 'd',
		describe: 'duration in milliseconds',
		type: 'number',
	},
};

interface CliArgs {
	target: string;
	limit: number;
  verbose: boolean;
	debug: boolean;
	batch: number;
  workers?: number;
	help?: boolean;
  duration?: number;
}

export const handler = async (args: CliArgs) => {
  const { limit, target, verbose, workers, duration, batch, debug } = args;
  runWithCluster({ limit, target, verbose, workers, duration, batch, debug });
};
