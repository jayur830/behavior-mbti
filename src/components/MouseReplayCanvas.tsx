'use client';

import { Crosshair, Flame, MousePointer, Pause, Play, RotateCcw } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Button from '@/components/ui/button';
import Card from '@/components/ui/card';
import { getOptionLabel } from '@/data/questions';
import type { AnswerSelectionEvent, MousePoint, QuestionBehaviorLog } from '@/types';

export type MouseCanvasViewMode = 'replay' | 'heatmap';

export interface MouseReplayCanvasProps {
  behaviorLog: QuestionBehaviorLog;
  width?: number;
  height?: number;
  viewMode?: MouseCanvasViewMode;
  onViewModeChange?: (mode: MouseCanvasViewMode) => void;
}

export default function MouseReplayCanvas({
  behaviorLog,
  width = 800,
  height = 400,
  viewMode: controlledViewMode,
  onViewModeChange,
}: MouseReplayCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [internalViewMode, setInternalViewMode] = useState<MouseCanvasViewMode>('replay');
  const viewMode = controlledViewMode ?? internalViewMode;
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);
  const animFrameIdRef = useRef<number | null>(null);
  const playStartTimeRef = useRef<number | null>(null);
  const pausedTimeOffsetRef = useRef<number>(0);

  const { theme, resolvedTheme } = useTheme();
  const isDark = (theme === 'system' ? resolvedTheme : theme) !== 'light';

  const duration = Math.max(1000, behaviorLog.totalDwellTime || 4000);
  const trajectory = useMemo(() => behaviorLog.mouseTrajectory || [], [behaviorLog.mouseTrajectory]);
  const clicks = useMemo(() => behaviorLog.selectionHistory || [], [behaviorLog.selectionHistory]);

  const optionPositions = useMemo(
    () => [
      { val: -3, x: 0.12, label: '매우아니다', color: '#f43f5e' },
      { val: -2, x: 0.24, label: '아니다', color: '#fb7185' },
      { val: -1, x: 0.37, label: '약간아니다', color: '#fda4af' },
      { val: 0, x: 0.5, label: '보통', color: '#71717a' },
      { val: 1, x: 0.63, label: '약간그렇다', color: '#6ee7b7' },
      { val: 2, x: 0.76, label: '그렇다', color: '#34d399' },
      { val: 3, x: 0.88, label: '매우그렇다', color: '#10b981' },
    ],
    [],
  );

  // Setup HiDPI Canvas
  const setupCanvas = useCallback(
    (canvas: HTMLCanvasElement) => {
      const dpr = typeof window !== 'undefined' ? Math.max(1, window.devicePixelRatio || 2) : 2;
      const targetWidth = Math.floor(width * dpr);
      const targetHeight = Math.floor(height * dpr);

      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
      }

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform?.(1, 0, 0, 1, 0, 0); // reset transform
        ctx.scale?.(dpr, dpr);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
      }
      return ctx;
    },
    [width, height],
  );

  // Draw Heatmap Mode
  const drawHeatmap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas);
    if (!ctx) return;

    // Base canvas background
    ctx.fillStyle = isDark ? '#0a0b10' : '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // Telemetry Grid
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Heatmap density layer
    if (trajectory.length > 0) {
      const heatCanvas = document.createElement('canvas');
      heatCanvas.width = width;
      heatCanvas.height = height;
      const heatCtx = heatCanvas.getContext('2d');

      if (heatCtx) {
        trajectory.forEach((pt: MousePoint, i: number) => {
          const cx = pt.x * width;
          const cy = pt.y * height;

          if (!Number.isFinite(cx) || !Number.isFinite(cy)) return;

          const nextPt = trajectory[i + 1];
          const rawDelta = nextPt ? nextPt.timestamp - pt.timestamp : 30;
          const timeDelta = Math.max(0, Math.min(250, Number.isFinite(rawDelta) ? rawDelta : 30));
          const radius = Math.max(8, Math.min(56, 24 + timeDelta / 5));
          const alpha = Math.max(0.06, Math.min(0.38, 0.1 + timeDelta / 450));

          const grad = heatCtx.createRadialGradient(cx, cy, 0, cx, cy, radius);
          grad.addColorStop(0, `rgba(239, 68, 68, ${alpha})`);
          grad.addColorStop(0.35, `rgba(245, 158, 11, ${alpha * 0.7})`);
          grad.addColorStop(0.7, `rgba(59, 130, 246, ${alpha * 0.4})`);
          grad.addColorStop(1, isDark ? 'rgba(15, 23, 42, 0)' : 'rgba(248, 250, 252, 0)');

          heatCtx.fillStyle = grad;
          heatCtx.beginPath();
          heatCtx.arc(cx, cy, radius, 0, Math.PI * 2);
          heatCtx.fill();
        });

        ctx.globalCompositeOperation = isDark ? 'screen' : 'multiply';
        ctx.drawImage(heatCanvas, 0, 0);
        ctx.globalCompositeOperation = 'source-over';
      }

      // Draw trajectory path over heatmap
      ctx.beginPath();
      ctx.moveTo(trajectory[0].x * width, trajectory[0].y * height);
      for (let i = 1; i < trajectory.length; i++) {
        ctx.lineTo(trajectory[i].x * width, trajectory[i].y * height);
      }
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.14)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Likert Options Indicators
    const optionY = height * 0.78;
    optionPositions.forEach((opt) => {
      const cx = opt.x * width;
      const isHotzone = trajectory.some((pt) => {
        const dist = Math.hypot(pt.x * width - cx, pt.y * height - optionY);
        return dist < 36;
      });

      ctx.beginPath();
      ctx.arc(cx, optionY, 14, 0, Math.PI * 2);
      ctx.fillStyle = isHotzone
        ? 'rgba(239, 68, 68, 0.3)'
        : isDark
          ? 'rgba(255, 255, 255, 0.05)'
          : 'rgba(0, 0, 0, 0.04)';
      ctx.strokeStyle = isHotzone ? '#f59e0b' : isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.16)';
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isHotzone ? (isDark ? '#ffffff' : '#0f172a') : isDark ? '#94a3b8' : '#64748b';
      ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(opt.label, cx, optionY + 30);
    });

    // Draw selection clicks
    clicks.forEach((c: AnswerSelectionEvent, idx: number) => {
      const opt = optionPositions.find((o) => o.val === c.value);
      if (opt) {
        const cx = opt.x * width;

        ctx.beginPath();
        ctx.arc(cx, optionY, 12, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${idx + 1}`, cx, optionY + 3.5);
      }
    });
  }, [setupCanvas, trajectory, clicks, width, height, optionPositions, isDark]);

  // Draw Replay Frame
  const drawFrame = useCallback(
    (currentTime: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = setupCanvas(canvas);
      if (!ctx) return;

      // Clear Canvas
      ctx.fillStyle = isDark ? '#0a0b10' : '#f8fafc';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle telemetry grid
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw 7 Likert Option Reference Nodes at Bottom
      const optionY = height * 0.78;
      optionPositions.forEach((opt) => {
        const cx = opt.x * width;
        ctx.beginPath();
        ctx.arc(cx, optionY, 12, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)';
        ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)';
        ctx.lineWidth = 1.5;
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
        ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(opt.label, cx, optionY + 28);
      });

      // Filter points up to currentTime
      const pointsToDraw = trajectory.filter((pt) => pt.timestamp <= currentTime);

      // Draw Trajectory Stream Line
      if (pointsToDraw.length > 1) {
        ctx.beginPath();
        ctx.moveTo(pointsToDraw[0].x * width, pointsToDraw[0].y * height);

        for (let i = 1; i < pointsToDraw.length; i++) {
          ctx.lineTo(pointsToDraw[i].x * width, pointsToDraw[i].y * height);
        }

        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#6366f1');
        gradient.addColorStop(0.5, '#a855f7');
        gradient.addColorStop(1, '#ec4899');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = '#6366f1';
        ctx.shadowBlur = isDark ? 10 : 3;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Draw Clicks occurred up to currentTime
      const clicksToDraw = clicks.filter((c) => c.timestamp <= currentTime);
      clicksToDraw.forEach((c: AnswerSelectionEvent, idx: number) => {
        const opt = optionPositions.find((o) => o.val === c.value);
        if (opt) {
          const cx = opt.x * width;

          // Pulse wave ring
          ctx.beginPath();
          ctx.arc(cx, optionY, 20, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Solid filled badge
          ctx.beginPath();
          ctx.arc(cx, optionY, 12, 0, Math.PI * 2);
          ctx.fillStyle = '#f59e0b';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${idx + 1}`, cx, optionY + 3.5);
        }
      });

      // Draw Current Pointer Cursor with Glow
      if (pointsToDraw.length > 0) {
        const currentPt = pointsToDraw[pointsToDraw.length - 1];
        const cx = currentPt.x * width;
        const cy = currentPt.y * height;

        // Outer glow
        ctx.beginPath();
        ctx.arc(cx, cy, 12, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(99, 102, 241, 0.3)';
        ctx.fill();

        // Inner solid cursor
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2.5;
        ctx.fill();
        ctx.stroke();
      }
    },
    [setupCanvas, trajectory, clicks, width, height, optionPositions, isDark],
  );

  const handleSwitchViewMode = (mode: MouseCanvasViewMode) => {
    if (mode === viewMode) return;
    if (onViewModeChange) {
      onViewModeChange(mode);
    } else {
      setInternalViewMode(mode);
    }
    if (mode === 'replay') {
      pausedTimeOffsetRef.current = 0;
      setPlaybackProgress(0);
      setIsPlaying(true);
    }
  };

  // Animation Loop for Replay & Heatmap
  useEffect(() => {
    if (viewMode === 'heatmap') {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      drawHeatmap();
      return;
    }

    if (!isPlaying) {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      // Ensure the frame is drawn even when paused, replacing any leftover heatmap pixels
      drawFrame(pausedTimeOffsetRef.current || (playbackProgress >= 1 ? duration : 0));
      return;
    }

    let startTimestamp: number | null = null;
    const initialOffset = pausedTimeOffsetRef.current;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp + initialOffset;
      const progressRatio = Math.min(1, elapsed / duration);

      pausedTimeOffsetRef.current = elapsed;
      setPlaybackProgress(progressRatio);

      drawFrame(elapsed);

      if (progressRatio < 1) {
        animFrameIdRef.current = requestAnimationFrame(step);
      } else {
        setIsPlaying(false);
      }
    };

    animFrameIdRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isPlaying, viewMode, duration, drawFrame, drawHeatmap, playbackProgress]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (playbackProgress >= 1) {
        pausedTimeOffsetRef.current = 0;
        setPlaybackProgress(0);
      }
      playStartTimeRef.current = performance.now();
      setIsPlaying(true);
    }
  };

  const handleRestart = () => {
    pausedTimeOffsetRef.current = 0;
    setPlaybackProgress(0);
    setIsPlaying(true);
  };

  const scrubberRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const wasPlayingBeforeDragRef = useRef<boolean>(false);

  const updateScrubFromClientX = useCallback(
    (clientX: number) => {
      const el = scrubberRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const clickX = clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
      const targetTime = ratio * duration;

      pausedTimeOffsetRef.current = targetTime;
      setPlaybackProgress(ratio);
      drawFrame(targetTime);
    },
    [duration, drawFrame],
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {
      // ignore in test env
    }
    isDraggingRef.current = true;
    wasPlayingBeforeDragRef.current = isPlaying;
    setIsPlaying(false);
    updateScrubFromClientX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    updateScrubFromClientX(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
    isDraggingRef.current = false;
    if (wasPlayingBeforeDragRef.current && playbackProgress < 1) {
      playStartTimeRef.current = performance.now();
      setIsPlaying(true);
    }
  };

  const currentTimeSec = ((playbackProgress * duration) / 1000).toFixed(1);
  const totalDurationSec = (duration / 1000).toFixed(1);

  return (
    <Card className="w-full bg-card dark:bg-neutral-950 border-border rounded-2xl p-4 sm:p-5 shadow-xl text-foreground font-sans">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-3 text-xs font-mono text-muted-foreground">
        <div className="flex items-center gap-2">
          <Crosshair className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
          <span className="text-foreground font-semibold uppercase tracking-wider">Mouse Telemetry Canvas</span>
        </div>

        <div className="flex items-center gap-3">
          {viewMode === 'replay' && (
            <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
              {currentTimeSec}s / {totalDurationSec}s
            </span>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center bg-muted p-0.5 rounded-lg border border-border gap-1">
            <Button
              size="sm"
              variant={viewMode === 'replay' ? 'default' : 'ghost'}
              onClick={() => handleSwitchViewMode('replay')}
              className={`h-6.5 px-2.5 text-xs rounded-md ${
                viewMode === 'replay' ? 'bg-emerald-600 text-white font-semibold shadow-xs' : ''
              }`}
            >
              궤적 재생
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'heatmap' ? 'default' : 'ghost'}
              onClick={() => handleSwitchViewMode('heatmap')}
              className={`h-6.5 px-2.5 text-xs rounded-md flex items-center gap-1 ${
                viewMode === 'heatmap' ? 'bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-xs' : ''
              }`}
            >
              <Flame className="w-3 h-3 text-amber-300" />
              히트맵
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas Container with HiDPI Resolution */}
      <div className="relative w-full aspect-2/1 rounded-xl border border-border overflow-hidden bg-muted/30 dark:bg-[#07080c] shadow-inner flex items-center justify-center">
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%' }}
          className="w-full h-full block object-contain"
        />

        {/* Empty Trajectory Fallback Notice */}
        {trajectory.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground text-xs font-mono">
            <MousePointer className="w-6 h-6 opacity-30 text-emerald-500" />
            <span>이 문항에는 기록된 마우스 궤적이 없습니다</span>
          </div>
        )}
      </div>

      {/* Replay Timeline Progress Scrubber Gauge Bar (Click & Drag Supported) */}
      {viewMode === 'replay' && (
        <div className="mt-3.5 space-y-1.5 select-none">
          <div
            ref={scrubberRef}
            role="progressbar"
            aria-valuenow={Math.round(playbackProgress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="group relative w-full h-3 bg-muted rounded-full cursor-grab active:cursor-grabbing overflow-visible touch-none transition-all active:ring-2 active:ring-emerald-500/50"
          >
            {/* Active playback sweep gauge */}
            <div className="relative w-full h-full rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-emerald-500 via-teal-500 to-lime-500 rounded-full"
                style={{ width: `${playbackProgress * 100}%` }}
              />
            </div>

            {/* Drag Handle Thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-white rounded-full border-2 border-emerald-600 shadow-md transition-transform pointer-events-none -ml-2 group-hover:scale-110 group-active:scale-125"
              style={{ left: `${playbackProgress * 100}%` }}
            />

            {/* Click Event Markers on Timeline */}
            {clicks.map((c, idx) => {
              const clickRatio = Math.min(1, c.timestamp / duration);
              return (
                <div
                  key={idx}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-neutral-900 pointer-events-none z-10"
                  style={{ left: `${clickRatio * 100}%` }}
                  title={`답변 선택 (#${c.value})`}
                />
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground px-0.5">
            <span>0.0s</span>
            <span className="font-semibold text-foreground">{currentTimeSec}s</span>
            <span>{totalDurationSec}s</span>
          </div>
        </div>
      )}

      {/* Replay Controls & Stats */}
      {viewMode === 'replay' ? (
        <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border text-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleTogglePlay}
              disabled={trajectory.length === 0}
              className="gap-1.5 font-mono text-xs cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? '일시정지' : '재생'}</span>
            </Button>

            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleRestart}
              disabled={trajectory.length === 0}
              className="gap-1 text-muted-foreground hover:text-foreground font-mono text-xs cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>처음부터</span>
            </Button>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-mono">
            <span>
              선택 변경: <strong className="text-amber-500 font-bold">{behaviorLog.changeCount}회</strong>
            </span>
            <span>
              최종 선택:{' '}
              <strong className="text-emerald-500 font-bold">
                {behaviorLog.finalValue !== null ? getOptionLabel(behaviorLog.finalValue) : '미선택'}
              </strong>
            </span>
          </div>
        </div>
      ) : (
        /* Heatmap Info Footer */
        <div className="mt-4 flex items-center justify-between w-full pt-3 border-t border-border text-xs font-mono text-muted-foreground">
          <div className="flex items-center gap-1.5 text-[11px]">
            <Flame className="w-3 h-3 text-amber-500" />
            <span>붉은 영역일수록 마우스가 오래 머물며 고민한 지점입니다.</span>
          </div>
          <div className="text-[11px]">
            총 체류 시간: <strong className="text-emerald-500 font-bold">{(duration / 1000).toFixed(1)}초</strong>
          </div>
        </div>
      )}
    </Card>
  );
}
