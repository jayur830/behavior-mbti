import { calculateUserBenchmark } from '@/data/benchmarkStats';
import { BEHAVIOR_PERSONAS, MBTI_PROFILES } from '@/data/mbtiDescriptions';
import { getOptionLabel, QUESTIONS_POOL } from '@/data/questions';
import type {
  DilemmaQuestionDetail,
  Dimension,
  DimensionAnalysis,
  FullAnalysisResult,
  HoverPsychologyAnalysis,
  InputDevice,
  MBTIType,
  PersonaGapAnalysis,
  QuestionBehaviorLog,
} from '@/types';

export function analyzeBehaviorAndMBTI(logs: QuestionBehaviorLog[], questions = QUESTIONS_POOL): FullAnalysisResult {
  // Ensure safe fallback if logs are empty
  const safeLogs: QuestionBehaviorLog[] =
    logs && logs.length > 0
      ? logs
      : questions.slice(0, 10).map((q) => ({
          questionId: q.id,
          startTime: Date.now() - 3000,
          endTime: Date.now(),
          initialValue: 1,
          finalValue: 1,
          changeCount: 0,
          selectionHistory: [{ value: 1, timestamp: 1000 }],
          totalDwellTime: 3000,
          firstInteractionTime: 1000,
          mouseTrajectory: [],
          hoverLogs: [],
          directionChanges: 0,
          hesitationScore: 20,
          tabBlurCount: 0,
          primaryDevice: 'mouse' as const,
          keyStrokeCount: 0,
        }));

  // 1. Total stats calculation
  const totalTestDuration = safeLogs.reduce((acc, l) => acc + (l.totalDwellTime || 0), 0);
  const totalAnswerChanges = safeLogs.reduce((acc, l) => acc + (l.changeCount || 0), 0);

  // 2. Hover Analytics (Declarative)
  const hoverLogsFlat = safeLogs.flatMap((log) => {
    const q = QUESTIONS_POOL.find((question) => question.id === log.questionId);
    return (log.hoverLogs || []).map((h) => ({
      log,
      question: q,
      hover: h,
    }));
  });

  const totalHoverCount = hoverLogsFlat.length;
  const totalHoverDurationMs = hoverLogsFlat.reduce((acc, item) => acc + item.hover.duration, 0);
  const hesitatedOptionsCount = hoverLogsFlat.filter((item) => item.hover.duration >= 400).length;

  const conflictedHoverItems: HoverPsychologyAnalysis['conflictedHoverItems'] = hoverLogsFlat
    .filter(
      (item) =>
        item.question &&
        item.log.finalValue !== null &&
        item.hover.optionValue !== item.log.finalValue &&
        item.hover.duration >= 450 &&
        Math.sign(item.hover.optionValue || 1) !== Math.sign(item.log.finalValue || 1),
    )
    .map((item) => ({
      questionTitle: item.question!.title,
      hoveredOptionLabel: getOptionLabel(item.hover.optionValue),
      finalOptionLabel: getOptionLabel(item.log.finalValue ?? 0),
      hoverDurationMs: item.hover.duration,
      interpretation: `[${getOptionLabel(item.hover.optionValue)}]에 ${(item.hover.duration / 1000).toFixed(1)}초간 마우스를 올려두며 내적 갈등을 겪은 후, 최종적으로 [${getOptionLabel(item.log.finalValue ?? 0)}]을 선택했습니다.`,
    }))
    .slice(0, 3);

  const hoverAnalysis: HoverPsychologyAnalysis = {
    totalHoverCount,
    totalHoverDurationMs,
    hesitatedOptionsCount,
    hoverInsight:
      hesitatedOptionsCount > 4
        ? '선택지를 누르기 전 여러 대안 위를 신중하게 오가며 비교 검토하는 사색적 시선 패턴이 뚜렷합니다.'
        : '직관적으로 떠오른 선택지로 마우스가 곧장 직행하는 결단력 있는 선택 패턴을 보였습니다.',
    conflictedHoverItems,
  };

  // 3. Detect primary input device (Declarative)
  const deviceCounts = safeLogs.reduce(
    (acc, l) => {
      if (l.primaryDevice === 'touch') acc.touch++;
      else if (l.primaryDevice === 'keyboard') acc.keyboard++;
      else acc.mouse++;
      return acc;
    },
    { touch: 0, keyboard: 0, mouse: 0 },
  );

  const primaryDevice: InputDevice =
    deviceCounts.touch > deviceCounts.mouse && deviceCounts.touch > deviceCounts.keyboard
      ? 'touch'
      : deviceCounts.keyboard > deviceCounts.mouse && deviceCounts.keyboard > deviceCounts.touch
        ? 'keyboard'
        : 'mouse';

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
    const q = QUESTIONS_POOL.find((item) => item.id === log.questionId);
    if (!q) return;

    const dim = q.dimension;
    const val = log.finalValue ?? 0;
    const scoreWeight = Math.abs(val);

    if (val > 0) {
      dimensionScores[dim].positiveScore += scoreWeight;
    } else if (val < 0) {
      dimensionScores[dim].negativeScore += scoreWeight;
    } else {
      dimensionScores[dim].positiveScore += 0.5;
      dimensionScores[dim].negativeScore += 0.5;
    }

    dimensionScores[dim].hesitationSum += log.hesitationScore;
    dimensionScores[dim].changesSum += log.changeCount;
    dimensionScores[dim].count += 1;
  });

  const analyzeDimension = (dimKey: Dimension, leftType: MBTIType, rightType: MBTIType): DimensionAnalysis => {
    const data = dimensionScores[dimKey];
    const totalScore = data.positiveScore + data.negativeScore || 1;
    const posRatio = data.positiveScore / totalScore;

    const leftScore = Math.round(posRatio * 100);
    const rightScore = 100 - leftScore;

    const winner: MBTIType = leftScore >= rightScore ? leftType : rightType;
    const winnerPercentage = Math.max(leftScore, rightScore);

    const avgHesitation = data.count > 0 ? data.hesitationSum / data.count : 30;
    const rawCertainty = winnerPercentage * 1.2 - avgHesitation * 0.4 - data.changesSum * 6;
    const certaintyScore = Math.max(25, Math.min(99, Math.round(rawCertainty)));

    const behaviorInsight =
      certaintyScore >= 80
        ? `마우스 망설임이나 수정 없이 매우 단호하고 명확하게 ${winner} 성향을 선택했습니다. (확신도 ${certaintyScore}%)`
        : certaintyScore >= 55
          ? `${winner} 성향이 우세하지만, 일부 문항에서 선택지를 비교하며 신중하게 사색했습니다. (확신도 ${certaintyScore}%)`
          : `${leftType}와 ${rightType} 성향 사이에서 마우스 궤적의 흔들림과 선택 수정이 관측된 균형/경계 영역입니다. (확신도 ${certaintyScore}%)`;

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
    certaintyInsight: '자신의 본능적 선택 패턴을 탐색해보세요.',
    hesitationAnalysis: '자연스러운 선택 흐름을 보였습니다.',
  };

  const overallCertainty = Math.round(
    (dimensions.EI.certaintyScore +
      dimensions.SN.certaintyScore +
      dimensions.TF.certaintyScore +
      dimensions.JP.certaintyScore) /
      4,
  );

  // 6. Behavior Persona Profiling (Declarative)
  const avgDwellPerQuestion = totalTestDuration / safeLogs.length;

  const determinePersona = () => {
    if (totalAnswerChanges >= 3) return BEHAVIOR_PERSONAS.THE_VACILLATOR;
    if (avgDwellPerQuestion > 7000) return BEHAVIOR_PERSONAS.THE_DELIBERATOR;
    if (avgDwellPerQuestion < 3200 && totalAnswerChanges === 0) return BEHAVIOR_PERSONAS.THE_DECISIVE;
    if (hesitatedOptionsCount >= 3) return BEHAVIOR_PERSONAS.THE_EXPLORER;
    return BEHAVIOR_PERSONAS.THE_STEALTH;
  };

  const persona = determinePersona() || BEHAVIOR_PERSONAS.THE_DECISIVE;

  // 7. Dilemma Details for All Questions
  const allQuestionDetails: DilemmaQuestionDetail[] = safeLogs.map((log) => {
    const q = QUESTIONS_POOL.find((item) => item.id === log.questionId) || QUESTIONS_POOL[0];
    const hoverSummary =
      log.hoverLogs && log.hoverLogs.length > 0
        ? `선택지 ${log.hoverLogs.length}회 탐색 (총 ${(log.hoverLogs.reduce((a, b) => a + b.duration, 0) / 1000).toFixed(1)}초 체류)`
        : '망설임 없는 즉시 선택';

    const longestHoveredOption =
      log.hoverLogs && log.hoverLogs.length > 0
        ? ([...log.hoverLogs].sort((a, b) => b.duration - a.duration)[0]?.optionValue ?? null)
        : null;

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
          : log.totalDwellTime > 5000
            ? '선택을 바꾸지는 않았으나 충분한 시간 동안 질문을 심사숙고했습니다.'
            : '자신의 성향을 명확하게 파악하여 직관적이고 빠르게 결정했습니다.',
      hoverSummary,
      longestHoveredOption,
    };
  });

  // Top 3 Dilemmas (highest hesitation + changeCount)
  const topDilemmas = [...allQuestionDetails]
    .sort((a, b) => {
      const scoreA = (a.behavior.hesitationScore || 0) * 1.5 + (a.behavior.changeCount || 0) * 30;
      const scoreB = (b.behavior.hesitationScore || 0) * 1.5 + (b.behavior.changeCount || 0) * 30;
      return scoreB - scoreA;
    })
    .slice(0, 3);

  // 8. Instinct vs Persona Gap Detection
  const gapItems = safeLogs
    .filter((log) => log.changeCount > 0 && log.selectionHistory && log.selectionHistory.length >= 2)
    .map((log) => {
      const q = QUESTIONS_POOL.find((item) => item.id === log.questionId) || QUESTIONS_POOL[0];
      const initialChoice = log.selectionHistory[0].value;
      const finalChoice = log.finalValue ?? initialChoice;

      return {
        question: q,
        initialChoiceText: getOptionLabel(initialChoice),
        finalChoiceText: getOptionLabel(finalChoice),
        hesitationDuration: log.totalDwellTime,
        psychologicalInterpretation: `첫 직관은 [${getOptionLabel(initialChoice)}]이었으나, ${(log.totalDwellTime / 1000).toFixed(1)}초간의 재검토를 거쳐 최종적으로 [${getOptionLabel(finalChoice)}]을 선택했습니다.`,
      };
    });

  const personaGap: PersonaGapAnalysis = {
    detected: gapItems.length > 0,
    count: gapItems.length,
    summary:
      gapItems.length > 0
        ? `총 ${gapItems.length}개 문항에서 첫 무의식적 직관과 최종 사회적 선택 간의 갭(Gap)이 포착되었습니다.`
        : '모든 문항에서 첫 직관적 반응과 최종 선택이 일치하여 내면과 외면의 일관성이 매우 높습니다.',
    items: gapItems,
  };

  // 9. Mouse Trajectory Analytics
  const totalDistance = safeLogs.reduce((acc, l) => {
    const traj = l.mouseTrajectory || [];
    const dist = traj.slice(1).reduce((sum, pt, idx) => {
      const prev = traj[idx];
      const dx = pt.x - prev.x;
      const dy = pt.y - prev.y;
      return sum + Math.sqrt(dx * dx + dy * dy);
    }, 0);
    return acc + dist;
  }, 0);

  const averageSpeed = totalTestDuration > 0 ? (totalDistance / (totalTestDuration / 1000)).toFixed(2) : '1.00';
  const totalDirectionChanges = safeLogs.reduce((acc, l) => acc + (l.directionChanges || 0), 0);
  const indecisivenessIndex = Math.min(
    100,
    Math.round(totalAnswerChanges * 20 + totalDirectionChanges * 2 + (hesitatedOptionsCount || 0) * 5),
  );

  const mouseTrajectoryStats = {
    totalDistanceNormalized: Math.round(totalDistance * 1000),
    averageSpeed: parseFloat(averageSpeed),
    indecisivenessIndex,
    primaryDevice,
    keyStrokeCount: safeLogs.reduce((acc, l) => acc + (l.keyStrokeCount || 0), 0),
    totalHoverCount,
  };

  // 10. Benchmark calculation
  const benchmark = calculateUserBenchmark(totalTestDuration, totalAnswerChanges);

  return {
    mbti: mbti as MBTIType,
    mbtiTitle: mbtiProfile.title,
    mbtiDescription: mbtiProfile.summary,
    dimensions,
    overallCertainty,
    totalTestDuration,
    totalAnswerChanges,
    behaviorPersona: persona,
    hoverAnalysis,
    allQuestionDetails,
    topDilemmas,
    personaGap,
    mouseTrajectoryStats,
    benchmark,
  };
}
