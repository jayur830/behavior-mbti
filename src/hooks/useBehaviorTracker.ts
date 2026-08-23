'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MousePoint, OptionHoverLog, AnswerSelectionEvent, QuestionBehaviorLog } from '../types';

interface UseBehaviorTrackerProps {
  questionId: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function useBehaviorTracker({ questionId, containerRef }: UseBehaviorTrackerProps) {
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

  // Mouse trajectory tracking (normalized 0~1 relative to container or window)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      // Throttle to ~30-60 fps (every 20ms)
      if (now - lastFrameTimeRef.current < 20) return;
      lastFrameTimeRef.current = now;

      const rect = container.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width;
      const relY = (e.clientY - rect.top) / rect.height;
      const timeOffset = now - startTimeRef.current;

      // Bound between 0 and 1 with slight overflow buffer
      const clampedX = Math.max(0, Math.min(1, relX));
      const clampedY = Math.max(0, Math.min(1, relY));

      if (lastPointRef.current) {
        const dx = clampedX - lastPointRef.current.x;
        const dy = clampedY - lastPointRef.current.y;
        const dt = timeOffset - lastPointRef.current.t;

        // Detect direction change (zig-zag)
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
        });

        lastPointRef.current = { x: clampedX, y: clampedY, t: timeOffset, dx, dy };
      } else {
        mouseTrajectoryRef.current.push({
          x: Math.round(clampedX * 1000) / 1000,
          y: Math.round(clampedY * 1000) / 1000,
          timestamp: timeOffset,
          speed: 0,
        });
        lastPointRef.current = { x: clampedX, y: clampedY, t: timeOffset, dx: 0, dy: 0 };
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [containerRef, questionId]);

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

  // Answer Click Handler
  const handleSelectOption = useCallback((val: number) => {
    const now = Date.now() - startTimeRef.current;
    if (firstInteractionTimeRef.current === null) {
      firstInteractionTimeRef.current = now;
    }

    const prevEvent = selectionHistoryRef.current[selectionHistoryRef.current.length - 1];
    const timeSinceLast = prevEvent ? now - prevEvent.timestamp : now;

    selectionHistoryRef.current.push({
      value: val,
      timestamp: now,
      timeSinceLastChange: timeSinceLast,
    });

    setSelectedVal(val);
  }, []);

  // Generate behavioral log for current question
  const finalizeLog = useCallback((): QuestionBehaviorLog => {
    const endTime = Date.now();
    const totalDwellTime = endTime - startTimeRef.current;
    const changeCount = Math.max(0, selectionHistoryRef.current.length - 1);

    // Calculate hesitation score (0~100)
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
    };
  }, [questionId, selectedVal]);

  return {
    selectedVal,
    handleSelectOption,
    handleOptionMouseEnter,
    handleOptionMouseLeave,
    finalizeLog,
    changeCount: Math.max(0, selectionHistoryRef.current.length - 1),
  };
}
