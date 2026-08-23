import { FullAnalysisResult, DimensionAnalysis, QuestionBehaviorLog } from '../types';
import { MBTI_PROFILES, BEHAVIOR_PERSONAS } from '../data/mbtiDescriptions';
import { calculateUserBenchmark } from '../data/benchmarkStats';
import { QUESTIONS } from '../data/questions';

export interface CompactSharePayload {
  m: string; // mbti code (e.g. "ENTJ")
  ei: [number, number, number]; // [leftScore, rightScore, certaintyScore]
  sn: [number, number, number];
  tf: [number, number, number];
  jp: [number, number, number];
  p: string; // persona code (e.g. "THE_DECISIVE")
  t: number; // total duration ms
  c: number; // total changes
  i: number; // indecisivenessIndex
  dev: 'mouse' | 'touch' | 'keyboard';
  dil?: {
    qid: number;
    dwell: number;
    val: number;
    c: number;
  }[];
}

export function encodeResultToUrl(result: FullAnalysisResult): string {
  const payload: CompactSharePayload = {
    m: result.mbti,
    ei: [result.dimensions.EI.leftScore, result.dimensions.EI.rightScore, result.dimensions.EI.certaintyScore],
    sn: [result.dimensions.SN.leftScore, result.dimensions.SN.rightScore, result.dimensions.SN.certaintyScore],
    tf: [result.dimensions.TF.leftScore, result.dimensions.TF.rightScore, result.dimensions.TF.certaintyScore],
    jp: [result.dimensions.JP.leftScore, result.dimensions.JP.rightScore, result.dimensions.JP.certaintyScore],
    p: result.behaviorPersona.code,
    t: result.totalTestDuration,
    c: result.totalAnswerChanges,
    i: result.mouseTrajectoryStats.indecisivenessIndex,
    dev: result.mouseTrajectoryStats.primaryDevice,
    dil: result.topDilemmas.map((d) => ({
      qid: d.question.id,
      dwell: d.hesitationTime,
      val: d.behavior.finalValue ?? 0,
      c: d.behavior.changeCount,
    })),
  };

  try {
    const jsonStr = JSON.stringify(payload);
    // Base64 encode URL safe
    const base64 = btoa(encodeURIComponent(jsonStr));
    return base64;
  } catch (err) {
    console.error('Failed to encode result', err);
    return '';
  }
}

export function decodeResultFromUrl(code: string): FullAnalysisResult | null {
  try {
    const jsonStr = decodeURIComponent(atob(code));
    const payload: CompactSharePayload = JSON.parse(jsonStr);

    const mbtiProfile = MBTI_PROFILES[payload.m] || {
      title: `${payload.m} 유형`,
      subtitle: '개성 넘치는 성향',
      summary: '독창적인 시각과 깊이 있는 매력을 지닌 성향입니다.',
      traits: ['입체적 성격', '상황 적응력'],
      behaviorAdvice: '행동 분석을 통해 나만의 고유한 심리 패턴을 확인해보세요.',
    };

    const persona =
      Object.values(BEHAVIOR_PERSONAS).find((p) => p.code === payload.p) ||
      BEHAVIOR_PERSONAS.THE_DECISIVE;

    const makeDim = (
      dimKey: 'EI' | 'SN' | 'TF' | 'JP',
      leftType: any,
      rightType: any,
      scores: [number, number, number]
    ): DimensionAnalysis => {
      const [leftScore, rightScore, certaintyScore] = scores;
      const winner = leftScore >= rightScore ? leftType : rightType;
      const winnerPercentage = Math.max(leftScore, rightScore);
      return {
        dimension: dimKey,
        leftType,
        rightType,
        leftScore,
        rightScore,
        winner,
        winnerPercentage,
        certaintyScore,
        averageHesitation: Math.round(payload.t / 4),
        changeCount: Math.round(payload.c / 4),
        behaviorInsight:
          certaintyScore >= 80
            ? `해당 영역에서는 망설임 없는 단호한 결정을 보였습니다. 확신도 ${certaintyScore}%`
            : `두 성향 사이에서 신중하게 답변을 선택했습니다.`,
      };
    };

    const dimensions = {
      EI: makeDim('EI', 'E', 'I', payload.ei),
      SN: makeDim('SN', 'N', 'S', payload.sn),
      TF: makeDim('TF', 'T', 'F', payload.tf),
      JP: makeDim('JP', 'J', 'P', payload.jp),
    };

    const avgCertainty =
      (payload.ei[2] + payload.sn[2] + payload.tf[2] + payload.jp[2]) / 4;

    const benchmark = calculateUserBenchmark(payload.t, payload.c);

    // Reconstruct dilemmas
    const topDilemmas = (payload.dil || []).map((item) => {
      const q = QUESTIONS.find((question) => question.id === item.qid) || QUESTIONS[0];
      const mockBehavior: QuestionBehaviorLog = {
        questionId: q.id,
        startTime: Date.now() - item.dwell,
        endTime: Date.now(),
        totalDwellTime: item.dwell,
        firstInteractionTime: Math.round(item.dwell * 0.5),
        finalValue: item.val,
        selectionHistory: [{ value: item.val, timestamp: Math.round(item.dwell * 0.5) }],
        changeCount: item.c,
        hoverLogs: [],
        mouseTrajectory: [
          { x: 0.2, y: 0.3, timestamp: 100 },
          { x: 0.5, y: 0.7, timestamp: Math.round(item.dwell * 0.5) },
        ],
        directionChanges: item.c * 3,
        hesitationScore: Math.min(100, item.c * 25 + 20),
        tabBlurCount: 0,
        primaryDevice: payload.dev || 'mouse',
        keyStrokeCount: 0,
        touchMetrics: {
          firstTapLatency: Math.round(item.dwell * 0.6),
          averagePressDuration: 90,
          confirmationDelay: Math.round(item.dwell * 0.3),
          tapCount: item.c + 1,
        },
      };

      return {
        question: q,
        behavior: mockBehavior,
        hesitationTime: item.dwell,
        changeHistorySummary:
          item.c > 0
            ? `선택 조정 ${item.c}회 진행`
            : `체류 시간 ${(item.dwell / 1000).toFixed(1)}초 동안 신중한 검토 후 확정`,
        insight: '깊이 있는 사색과 신중한 판단이 드러난 핵심 문항입니다.',
      };
    });

    return {
      mbti: payload.m,
      mbtiTitle: mbtiProfile.title,
      mbtiDescription: mbtiProfile.summary,
      dimensions,
      overallCertainty: Math.round(avgCertainty),
      totalTestDuration: payload.t,
      totalAnswerChanges: payload.c,
      behaviorPersona: persona,
      topDilemmas,
      personaGap: {
        detected: payload.c >= 2,
        count: payload.c >= 2 ? 1 : 0,
        summary: payload.c >= 2 ? '상황에 따라 유연하게 생각하며 답변을 심사숙고했습니다.' : '자신의 성향을 일관되게 인식하고 있습니다.',
        items: [],
      },
      mouseTrajectoryStats: {
        totalDistanceNormalized: 25.5,
        averageSpeed: 45.2,
        indecisivenessIndex: payload.i,
        primaryDevice: payload.dev || 'mouse',
        keyStrokeCount: 0,
      },
      benchmark,
    };
  } catch (err) {
    console.error('Failed to decode share payload', err);
    return null;
  }
}
