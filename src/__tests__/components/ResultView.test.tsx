import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';

import ResultView from '@/components/ResultView';
import type { FullAnalysisResult } from '@/types';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

function renderWithClient(ui: ReactElement) {
  const testClient = createTestQueryClient();
  return render(<QueryClientProvider client={testClient}>{ui}</QueryClientProvider>);
}

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
  allQuestionDetails: [
    {
      question: {
        id: 1,
        title: '질문 1 테스트',
        dimension: 'EI',
        positiveType: 'I',
        negativeType: 'E',
        category: 'social',
      },
      behavior: {
        questionId: 1,
        startTime: 1000,
        endTime: 2000,
        totalDwellTime: 1000,
        firstInteractionTime: 200,
        finalValue: 3,
        selectionHistory: [{ value: 3, timestamp: 500 }],
        changeCount: 0,
        hoverLogs: [],
        mouseTrajectory: [
          { x: 0.1, y: 0.2, timestamp: 100 },
          { x: 0.5, y: 0.5, timestamp: 500 },
        ],
        directionChanges: 0,
        hesitationScore: 10,
        tabBlurCount: 0,
        primaryDevice: 'mouse',
        keyStrokeCount: 0,
      },
      hesitationTime: 1000,
      changeHistorySummary: '선택 변경 없음',
      hoverSummary: '망설임 없음',
      insight: '신속하고 일관된 직관적 결정',
    },
    {
      question: {
        id: 2,
        title: '질문 2 테스트',
        dimension: 'SN',
        positiveType: 'N',
        negativeType: 'S',
        category: 'cognition',
      },
      behavior: {
        questionId: 2,
        startTime: 2000,
        endTime: 3500,
        totalDwellTime: 1500,
        firstInteractionTime: 300,
        finalValue: -2,
        selectionHistory: [{ value: -2, timestamp: 800 }],
        changeCount: 0,
        hoverLogs: [],
        mouseTrajectory: [
          { x: 0.2, y: 0.3, timestamp: 200 },
          { x: 0.7, y: 0.8, timestamp: 800 },
        ],
        directionChanges: 0,
        hesitationScore: 15,
        tabBlurCount: 0,
        primaryDevice: 'mouse',
        keyStrokeCount: 0,
      },
      hesitationTime: 1500,
      changeHistorySummary: '선택 변경 없음',
      hoverSummary: '망설임 없음',
      insight: '신중한 고민 후 결정',
    },
  ],
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

    renderWithClient(<ResultView result={mockResult} onRestart={handleRestart} isSharedView={false} />);

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

  it('홈으로 이동 버튼 클릭 시 onHome 콜백이 호출되어야 한다', () => {
    const handleHome = jest.fn();

    renderWithClient(<ResultView result={mockResult} onHome={handleHome} isSharedView={false} />);

    const homeButton = screen.getByRole('button', { name: /홈으로 이동/i });
    fireEvent.click(homeButton);

    expect(handleHome).toHaveBeenCalledTimes(1);
  });

  it('히트맵 모드를 선택한 후 다른 문항 번호를 클릭해도 히트맵 모드가 유지되어야 한다', () => {
    renderWithClient(<ResultView result={mockResult} isSharedView={false} />);

    const heatmapButton = screen.getByRole('button', { name: /히트맵/i });
    fireEvent.click(heatmapButton);

    expect(screen.getByText(/붉은 영역일수록 마우스가 오래 머물며 고민한 지점입니다/i)).toBeInTheDocument();

    const q2Button = screen.getByRole('button', { name: /Q2/i });
    fireEvent.click(q2Button);

    // Q2로 문항을 바꾼 후에도 히트맵 설명 문구가 여전히 유지되어야 함
    expect(screen.getByText(/붉은 영역일수록 마우스가 오래 머물며 고민한 지점입니다/i)).toBeInTheDocument();
  });
});
