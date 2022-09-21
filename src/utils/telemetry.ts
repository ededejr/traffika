import chalk from 'chalk';

export type HistoryEntryMetadata = {
	statusString?: string;
	ua?: string;
	duration?: string;
	id?: string;
};

export type HistoryEntry = { 
	data: string;
	timestamp: number;
	metadata: HistoryEntryMetadata;
};

const history = new Map<number, HistoryEntry>();

export interface TelemetryStats { 
	count: number;
	avg: number;
	fastest: number;
	slowest: number;
	statusCodes: { status?: string; count: number }[];
}

function getStats(): TelemetryStats {
	const entries = Array.from(history.values());

	const metadata = entries
		.filter(({ data }) => data.includes('stop'))
		.map(({ data, metadata }) => {
			let runTime;
	
			if (metadata?.duration) {
				runTime = {
					string: `${metadata.duration}ms`,
					int: parseFloat(metadata.duration),
				};
			}

			return {
				data,
				runTime,
				requestId: metadata?.id,
				statusString: metadata?.statusString,
			};
		});

	const statuses = metadata.map(({ statusString }) => statusString);
	const statusCodes = Array.from(new Set(statuses)).map((status) => ({ status, count: countOccurrences(statuses, status) }));
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
		statusCodes,
	}
}

function outputStats({ count, avg, fastest, slowest, statusCodes }: TelemetryStats = getStats()) {
	// print out more detailed summary (inefficient)
	const important = (s: string) => console.log(chalk.magenta(s));
	const dim = (s: string) => console.log(chalk.dim(s));
	important('\nSummary:');
	dim(`  requests: ${count}`);
	dim(`  average: ${Math.round(avg)}ms`);
	dim(`  fastest: ${Math.round(fastest)}ms`);
	dim(`  slowest: ${Math.round(slowest)}ms`);
	dim(`  status codes:\n${statusCodes.map((code) => `    - ${code.status}: ${(100 * (code.count/count)).toFixed(1)}%`).join('\n')}`);
	console.log('');
}

function countOccurrences<T>(arr: T[], item: T) {
	return arr.reduce((a, v) => (v === item ? a + 1 : a), 0);
}

const Telemetry = {
	/**
	 * An internal map used for tracking
	 */
	history,
	/**
	 * Pretty print the Telemetry stats
	 */
	outputStats,
	/**
	 * Get the current stats stored in the Telemetry history
	 */
	getStats,
	/**
	 * Parse a TaskRunner entry into relevant parts
	 */
	entryRgx: /::(?<id>[A-Z0-9\-]+)]\sstop:\s(?<duration>[0-9\.]+)/
};

export default Telemetry;
