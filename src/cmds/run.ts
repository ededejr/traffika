import yargs from 'yargs';
import Logger from '../utils/logger';
import { sendRequest } from '../utils/sendRequest';

export const command = 'run <target>';
export const desc = 'send requests to target';
export const builder: yargs.CommandBuilder = {
  target: {
    describe: 'target url',
    type: 'string',
    demandOption: true
  },
  verbose: {
    alias: 'v',
    describe: 'verbose output',
    type: 'boolean',
    default: false
  },
  limit: {
    alias: 'l',
    describe: 'limit requests',
    type: 'number',
    default: 1000
  },
  duration: {
    alias: 'd',
    describe: 'duration in seconds',
    type: 'number'
  },
  maxWait: {
    alias: 'w',
    describe: 'max delay in milliseconds',
    type: 'number',
    default: 200
  },
  sync: {
    alias: 's',
    describe: 'run requests synchronously',
    type: 'boolean',
    default: false
  }
};

interface CliArgs {
  target: string;
  limit: number;
  maxWait: number;
  duration?: number;
  help?: boolean;
  verbose?: boolean;
  sync?: boolean;
};

const logger = new Logger('run');

export const handler = async (args: CliArgs) => {
  const { maxWait, limit, target, duration, sync} = args;

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

  async function makeRequestsInParallel() {
    let count = 0;
    
    const makeRequest = async () => {
      if (shouldExit(count)) {
        return;
      }

      await sendRequest({ target, logger });
      count++;
    };

    await Promise.all(Array(limit).fill(0).map(makeRequest));
  }

  async function makeRequestsInSeries() {
    const getTimeout = () => {
      if (maxWait) {
        return Math.max(100, Math.random() * maxWait)
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
}

function exitAfterDuration({ duration }: CliArgs) {
  if (duration) {
    // start an unrefed timeout so that
    // if the duration is reached, the process
    // will exit
    setTimeout(() => {
      process.exit(0);
    }, duration).unref();
  }
}