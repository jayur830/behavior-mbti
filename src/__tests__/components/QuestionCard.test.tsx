import { fireEvent, render, screen } from '@testing-library/react';

import { QuestionCard } from '@/components/QuestionCard';
import { Question } from '@/types';

const mockQuestion: Question = {
  id: 1,
  dimension: 'EI',
  positiveType: 'E',
  negativeType: 'I',
  category: 'social',
  title: '처음 보는 사람들과 모인 자리에서도 어색함 없이 대화를 주도한다.',
  description: '낯선 공간에서 에너지를 얻고 먼저 말을 거는 편인가요?',
};

describe('QuestionCard 컴포넌트 테스트', () => {
  it('문항 제목, 카테고리 라벨, 설명이 올바르게 렌더링되어야 한다', () => {
    const handleNext = jest.fn();

    render(<QuestionCard question={mockQuestion} currentIndex={0} totalQuestions={40} onNext={handleNext} />);

    expect(screen.getByText('처음 보는 사람들과 모인 자리에서도 어색함 없이 대화를 주도한다.')).toBeInTheDocument();
    expect(screen.getByText('사회적 상호작용 및 에너지')).toBeInTheDocument();
    expect(screen.getByText('낯선 공간에서 에너지를 얻고 먼저 말을 거는 편인가요?')).toBeInTheDocument();
  });

  it('리커트 선택지를 클릭하면 선택 상태가 반영되고 다음 버튼 클릭 시 onNext가 호출되어야 한다', () => {
    const handleNext = jest.fn();

    render(<QuestionCard question={mockQuestion} currentIndex={0} totalQuestions={40} onNext={handleNext} />);

    // 7개 선택지 버튼 중 7번째(+3: 매우 그렇다) 클릭
    const optionButtons = screen.getAllByRole('button');
    expect(optionButtons.length).toBeGreaterThanOrEqual(7);

    fireEvent.click(optionButtons[6]);

    // 다음으로 이동 버튼 활성화 확인
    const nextButton = screen.getByRole('button', { name: /다음 문항/i });
    expect(nextButton).toBeInTheDocument();
    fireEvent.click(nextButton);

    expect(handleNext).toHaveBeenCalledTimes(1);
    expect(handleNext.mock.calls[0][0].finalValue).toBe(3);
  });
});
