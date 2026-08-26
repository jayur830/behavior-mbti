import { render, screen } from '@testing-library/react';

import { ResultView } from '@/components/ResultView';
import { FullAnalysisResult } from '@/types';

const mockResult: FullAnalysisResult = {
  mbti: 'INTJ',
  mbtiTitle: '용의주도한 전략가',
  mbtiDescription: '전략적 사고와 냉철한 통찰력으로 비전을 실현하는 성향입니다.',
  dimensions: {
    EI: {
      dimension: 'EI',
      leftType: 'E',
      rightType: 'I',
      leftScore: 20,
      rightScore: 80,
      winner: 'I',
      winnerPercentage: 80,
      certaintyScore: 88,
      averageHesitation: 1000,
      changeCount: 0,
      behaviorInsight: '내향적 방향에 높은 확신을 보였습니다.',
    },
    SN: {
      dimension: 'SN',
      leftType: 'S',
      rightType: 'N',
      leftScore: 15,
      rightScore: 85,
      winner: 'N',
      winnerPercentage: 85,
      certaintyScore: 92,
      averageHesitation: 1100,
      changeCount: 0,
      behaviorInsight: '추상적 패턴과 미래 가능성을 중시합니다.',
    },
    TF: {
      dimension: 'TF',
      leftType: 'T',
      rightType: 'F',
      leftScore: 85,
      rightScore: 15,
      winner: 'T',
      winnerPercentage: 85,
      certaintyScore: 90,
      averageHesitation: 1050,
      changeCount: 0,
      behaviorInsight: '논리적 원칙과 객관성을 우선합니다.',
    },
    JP: {
      dimension: 'JP',
      leftType: 'J',
      rightType: 'P',
      leftScore: 80,
      rightScore: 20,
      winner: 'J',
      winnerPercentage: 80,
      certaintyScore: 86,
      averageHesitation: 1200,
      changeCount: 0,
      behaviorInsight: '체계적인 계획과 마감을 선호합니다.',
    },
  },
  overallCertainty: 89,
  totalTestDuration: 42000,
  totalAnswerChanges: 0,
  behaviorPersona: {
    code: 'THE_DECISIVE',
    title: '초고속 직진 결단파',
    subtitle: '빠른 판단과 높은 직관적 결단력',
    description: '첫 직관을 신뢰하며 결정을 내리는 유형입니다.',
    tags: ['직관적 결단', '빠른 속도'],
    iconName: 'Zap',
  },
  hoverAnalysis: {
    totalHoverCount: 10,
    totalHoverDurationMs: 4000,
    hesitatedOptionsCount: 0,
    hoverInsight: '선택지 간 망설임 없이 결정을 내렸습니다.',
    conflictedHoverItems: [],
  },
  allQuestionDetails: [],
  topDilemmas: [],
  personaGap: {
    detected: false,
    count: 0,
    summary: '본능적 직감과 사회적 페르소나의 일관성이 매우 높습니다.',
    items: [],
  },
  mouseTrajectoryStats: {
    totalDistanceNormalized: 250,
    averageSpeed: 1.8,
    indecisivenessIndex: 8,
    primaryDevice: 'mouse',
    keyStrokeCount: 0,
    totalHoverCount: 10,
  },
  benchmark: {
    dwellTimePercentile: 95,
    changeCountPercentile: 95,
    globalAverageDwellSec: 54.2,
    globalAverageChanges: 2.3,
    personaDistribution: [],
    topRevisedQuestionsRank: [],
  },
};

describe('ResultView 컴포넌트 테스트', () => {
  it('MBTI 유형, 4대 성향 분석, 행동 인터랙션 데이터 요약이 렌더링되어야 한다', () => {
    const handleRestart = jest.fn();

    render(<ResultView result={mockResult} onRestart={handleRestart} isSharedView={false} />);

    // MBTI 타이틀 및 카드 렌더링
    expect(screen.getAllByText('INTJ').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('용의주도한 전략가').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('나의 행동 데이터 요약')).toBeInTheDocument();
    expect(screen.getByText('4대 성향 축 선호도 및 확신도 분석')).toBeInTheDocument();
    expect(screen.getByText('나의 행동 페르소나 프로필')).toBeInTheDocument();

    // 실측 데이터 검증
    expect(screen.getByText('42.0초')).toBeInTheDocument(); // 총 소요 시간
    expect(screen.getAllByText('89%').length).toBeGreaterThanOrEqual(1); // 종합 확신도
    expect(screen.getAllByText('0회').length).toBeGreaterThanOrEqual(1); // 선택 번복
  });
});
