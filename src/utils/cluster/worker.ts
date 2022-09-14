import cluster from 'node:cluster';
import Logger from '../../utils/logger';
import { sendRequest } from '../sendRequest';
import Telemetry from '../telemetry';
import WorkerNode, { IPCPacket } from './WorkerNode';

if (cluster.isWorker) {
  const [,,target, limit, duration, verbose] = process.argv;
  const limitInt = parseInt(limit);
  const logger = new Logger(`w::${process.pid}`, verbose === 'true');
  const wn = new WorkerNode();
  const state = {
    isRunnable: false,
  };
  
  // Handle incoming messages
  process.on('message', (message: IPCPacket) => wn.onMessage(message));
  process.on('exit', () => { 
    logger.verbose('exited');
  });

  wn.onCommand(async (message) => {
    logger.info(`[command] ${message.type}`);
    switch (message.type) {
      case 'start':
        if (!state.isRunnable) {
          state.isRunnable = true;
          logger.important('started');
          wn.sendMessage('online');
          wn.sendMessage(`target: ${target}`);
          wn.sendMessage(`limit: ${limit}`);
          wn.sendMessage(`verbose: ${verbose}`);
          execute();
        }
        break;
      case 'stop':
        if (state.isRunnable) {
          state.isRunnable = false;
          logger.important('stopped');
        }
        break;
      case 'exit':
        const stats = Telemetry.getStats();
        wn.sendAction({
          action: 'REPORT_STATS',
          value: JSON.stringify(stats),
        });
        logger.verbose('exiting...');
        process.disconnect();
        process.exit(0);
    }
  });

  const shouldContinue = (count: number) => {
    if (duration === 'true') {
      return true;
    } else {
      return count < limitInt;
    }
  };

  const execute = async () => {
		let count = 0;
    
		const makeRequest = async () => {
			if (!shouldContinue(count)) {
				return;
			}
			await sendRequest({ target, logger });
      wn.sendAction({
        action: 'UPDATE_COUNTER',
        value: ++count,
      });
		};

		async function batch() {
			if (!shouldContinue(count)) {
				return;
			}

			await Promise.all(Array(Math.min(limitInt, 100)).fill(0).map(makeRequest));
			await batch();
		}

		await batch();
	}
}