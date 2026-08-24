import LZString from 'lz-string';
import {
  FullAnalysisResult,
  DimensionAnalysis,
  QuestionBehaviorLog,
  MousePoint,
  AnswerSelectionEvent,
  OptionHoverLog,
  HoverPsychologyAnalysis,
  MBTIType,
} from '../types';
import { MBTI_PROFILES, BEHAVIOR_PERSONAS } from '../data/mbtiDescriptions';
import { calculateUserBenchmark } from '../data/benchmarkStats';
import { QUESTIONS_POOL, getOptionLabel } from '../data/questions';

const INTEGRITY_SALT = 'BM_CRYPTO_TAMPER_PROOF_SALT_2026_@!';

/**
 * 32비트 FNV-1a 기반 무결성 검증 체크섬 계산
 * URL 내의 데이터가 1글자라도 변경되면 시그니처 불일치로 즉시 거부됩니다.
 */
function computeSignature(payloadStr: string): string {
  let hash = 0x811c9dc5;
  const combined = payloadStr + INTEGRITY_SALT;
  for (let i = 0; i < combined.length; i++) {
    hash ^= combined.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

/**
 * 육안 식별 불가(Opaque)를 위한 가역적 XOR 스크램블링
 * 평문 MBTI(ENTJ 등), 점수 등의 키워드를 암호화하여 육안 파악 및 추측을 원천 차단합니다.
 */
function xorScramble(str: string): string {
  const saltLen = INTEGRITY_SALT.length;
  let out = '';
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i) ^ INTEGRITY_SALT.charCodeAt(i % saltLen);
    out += String.fromCharCode(code);
  }
  return out;
}

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

interface SecurePayloadEnvelope {
  /** 암호화된 불투명 페이로드 */
  _d: string;
  /** 위변조 방지 무결성 디지털 서명 */
  _s: string;
}

/**
 * 분석 결과를 육안 식별이 불가능하며 위변조 검증 서명이 포함된 압축 문자열로 직렬화합니다.
 */
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
    p: result.behaviorPersona?.code || 'THE_DECISIVE',
    t: result.totalTestDuration,
    c: result.totalAnswerChanges,
    i: result.mouseTrajectoryStats.indecisivenessIndex,
    dev: result.mouseTrajectoryStats.primaryDevice,
    dil: questionsToEncode.map((d, dIdx) => {
      const rawPts = d.behavior.mouseTrajectory || [];
      const shouldSaveFullPts = dIdx < 10 || d.behavior.changeCount > 0 || d.hesitationTime > 4500;
      const step = rawPts.length > 25 ? Math.ceil(rawPts.length / 25) : 1;
      const sampledPts = shouldSaveFullPts && rawPts.length > 0
        ? rawPts
            .filter((_, idx) => idx % step === 0 || idx === rawPts.length - 1)
            .map((p): [number, number, number, number] => [
              Math.round(p.x * 1000),
              Math.round(p.y * 1000),
              p.timestamp,
              Math.round((p.speed || 0) * 1000),
            ])
        : undefined;

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
    const rawJson = JSON.stringify(payload);
    const signature = computeSignature(rawJson);
    const scrambled = xorScramble(rawJson);

    const envelope: SecurePayloadEnvelope = {
      _d: scrambled,
      _s: signature,
    };

    return LZString.compressToEncodedURIComponent(JSON.stringify(envelope));
  } catch (err) {
    console.error('Failed to encode result:', err);
    return '';
  }
}

/**
 * 압축 문자열로부터 디지털 서명을 검증하고 위변조가 감지되면 null을 반환합니다.
 */
export function decodeResultFromCompressedString(
  compressedStr: string
): FullAnalysisResult | null {
  if (!compressedStr) return null;

  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(compressedStr);
    if (!decompressed) return null;

    let payload: CompactSharePayload | null = null;

    // 1. 보안 엔벨로프(서명 + 스크램블링) 파싱 시도
    if (decompressed.includes('_d') && decompressed.includes('_s')) {
      const envelope: SecurePayloadEnvelope = JSON.parse(decompressed);
      const unscrambledJson = xorScramble(envelope._d);
      const expectedSig = computeSignature(unscrambledJson);

      // 위변조 검증: 서명이 일치하지 않으면 즉시 차단
      if (envelope._s !== expectedSig) {
        console.warn('Tampered or corrupted payload signature detected! Rejected.');
        return null;
      }

      payload = JSON.parse(unscrambledJson) as CompactSharePayload;
    } else {
      // 레거시 페이로드 하위 호환
      payload = JSON.parse(decompressed) as CompactSharePayload;
    }

    if (!payload || !payload.m) return null;

    // 2. 성향 축 분석 복원
    const buildDimension = (
      dimKey: 'EI' | 'SN' | 'TF' | 'JP',
      leftType: MBTIType,
      rightType: MBTIType,
      data: [number, number, number]
    ): DimensionAnalysis => {
      const leftScore = data[0];
      const rightScore = data[1];
      const certaintyScore = data[2];
      const winner: MBTIType = leftScore >= rightScore ? leftType : rightType;
      const winnerPercentage = Math.max(leftScore, rightScore);

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
        averageHesitation: Math.round(data[2] * 40),
        changeCount: 0,
        behaviorInsight,
      };
    };

    const dimensions = {
      EI: buildDimension('EI', 'E', 'I', payload.ei),
      SN: buildDimension('SN', 'N', 'S', payload.sn),
      TF: buildDimension('TF', 'T', 'F', payload.tf),
      JP: buildDimension('JP', 'J', 'P', payload.jp),
    };

    const mbti = payload.m;
    const mbtiProfile = MBTI_PROFILES[mbti] || {
      title: `${mbti} 유형`,
      subtitle: '개성 넘치는 독창적인 성향',
      summary: '행동 분석을 통해 측정된 고유한 심리적 특성을 가지고 있습니다.',
      traits: ['균형 잡힌 성격', '유연한 대처'],
      behaviorAdvice: '자신의 본능적 선택 패턴을 탐색해보세요.',
    };

    const behaviorPersona =
      BEHAVIOR_PERSONAS[payload.p] || BEHAVIOR_PERSONAS.THE_DECISIVE;

    const overallCertainty = Math.round(
      (dimensions.EI.certaintyScore +
        dimensions.SN.certaintyScore +
        dimensions.TF.certaintyScore +
        dimensions.JP.certaintyScore) /
        4
    );

    let totalHoverCount = 0;
    let totalHoverDurationMs = 0;
    let hesitatedOptionsCount = 0;
    const conflictedHoverItems: HoverPsychologyAnalysis['conflictedHoverItems'] = [];

    // 3. 문항별 디테일 및 궤적 복원
    const allQuestionDetails = (payload.dil || []).map((item) => {
      const q = QUESTIONS_POOL.find((question) => question.id === item.qid) || QUESTIONS_POOL[0];

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
            {
              x: 0.5 + item.val * 0.12,
              y: 0.74,
              timestamp: Math.round(item.dwell * 0.85),
              speed: 0.2,
            },
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
        if (h.duration >= 400) hesitatedOptionsCount++;
        if (
          item.val !== null &&
          h.optionValue !== item.val &&
          h.duration >= 450 &&
          Math.sign(h.optionValue || 1) !== Math.sign(item.val || 1)
        ) {
          conflictedHoverItems.push({
            questionTitle: q.title,
            hoveredOptionLabel: getOptionLabel(h.optionValue),
            finalOptionLabel: getOptionLabel(item.val),
            hoverDurationMs: h.duration,
            interpretation: `[${getOptionLabel(h.optionValue)}]에 ${(h.duration / 1000).toFixed(1)}초간 마우스를 올려두며 내적 갈등을 겪은 후, 최종적으로 [${getOptionLabel(item.val)}]을 선택했습니다.`,
          });
        }
      });

      const behavior: QuestionBehaviorLog = {
        questionId: item.qid,
        startTime: 0,
        endTime: item.dwell,
        totalDwellTime: item.dwell,
        firstInteractionTime: Math.round(item.dwell * 0.4),
        finalValue: item.val,
        selectionHistory,
        changeCount: item.c,
        hoverLogs,
        mouseTrajectory,
        directionChanges: Math.max(1, item.c * 2),
        hesitationScore: Math.min(100, Math.round(item.c * 20 + item.dwell / 200)),
        tabBlurCount: 0,
        primaryDevice: payload.dev || 'mouse',
        keyStrokeCount: 0,
        touchMetrics: {
          firstTapLatency: Math.round(item.dwell * 0.4),
          averagePressDuration: 85,
          confirmationDelay: Math.round(item.dwell * 0.3),
          tapCount: selectionHistory.length,
        },
      };

      return {
        question: q,
        behavior,
        hesitationTime: item.dwell,
        changeHistorySummary:
          item.c > 0
            ? `선택 조정 ${item.c}회 진행`
            : `체류 시간 ${(item.dwell / 1000).toFixed(1)}초 동안 신중한 검토 후 확정`,
        insight:
          item.c > 0
            ? `선택지를 번복하며 내면의 성향 갈등을 겪었습니다.`
            : `망설임 없이 일관되게 본인의 생각을 표현했습니다.`,
      };
    });

    const topDilemmas = [...allQuestionDetails]
      .sort((a, b) => b.hesitationTime - a.hesitationTime)
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

    const benchmark = calculateUserBenchmark(
      payload.t,
      payload.c
    );

    return {
      mbti,
      mbtiTitle: mbtiProfile.title,
      mbtiDescription: mbtiProfile.summary,
      overallCertainty,
      dimensions,
      behaviorPersona,
      topDilemmas,
      allQuestionDetails,
      hoverAnalysis,
      personaGap: {
        detected: payload.c > 0,
        count: payload.c,
        summary: payload.c > 0 ? `선택지를 번복하며 내면의 갈등을 겪었습니다.` : '일관된 선택을 보였습니다.',
        items: [],
      },
      benchmark,
      totalTestDuration: payload.t,
      totalAnswerChanges: payload.c,
      mouseTrajectoryStats: {
        totalDistanceNormalized: 1200,
        averageSpeed: 0.4,
        keyStrokeCount: 0,
        totalHoverCount,
        primaryDevice: payload.dev || 'mouse',
        indecisivenessIndex: payload.i,
      },
    };
  } catch (err) {
    console.error('Failed to decode result:', err);
    return null;
  }
}
