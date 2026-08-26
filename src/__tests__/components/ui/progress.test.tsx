import { render } from '@testing-library/react';

import { Progress } from '@/components/ui/progress';

describe('shadcn Progress 컴포넌트 테스트', () => {
  it('진행률 바가 정상적으로 렌더링되어야 한다', () => {
    const { container } = render(<Progress value={75} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
