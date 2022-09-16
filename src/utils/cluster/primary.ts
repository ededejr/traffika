import path from 'node:path';
import { cpus } from 'node:os';
import cluster, { Worker } from 'node:cluster';
import Logger from '../logger';
import { IPCPacket, Messages } from './WorkerNode';
import Telemetry, { TelemetryStats } from '../telemetry';

interface Options {
  target: string;
	limit: number;
  verbose: boolean;
  batch: number;
  duration?: number;
  workers?: number;
};

export default async function runWithCluster(options: Options) {
  if (cluster.isPrimary) {
    const { target, verbose } = options;
    const logger = new Logger('primary', verbose);

    if (!target) {
      logger.warn('no target specified');
      process.exit(1);
    }
    
    const utilOptions = { logger, ...options };

    cluster.on('message', (worker, packet: IPCPacket) => {
      handleMessage(worker, packet, utilOptions);
    });

    handleProcessExit(utilOptions);
    await createWorkers(utilOptions);
    logger.verbose('ready ✅');
    broadcastCommand('start');
    exitAfterDuration(utilOptions);
  }
}

type UtilOptions = Options & {
  logger: Logger;
}

function createWorkers({ logger, limit, target, verbose, duration, workers, batch }: UtilOptions) {
  return new Promise((resolve) => {
    logger.verbose('setting up cluster...');
    const cores = cpus().length;
    const numWorkers = workers ? Math.min(workers, cores) : cores;
    const requestsPerWorker = Math.round(limit/numWorkers);
    TOTAL_REQUESTS = requestsPerWorker * numWorkers;
    logger.verbose(`detected ${cores} cores:`);

    cluster.setupPrimary({
      args: [
        target,
        requestsPerWorker.toString(),
        batch.toString(),
        Boolean(duration).toString(),
        verbose.toString()
      ],
      exec: path.join(__dirname, './worker.js'),
    });

    for (let i = 1; i <= numWorkers; i++) {
      cluster.fork();
      logger.verbose(`  - forked [${i}/${cores}]`);
    }

    resolve(undefined);
  })
}

function handleProcessExit({ logger }: UtilOptions) {
  process.on('exit', async () => {
    broadcastCommand('exit');
    logger.important('exiting gracefully...');
    Telemetry.outputStats(merge(STATS));
  });
}

function merge(stats: TelemetryStats[]) {
  return stats.reduce((acc, stat) => {
    acc.avg = ((acc.count * acc.avg) + (stat.count * stat.avg)) / (acc.count + stat.count);
    acc.count += stat.count;
    acc.slowest = Math.max(acc.slowest, stat.slowest);
    acc.fastest = Math.min(stat.fastest, acc.fastest);
    return acc;
  }, {
    count: 0,
    avg: 0,
    fastest: Infinity,
    slowest: 0,
  });
}

let TOTAL_REQUESTS = 0;
let COUNTER = 0;
let STATS: TelemetryStats[] = [];

function handleMessage(worker: Worker, packet: IPCPacket, options: UtilOptions) {
  const { logger, limit, duration } = options;
  switch (packet.type) {
    case 'action':
      const { action, value } = packet.message as Messages.Action;
      logger.verbose(`[w::${worker.process.pid}::${action}] ${value}`);

      switch (action) {
        case 'UPDATE_COUNTER':
          COUNTER++;

          if (duration) {
            logger.verbose(`[counter] ${COUNTER}`);  
          } else {
            logger.verbose(`[counter] ${COUNTER}/${limit}`);
          }

          if (!duration && COUNTER === TOTAL_REQUESTS) {
            broadcastCommand('exit');
          }
          break;
        case 'REPORT_STATS':
          STATS.push(JSON.parse(value as string));
          break;
      }
      break;
    case 'log':
      logger.verbose(`[w::${worker.process.pid}] ${packet.message}`);
      break;
  }
}

function exitAfterDuration({ duration }: UtilOptions) {
	if (duration) {
		// start an unrefed timeout so that
		// if the limit is reached, the process
		// will exit
		setTimeout(() => {
      broadcastCommand('exit');
			// process.exit(0);
		}, duration).unref();
	}
}

function broadcastCommand(type: 'start' | 'exit' | 'stop') {
  eachWorker(async (worker) => {
    worker.send({ type: 'command', message: { type } });
  });
}

async function eachWorker(fn: (worker: Worker) => Promise<void>) {
  if (cluster.workers) {
    const workers = Object.values(cluster.workers);
    await Promise.all(workers.filter(Boolean).map(async (worker) => fn(worker as Worker)));
  }
}