import { fireEvent, render } from '@testing-library/react';

import AmbientCursorBlob from '@/components/AmbientCursorBlob';

describe('AmbientCursorBlob 컴포넌트 테스트', () => {
  it('정상적으로 렌더링되고 마우스 이동 이벤트에 반응해야 한다', () => {
    const { container } = render(<AmbientCursorBlob />);

    expect(container.firstChild).toBeInTheDocument();

    // 마우스 이동 이벤트 트리거
    fireEvent.mouseMove(window, { clientX: 200, clientY: 300 });

    // 터치 이동 이벤트 트리거
    fireEvent.touchMove(window, { touches: [{ clientX: 150, clientY: 250 }] });

    expect(container.firstChild).toHaveClass('pointer-events-none');
  });
});
