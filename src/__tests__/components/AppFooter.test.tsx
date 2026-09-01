import { render, screen } from '@testing-library/react';

import AppFooter from '@/components/AppFooter';

describe('AppFooter 컴포넌트 테스트', () => {
  it('브랜드 로고와 설명, 서비스 유의사항, 저작권 문구가 정상적으로 렌더링되어야 한다', () => {
    const { container } = render(<AppFooter />);

    expect(screen.getAllByText(/opentoyapp/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/PersonaLens/i)).toBeInTheDocument();
    expect(screen.getByText(/서비스 유의사항/i)).toBeInTheDocument();
    expect(screen.getByText(/공식 MBTI® 검사와는 무관합니다/i)).toBeInTheDocument();
    expect(screen.getByText(/© 2026 opentoyapp. All rights reserved./i)).toBeInTheDocument();
    expect(container.querySelector('footer')).toBeInTheDocument();
  });
});
