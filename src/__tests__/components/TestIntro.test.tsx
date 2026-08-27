import { fireEvent, render, screen } from '@testing-library/react';

import TestIntro from '@/components/TestIntro';

describe('TestIntro 컴포넌트 테스트', () => {
  it('검사 타이틀과 설명이 정상적으로 렌더링되어야 한다', () => {
    const handleStart = jest.fn();

    render(<TestIntro onStart={handleStart} />);

    expect(screen.getByText(/무의식 궤적 기반 MBTI 성향 검사/i)).toBeInTheDocument();
    expect(screen.getByText(/마우스의 망설임을 분석합니다/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /MBTI 성향 검사 시작하기/i })).toBeInTheDocument();
  });

  it('검사 시작하기 버튼을 클릭하면 onStart 콜백이 호출되어야 한다', () => {
    const handleStart = jest.fn();

    render(<TestIntro onStart={handleStart} />);

    const startButton = screen.getByRole('button', { name: /MBTI 성향 검사 시작하기/i });
    fireEvent.click(startButton);

    expect(handleStart).toHaveBeenCalledTimes(1);
  });

  it('전체 검사 목록 보기 버튼을 클릭하면 onExploreCatalog 콜백이 호출되어야 한다', () => {
    const handleStart = jest.fn();
    const handleExplore = jest.fn();

    render(<TestIntro onStart={handleStart} onExploreCatalog={handleExplore} />);

    const exploreButton = screen.getByRole('button', { name: /전체 검사 목록 보기/i });
    fireEvent.click(exploreButton);

    expect(handleExplore).toHaveBeenCalledTimes(1);
  });
});
