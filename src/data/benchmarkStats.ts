import type { BenchmarkStats } from '@/types';

import { QUESTIONS_POOL } from './questions';

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
    { questionId: 7, revisionRate: 41.2 }, // T vs F
    { questionId: 2, revisionRate: 36.8 }, // E vs I
    { questionId: 9, revisionRate: 33.5 }, // T vs F
    { questionId: 10, revisionRate: 29.4 }, // J vs P
    { questionId: 5, revisionRate: 27.1 }, // S vs N
  ],
};

function calculateSpeedPercentile(avgSecPerQuestion: number): number {
  if (avgSecPerQuestion < 2.0) return 96;
  if (avgSecPerQuestion < 3.2) return 85;
  if (avgSecPerQuestion < 4.5) return 70;
  if (avgSecPerQuestion < 6.0) return 50;
  if (avgSecPerQuestion < 8.5) return 30;
  return 12;
}

function calculateDecisivenessPercentile(changeRatePercent: number): number {
  if (changeRatePercent === 0) return 92;
  if (changeRatePercent <= 10) return 75;
  if (changeRatePercent <= 25) return 55;
  if (changeRatePercent <= 40) return 35;
  return 15;
}

export function calculateUserBenchmark(
  totalDurationMs: number,
  totalChanges: number,
  questionCount = 10,
): BenchmarkStats {
  const durationSec = totalDurationMs / 1000;
  const safeCount = Math.max(1, questionCount);
  const avgSecPerQuestion = durationSec / safeCount;
  const changeRatePercent = (totalChanges / safeCount) * 100;

  const speedPercentile = calculateSpeedPercentile(avgSecPerQuestion);
  const decisivenessPercentile = calculateDecisivenessPercentile(changeRatePercent);

  const topRevisedQuestions = GLOBAL_BENCHMARK_BASE.revisedQuestionRates.map((item, idx) => {
    const q = QUESTIONS_POOL.find((qItem) => qItem.id === item.questionId);
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
