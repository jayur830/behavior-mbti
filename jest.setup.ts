import '@testing-library/jest-dom';

// Mock Canvas getContext for HTML5 Canvas components in jsdom
if (typeof window !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = jest.fn((contextId: string) => {
    if (contextId === '2d') {
      return {
        clearRect: jest.fn(),
        fillRect: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        stroke: jest.fn(),
        fill: jest.fn(),
        arc: jest.fn(),
        closePath: jest.fn(),
        setLineDash: jest.fn(),
        getLineDash: jest.fn(() => []),
        createLinearGradient: jest.fn(() => ({
          addColorStop: jest.fn(),
        })),
        createRadialGradient: jest.fn(() => ({
          addColorStop: jest.fn(),
        })),
        save: jest.fn(),
        restore: jest.fn(),
        scale: jest.fn(),
        setTransform: jest.fn(),
        drawImage: jest.fn(),
        fillText: jest.fn(),
        measureText: jest.fn(() => ({ width: 50 })),
        canvas: { width: 800, height: 400 },
      } as unknown as CanvasRenderingContext2D;
    }
    return null;
  }) as unknown as typeof HTMLCanvasElement.prototype.getContext;

  // Mock clipboard and matchMedia
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: jest.fn().mockResolvedValue(undefined),
    },
    configurable: true,
  });

  Object.defineProperty(window, 'confirm', {
    writable: true,
    value: jest.fn().mockReturnValue(true),
  });

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // Mock Global Fetch
  global.fetch = jest.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true, shareHash: 'test-hash' }),
    }),
  );
}
