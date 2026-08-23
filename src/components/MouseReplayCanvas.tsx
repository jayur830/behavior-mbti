'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { QuestionBehaviorLog } from '../types';
import { Play, Pause, RotateCcw, Crosshair } from 'lucide-react';
import { getOptionLabel } from '../data/questions';

interface MouseReplayCanvasProps {
  behaviorLog: QuestionBehaviorLog;
  width?: number;
  height?: number;
}

export const MouseReplayCanvas: React.FC<MouseReplayCanvasProps> = ({
  behaviorLog,
  width = 640,
  height = 320,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);
  const animFrameIdRef = useRef<number | null>(null);
  const playStartTimeRef = useRef<number | null>(null);
  const pausedTimeOffsetRef = useRef<number>(0);

  const duration = Math.max(1000, behaviorLog.totalDwellTime || 4000);
  const trajectory = behaviorLog.mouseTrajectory || [];
  const clicks = behaviorLog.selectionHistory || [];

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

      // Draw Option nodes at the bottom
      const optionPositions = [
        { val: -3, x: 0.12, label: '매우아니다', color: '#f43f5e' },
        { val: -2, x: 0.24, label: '아니다', color: '#fb7185' },
        { val: -1, x: 0.37, label: '약간아니다', color: '#fda4af' },
        { val: 0, x: 0.5, label: '보통', color: '#71717a' },
        { val: 1, x: 0.63, label: '약간그렇다', color: '#6ee7b7' },
        { val: 2, x: 0.76, label: '그렇다', color: '#34d399' },
        { val: 3, x: 0.88, label: '매우그렇다', color: '#10b981' },
      ];

      const optionY = height * 0.74;
      optionPositions.forEach((opt) => {
        const cx = opt.x * width;
        ctx.beginPath();
        ctx.arc(cx, optionY, 12, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1.5;
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#71717a';
        ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(opt.label, cx, optionY + 26);
      });

      // Filter points up to current playback time
      const visiblePoints = trajectory.filter((pt) => pt.timestamp <= currentTime);

      // Draw trajectory path
      if (visiblePoints.length > 1) {
        ctx.beginPath();
        ctx.moveTo(visiblePoints[0].x * width, visiblePoints[0].y * height);

        for (let i = 1; i < visiblePoints.length; i++) {
          const pt = visiblePoints[i];
          ctx.lineTo(pt.x * width, pt.y * height);
        }

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      }

      // Draw clicks up to current time
      const pastClicks = clicks.filter((c) => c.timestamp <= currentTime);
      pastClicks.forEach((c, idx) => {
        const opt = optionPositions.find((o) => o.val === c.value);
        if (opt) {
          const cx = opt.x * width;
          const clickAge = currentTime - c.timestamp;
          const pulseRadius = Math.min(26, 12 + (clickAge / 60) % 16);

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
      if (visiblePoints.length > 0) {
        const lastPt = visiblePoints[visiblePoints.length - 1];
        const cx = lastPt.x * width;
        const cy = lastPt.y * height;

        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, 11, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    },
    [trajectory, clicks, width, height, behaviorLog]
  );

  useEffect(() => {
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
  }, [isPlaying, duration, drawFrame]);

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
    <div className="flex flex-col items-center bg-neutral-950 border border-white/[0.08] rounded-2xl p-4 shadow-xl text-neutral-100 max-w-full">
      <div className="flex items-center justify-between w-full mb-3 px-1">
        <div className="flex items-center gap-2">
          <Crosshair className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-xs font-mono text-neutral-300 uppercase tracking-wide">
            Telemetry Cursor Replay
          </span>
        </div>
        <div className="text-xs text-neutral-500 font-mono">
          {(playbackProgress * (duration / 1000)).toFixed(1)}s / {(duration / 1000).toFixed(1)}s
        </div>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-white/[0.06] bg-[#07080c] w-full flex justify-center">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full max-w-full h-auto block object-contain"
        />
      </div>

      {/* Scrubber */}
      <div className="w-full bg-neutral-800 h-1 rounded-full mt-3 overflow-hidden cursor-pointer">
        <div
          className="bg-neutral-300 h-full transition-all duration-75"
          style={{ width: `${playbackProgress * 100}%` }}
        />
      </div>

      {/* Controls and Click Stats */}
      <div className="flex items-center justify-between w-full mt-3 text-xs font-mono text-neutral-400">
        <div className="flex items-center gap-2">
          <button
            onClick={handleTogglePlay}
            className="p-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-white transition-colors flex items-center gap-1.5 px-3 font-sans text-xs"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3 h-3" /> 정지
              </>
            ) : (
              <>
                <Play className="w-3 h-3" /> 재생
              </>
            )}
          </button>
          <button
            onClick={handleRestart}
            className="p-1.5 rounded-lg bg-transparent hover:bg-white/[0.06] text-neutral-400 hover:text-white transition-colors flex items-center gap-1 px-2 font-sans text-xs"
          >
            <RotateCcw className="w-3 h-3" /> 다시보기
          </button>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span>
            선택 변경: <strong className="text-amber-400">{behaviorLog.changeCount}회</strong>
          </span>
          <span>
            최종 결정:{' '}
            <strong className="text-emerald-400">
              {behaviorLog.finalValue !== null ? getOptionLabel(behaviorLog.finalValue) : '미선택'}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
};
