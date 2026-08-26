import { decodeResultFromCompressedString, encodeResultToCompressedString } from '@/lib/shareResult';
import type { FullAnalysisResult } from '@/types';

const mockResult: FullAnalysisResult = {
  mbti: 'INFP',
  mbtiTitle: '열정적인 중재자',
  mbtiDescription: '조용하지만 깊은 통찰력과 따뜻한 공감 능력을 지닌 성향입니다.',
  dimensions: {
    EI: {
      dimension: 'EI',
      leftType: 'E',
      rightType: 'I',
      leftScore: 25,
      rightScore: 75,
      winner: 'I',
      winnerPercentage: 75,
      certaintyScore: 80,
      averageHesitation: 1500,
      changeCount: 0,
      behaviorInsight: '내향적 에너지 방향에 확신을 보였습니다.',
    },
    SN: {
      dimension: 'SN',
      leftType: 'S',
      rightType: 'N',
      leftScore: 30,
      rightScore: 70,
      winner: 'N',
      winnerPercentage: 70,
      certaintyScore: 78,
      averageHesitation: 1800,
      changeCount: 1,
      behaviorInsight: '직관적 가능성을 선호합니다.',
    },
    TF: {
      dimension: 'TF',
      leftType: 'T',
      rightType: 'F',
      leftScore: 35,
      rightScore: 65,
      winner: 'F',
      winnerPercentage: 65,
      certaintyScore: 72,
      averageHesitation: 2100,
      changeCount: 1,
      behaviorInsight: '인간적 가치와 공감을 우선시합니다.',
    },
    JP: {
      dimension: 'JP',
      leftType: 'J',
      rightType: 'P',
      leftScore: 40,
      rightScore: 60,
      winner: 'P',
      winnerPercentage: 60,
      certaintyScore: 68,
      averageHesitation: 1400,
      changeCount: 0,
      behaviorInsight: '자율성과 유연성을 선호합니다.',
    },
  },
  overallCertainty: 75,
  totalTestDuration: 52400,
  totalAnswerChanges: 2,
  behaviorPersona: {
    code: 'THE_DECISIVE',
    title: '초고속 직진 결단파',
    subtitle: '빠른 판단과 높은 직관적 결단력',
    description: '첫 직관을 신뢰하며 망설임 없이 결정을 내리는 유형입니다.',
    tags: ['직관적 결단', '빠른 속도', '단호함'],
    iconName: 'Zap',
  },
  hoverAnalysis: {
    totalHoverCount: 12,
    totalHoverDurationMs: 8500,
    hesitatedOptionsCount: 2,
    hoverInsight: '선택지 간 망설임이 적고 빠른 판단을 보였습니다.',
    conflictedHoverItems: [],
  },
  allQuestionDetails: [],
  topDilemmas: [],
  personaGap: {
    detected: false,
    count: 0,
    summary: '본능적 첫 선택과 최종 결정이 일치하여 내면의 일관성이 높습니다.',
    items: [],
  },
  mouseTrajectoryStats: {
    totalDistanceNormalized: 450,
    averageSpeed: 1.2,
    indecisivenessIndex: 18,
    primaryDevice: 'mouse',
    keyStrokeCount: 0,
    totalHoverCount: 12,
  },
  benchmark: {
    dwellTimePercentile: 85,
    changeCountPercentile: 75,
    globalAverageDwellSec: 54.2,
    globalAverageChanges: 2.3,
    personaDistribution: [],
    topRevisedQuestionsRank: [],
  },
};

describe('결과 공유 인코딩/디코딩 테스트 (shareResult)', () => {
  it('분석 결과를 URL-safe 압축 문자열로 인코딩하고 다시 디코딩했을 때 원본과 일치해야 한다', () => {
    const encoded = encodeResultToCompressedString(mockResult);
    expect(typeof encoded).toBe('string');
    expect(encoded.length).toBeGreaterThan(0);

    const decoded = decodeResultFromCompressedString(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded?.mbti).toBe('INFP');
    expect(decoded?.mbtiTitle).toBe('열정적인 중재자');
    expect(decoded?.overallCertainty).toBe(75);
    expect(decoded?.totalAnswerChanges).toBe(2);
    expect(decoded?.behaviorPersona.title).toContain('초고속 직진 결단파');
    expect(decoded?.dimensions.EI.winner).toBe('I');
  });

  it('유효하지 않거나 손상된 문자열 입력 시 크래시 없이 안전하게 null을 반환해야 한다', () => {
    expect(decodeResultFromCompressedString('')).toBeNull();
    expect(decodeResultFromCompressedString('invalid-corrupted-data-string')).toBeNull();
    expect(decodeResultFromCompressedString('{}')).toBeNull();
  });
});
