import {
  Dimension,
  DimensionAnalysis,
  DilemmaQuestionDetail,
  FullAnalysisResult,
  InputDevice,
  MBTIType,
  PersonaGapAnalysis,
  QuestionBehaviorLog,
} from '../types';
import { QUESTIONS, getOptionLabel } from '../data/questions';
import { BEHAVIOR_PERSONAS, MBTI_PROFILES } from '../data/mbtiDescriptions';
import { calculateUserBenchmark } from '../data/benchmarkStats';

export function analyzeBehaviorAndMBTI(logs: QuestionBehaviorLog[]): FullAnalysisResult {
  const logMap = new Map<number, QuestionBehaviorLog>();
  logs.forEach((log) => logMap.set(log.questionId, log));

  // 1. Calculate MBTI 4 Dimensions
  const dimensionResults: Record<Dimension, DimensionAnalysis> = {
    EI: calculateDimension('EI', 'E', 'I', logs, logMap),
    SN: calculateDimension('SN', 'N', 'S', logs, logMap),
    TF: calculateDimension('TF', 'T', 'F', logs, logMap),
    JP: calculateDimension('JP', 'J', 'P', logs, logMap),
  };

  const mbtiCode = `${dimensionResults.EI.winner}${dimensionResults.SN.winner}${dimensionResults.TF.winner}${dimensionResults.JP.winner}`;
  const mbtiProfile = MBTI_PROFILES[mbtiCode] || {
    title: `${mbtiCode} 유형`,
    subtitle: '개성 넘치는 특별한 성향',
    summary: '독창적인 시각과 깊이 있는 매력을 지닌 성향입니다.',
    traits: ['입체적 성격', '상황 적응력'],
    behaviorAdvice: '행동 분석을 통해 나만의 고유한 심리 패턴을 확인해보세요.',
  };

  // 2. Aggregate Overall Stats
  const totalTestDuration = logs.reduce((acc, l) => acc + (l.totalDwellTime || 0), 0);
  const totalAnswerChanges = logs.reduce((acc, l) => acc + l.changeCount, 0);
  const totalKeyStrokes = logs.reduce((acc, l) => acc + (l.keyStrokeCount || 0), 0);
  const avgCertainty =
    (dimensionResults.EI.certaintyScore +
      dimensionResults.SN.certaintyScore +
      dimensionResults.TF.certaintyScore +
      dimensionResults.JP.certaintyScore) /
    4;

  // 3. Detect primary input device
  let touchCount = 0;
  let keyCount = 0;
  let mouseCount = 0;
  logs.forEach((l) => {
    if (l.primaryDevice === 'touch') touchCount++;
    else if (l.primaryDevice === 'keyboard') keyCount++;
    else mouseCount++;
  });
  let primaryDevice: InputDevice = 'mouse';
  if (touchCount > mouseCount && touchCount > keyCount) primaryDevice = 'touch';
  else if (keyCount > mouseCount && keyCount > touchCount) primaryDevice = 'keyboard';

  // 4. Mouse & Touch Trajectory Dynamics
  let totalDistance = 0;
  let totalTrajectoryPoints = 0;
  let totalDirectionChanges = 0;

  logs.forEach((l) => {
    totalDirectionChanges += l.directionChanges || 0;
    const pts = l.mouseTrajectory || [];
    totalTrajectoryPoints += pts.length;
    for (let i = 1; i < pts.length; i++) {
      const dx = pts[i].x - pts[i - 1].x;
      const dy = pts[i].y - pts[i - 1].y;
      totalDistance += Math.sqrt(dx * dx + dy * dy);
    }
  });

  const avgSpeed = totalTestDuration > 0 ? (totalDistance / (totalTestDuration / 1000)) * 100 : 0;
  const indecisivenessIndex = Math.min(
    100,
    Math.round(
      totalAnswerChanges * 18 +
        (totalDirectionChanges / (logs.length || 1)) * 5 +
        (totalTestDuration / logs.length / 1000) * 3
    )
  );

  // 5. Determine Behavior Persona
  const behaviorPersona = determinePersona(
    totalAnswerChanges,
    totalTestDuration / (logs.length || 1),
    totalDistance,
    indecisivenessIndex
  );

  // 6. Detect Persona Gap
  const personaGap = detectPersonaGap(logs, logMap);

  // 7. Extract Top Dilemmas
  const topDilemmas = extractTopDilemmas(logs, logMap);

  // 8. Global Benchmark Stats
  const benchmark = calculateUserBenchmark(totalTestDuration, totalAnswerChanges);

  return {
    mbti: mbtiCode,
    mbtiTitle: mbtiProfile.title,
    mbtiDescription: mbtiProfile.summary,
    dimensions: dimensionResults,
    overallCertainty: Math.round(avgCertainty),
    totalTestDuration,
    totalAnswerChanges,
    behaviorPersona,
    topDilemmas,
    personaGap,
    mouseTrajectoryStats: {
      totalDistanceNormalized: Math.round(totalDistance * 10) / 10,
      averageSpeed: Math.round(avgSpeed * 10) / 10,
      indecisivenessIndex,
      primaryDevice,
      keyStrokeCount: totalKeyStrokes,
    },
    benchmark,
  };
}

function calculateDimension(
  dim: Dimension,
  posType: MBTIType,
  negType: MBTIType,
  logs: QuestionBehaviorLog[],
  logMap: Map<number, QuestionBehaviorLog>
): DimensionAnalysis {
  const dimQuestions = QUESTIONS.filter((q) => q.dimension === dim);
  let totalScore = 0;
  let totalChanges = 0;
  let totalDwell = 0;
  let totalHesitation = 0;

  dimQuestions.forEach((q) => {
    const l = logMap.get(q.id);
    const val = l?.finalValue ?? 0;
    totalScore += val;
    if (l) {
      totalChanges += l.changeCount;
      totalDwell += l.totalDwellTime;
      totalHesitation += l.hesitationScore;
    }
  });

  const maxPossible = dimQuestions.length * 3;
  let winner: MBTIType = posType;
  let leftScore = 50;
  let rightScore = 50;
  let winnerPercentage = 50;

  if (totalScore > 0) {
    winner = posType;
    winnerPercentage = Math.round(50 + (totalScore / maxPossible) * 50);
    leftScore = winnerPercentage;
    rightScore = 100 - winnerPercentage;
  } else if (totalScore < 0) {
    winner = negType;
    winnerPercentage = Math.round(50 + (Math.abs(totalScore) / maxPossible) * 50);
    leftScore = 100 - winnerPercentage;
    rightScore = winnerPercentage;
  } else {
    winner = posType;
    winnerPercentage = 50;
  }

  const avgDwellSec = totalDwell / dimQuestions.length / 1000;
  const strengthFactor = Math.abs(totalScore) / maxPossible;
  const penalty =
    totalChanges * 12 + (totalHesitation / dimQuestions.length) * 0.4 + (avgDwellSec > 10 ? 15 : 0);
  const certaintyScore = Math.max(20, Math.min(99, Math.round(strengthFactor * 100 - penalty + 25)));

  let insight = '';
  if (certaintyScore >= 80) {
    insight = `해당 영역에서는 망설임 없는 단호한 결정을 보였습니다. 확신도 ${certaintyScore}%`;
  } else if (certaintyScore >= 55) {
    insight = `상황에 따라 균형을 고려하며 신중하게 답변을 선택했습니다.`;
  } else {
    insight = `두 성향 사이에서 마우스 방황과 답변 수정이 빈번하여 경계선에 가까운 유연함을 보입니다.`;
  }

  return {
    dimension: dim,
    leftType: posType,
    rightType: negType,
    leftScore,
    rightScore,
    winner,
    winnerPercentage,
    certaintyScore,
    averageHesitation: Math.round(totalDwell / (dimQuestions.length || 1)),
    changeCount: totalChanges,
    behaviorInsight: insight,
  };
}

function determinePersona(
  totalChanges: number,
  avgDwellMs: number,
  totalDistance: number,
  indecisivenessIndex: number
) {
  if (totalChanges >= 3 || indecisivenessIndex >= 70) {
    return BEHAVIOR_PERSONAS.THE_VACILLATOR;
  }
  if (avgDwellMs >= 7000) {
    return BEHAVIOR_PERSONAS.THE_DELIBERATOR;
  }
  if (totalDistance > 35) {
    return BEHAVIOR_PERSONAS.THE_EXPLORER;
  }
  if (avgDwellMs < 3200 && totalChanges === 0) {
    return BEHAVIOR_PERSONAS.THE_DECISIVE;
  }
  return BEHAVIOR_PERSONAS.THE_STEALTH;
}

function detectPersonaGap(
  logs: QuestionBehaviorLog[],
  logMap: Map<number, QuestionBehaviorLog>
): PersonaGapAnalysis {
  const gapItems: PersonaGapAnalysis['items'] = [];

  logs.forEach((log) => {
    if (log.selectionHistory.length >= 2) {
      const first = log.selectionHistory[0];
      const last = log.selectionHistory[log.selectionHistory.length - 1];
      const diff = Math.abs(first.value - last.value);
      const q = QUESTIONS.find((question) => question.id === log.questionId);

      if (diff >= 2 && q) {
        let interpretation = '';
        if (first.value < last.value) {
          interpretation = `처음에는 소극적이거나 반대되는 입장을 취했으나(${getOptionLabel(
            first.value
          )}), 고민 끝에 긍정적인 방향(${getOptionLabel(last.value)})으로 의사를 조정했습니다.`;
        } else {
          interpretation = `처음에는 즉각적으로 ${getOptionLabel(
            first.value
          )}를 골랐으나, 현실적 조건이나 자신의 실제 패턴을 재숙고하여 ${getOptionLabel(
            last.value
          )}로 솔직하게 수정했습니다.`;
        }

        gapItems.push({
          question: q,
          initialChoiceText: getOptionLabel(first.value),
          finalChoiceText: getOptionLabel(last.value),
          hesitationDuration: last.timestamp - first.timestamp || 1200,
          psychologicalInterpretation: interpretation,
        });
      }
    }
  });

  return {
    detected: gapItems.length > 0,
    count: gapItems.length,
    summary:
      gapItems.length > 0
        ? `총 ${gapItems.length}개 문항에서 최초의 본능적 선택과 최종 선택 간의 유의미한 심리적 유턴이 포착되었습니다.`
        : `답변을 크게 뒤바꾼 문항이 없어, 자신의 성향을 매우 일관되고 뚜렷하게 인식하고 있습니다.`,
    items: gapItems,
  };
}

function extractTopDilemmas(
  logs: QuestionBehaviorLog[],
  logMap: Map<number, QuestionBehaviorLog>
): DilemmaQuestionDetail[] {
  const scored = logs.map((log) => {
    const q = QUESTIONS.find((item) => item.id === log.questionId)!;
    const changeScore = log.changeCount * 40;
    const dwellScore = Math.min(60, (log.totalDwellTime / 1000) * 5);
    const hesitationScore = (log.hesitationScore || 0) * 0.4;
    const zigZagScore = (log.directionChanges || 0) * 3;
    const totalDilemmaScore = changeScore + dwellScore + hesitationScore + zigZagScore;

    let summary = '';
    if (log.changeCount > 0) {
      const historyStr = log.selectionHistory.map((s) => getOptionLabel(s.value)).join(' ➔ ');
      summary = `선택 변경 ${log.changeCount}회 (${historyStr})`;
    } else {
      summary = `체류 시간 ${(log.totalDwellTime / 1000).toFixed(1)}초 동안 신중한 마우스 탐색 후 확정`;
    }

    let insight = '';
    if (log.changeCount >= 2) {
      insight = '양쪽 극단과 중립을 오가며 심리적 갈등이 가장 격렬했던 질문입니다.';
    } else if (log.totalDwellTime > 8000) {
      insight = '긴 시간 동안 질문의 단어 하나하나를 곱씹으며 깊은 사색에 잠겼습니다.';
    } else if (log.directionChanges > 10) {
      insight = '마우스 커서가 여러 선택지 위에서 머뭇거리며 흔들리는 패턴이 뚜렷했습니다.';
    } else {
      insight = '상대적으로 고민의 흔적이 묻어난 의미 있는 문항입니다.';
    }

    return {
      dilemmaScore: totalDilemmaScore,
      detail: {
        question: q,
        behavior: log,
        hesitationTime: log.totalDwellTime,
        changeHistorySummary: summary,
        insight,
      },
    };
  });

  scored.sort((a, b) => b.dilemmaScore - a.dilemmaScore);
  return scored.slice(0, 3).map((s) => s.detail);
}
