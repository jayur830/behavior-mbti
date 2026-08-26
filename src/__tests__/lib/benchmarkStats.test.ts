import { calculateUserBenchmark } from '@/data/benchmarkStats';

describe('사용자 벤치마크 계산 테스트 (benchmarkStats)', () => {
  it('유효한 소요 시간과 번복 횟수로 벤치마크 지표를 정상 산출해야 한다', () => {
    const benchmark = calculateUserBenchmark(45000, 1);

    expect(benchmark).toBeDefined();
    expect(benchmark.dwellTimePercentile).toBeGreaterThanOrEqual(1);
    expect(benchmark.dwellTimePercentile).toBeLessThanOrEqual(99);
    expect(benchmark.changeCountPercentile).toBeGreaterThanOrEqual(1);
    expect(benchmark.changeCountPercentile).toBeLessThanOrEqual(99);
    expect(benchmark.globalAverageDwellSec).toBeGreaterThan(0);
    expect(benchmark.globalAverageChanges).toBeGreaterThan(0);
  });
});
