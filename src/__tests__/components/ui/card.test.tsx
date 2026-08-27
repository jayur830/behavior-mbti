import { render, screen } from '@testing-library/react';

import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

describe('shadcn Card 컴포넌트 테스트', () => {
  it('카드 내부 구성 요소들이 정상적으로 렌더링되어야 한다', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>성향 분석 타이틀</CardTitle>
          <CardDescription>성향 분석 설명</CardDescription>
        </CardHeader>
        <CardContent>본문 컨텐츠</CardContent>
      </Card>,
    );

    expect(screen.getByText('성향 분석 타이틀')).toBeInTheDocument();
    expect(screen.getByText('성향 분석 설명')).toBeInTheDocument();
    expect(screen.getByText('본문 컨텐츠')).toBeInTheDocument();
  });
});
