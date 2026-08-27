import { fireEvent, render, screen } from '@testing-library/react';
import { useTheme } from 'next-themes';

import ThemeToggle from '@/components/ThemeToggle';

jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}));

describe('ThemeToggle 슬라이딩 스위치 단위 테스트', () => {
  const mockSetTheme = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('다크 모드 상태일 때 스위치 클릭 시 라이트 모드로 전환되어야 한다', () => {
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
      resolvedTheme: 'dark',
    });

    render(<ThemeToggle />);

    const toggleSwitch = screen.getByRole('switch', { name: /테마 전환/i });
    expect(toggleSwitch).toBeInTheDocument();
    expect(toggleSwitch).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(toggleSwitch);
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('라이트 모드 상태일 때 스위치 클릭 시 다크 모드로 전환되어야 한다', () => {
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      resolvedTheme: 'light',
    });

    render(<ThemeToggle />);

    const toggleSwitch = screen.getByRole('switch', { name: /테마 전환/i });
    expect(toggleSwitch).toBeInTheDocument();
    expect(toggleSwitch).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(toggleSwitch);
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });
});
