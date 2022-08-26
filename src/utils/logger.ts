import chalk from 'chalk';

type LogType = 'info' | 'verbose' | 'error' | 'warn';

export default class Logger {
  owner: string;

  constructor(owner: string) {
    this.owner = owner;
  }

  private formatMessage(message: string, type: LogType = 'info') {
    let method;
    
    switch (type) {
      case 'info':
        method = chalk.dim.white;
        break;
      case 'verbose':
        method = chalk.gray;
        break;
      case 'error':
        method = chalk.red;
        break;
      case 'warn':
        method = chalk.yellow;
        break;
    }

    return method(`${chalk.bold.dim(`[${this.owner}]`)} ${message}`);
  }

  public info(message: string) {
    console.log(this.formatMessage(message));
  }

  public verbose(message: string) {
    console.debug(this.formatMessage(message));
  }

  public error(message: string) {
    console.error(new Error(this.formatMessage(message)));
  }

  public warn(message: string) {
    console.warn(this.formatMessage(message));
  }
}