import { act, renderHook } from '@testing-library/react';

import { useClipboard } from '@/hooks/useClipboard';

describe('useClipboard 훅 테스트', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
      configurable: true,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('텍스트 복사 성공 시 copied 상태가 true로 변경되고 timeout 후 false로 복구되어야 한다', async () => {
    const { result } = renderHook(() => useClipboard({ timeoutMs: 1000 }));

    expect(result.current.copied).toBe(false);

    let success = false;
    await act(async () => {
      success = await result.current.copy('https://example.com');
    });

    expect(success).toBe(true);
    expect(result.current.copied).toBe(true);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.copied).toBe(false);
  });
});
