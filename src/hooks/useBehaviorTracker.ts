'use client';

import type { RefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  AnswerSelectionEvent,
  InputDevice,
  MousePoint,
  OptionHoverLog,
  QuestionBehaviorLog,
  TouchMetrics,
} from '@/types';

/**
 * 문항 컴포넌트의 행동 추적을 위한 훅 입력 Props
 */
export interface UseBehaviorTrackerProps {
  /** 측정 대상 문항 ID */
  questionId: number;
  /** 좌표 정규화의 기준이 되는 질문 카드 컨테이너 Ref */
  containerRef: RefObject<HTMLDivElement | null>;
  /** 이전 응답값이 존재할 경우 초기값 (-3 ~ +3) */
  initialValue?: number | null;
  /** 이미 기록된 이전 행동 로그가 존재할 경우 전달 */
  existingLog?: QuestionBehaviorLog | null;
  /** 답변 선택 시 자동 다음 이동 콜백 (선택) */
  onAutoSubmit?: () => void;
}

/**
 * 단일 문항 진행 중 사용자의 마우스 궤적, 선택 번복, 체류 시간, 호버 지속 시간,
 * 터치 제스처 및 키보드 입력을 실시간으로 추적하고 망설임 지수를 산출하는 커스텀 훅
 *
 * @param props {@link UseBehaviorTrackerProps}
 * @returns 현재 선택값, 선택/호버 이벤트 핸들러, 최종 로그 추출 함수(`finalizeLog`)
 */
export function useBehaviorTracker({
  questionId,
  containerRef,
  initialValue = null,
  existingLog = null,
  onAutoSubmit,
}: UseBehaviorTrackerProps) {
  const [selectedVal, setSelectedVal] = useState<number | null>(
    initialValue !== undefined ? initialValue : (existingLog?.finalValue ?? null),
  );
  const [changeCountState, setChangeCountState] = useState<number>(
    Math.max(0, (existingLog?.selectionHistory?.length || 1) - 1),
  );
  const [primaryDeviceState, setPrimaryDeviceState] = useState<InputDevice>(existingLog?.primaryDevice || 'mouse');
  const [prevQuestionId, setPrevQuestionId] = useState<number>(questionId);
  if (prevQuestionId !== questionId) {
    setPrevQuestionId(questionId);
    setSelectedVal(initialValue !== undefined ? initialValue : (existingLog?.finalValue ?? null));
    setChangeCountState(Math.max(0, (existingLog?.selectionHistory?.length || 1) - 1));
    setPrimaryDeviceState(existingLog?.primaryDevice || 'mouse');
  }

  // Time & Trajectory Refs
  const startTimeRef = useRef<number>(0);
  const firstInteractionTimeRef = useRef<number | null>(existingLog?.firstInteractionTime || null);
  const accumulatedDwellTimeRef = useRef<number>(existingLog?.totalDwellTime || 0);
  const selectionHistoryRef = useRef<AnswerSelectionEvent[]>(
    existingLog?.selectionHistory ? [...existingLog.selectionHistory] : [],
  );
  const hoverLogsRef = useRef<OptionHoverLog[]>(existingLog?.hoverLogs ? [...existingLog.hoverLogs] : []);
  const currentHoverRef = useRef<{ optionValue: number; enterTime: number } | null>(null);
  const mouseTrajectoryRef = useRef<MousePoint[]>(existingLog?.mouseTrajectory ? [...existingLog.mouseTrajectory] : []);
  const lastPointRef = useRef<{ x: number; y: number; dx: number; dy: number; t: number } | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const directionChangesRef = useRef<number>(existingLog?.directionChanges || 0);
  const tabBlurCountRef = useRef<number>(existingLog?.tabBlurCount || 0);
  const keyStrokeCountRef = useRef<number>(existingLog?.keyStrokeCount || 0);

  // Interaction Counters
  const mouseMoveCountRef = useRef<number>(0);
  const touchCountRef = useRef<number>(0);
  const touchStartTimeRef = useRef<number | null>(null);
  const touchPressDurationsRef = useRef<number[]>([]);

  // Reset on question change
  useEffect(() => {
    startTimeRef.current = Date.now();
    selectionHistoryRef.current = existingLog?.selectionHistory ? [...existingLog.selectionHistory] : [];
    hoverLogsRef.current = existingLog?.hoverLogs ? [...existingLog.hoverLogs] : [];
    currentHoverRef.current = null;
    mouseTrajectoryRef.current = existingLog?.mouseTrajectory ? [...existingLog.mouseTrajectory] : [];
    lastPointRef.current = null;
    directionChangesRef.current = existingLog?.directionChanges || 0;
    firstInteractionTimeRef.current = existingLog?.firstInteractionTime || null;
    accumulatedDwellTimeRef.current = existingLog?.totalDwellTime || 0;
    tabBlurCountRef.current = existingLog?.tabBlurCount || 0;
    keyStrokeCountRef.current = existingLog?.keyStrokeCount || 0;
    mouseMoveCountRef.current = 0;
    touchCountRef.current = 0;
    touchStartTimeRef.current = null;
    touchPressDurationsRef.current = [];
  }, [questionId, existingLog]);

  // Tab blur detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabBlurCountRef.current += 1;
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Record a coordinate point helper
  const recordPoint = useCallback(
    (clientX: number, clientY: number, type: 'move' | 'touch' = 'move') => {
      const container = containerRef.current;
      if (!container) return;

      const now = Date.now();
      if (now - lastFrameTimeRef.current < 16) return;
      lastFrameTimeRef.current = now;

      const rect = container.getBoundingClientRect();
      const relX = (clientX - rect.left) / rect.width;
      const relY = (clientY - rect.top) / rect.height;
      const timeOffset = now - startTimeRef.current;

      const clampedX = Math.max(0, Math.min(1, relX));
      const clampedY = Math.max(0, Math.min(1, relY));

      if (lastPointRef.current) {
        const dx = clampedX - lastPointRef.current.x;
        const dy = clampedY - lastPointRef.current.y;
        const dt = timeOffset - lastPointRef.current.t;

        if (lastPointRef.current.dx !== 0 && dx !== 0) {
          if ((lastPointRef.current.dx > 0 && dx < -0.01) || (lastPointRef.current.dx < 0 && dx > 0.01)) {
            directionChangesRef.current += 1;
          }
        }

        const dist = Math.sqrt(dx * dx + dy * dy);
        const speed = dt > 0 ? dist / dt : 0;

        mouseTrajectoryRef.current.push({
          x: Math.round(clampedX * 1000) / 1000,
          y: Math.round(clampedY * 1000) / 1000,
          timestamp: timeOffset,
          speed: Math.round(speed * 1000) / 1000,
          type,
        });

        lastPointRef.current = { x: clampedX, y: clampedY, t: timeOffset, dx, dy };
      } else {
        mouseTrajectoryRef.current.push({
          x: Math.round(clampedX * 1000) / 1000,
          y: Math.round(clampedY * 1000) / 1000,
          timestamp: timeOffset,
          speed: 0,
          type,
        });
        lastPointRef.current = { x: clampedX, y: clampedY, t: timeOffset, dx: 0, dy: 0 };
      }
    },
    [containerRef],
  );

  // Mouse trajectory tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseMoveCountRef.current += 1;
      recordPoint(e.clientX, e.clientY, 'move');
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [recordPoint]);

  // Touch gesture & Touch Press Duration tracking
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchCountRef.current += 1;
      touchStartTimeRef.current = performance.now();

      if (e.touches.length > 0) {
        const touch = e.touches[0];
        recordPoint(touch.clientX, touch.clientY, 'touch');
      }
    };

    const handleTouchEnd = () => {
      if (touchStartTimeRef.current !== null) {
        const pressDuration = Math.round(performance.now() - touchStartTimeRef.current);
        touchPressDurationsRef.current.push(pressDuration);
        touchStartTimeRef.current = null;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        recordPoint(touch.clientX, touch.clientY, 'touch');
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, [containerRef, recordPoint]);

  // Selection Handler
  const handleSelectOption = useCallback((val: number, device: InputDevice = 'mouse') => {
    const now = Date.now() - startTimeRef.current;
    if (firstInteractionTimeRef.current === null) {
      firstInteractionTimeRef.current = now;
    }

    const prevEvent = selectionHistoryRef.current[selectionHistoryRef.current.length - 1];
    const timeSinceLast = prevEvent ? now - prevEvent.timestamp : now;
    const lastPress = touchPressDurationsRef.current[touchPressDurationsRef.current.length - 1] || 80;

    selectionHistoryRef.current.push({
      value: val,
      timestamp: now,
      timeSinceLastChange: timeSinceLast,
      pressDuration: lastPress,
      inputDevice: device,
    });

    setSelectedVal(val);
    setChangeCountState(Math.max(0, selectionHistoryRef.current.length - 1));
    if (device) {
      setPrimaryDeviceState(device);
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      keyStrokeCountRef.current += 1;

      const keyNum = parseInt(e.key, 10);
      if (keyNum >= 1 && keyNum <= 7) {
        const mappedVal = keyNum - 4;
        handleSelectOption(mappedVal, 'keyboard');
      } else if (e.key === 'ArrowLeft') {
        setSelectedVal((prev) => {
          const nextVal = prev === null ? 0 : Math.max(-3, prev - 1);
          handleSelectOption(nextVal, 'keyboard');
          return nextVal;
        });
      } else if (e.key === 'ArrowRight') {
        setSelectedVal((prev) => {
          const nextVal = prev === null ? 0 : Math.min(3, prev + 1);
          handleSelectOption(nextVal, 'keyboard');
          return nextVal;
        });
      } else if (e.key === 'Enter') {
        if (selectedVal !== null && onAutoSubmit) {
          onAutoSubmit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSelectOption, onAutoSubmit, selectedVal]);

  // Option Hover Handlers
  const handleOptionMouseEnter = useCallback((val: number) => {
    const now = Date.now() - startTimeRef.current;
    currentHoverRef.current = { optionValue: val, enterTime: now };
  }, []);

  const handleOptionMouseLeave = useCallback((val: number) => {
    if (currentHoverRef.current && currentHoverRef.current.optionValue === val) {
      const now = Date.now() - startTimeRef.current;
      hoverLogsRef.current.push({
        optionValue: val,
        enterTime: currentHoverRef.current.enterTime,
        leaveTime: now,
        duration: now - currentHoverRef.current.enterTime,
      });
      currentHoverRef.current = null;
    }
  }, []);

  // Finalize behavioral log
  const finalizeLog = useCallback((): QuestionBehaviorLog => {
    const currentSessionDwell = Date.now() - startTimeRef.current;
    const totalDwellTime = accumulatedDwellTimeRef.current + currentSessionDwell;
    const changeCount = Math.max(0, selectionHistoryRef.current.length - 1);

    const firstTapLatency = firstInteractionTimeRef.current ?? totalDwellTime;
    const lastSelection = selectionHistoryRef.current[selectionHistoryRef.current.length - 1];
    const confirmationDelay = lastSelection ? currentSessionDwell - lastSelection.timestamp : 0;

    const avgPress =
      touchPressDurationsRef.current.length > 0
        ? Math.round(touchPressDurationsRef.current.reduce((a, b) => a + b, 0) / touchPressDurationsRef.current.length)
        : 85;

    const touchMetrics: TouchMetrics = {
      firstTapLatency,
      averagePressDuration: avgPress,
      confirmationDelay: Math.max(0, confirmationDelay),
      tapCount: selectionHistoryRef.current.length,
    };

    // Determine device accurately (Declarative)
    const detectedDevice: InputDevice =
      mouseMoveCountRef.current >= 3 || mouseTrajectoryRef.current.length > 3
        ? 'mouse'
        : keyStrokeCountRef.current > 0 && touchCountRef.current === 0
          ? 'keyboard'
          : touchCountRef.current > 0 && mouseMoveCountRef.current < 3
            ? 'touch'
            : 'mouse';

    // Calculate hesitation score (Declarative)
    const baseHesitation = changeCount * 25 + Math.min(40, (totalDwellTime / 1000) * 3);
    const deviceSpecificHesitation =
      detectedDevice === 'touch'
        ? (firstTapLatency > 5000 ? 15 : 0) + (avgPress > 250 ? 10 : 0) + (confirmationDelay > 3000 ? 10 : 0)
        : Math.min(25, directionChangesRef.current * 2);
    const blurHesitation = tabBlurCountRef.current > 0 ? 15 : 0;

    const hesitationScore = Math.min(100, Math.round(baseHesitation + deviceSpecificHesitation + blurHesitation));

    return {
      questionId,
      startTime: startTimeRef.current,
      endTime: Date.now(),
      totalDwellTime,
      firstInteractionTime: firstInteractionTimeRef.current,
      finalValue: selectedVal,
      selectionHistory: [...selectionHistoryRef.current],
      changeCount,
      hoverLogs: [...hoverLogsRef.current],
      mouseTrajectory: [...mouseTrajectoryRef.current],
      directionChanges: directionChangesRef.current,
      hesitationScore,
      tabBlurCount: tabBlurCountRef.current,
      primaryDevice: detectedDevice,
      keyStrokeCount: keyStrokeCountRef.current,
      touchMetrics,
    };
  }, [questionId, selectedVal]);

  return {
    selectedVal,
    handleSelectOption,
    handleOptionMouseEnter,
    handleOptionMouseLeave,
    finalizeLog,
    changeCount: changeCountState,
    primaryDevice: primaryDeviceState,
  };
}
