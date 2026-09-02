import { fireEvent, render, screen } from '@testing-library/react';

import AppHeader from '@/components/AppHeader';

describe('AppHeader 컴포넌트 테스트', () => {
  it('브랜드 로고와 서비스명이 정상적으로 렌더링되어야 한다', () => {
    render(<AppHeader />);

    expect(screen.getByText(/PERSONA/i)).toBeInTheDocument();
    expect(screen.getByText(/LENS/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /PersonaLens 홈으로 이동/i })).toBeInTheDocument();
  });

  it('로고 클릭 시 onLogoClick 콜백이 호출되어야 한다', () => {
    const handleLogoClick = jest.fn();
    render(<AppHeader onLogoClick={handleLogoClick} />);

    const logoLink = screen.getByRole('link', { name: /PersonaLens 홈으로 이동/i });
    fireEvent.click(logoLink);

    expect(handleLogoClick).toHaveBeenCalledTimes(1);
  });

  it('home 모드이고 onCatalogClick이 전달되었을 때 전체 검사 목록 버튼이 렌더링되고 클릭되어야 한다', () => {
    const handleCatalogClick = jest.fn();
    render(<AppHeader mode="home" onCatalogClick={handleCatalogClick} />);

    const catalogButton = screen.getByRole('button', { name: /전체 검사 목록/i });
    expect(catalogButton).toBeInTheDocument();

    fireEvent.click(catalogButton);
    expect(handleCatalogClick).toHaveBeenCalledTimes(1);
  });
});
