import chalk from 'chalk';

const history = new Map<number, { data: string; timestamp: number }>();
const entryRgx = /::(?<id>[A-Z0-9\-]+)]\sstop:\s(?<time>[0-9\.]+)/;

function exitHandler() {
	const entries = Array.from(history.values());

	const metadata = entries
		.filter(({ data }) => data.includes('stop'))
		.map(({ data, timestamp }) => {
			let runTime;
			let requestId;

			const found = data.match(entryRgx);

			if (found) {
				const { id, time } = found.groups || {};
				requestId = id;
				runTime = {
					string: `${time}ms`,
					int: parseFloat(time),
				};
			}

			return {
				data,
				runTime,
				requestId,
			};
		});

	// print out more detailed summary (inefficient)
	const important = (s: string) => console.log(chalk.magenta(s));
	const dim = (s: string) => console.log(chalk.dim(s));

	important('\nSummary:');

	const speeds = metadata
		.map(({ runTime }) => runTime?.int)
		.filter(Boolean) as number[];
	const sum = speeds.reduce((a, b) => a + b, 0);
	const avg = sum / speeds.length || 0;
	const fastest = Math.min(...speeds);
	const slowest = Math.max(...speeds);

	dim(`  count: ${speeds.length} requests`);
	dim(`  average: ${Math.round(avg)}ms`);
	dim(`  fastest: ${Math.round(fastest)}ms`);
	dim(`  slowest: ${Math.round(slowest)}ms`);
	console.log('');
}

process.on('beforeExit', exitHandler);

const Telemetry = {
	history,
	onExit: exitHandler,
};

export default Telemetry;
