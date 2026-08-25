import { BenchmarkStats } from '../types';
import { QUESTIONS } from './questions';

export const GLOBAL_BENCHMARK_BASE = {
  averageTestDurationSec: 54.2,
  averageChangesPerTest: 2.3,
  personaDistribution: [
    { personaCode: 'THE_DECISIVE', name: '초고속 직진 결단파', percentage: 22 },
    { personaCode: 'THE_DELIBERATOR', name: '심사숙고 장고파', percentage: 34 },
    { personaCode: 'THE_VACILLATOR', name: '갈팡질팡 갈대형', percentage: 21 },
    { personaCode: 'THE_EXPLORER', name: '마우스 춤추는 탐색형', percentage: 14 },
    { personaCode: 'THE_STEALTH', name: '미니멀 스텔스형', percentage: 9 },
  ],
  revisedQuestionRates: [
    { questionId: 7, revisionRate: 41.2 }, // T vs F (친구 고민 vs 해결책)
    { questionId: 2, revisionRate: 36.8 }, // E vs I (주말 혼자 있기)
    { questionId: 9, revisionRate: 33.5 }, // T vs F (솔직한 비판 vs 칭찬)
    { questionId: 10, revisionRate: 29.4 }, // J vs P (여행 계획 엑셀)
    { questionId: 5, revisionRate: 27.1 }, // S vs N (화성 이주 상상)
  ],
};

export function calculateUserBenchmark(totalDurationMs: number, totalChanges: number): BenchmarkStats {
  const durationSec = totalDurationMs / 1000;

  // Percentile calculation for duration (lower = faster = higher percentile)
  let speedPercentile = 50;
  if (durationSec < 25) speedPercentile = 96;
  else if (durationSec < 35) speedPercentile = 85;
  else if (durationSec < 45) speedPercentile = 70;
  else if (durationSec < 55) speedPercentile = 50;
  else if (durationSec < 75) speedPercentile = 30;
  else speedPercentile = 12;

  // Percentile for decisiveness (fewer changes = higher decisiveness percentile)
  let decisivenessPercentile = 50;
  if (totalChanges === 0) decisivenessPercentile = 92;
  else if (totalChanges === 1) decisivenessPercentile = 75;
  else if (totalChanges === 2) decisivenessPercentile = 55;
  else if (totalChanges === 3) decisivenessPercentile = 35;
  else decisivenessPercentile = 15;

  const topRevisedQuestions = GLOBAL_BENCHMARK_BASE.revisedQuestionRates.map((item, idx) => {
    const q = QUESTIONS.find((qItem) => qItem.id === item.questionId);
    return {
      rank: idx + 1,
      questionId: item.questionId,
      questionTitle: q ? q.title : `문항 ${item.questionId}`,
      revisionRate: item.revisionRate,
    };
  });

  return {
    dwellTimePercentile: speedPercentile,
    changeCountPercentile: decisivenessPercentile,
    globalAverageDwellSec: GLOBAL_BENCHMARK_BASE.averageTestDurationSec,
    globalAverageChanges: GLOBAL_BENCHMARK_BASE.averageChangesPerTest,
    personaDistribution: GLOBAL_BENCHMARK_BASE.personaDistribution,
    topRevisedQuestionsRank: topRevisedQuestions,
  };
}
