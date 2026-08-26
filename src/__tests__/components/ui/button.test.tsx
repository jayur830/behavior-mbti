import { fireEvent, render, screen } from '@testing-library/react';

import { Button } from '@/components/ui/button';

describe('shadcn Button 컴포넌트 테스트', () => {
  it('기본 버튼이 정상적으로 렌더링되어야 한다', () => {
    render(<Button>테스트 버튼</Button>);
    expect(screen.getByText('테스트 버튼')).toBeInTheDocument();
  });

  it('클릭 이벤트가 정상적으로 동작해야 한다', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>클릭</Button>);
    fireEvent.click(screen.getByText('클릭'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disabled 상태일 때 클릭되지 않아야 한다', () => {
    const handleClick = jest.fn();
    render(
      <Button disabled onClick={handleClick}>
        비활성
      </Button>,
    );
    fireEvent.click(screen.getByText('비활성'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
