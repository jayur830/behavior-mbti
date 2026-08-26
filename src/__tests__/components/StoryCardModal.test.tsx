import { fireEvent, render, screen } from '@testing-library/react';

import { StoryCardModal } from '@/components/StoryCardModal';
import type { FullAnalysisResult } from '@/types';

const mockResult: FullAnalysisResult = {
  mbti: 'ENFP',
  mbtiTitle: '재기발랄한 활동가',
  mbtiDescription: '열정적이고 창의적인 자유로운 영혼의 소유자입니다.',
  dimensions: {
    EI: {
      dimension: 'EI',
      leftType: 'E',
      rightType: 'I',
      leftScore: 80,
      rightScore: 20,
      winner: 'E',
      winnerPercentage: 80,
      certaintyScore: 85,
      averageHesitation: 1200,
      changeCount: 0,
      behaviorInsight: '외향적 상호작용에 거침없는 확신을 보였습니다.',
    },
    SN: {
      dimension: 'SN',
      leftType: 'S',
      rightType: 'N',
      leftScore: 30,
      rightScore: 70,
      winner: 'N',
      winnerPercentage: 70,
      certaintyScore: 80,
      averageHesitation: 1400,
      changeCount: 0,
      behaviorInsight: '직관적 상상력을 선호합니다.',
    },
    TF: {
      dimension: 'TF',
      leftType: 'T',
      rightType: 'F',
      leftScore: 20,
      rightScore: 80,
      winner: 'F',
      winnerPercentage: 80,
      certaintyScore: 88,
      averageHesitation: 1100,
      changeCount: 0,
      behaviorInsight: '사람 중심의 가치를 중시합니다.',
    },
    JP: {
      dimension: 'JP',
      leftType: 'J',
      rightType: 'P',
      leftScore: 25,
      rightScore: 75,
      winner: 'P',
      winnerPercentage: 75,
      certaintyScore: 78,
      averageHesitation: 1300,
      changeCount: 0,
      behaviorInsight: '자유롭고 즉흥적인 흐름을 선호합니다.',
    },
  },
  overallCertainty: 83,
  totalTestDuration: 45000,
  totalAnswerChanges: 1,
  behaviorPersona: {
    code: 'THE_DECISIVE',
    title: '초고속 직진 결단파',
    subtitle: '빠른 판단과 높은 직관적 결단력',
    description: '첫 직관을 신뢰하며 결정을 내리는 유형입니다.',
    tags: ['직관적 결단', '빠른 속도'],
    iconName: 'Zap',
  },
  hoverAnalysis: {
    totalHoverCount: 15,
    totalHoverDurationMs: 6000,
    hesitatedOptionsCount: 1,
    hoverInsight: '직관적인 결정을 보였습니다.',
    conflictedHoverItems: [],
  },
  allQuestionDetails: [],
  topDilemmas: [],
  personaGap: {
    detected: false,
    count: 0,
    summary: '일관성 높은 선택을 보였습니다.',
    items: [],
  },
  mouseTrajectoryStats: {
    totalDistanceNormalized: 300,
    averageSpeed: 1.5,
    indecisivenessIndex: 12,
    primaryDevice: 'mouse',
    keyStrokeCount: 0,
    totalHoverCount: 15,
  },
  benchmark: {
    dwellTimePercentile: 90,
    changeCountPercentile: 85,
    globalAverageDwellSec: 50.0,
    globalAverageChanges: 2.0,
    personaDistribution: [],
    topRevisedQuestionsRank: [],
  },
};

describe('StoryCardModal 컴포넌트 테스트', () => {
  it('isOpen이 true일 때 인스타그램 스토리 카드와 실측 통계가 렌더링되어야 한다', () => {
    const handleClose = jest.fn();

    render(<StoryCardModal isOpen={true} onClose={handleClose} result={mockResult} />);

    expect(screen.getByText('ENFP')).toBeInTheDocument();
    expect(screen.getByText('재기발랄한 활동가')).toBeInTheDocument();
    expect(screen.getByText('83%')).toBeInTheDocument(); // 종합 확신도
    expect(screen.getByText('45.0s')).toBeInTheDocument(); // 총 소요 시간
    expect(screen.getByText('1회')).toBeInTheDocument(); // 번복 횟수
  });

  it('닫기 버튼 클릭 시 onClose 콜백이 호출되어야 한다', () => {
    const handleClose = jest.fn();

    render(<StoryCardModal isOpen={true} onClose={handleClose} result={mockResult} />);

    const closeButton = screen.getByRole('button', { name: /모달 닫기/i });
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('isOpen이 false일 때는 모달이 렌더링되지 않아야 한다', () => {
    const handleClose = jest.fn();

    render(<StoryCardModal isOpen={false} onClose={handleClose} result={mockResult} />);

    expect(screen.queryByText('ENFP')).not.toBeInTheDocument();
  });
});
