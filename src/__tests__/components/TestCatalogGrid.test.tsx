import { render, screen } from '@testing-library/react';

import { TestCatalogGrid } from '@/components/TestCatalogGrid';

describe('TestCatalogGrid 컴포넌트 테스트', () => {
  it('카탈로그 헤더 및 4개 검사 항목이 렌더링되어야 한다', () => {
    render(<TestCatalogGrid />);

    expect(screen.getByText(/PersonaLens Test Series/i)).toBeInTheDocument();
    expect(screen.getByText(/무의식 행동 분석 검사 카탈로그/i)).toBeInTheDocument();

    // 4개 검사 타이틀 검증
    expect(screen.getByText(/무의식 궤적 기반 MBTI 성향 검사/i)).toBeInTheDocument();
    expect(screen.getByText(/결정 장애 & 망설임 지수 테스트/i)).toBeInTheDocument();
    expect(screen.getByText(/Big-5 무의식 인터랙션 성격 특성/i)).toBeInTheDocument();
    expect(screen.getByText(/직관 vs 이성 인지 리플렉스 검사/i)).toBeInTheDocument();
  });

  it('진행 가능한 검사(MBTI)에는 /test 라우트 링크가 걸려 있어야 한다', () => {
    render(<TestCatalogGrid />);

    const mbtiLink = screen.getByRole('link', { name: /무의식 궤적 기반 MBTI 성향 검사/i });
    expect(mbtiLink).toHaveAttribute('href', '/test');
  });

  it('대표 검사 배지 및 COMING SOON / PREPARING 배지가 표시되어야 한다', () => {
    render(<TestCatalogGrid />);

    expect(screen.getByText(/HOT · 대표 검사/i)).toBeInTheDocument();
    expect(screen.getByText(/COMING SOON/i)).toBeInTheDocument();
    expect(screen.getAllByText(/PREPARING/i).length).toBeGreaterThanOrEqual(1);
  });
});
