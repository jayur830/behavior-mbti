'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MousePoint, OptionHoverLog, AnswerSelectionEvent, QuestionBehaviorLog, InputDevice } from '../types';

interface UseBehaviorTrackerProps {
  questionId: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onAutoSubmit?: () => void;
}

export function useBehaviorTracker({ questionId, containerRef, onAutoSubmit }: UseBehaviorTrackerProps) {
  const [selectedVal, setSelectedVal] = useState<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const selectionHistoryRef = useRef<AnswerSelectionEvent[]>([]);
  const hoverLogsRef = useRef<OptionHoverLog[]>([]);
  const currentHoverRef = useRef<{ optionValue: number; enterTime: number } | null>(null);
  const mouseTrajectoryRef = useRef<MousePoint[]>([]);
  const lastPointRef = useRef<{ x: number; y: number; t: number; dx: number; dy: number } | null>(null);
  const directionChangesRef = useRef<number>(0);
  const firstInteractionTimeRef = useRef<number | null>(null);
  const tabBlurCountRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const primaryDeviceRef = useRef<InputDevice>('mouse');
  const keyStrokeCountRef = useRef<number>(0);

  // Reset or initialize on question change
  useEffect(() => {
    startTimeRef.current = Date.now();
    selectionHistoryRef.current = [];
    hoverLogsRef.current = [];
    currentHoverRef.current = null;
    mouseTrajectoryRef.current = [];
    lastPointRef.current = null;
    directionChangesRef.current = 0;
    firstInteractionTimeRef.current = null;
    tabBlurCountRef.current = 0;
    keyStrokeCountRef.current = 0;
    setSelectedVal(null);
  }, [questionId]);

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
      if (now - lastFrameTimeRef.current < 16) return; // ~60fps
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
    [containerRef]
  );

  // Mouse trajectory tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      primaryDeviceRef.current = 'mouse';
      recordPoint(e.clientX, e.clientY, 'move');
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [recordPoint]);

  // Touch gesture & Touchmove tracking
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchMove = (e: TouchEvent) => {
      primaryDeviceRef.current = 'touch';
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        recordPoint(touch.clientX, touch.clientY, 'touch');
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      primaryDeviceRef.current = 'touch';
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        recordPoint(touch.clientX, touch.clientY, 'touch');
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, [containerRef, recordPoint]);

  // Selection Handler
  const handleSelectOption = useCallback(
    (val: number, device: InputDevice = 'mouse') => {
      const now = Date.now() - startTimeRef.current;
      if (firstInteractionTimeRef.current === null) {
        firstInteractionTimeRef.current = now;
      }

      primaryDeviceRef.current = device;
      const prevEvent = selectionHistoryRef.current[selectionHistoryRef.current.length - 1];
      const timeSinceLast = prevEvent ? now - prevEvent.timestamp : now;

      selectionHistoryRef.current.push({
        value: val,
        timestamp: now,
        timeSinceLastChange: timeSinceLast,
        inputDevice: device,
      });

      setSelectedVal(val);
    },
    []
  );

  // Keyboard navigation & Hotkeys (1~7 for options, Arrow keys, Enter to submit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is in an input field
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      keyStrokeCountRef.current += 1;

      // Number keys 1~7 mapping to -3 ~ 3
      const keyNum = parseInt(e.key, 10);
      if (keyNum >= 1 && keyNum <= 7) {
        const mappedVal = keyNum - 4; // 1->-3, 2->-2, 3->-1, 4->0, 5->1, 6->2, 7->3
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

  // Generate behavioral log for current question
  const finalizeLog = useCallback((): QuestionBehaviorLog => {
    const endTime = Date.now();
    const totalDwellTime = endTime - startTimeRef.current;
    const changeCount = Math.max(0, selectionHistoryRef.current.length - 1);

    let hesitationScore = 0;
    hesitationScore += changeCount * 25;
    hesitationScore += Math.min(40, (totalDwellTime / 1000) * 3);
    hesitationScore += Math.min(25, directionChangesRef.current * 2);
    if (tabBlurCountRef.current > 0) hesitationScore += 15;
    hesitationScore = Math.min(100, Math.round(hesitationScore));

    return {
      questionId,
      startTime: startTimeRef.current,
      endTime,
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
      primaryDevice: primaryDeviceRef.current,
      keyStrokeCount: keyStrokeCountRef.current,
    };
  }, [questionId, selectedVal]);

  return {
    selectedVal,
    handleSelectOption,
    handleOptionMouseEnter,
    handleOptionMouseLeave,
    finalizeLog,
    changeCount: Math.max(0, selectionHistoryRef.current.length - 1),
    primaryDevice: primaryDeviceRef.current,
  };
}
