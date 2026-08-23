'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  MousePoint,
  OptionHoverLog,
  AnswerSelectionEvent,
  QuestionBehaviorLog,
  InputDevice,
  TouchMetrics,
} from '../types';

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

  // Mobile Touch Dynamics
  const touchStartTimeRef = useRef<number | null>(null);
  const touchPressDurationsRef = useRef<number[]>([]);

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
    touchStartTimeRef.current = null;
    touchPressDurationsRef.current = [];
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
    [containerRef]
  );

  // Mouse trajectory tracking (only when not on mobile touch)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (primaryDeviceRef.current !== 'touch') {
        primaryDeviceRef.current = 'mouse';
      }
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
      primaryDeviceRef.current = 'touch';
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
  const handleSelectOption = useCallback(
    (val: number, device: InputDevice = 'mouse') => {
      const now = Date.now() - startTimeRef.current;
      if (firstInteractionTimeRef.current === null) {
        firstInteractionTimeRef.current = now;
      }

      if (device === 'touch' || primaryDeviceRef.current === 'touch') {
        primaryDeviceRef.current = 'touch';
      } else {
        primaryDeviceRef.current = device;
      }

      const prevEvent = selectionHistoryRef.current[selectionHistoryRef.current.length - 1];
      const timeSinceLast = prevEvent ? now - prevEvent.timestamp : now;
      const lastPress = touchPressDurationsRef.current[touchPressDurationsRef.current.length - 1] || 80;

      selectionHistoryRef.current.push({
        value: val,
        timestamp: now,
        timeSinceLastChange: timeSinceLast,
        pressDuration: lastPress,
        inputDevice: primaryDeviceRef.current,
      });

      setSelectedVal(val);
    },
    []
  );

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

  // Option Hover Handlers (Desktop only)
  const handleOptionMouseEnter = useCallback((val: number) => {
    if (primaryDeviceRef.current === 'touch') return;
    const now = Date.now() - startTimeRef.current;
    currentHoverRef.current = { optionValue: val, enterTime: now };
  }, []);

  const handleOptionMouseLeave = useCallback((val: number) => {
    if (primaryDeviceRef.current === 'touch') return;
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
    const endTime = Date.now();
    const totalDwellTime = endTime - startTimeRef.current;
    const changeCount = Math.max(0, selectionHistoryRef.current.length - 1);

    const firstTapLatency = firstInteractionTimeRef.current ?? totalDwellTime;
    const lastSelection = selectionHistoryRef.current[selectionHistoryRef.current.length - 1];
    const confirmationDelay = lastSelection ? totalDwellTime - lastSelection.timestamp : 0;

    const avgPress =
      touchPressDurationsRef.current.length > 0
        ? Math.round(
            touchPressDurationsRef.current.reduce((a, b) => a + b, 0) /
              touchPressDurationsRef.current.length
          )
        : 85;

    const touchMetrics: TouchMetrics = {
      firstTapLatency,
      averagePressDuration: avgPress,
      confirmationDelay,
      tapCount: selectionHistoryRef.current.length,
    };

    // Calculate hesitation score
    let hesitationScore = 0;
    hesitationScore += changeCount * 25;
    hesitationScore += Math.min(40, (totalDwellTime / 1000) * 3);

    if (primaryDeviceRef.current === 'touch') {
      // Touch-specific hesitation weighting
      if (firstTapLatency > 5000) hesitationScore += 15;
      if (avgPress > 250) hesitationScore += 10; // held finger long
      if (confirmationDelay > 3000) hesitationScore += 10;
    } else {
      hesitationScore += Math.min(25, directionChangesRef.current * 2);
    }

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
      touchMetrics,
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
