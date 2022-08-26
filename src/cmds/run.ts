import axios from 'axios';
import randomatic from 'randomatic';
import yargs from 'yargs';
import Logger from '../utils/logger';

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
};

interface CliArgs {
  target: string;
  limit: number;
  maxWait: number;
  duration?: number;
  help?: boolean;
  verbose?: boolean;
};

const logger = new Logger('run');

export const handler = async (args: CliArgs) => {
  const { maxWait, limit, target, duration } = args;

  if (!target) {
    logger.warn('no target specified');
    process.exit(1);
  }
  
  exitAfterDuration(args);

  const getTimeout = () => {
    if (maxWait) {
      return Math.max(100, Math.random() * maxWait)
    } else {
      return 100;
    }
  };
  
  let count = 0;
  let timeout = setTimeout(makeRequest, getTimeout());

  async function makeRequest() {
    if (!duration && count > limit) {
      return;
    }

    await sendRequest(target, makeRequestId());
    count++;
    timeout = setTimeout(makeRequest, getTimeout());
  }

  process.on('exit', () => {
    if (timeout) {
      clearTimeout(timeout);
    }
  });
}

async function sendRequest(target: string, id: string) {
  const url = makeTargetUrl(target, id);

  try {
    await axios.get(url);
    logger.verbose(`sent: GET ${url}`);
  } catch (error: any) {
    logger.error(error.message);
  }
}

function makeTargetUrl(target: string, id: string) {
  const url = new URL(target);
  url.searchParams.append('tfk', id);
  return url.toString();
}

function makeRequestId() {
  return `${process.pid}-${randomatic('A0', 16)}`
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