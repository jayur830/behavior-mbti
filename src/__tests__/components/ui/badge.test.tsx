import { render, screen } from '@testing-library/react';

import { Badge } from '@/components/ui/badge';

describe('shadcn Badge 컴포넌트 테스트', () => {
  it('뱃지가 정상적으로 렌더링되어야 한다', () => {
    render(<Badge variant="indigo">진단 완료</Badge>);
    expect(screen.getByText('진단 완료')).toBeInTheDocument();
  });
});
