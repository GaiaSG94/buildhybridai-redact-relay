import { describe, expect, it } from 'vitest';
import { formatMetrics, median, summarize } from '../src/core/metrics';

describe('median', () => {
  it('handles odd, even and empty lists', () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(3);
    expect(median([])).toBeNull();
  });
});

describe('summarize', () => {
  it('splits runs by where they actually ran', () => {
    const metrics = summarize([
      { source: 'on_device', latencyMs: 180 },
      { source: 'on_device', latencyMs: 200 },
      { source: 'in_cloud', latencyMs: 1400 },
    ]);
    expect(metrics.runs).toBe(3);
    expect(metrics.local).toBe(2);
    expect(metrics.cloud).toBe(1);
    expect(metrics.localShare).toBe(67);
    expect(metrics.medianLocalMs).toBe(190);
    expect(metrics.medianCloudMs).toBe(1400);
  });

  it('reports 0% when the device could not run the model', () => {
    const metrics = summarize([
      { source: 'in_cloud', latencyMs: 900 },
      { source: 'in_cloud', latencyMs: 1100 },
    ]);
    expect(metrics.localShare).toBe(0);
    expect(metrics.medianLocalMs).toBeNull();
    expect(metrics.medianCloudMs).toBe(1000);
  });

  it('returns zeros before the first run', () => {
    const empty = summarize([]);
    expect(empty.runs).toBe(0);
    expect(empty.local).toBe(0);
    expect(empty.cloud).toBe(0);
    expect(empty.localShare).toBe(0);
    expect(empty.medianLocalMs).toBeNull();
    expect(empty.medianCloudMs).toBeNull();
  });
});

describe('formatMetrics', () => {
  it('prints the numbers the demo quotes', () => {
    const line = formatMetrics(
      summarize([
        { source: 'on_device', latencyMs: 180 },
        { source: 'in_cloud', latencyMs: 1400 },
      ]),
    );
    expect(line).toContain('2 run(s)');
    expect(line).toContain('median local 180 ms');
    expect(line).toContain('median cloud 1.40 s');
    expect(line).toContain('50% of runs computed on device');
  });

  it('says so when nothing ran yet', () => {
    expect(formatMetrics(summarize([]))).toBe('Measurements: no run yet.');
  });
});
