import chalk from 'chalk';

const history = new Map<number, { data: string; timestamp: number }>();
const entryRgx = /::(?<id>[A-Z0-9\-]+)]\sstop:\s(?<time>[0-9\.]+)/;

export interface TelemetryStats { 
	count: number;
	avg: number;
	fastest: number;
	slowest: number;
}

function getStats(): TelemetryStats {
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

	const speeds = metadata
		.map(({ runTime }) => runTime?.int)
		.filter(Boolean) as number[];
	const sum = speeds.reduce((a, b) => a + b, 0);
	const avg = sum / speeds.length || 0;
	const fastest = Math.min(...speeds);
	const slowest = Math.max(...speeds);

	return {
		count: speeds.length,
		avg,
		fastest,
		slowest,
	}
}

function outputStats({ count, avg, fastest, slowest }: TelemetryStats = getStats()) {
	// print out more detailed summary (inefficient)
	const important = (s: string) => console.log(chalk.magenta(s));
	const dim = (s: string) => console.log(chalk.dim(s));
	important('\nSummary:');
	dim(`  count: ${count} requests`);
	dim(`  average: ${Math.round(avg)}ms`);
	dim(`  fastest: ${Math.round(fastest)}ms`);
	dim(`  slowest: ${Math.round(slowest)}ms`);
	console.log('');
}

const Telemetry = {
	history,
	outputStats,
	getStats,
};

export default Telemetry;
