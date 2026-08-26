'use client';

import { Crosshair, Flame, Pause, Play, RotateCcw } from 'lucide-react';
import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getOptionLabel } from '@/data/questions';
import type { AnswerSelectionEvent, MousePoint, QuestionBehaviorLog } from '@/types';

export interface MouseReplayCanvasProps {
  behaviorLog: QuestionBehaviorLog;
  width?: number;
  height?: number;
}

export type ViewMode = 'replay' | 'heatmap';

export const MouseReplayCanvas: FC<MouseReplayCanvasProps> = ({ behaviorLog, width = 640, height = 320 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('replay');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);
  const animFrameIdRef = useRef<number | null>(null);
  const playStartTimeRef = useRef<number | null>(null);
  const pausedTimeOffsetRef = useRef<number>(0);

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

  // Draw Heatmap Mode
  const drawHeatmap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dark base canvas
    ctx.fillStyle = '#0a0b10';
    ctx.fillRect(0, 0, width, height);

    // Telemetry Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
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
      // Create offscreen heatmap canvas for smooth accumulation
      const heatCanvas = document.createElement('canvas');
      heatCanvas.width = width;
      heatCanvas.height = height;
      const heatCtx = heatCanvas.getContext('2d');

      if (heatCtx) {
        // Draw intensity blobs for each mouse point
        trajectory.forEach((pt: MousePoint, i: number) => {
          const cx = pt.x * width;
          const cy = pt.y * height;

          if (!Number.isFinite(cx) || !Number.isFinite(cy)) return;

          // Weight by time spent near this point (ensure non-negative)
          const nextPt = trajectory[i + 1];
          const rawDelta = nextPt ? nextPt.timestamp - pt.timestamp : 30;
          const timeDelta = Math.max(0, Math.min(250, Number.isFinite(rawDelta) ? rawDelta : 30));
          const radius = Math.max(5, Math.min(48, 20 + timeDelta / 6));
          const alpha = Math.max(0.05, Math.min(0.35, 0.08 + timeDelta / 500));

          const grad = heatCtx.createRadialGradient(cx, cy, 0, cx, cy, radius);
          grad.addColorStop(0, `rgba(239, 68, 68, ${alpha})`);
          grad.addColorStop(0.35, `rgba(245, 158, 11, ${alpha * 0.7})`);
          grad.addColorStop(0.7, `rgba(59, 130, 246, ${alpha * 0.4})`);
          grad.addColorStop(1, 'rgba(15, 23, 42, 0)');

          heatCtx.fillStyle = grad;
          heatCtx.beginPath();
          heatCtx.arc(cx, cy, radius, 0, Math.PI * 2);
          heatCtx.fill();
        });

        // Composite heat canvas onto main canvas
        ctx.globalCompositeOperation = 'screen';
        ctx.drawImage(heatCanvas, 0, 0);
        ctx.globalCompositeOperation = 'source-over';
      }

      // Draw faint trajectory path over heatmap
      ctx.beginPath();
      ctx.moveTo(trajectory[0].x * width, trajectory[0].y * height);
      for (let i = 1; i < trajectory.length; i++) {
        ctx.lineTo(trajectory[i].x * width, trajectory[i].y * height);
      }
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw Option nodes at the bottom with dwell stats
    const optionY = height * 0.74;
    optionPositions.forEach((opt) => {
      const cx = opt.x * width;

      // Count points near this option
      const nearPoints = trajectory.filter(
        (p: MousePoint) => Math.abs(p.x - opt.x) < 0.065 && Math.abs(p.y - 0.74) < 0.18,
      );
      const isHotzone = nearPoints.length > 5;

      if (isHotzone) {
        const intensity = Math.min(1, nearPoints.length / 25);
        ctx.beginPath();
        ctx.arc(cx, optionY, 20 + intensity * 10, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(239, 68, 68, ${0.15 + intensity * 0.25})`;
        ctx.strokeStyle = `rgba(245, 158, 11, ${0.4 + intensity * 0.4})`;
        ctx.lineWidth = 1.5;
        ctx.fill();
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(cx, optionY, 12, 0, Math.PI * 2);
      ctx.fillStyle = isHotzone ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.04)';
      ctx.strokeStyle = isHotzone ? '#f59e0b' : 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isHotzone ? '#ffffff' : '#94a3b8';
      ctx.font = isHotzone
        ? 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        : '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(opt.label, cx, optionY + 26);
    });

    // Draw selection clicks
    clicks.forEach((c: AnswerSelectionEvent, idx: number) => {
      const opt = optionPositions.find((o) => o.val === c.value);
      if (opt) {
        const cx = opt.x * width;

        ctx.beginPath();
        ctx.arc(cx, optionY, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#090a0f';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText(`${idx + 1}`, cx, optionY + 3);
      }
    });
  }, [trajectory, clicks, width, height, optionPositions]);

  // Draw Replay Frame
  const drawFrame = useCallback(
    (currentTime: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear Canvas with sleek jet-black slate background
      ctx.fillStyle = '#0a0b10';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle telemetry grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
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

      const optionY = height * 0.74;
      const visiblePts = trajectory.filter((p: MousePoint) => p.timestamp <= currentTime);
      const currentPoint = visiblePts.length > 0 ? visiblePts[visiblePts.length - 1] : null;

      optionPositions.forEach((opt) => {
        const cx = opt.x * width;
        const isCurrentlyHovered =
          currentPoint && Math.abs(currentPoint.x - opt.x) < 0.055 && Math.abs(currentPoint.y - 0.74) < 0.16;

        if (isCurrentlyHovered) {
          ctx.beginPath();
          ctx.arc(cx, optionY, 18, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
          ctx.strokeStyle = 'rgba(99, 102, 241, 0.7)';
          ctx.lineWidth = 1.5;
          ctx.fill();
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(cx, optionY, 12, 0, Math.PI * 2);
        ctx.fillStyle = isCurrentlyHovered ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.03)';
        ctx.strokeStyle = isCurrentlyHovered ? '#818cf8' : 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1.5;
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isCurrentlyHovered ? '#ffffff' : '#71717a';
        ctx.font = isCurrentlyHovered
          ? 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          : '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(opt.label, cx, optionY + 26);
      });

      // Draw trajectory path up to current time
      if (visiblePts.length > 1) {
        ctx.beginPath();
        ctx.moveTo(visiblePts[0].x * width, visiblePts[0].y * height);

        for (let i = 1; i < visiblePts.length; i++) {
          const pt = visiblePts[i];
          ctx.lineTo(pt.x * width, pt.y * height);
        }

        ctx.strokeStyle = '#818cf8';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      }

      // Draw clicks up to current time
      const pastClicks = clicks.filter((c: AnswerSelectionEvent) => c.timestamp <= currentTime);
      pastClicks.forEach((c: AnswerSelectionEvent, idx: number) => {
        const opt = optionPositions.find((o) => o.val === c.value);
        if (opt) {
          const cx = opt.x * width;
          const clickAge = currentTime - c.timestamp;
          const pulseRadius = Math.min(26, 12 + ((clickAge / 60) % 16));

          ctx.beginPath();
          ctx.arc(cx, optionY, pulseRadius, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Click badge
          ctx.beginPath();
          ctx.arc(cx, optionY, 8, 0, Math.PI * 2);
          ctx.fillStyle = '#f59e0b';
          ctx.fill();

          ctx.fillStyle = '#090a0f';
          ctx.font = 'bold 9px sans-serif';
          ctx.fillText(`${idx + 1}`, cx, optionY + 3);
        }
      });

      // Draw active cursor pointer
      if (visiblePts.length > 0) {
        const lastPt = visiblePts[visiblePts.length - 1];
        const cx = lastPt.x * width;
        const cy = lastPt.y * height;

        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, 11, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(129, 140, 248, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    },
    [trajectory, clicks, width, height, optionPositions],
  );

  // Animation effect for replay mode
  useEffect(() => {
    if (viewMode !== 'replay') {
      drawHeatmap();
      return;
    }

    if (!isPlaying) {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      return;
    }

    const startTimestamp = performance.now() - pausedTimeOffsetRef.current;
    playStartTimeRef.current = startTimestamp;

    const animate = (now: number) => {
      const elapsed = now - startTimestamp;
      const progress = Math.min(1, elapsed / duration);
      setPlaybackProgress(progress);

      const simTime = progress * duration;
      drawFrame(simTime);

      if (progress < 1) {
        animFrameIdRef.current = requestAnimationFrame(animate);
      } else {
        setIsPlaying(false);
        pausedTimeOffsetRef.current = 0;
      }
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [viewMode, isPlaying, duration, drawFrame, drawHeatmap]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (playStartTimeRef.current) {
        pausedTimeOffsetRef.current = performance.now() - playStartTimeRef.current;
      }
    } else {
      if (playbackProgress >= 1) {
        pausedTimeOffsetRef.current = 0;
        setPlaybackProgress(0);
      }
      setIsPlaying(true);
    }
  };

  const handleRestart = () => {
    pausedTimeOffsetRef.current = 0;
    setPlaybackProgress(0);
    setIsPlaying(true);
  };

  return (
    <Card className="w-full bg-neutral-950 border-white/8 rounded-2xl p-4 sm:p-5 shadow-xl text-neutral-100 font-sans">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-3 text-xs font-mono text-neutral-400">
        <div className="flex items-center gap-2">
          <Crosshair className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-neutral-300 font-semibold uppercase tracking-wider">Mouse Telemetry Canvas</span>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-[#07080c] p-0.5 rounded-lg border border-white/8">
          <button
            type="button"
            onClick={() => setViewMode('replay')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              viewMode === 'replay'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            궤적 재생
          </button>
          <button
            type="button"
            onClick={() => setViewMode('heatmap')}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
              viewMode === 'heatmap'
                ? 'bg-amber-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3 h-3 text-amber-300" />
            히트맵
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative rounded-xl overflow-hidden border border-white/6 bg-[#07080c] w-full flex justify-center">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full max-w-full h-auto block object-contain"
        />

        {/* Heatmap Legend Overlay */}
        {viewMode === 'heatmap' && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 border border-white/10 text-[10px] font-mono text-slate-400 backdrop-blur-xs">
            <span>빠른 통과</span>
            <div className="w-12 h-1.5 rounded-full bg-linear-to-r from-blue-500 via-amber-400 to-red-500" />
            <span className="text-amber-300 font-semibold">집중 고민</span>
          </div>
        )}
      </div>

      {/* Replay Controls & Scrubber */}
      {viewMode === 'replay' ? (
        <>
          {/* Scrubber */}
          <div className="w-full bg-neutral-800 h-1 rounded-full mt-3 overflow-hidden cursor-pointer">
            <div
              className="bg-indigo-400 h-full transition-all duration-75"
              style={{ width: `${playbackProgress * 100}%` }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between w-full mt-3 text-xs font-mono text-neutral-400">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={handleTogglePlay}
                className="flex items-center gap-1.5 px-3 text-xs"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3 h-3" /> 일시정지
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3" /> 재생
                  </>
                )}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleRestart}
                className="flex items-center gap-1 px-2 text-xs text-neutral-400 hover:text-white"
              >
                <RotateCcw className="w-3 h-3" /> 처음부터
              </Button>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <span>
                선택 변경: <strong className="text-amber-400">{behaviorLog.changeCount}회</strong>
              </span>
              <span>
                최종 선택:{' '}
                <strong className="text-emerald-400">
                  {behaviorLog.finalValue !== null ? getOptionLabel(behaviorLog.finalValue) : '미선택'}
                </strong>
              </span>
            </div>
          </div>
        </>
      ) : (
        /* Heatmap Info Footer */
        <div className="flex items-center justify-between w-full mt-3 text-xs font-mono text-neutral-400">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Flame className="w-3 h-3 text-amber-400" />
            <span>붉은 영역일수록 마우스가 오래 머물며 고민한 지점입니다.</span>
          </div>
          <div className="text-[11px]">
            총 체류 시간: <strong className="text-indigo-400">{(duration / 1000).toFixed(1)}초</strong>
          </div>
        </div>
      )}
    </Card>
  );
};
