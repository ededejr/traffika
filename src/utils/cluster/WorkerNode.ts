import cluster from 'node:cluster';
import { EventEmitter } from 'node:events';

export default class WorkerNode {
  private $emitter = new EventEmitter();

  onMessage(packet: IPCPacket) {
    type PacketType = typeof packet['type'];
    type MessageType = 
    PacketType extends 'command' ? Messages.Command : 
    PacketType extends 'action' ? Messages.Action : never;

    const { type } = packet;
    const message = packet.message as MessageType;

    switch (type) {
      case 'command':
        this.handleCommand(message);
        break;
    }
  }

  private handleCommand(message: Messages.Command) {
    this.$emitter.emit('command', message);
  }

  onCommand(cb: (message: Messages.Command) => void) {
    this.$emitter.on('command', cb);
  }

  sendAction(action: Messages.Action) {
    sendToParent({
      type: 'action',
      message: action,
    });
  }

  sendMessage(message: Messages.Log) {
    sendToParent({
      type: 'log',
      message,
    });
  }
}

function sendToParent(message: IPCPacket) {
  if (cluster.isWorker && process.send) {
    process.send(message);
  }
}

export interface IPCPacket {
  type: 'command' | 'action' | 'log';
  message: Messages.Command | Messages.Action | Messages.Log;
}

export namespace Messages {
  export interface Command {
    type: 'start' | 'exit' | 'stop';
  }
  export type Log = string;
  export type Action = UpdateCounterAction | ReportStatsAction;

  interface UpdateCounterAction {
    action: 'UPDATE_COUNTER';
    value: number
  }

  interface ReportStatsAction {
    action: 'REPORT_STATS';
    value: string
  }
}