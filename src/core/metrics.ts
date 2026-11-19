/** One recorded inference, with the place it actually ran. */
export interface TimedRun {
  source: 'on_device' | 'in_cloud';
  latencyMs: number;
}

export interface RunMetrics {
  runs: number;
  local: number;
  cloud: number;
  localShare: number;
  medianLocalMs: number | null;
  medianCloudMs: number | null;
}

export function median(values: readonly number[]): number | null {
  if (values.length === 0) {
    return null;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[middle - 1] + sorted[middle]) / 2)
    : sorted[middle];
}

/**
 * Numbers the demo quotes, computed from the runs that actually happened:
 * how much inference stayed on the device, and how fast each path was.
 */
export function summarize(runs: readonly TimedRun[]): RunMetrics {
  const local = runs.filter((run) => run.source === 'on_device');
  const cloud = runs.filter((run) => run.source === 'in_cloud');
  return {
    runs: runs.length,
    local: local.length,
    cloud: cloud.length,
    localShare: runs.length === 0 ? 0 : Math.round((local.length / runs.length) * 100),
    medianLocalMs: median(local.map((run) => run.latencyMs)),
    medianCloudMs: median(cloud.map((run) => run.latencyMs)),
  };
}

const asSeconds = (ms: number | null, unit: 's' | 'ms'): string => {
  if (ms === null) {
    return '-';
  }
  return unit === 's' ? `${(ms / 1000).toFixed(2)} s` : `${ms} ms`;
};

/** One line, ready to be printed in the UI. */
export function formatMetrics(metrics: RunMetrics): string {
  if (metrics.runs === 0) {
    return 'Measurements: no run yet.';
  }
  return [
    `Measurements: ${metrics.runs} run(s)`,
    `${metrics.local} local`,
    `${metrics.cloud} cloud`,
    `median local ${asSeconds(metrics.medianLocalMs, 'ms')}`,
    `median cloud ${asSeconds(metrics.medianCloudMs, 's')}`,
    `${metrics.localShare}% of runs computed on device`,
  ].join(' - ');
}
