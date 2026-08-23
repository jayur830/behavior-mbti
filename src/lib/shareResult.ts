import LZString from 'lz-string';
import {
  FullAnalysisResult,
  DimensionAnalysis,
  QuestionBehaviorLog,
  MousePoint,
  AnswerSelectionEvent,
  OptionHoverLog,
  HoverPsychologyAnalysis,
} from '../types';
import { MBTI_PROFILES, BEHAVIOR_PERSONAS } from '../data/mbtiDescriptions';
import { calculateUserBenchmark } from '../data/benchmarkStats';
import { QUESTIONS, getOptionLabel } from '../data/questions';

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
    pts?: [number, number, number, number][]; // [x*1000, y*1000, timestamp, speed*1000]
    taps?: [number, number][]; // [value, timestamp]
    hov?: [number, number][]; // [optionValue, duration]
  }[];
}

export function encodeResultToCompressedString(result: FullAnalysisResult): string {
  const questionsToEncode =
    result.allQuestionDetails && result.allQuestionDetails.length > 0
      ? result.allQuestionDetails
      : result.topDilemmas;

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
    dil: questionsToEncode.map((d) => {
      const rawPts = d.behavior.mouseTrajectory || [];
      const step = rawPts.length > 30 ? Math.ceil(rawPts.length / 30) : 1;
      const sampledPts = rawPts
        .filter((_, idx) => idx % step === 0 || idx === rawPts.length - 1)
        .map((p): [number, number, number, number] => [
          Math.round(p.x * 1000),
          Math.round(p.y * 1000),
          p.timestamp,
          Math.round((p.speed || 0) * 1000),
        ]);

      const taps = (d.behavior.selectionHistory || []).map((s): [number, number] => [
        s.value,
        s.timestamp,
      ]);

      const hov = (d.behavior.hoverLogs || []).map((h): [number, number] => [
        h.optionValue,
        h.duration,
      ]);

      return {
        qid: d.question.id,
        dwell: d.hesitationTime,
        val: d.behavior.finalValue ?? 0,
        c: d.behavior.changeCount,
        pts: sampledPts,
        taps,
        hov,
      };
    }),
  };

  try {
    const jsonStr = JSON.stringify(payload);
    return LZString.compressToEncodedURIComponent(jsonStr);
  } catch (err) {
    console.error('Failed to compress result', err);
    return '';
  }
}

export function decodeResultFromCompressedString(compressed: string): FullAnalysisResult | null {
  try {
    let jsonStr: string | null = LZString.decompressFromEncodedURIComponent(compressed);

    // Backward compatibility for base64
    if (!jsonStr) {
      try {
        jsonStr = decodeURIComponent(atob(compressed));
      } catch {
        jsonStr = null;
      }
    }

    if (!jsonStr) return null;

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

    let totalHoverCount = 0;
    let totalHoverDurationMs = 0;
    let hesitatedOptionsCount = 0;
    const conflictedHoverItems: HoverPsychologyAnalysis['conflictedHoverItems'] = [];

    // Reconstruct all question details with trajectories
    const allQuestionDetails = (payload.dil || []).map((item) => {
      const q = QUESTIONS.find((question) => question.id === item.qid) || QUESTIONS[0];

      const mouseTrajectory: MousePoint[] = (item.pts && item.pts.length > 0)
        ? item.pts.map((p) => ({
            x: p[0] / 1000,
            y: p[1] / 1000,
            timestamp: p[2],
            speed: p[3] / 1000,
            type: 'move',
          }))
        : [
            { x: 0.5, y: 0.8, timestamp: 0, speed: 0 },
            { x: 0.5, y: 0.5, timestamp: Math.round(item.dwell * 0.5), speed: 0.1 },
          ];

      const selectionHistory: AnswerSelectionEvent[] = (item.taps && item.taps.length > 0)
        ? item.taps.map((t) => ({
            value: t[0],
            timestamp: t[1],
          }))
        : [{ value: item.val, timestamp: Math.round(item.dwell * 0.7) }];

      const hoverLogs: OptionHoverLog[] = (item.hov && item.hov.length > 0)
        ? item.hov.map((h, hIdx) => ({
            optionValue: h[0],
            enterTime: hIdx * 200,
            leaveTime: hIdx * 200 + h[1],
            duration: h[1],
          }))
        : [];

      totalHoverCount += hoverLogs.length;
      hoverLogs.forEach((h) => {
        totalHoverDurationMs += h.duration;
        if (h.duration >= 400) hesitatedOptionsCount += 1;
        if (
          h.optionValue !== item.val &&
          h.duration >= 450 &&
          Math.sign(h.optionValue || 1) !== Math.sign(item.val || 1)
        ) {
          conflictedHoverItems.push({
            questionTitle: q.title,
            hoveredOptionLabel: getOptionLabel(h.optionValue),
            finalOptionLabel: getOptionLabel(item.val),
            hoverDurationMs: h.duration,
            interpretation: `[${getOptionLabel(h.optionValue)}]에 ${(h.duration / 1000).toFixed(1)}초간 마우스를 올려두며 고민한 후, 최종적으로 [${getOptionLabel(item.val)}]을 선택했습니다.`,
          });
        }
      });

      const hoverSummary =
        hoverLogs.length > 0
          ? `선택지 ${hoverLogs.length}회 탐색 (총 ${(hoverLogs.reduce((a, b) => a + b.duration, 0) / 1000).toFixed(1)}초 체류)`
          : '망설임 없는 즉시 선택';

      const mockBehavior: QuestionBehaviorLog = {
        questionId: q.id,
        startTime: Date.now() - item.dwell,
        endTime: Date.now(),
        totalDwellTime: item.dwell,
        firstInteractionTime: selectionHistory[0]?.timestamp ?? Math.round(item.dwell * 0.5),
        finalValue: item.val,
        selectionHistory,
        changeCount: item.c,
        hoverLogs,
        mouseTrajectory,
        directionChanges: item.c * 3,
        hesitationScore: Math.min(100, item.c * 25 + 20),
        tabBlurCount: 0,
        primaryDevice: payload.dev || 'mouse',
        keyStrokeCount: 0,
        touchMetrics: {
          firstTapLatency: selectionHistory[0]?.timestamp ?? Math.round(item.dwell * 0.6),
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
        insight:
          item.c > 0
            ? '선택지를 바꾸며 본능적 직감과 이성적 판단 사이에서 깊이 고민했습니다.'
            : (item.dwell > 5000
            ? '선택을 바꾸지는 않았으나 충분한 시간 동안 질문을 심사숙고했습니다.'
            : '자신의 성향을 명확하게 파악하여 직관적이고 빠르게 결정했습니다.'),
        hoverSummary,
        longestHoveredOption: hoverLogs.length > 0 ? hoverLogs[0].optionValue : null,
      };
    });

    const topDilemmas = [...allQuestionDetails]
      .sort((a, b) => b.behavior.hesitationScore - a.behavior.hesitationScore)
      .slice(0, 3);

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

    return {
      mbti: payload.m,
      mbtiTitle: mbtiProfile.title,
      mbtiDescription: mbtiProfile.summary,
      dimensions,
      overallCertainty: Math.round(avgCertainty),
      totalTestDuration: payload.t,
      totalAnswerChanges: payload.c,
      behaviorPersona: persona,
      allQuestionDetails,
      topDilemmas,
      hoverAnalysis,
      personaGap: {
        detected: payload.c >= 2,
        count: payload.c >= 2 ? 1 : 0,
        summary:
          payload.c >= 2
            ? '상황에 따라 유연하게 생각하며 답변을 심사숙고했습니다.'
            : '자신의 성향을 일관되게 인식하고 있습니다.',
        items: [],
      },
      mouseTrajectoryStats: {
        totalDistanceNormalized: 25.5,
        averageSpeed: 45.2,
        indecisivenessIndex: payload.i,
        primaryDevice: payload.dev || 'mouse',
        keyStrokeCount: 0,
        totalHoverCount,
      },
      benchmark,
    };
  } catch (err) {
    console.error('Failed to decode compressed share payload', err);
    return null;
  }
}
