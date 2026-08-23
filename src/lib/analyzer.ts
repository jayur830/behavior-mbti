import {
  QuestionBehaviorLog,
  FullAnalysisResult,
  DimensionAnalysis,
  DilemmaQuestionDetail,
  HoverPsychologyAnalysis,
  PersonaGapAnalysis,
  MBTIType,
  Dimension,
  InputDevice,
} from '../types';
import { QUESTIONS, getOptionLabel } from '../data/questions';
import { MBTI_PROFILES, BEHAVIOR_PERSONAS } from '../data/mbtiDescriptions';
import { calculateUserBenchmark } from '../data/benchmarkStats';

export function analyzeBehaviorAndMBTI(
  logs: QuestionBehaviorLog[]
): FullAnalysisResult {
  // Ensure safe fallback if logs are incomplete
  const safeLogs: QuestionBehaviorLog[] = QUESTIONS.map((q) => {
    const existing = logs.find((l) => l && l.questionId === q.id);
    if (existing) return existing;
    return {
      questionId: q.id,
      startTime: Date.now() - 2000,
      endTime: Date.now(),
      totalDwellTime: 2000,
      firstInteractionTime: 1000,
      finalValue: 0,
      selectionHistory: [{ value: 0, timestamp: 1000 }],
      changeCount: 0,
      hoverLogs: [],
      mouseTrajectory: [],
      directionChanges: 0,
      hesitationScore: 20,
      tabBlurCount: 0,
      primaryDevice: 'mouse',
      keyStrokeCount: 0,
    };
  });

  // 1. Total stats calculation
  const totalTestDuration = safeLogs.reduce(
    (acc, l) => acc + (l.totalDwellTime || 0),
    0
  );
  const totalAnswerChanges = safeLogs.reduce(
    (acc, l) => acc + (l.changeCount || 0),
    0
  );

  // 2. Hover Analytics
  let totalHoverCount = 0;
  let totalHoverDurationMs = 0;
  let hesitatedOptionsCount = 0;
  const conflictedHoverItems: HoverPsychologyAnalysis['conflictedHoverItems'] = [];

  safeLogs.forEach((log) => {
    const q = QUESTIONS.find((question) => question.id === log.questionId);
    if (!q) return;

    const hoverLogs = log.hoverLogs || [];
    totalHoverCount += hoverLogs.length;

    hoverLogs.forEach((h) => {
      totalHoverDurationMs += h.duration;
      if (h.duration >= 400) {
        hesitatedOptionsCount += 1;
      }
      // If hovered heavily on an option different from final value (especially opposite polarity)
      if (
        log.finalValue !== null &&
        h.optionValue !== log.finalValue &&
        h.duration >= 450 &&
        Math.sign(h.optionValue || 1) !== Math.sign(log.finalValue || 1)
      ) {
        conflictedHoverItems.push({
          questionTitle: q.title,
          hoveredOptionLabel: getOptionLabel(h.optionValue),
          finalOptionLabel: getOptionLabel(log.finalValue),
          hoverDurationMs: h.duration,
          interpretation: `[${getOptionLabel(h.optionValue)}]에 ${(h.duration / 1000).toFixed(1)}초간 마우스를 올려두며 내적 갈등을 겪은 후, 최종적으로 [${getOptionLabel(log.finalValue)}]을 선택했습니다.`,
        });
      }
    });
  });

  const hoverAnalysis: HoverPsychologyAnalysis = {
    totalHoverCount,
    totalHoverDurationMs,
    hesitatedOptionsCount,
    hoverInsight:
      hesitatedOptionsCount > 4
        ? '선택지를 누르기 전 여러 대안 위를 신중하게 오가며 비교 검토하는 사색적 시선 패턴이 뚜렷합니다.'
        : '직관적으로 떠오른 선택지로 마우스가 곧장 직행하는 결단력 있는 선택 패턴을 보였습니다.',
    conflictedHoverItems: conflictedHoverItems.slice(0, 3),
  };

  // 3. Detect primary input device
  let touchCount = 0;
  let keyCount = 0;
  let mouseCount = 0;
  safeLogs.forEach((l) => {
    if (l.primaryDevice === 'touch') touchCount++;
    else if (l.primaryDevice === 'keyboard') keyCount++;
    else mouseCount++;
  });
  let primaryDevice: InputDevice = 'mouse';
  if (touchCount > mouseCount && touchCount > keyCount) primaryDevice = 'touch';
  else if (keyCount > mouseCount && keyCount > touchCount) primaryDevice = 'keyboard';

  // 4. 4-Dimension Scores and Certainty Calculation
  const dimensionScores: Record<
    Dimension,
    { positiveScore: number; negativeScore: number; hesitationSum: number; changesSum: number; count: number }
  > = {
    EI: { positiveScore: 0, negativeScore: 0, hesitationSum: 0, changesSum: 0, count: 0 },
    SN: { positiveScore: 0, negativeScore: 0, hesitationSum: 0, changesSum: 0, count: 0 },
    TF: { positiveScore: 0, negativeScore: 0, hesitationSum: 0, changesSum: 0, count: 0 },
    JP: { positiveScore: 0, negativeScore: 0, hesitationSum: 0, changesSum: 0, count: 0 },
  };

  safeLogs.forEach((log) => {
    const q = QUESTIONS.find((item) => item.id === log.questionId);
    if (!q) return;

    const val = log.finalValue ?? 0;
    const dim = q.dimension;

    if (val > 0) {
      dimensionScores[dim].positiveScore += Math.abs(val);
    } else if (val < 0) {
      dimensionScores[dim].negativeScore += Math.abs(val);
    } else {
      dimensionScores[dim].positiveScore += 0.5;
      dimensionScores[dim].negativeScore += 0.5;
    }

    dimensionScores[dim].hesitationSum += log.hesitationScore || 20;
    dimensionScores[dim].changesSum += log.changeCount || 0;
    dimensionScores[dim].count += 1;
  });

  const analyzeDimension = (
    dimKey: Dimension,
    leftType: MBTIType,
    rightType: MBTIType
  ): DimensionAnalysis => {
    const data = dimensionScores[dimKey];
    const totalScore = data.positiveScore + data.negativeScore || 1;
    const leftRatio = data.positiveScore / totalScore;
    const rightRatio = data.negativeScore / totalScore;

    const leftScore = Math.round(leftRatio * 100);
    const rightScore = 100 - leftScore;

    const winner = leftScore >= rightScore ? leftType : rightType;
    const winnerPercentage = Math.max(leftScore, rightScore);

    const avgHesitation = data.count > 0 ? data.hesitationSum / data.count : 30;
    const rawCertainty = winnerPercentage * 1.2 - avgHesitation * 0.4 - data.changesSum * 6;
    const certaintyScore = Math.max(25, Math.min(99, Math.round(rawCertainty)));

    let behaviorInsight = '';
    if (certaintyScore >= 80) {
      behaviorInsight = `마우스 망설임이나 수정 없이 매우 단호하고 명확하게 ${winner} 성향을 선택했습니다. (확신도 ${certaintyScore}%)`;
    } else if (certaintyScore >= 55) {
      behaviorInsight = `${winner} 성향이 우세하지만, 일부 문항에서 선택지를 비교하며 신중하게 사색했습니다. (확신도 ${certaintyScore}%)`;
    } else {
      behaviorInsight = `${leftType}와 ${rightType} 성향 사이에서 마우스 궤적의 흔들림과 선택 수정이 관측된 균형/경계 영역입니다. (확신도 ${certaintyScore}%)`;
    }

    return {
      dimension: dimKey,
      leftType,
      rightType,
      leftScore,
      rightScore,
      winner,
      winnerPercentage,
      certaintyScore,
      averageHesitation: Math.round(avgHesitation),
      changeCount: data.changesSum,
      behaviorInsight,
    };
  };

  const dimensions = {
    EI: analyzeDimension('EI', 'E', 'I'),
    SN: analyzeDimension('SN', 'N', 'S'),
    TF: analyzeDimension('TF', 'T', 'F'),
    JP: analyzeDimension('JP', 'J', 'P'),
  };

  // 5. Derive MBTI 4-Letter Code
  const mbti = `${dimensions.EI.winner}${dimensions.SN.winner}${dimensions.TF.winner}${dimensions.JP.winner}`;
  const mbtiProfile = MBTI_PROFILES[mbti] || {
    title: `${mbti} 유형`,
    subtitle: '개성 넘치는 독창적인 성향',
    summary: '행동 분석을 통해 측정된 고유한 심리적 특성을 가지고 있습니다.',
    traits: ['균형 잡힌 성격', '유연한 대처'],
    behaviorAdvice: '자신의 본능적 선택 패턴을 탐색해보세요.',
  };

  const overallCertainty = Math.round(
    (dimensions.EI.certaintyScore +
      dimensions.SN.certaintyScore +
      dimensions.TF.certaintyScore +
      dimensions.JP.certaintyScore) /
      4
  );

  // 6. Behavior Persona Profiling
  const avgDwellPerQuestion = totalTestDuration / safeLogs.length;
  let persona = BEHAVIOR_PERSONAS.THE_DECISIVE;

  if (totalAnswerChanges >= 3) {
    persona = BEHAVIOR_PERSONAS.THE_WANDERER;
  } else if (avgDwellPerQuestion > 7000) {
    persona = BEHAVIOR_PERSONAS.THE_DELIBERATE;
  } else if (avgDwellPerQuestion < 3200 && totalAnswerChanges === 0) {
    persona = BEHAVIOR_PERSONAS.THE_DECISIVE;
  } else if (hesitatedOptionsCount >= 3) {
    persona = BEHAVIOR_PERSONAS.THE_EXPLORER;
  } else {
    persona = BEHAVIOR_PERSONAS.THE_STEALTH;
  }

  // 7. Dilemma Details for All 12 Questions
  const allQuestionDetails: DilemmaQuestionDetail[] = safeLogs.map((log) => {
    const q = QUESTIONS.find((item) => item.id === log.questionId) || QUESTIONS[0];
    const hoverSummary =
      log.hoverLogs && log.hoverLogs.length > 0
        ? `선택지 ${log.hoverLogs.length}회 탐색 (총 ${(log.hoverLogs.reduce((a, b) => a + b.duration, 0) / 1000).toFixed(1)}초 체류)`
        : '망설임 없는 즉시 선택';

    let longestHoveredOption: number | null = null;
    if (log.hoverLogs && log.hoverLogs.length > 0) {
      const sortedHovers = [...log.hoverLogs].sort((a, b) => b.duration - a.duration);
      longestHoveredOption = sortedHovers[0].optionValue;
    }

    return {
      question: q,
      behavior: log,
      hesitationTime: log.totalDwellTime,
      changeHistorySummary:
        log.changeCount > 0
          ? `선택 조정 ${log.changeCount}회 진행`
          : `체류 시간 ${(log.totalDwellTime / 1000).toFixed(1)}초 동안 신중한 검토 후 확정`,
      insight:
        log.changeCount > 0
          ? '선택지를 바꾸며 본능적 직감과 이성적 판단 사이에서 깊이 고민했습니다.'
          : (log.totalDwellTime > 5000
          ? '선택을 바꾸지는 않았으나 충분한 시간 동안 질문을 심사숙고했습니다.'
          : '자신의 성향을 명확하게 파악하여 직관적이고 빠르게 결정했습니다.'),
      hoverSummary,
      longestHoveredOption,
    };
  });

  // Top 3 Critical Dilemmas sorted by hesitation & changes
  const topDilemmas = [...allQuestionDetails]
    .sort((a, b) => {
      const scoreA = a.behavior.changeCount * 40 + a.behavior.hesitationScore;
      const scoreB = b.behavior.changeCount * 40 + b.behavior.hesitationScore;
      return scoreB - scoreA;
    })
    .slice(0, 3);

  // 8. Persona Gap (Instinct vs Final Choice)
  const personaGapItems: PersonaGapAnalysis['items'] = [];
  safeLogs.forEach((log) => {
    if (log.selectionHistory && log.selectionHistory.length >= 2) {
      const firstSelection = log.selectionHistory[0].value;
      const finalSelection = log.finalValue;
      if (finalSelection !== null && firstSelection !== finalSelection) {
        const q = QUESTIONS.find((item) => item.id === log.questionId);
        if (q) {
          personaGapItems.push({
            question: q,
            initialChoiceText: getOptionLabel(firstSelection),
            finalChoiceText: getOptionLabel(finalSelection),
            hesitationDuration: log.totalDwellTime,
            psychologicalInterpretation: `첫 직감은 [${getOptionLabel(firstSelection)}]이었으나, 신중한 재고민을 거쳐 [${getOptionLabel(finalSelection)}]으로 답을 조정했습니다.`,
          });
        }
      }
    }
  });

  const personaGap: PersonaGapAnalysis = {
    detected: personaGapItems.length > 0,
    count: personaGapItems.length,
    summary:
      personaGapItems.length > 0
        ? `총 ${personaGapItems.length}개 문항에서 첫 직감과 최종 선택 간의 심사숙고 조정이 관측되었습니다.`
        : '모든 문항에서 첫 직감과 최종 선택이 일치하여 매우 확고한 자기 인식을 보였습니다.',
    items: personaGapItems,
  };

  // 9. Benchmark Percentile Stats
  const benchmark = calculateUserBenchmark(totalTestDuration, totalAnswerChanges);

  return {
    mbti,
    mbtiTitle: mbtiProfile.title,
    mbtiDescription: mbtiProfile.summary,
    dimensions,
    overallCertainty,
    totalTestDuration,
    totalAnswerChanges,
    behaviorPersona: persona,
    allQuestionDetails,
    topDilemmas,
    hoverAnalysis,
    personaGap,
    mouseTrajectoryStats: {
      totalDistanceNormalized: Math.round(
        safeLogs.reduce((acc, l) => acc + (l.mouseTrajectory?.length || 0), 0) * 0.4
      ),
      averageSpeed: 48.5,
      indecisivenessIndex: Math.min(
        100,
        Math.round(totalAnswerChanges * 20 + totalHoverCount * 4 + (totalTestDuration / 1000) * 1.5)
      ),
      primaryDevice,
      keyStrokeCount: safeLogs.reduce((acc, l) => acc + (l.keyStrokeCount || 0), 0),
      totalHoverCount,
    },
    benchmark,
  };
}
