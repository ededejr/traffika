import chalk from 'chalk';

type LogType = 'info' | 'verbose' | 'error' | 'warn' | 'important' | 'debug';

export default class Logger {
	owner: string;
	isVerbose: boolean;
	isDebug: boolean;

	constructor(owner: string, { verbose = false, debug = false }) {
		this.owner = owner;
		this.isVerbose = verbose;
		this.isDebug = debug;
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
			case 'debug':
				method = chalk.gray.dim;
				break;
			case 'error':
				method = chalk.red;
				break;
			case 'warn':
				method = chalk.yellow;
				break;
			case 'important':
				method = chalk.magentaBright.bold;
				break;
		}

		return method(`${chalk.bold.dim(`[${this.owner}]`)} ${message}`);
	}

	public info(message: string) {
		console.log(this.formatMessage(message, 'info'));
	}

	public verbose(message: string) {
		if (this.isVerbose) {
			console.debug(this.formatMessage(message, 'verbose'));
		}
	}

	public error(message: string) {
		console.error(this.formatMessage(message, 'error'));
	}

	public warn(message: string) {
		console.warn(this.formatMessage(message, 'warn'));
	}

	public important(message: string) {
		console.log(this.formatMessage(message, 'important'));
	}

	public debug(message: string) {
		if (this.isDebug) {
			console.debug(this.formatMessage(message, 'debug'));
		}
	}
}
