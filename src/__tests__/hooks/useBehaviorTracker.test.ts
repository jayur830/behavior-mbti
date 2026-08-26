import { act, renderHook } from '@testing-library/react';

import { useBehaviorTracker } from '@/hooks/useBehaviorTracker';

function createMockContainer() {
  const element = document.createElement('div');
  element.getBoundingClientRect = () => ({
    left: 0,
    top: 0,
    width: 1000,
    height: 800,
    right: 1000,
    bottom: 800,
    x: 0,
    y: 0,
    toJSON: () => {},
  });
  return { current: element };
}

describe('useBehaviorTracker 커스텀 훅 테스트', () => {
  it('초기화 시 기본 상태를 정상적으로 설정해야 한다', () => {
    const containerMock = createMockContainer();
    const { result } = renderHook(() =>
      useBehaviorTracker({
        questionId: 1,
        containerRef: containerMock,
      }),
    );

    expect(result.current.selectedVal).toBeNull();
    expect(result.current.changeCount).toBe(0);
    expect(result.current.primaryDevice).toBe('mouse');
  });

  it('선택지를 선택하면 selectedVal이 갱신되고 번복 시 changeCount가 증가해야 한다', () => {
    const containerMock = createMockContainer();
    const { result } = renderHook(() =>
      useBehaviorTracker({
        questionId: 1,
        containerRef: containerMock,
      }),
    );

    // 1차 선택: +2 (그렇다)
    act(() => {
      result.current.handleSelectOption(2);
    });

    expect(result.current.selectedVal).toBe(2);
    expect(result.current.changeCount).toBe(0);

    // 2차 번복 선택: -1 (약간 아니다)
    act(() => {
      result.current.handleSelectOption(-1);
    });

    expect(result.current.selectedVal).toBe(-1);
    expect(result.current.changeCount).toBe(1);

    const log = result.current.finalizeLog();
    expect(log.finalValue).toBe(-1);
    expect(log.selectionHistory).toHaveLength(2);
    expect(log.changeCount).toBe(1);
  });

  it('호버 시작과 종료 시 hoverLogs에 체류 기록이 저장되어야 한다', () => {
    const containerMock = createMockContainer();
    const { result } = renderHook(() =>
      useBehaviorTracker({
        questionId: 1,
        containerRef: containerMock,
      }),
    );

    act(() => {
      result.current.handleOptionMouseEnter(3);
    });

    act(() => {
      result.current.handleOptionMouseLeave(3);
    });

    const log = result.current.finalizeLog();
    expect(log.hoverLogs.length).toBeGreaterThanOrEqual(1);
    expect(log.hoverLogs[0].optionValue).toBe(3);
  });

  it('questionId가 변경되면 이전 문항의 상태가 초기화되어야 한다', () => {
    const containerMock = createMockContainer();
    const { result, rerender } = renderHook(
      ({ qId }: { qId: number }) =>
        useBehaviorTracker({
          questionId: qId,
          containerRef: containerMock,
        }),
      { initialProps: { qId: 1 } },
    );

    act(() => {
      result.current.handleSelectOption(2);
    });
    expect(result.current.selectedVal).toBe(2);

    // 다음 문항으로 변경
    rerender({ qId: 2 });

    expect(result.current.selectedVal).toBeNull();
    expect(result.current.changeCount).toBe(0);
  });
});
