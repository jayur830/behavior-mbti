'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { QuestionBehaviorLog } from '../types';
import { Play, Pause, RotateCcw, Activity } from 'lucide-react';
import { getOptionLabel } from '../data/questions';

interface MouseReplayCanvasProps {
  behaviorLog: QuestionBehaviorLog;
  width?: number;
  height?: number;
}

export const MouseReplayCanvas: React.FC<MouseReplayCanvasProps> = ({
  behaviorLog,
  width = 600,
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

      // Clear Canvas with dark sleek background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle grid
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
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

      // Draw Option mock zones at the bottom
      const optionPositions = [
        { val: -3, x: 0.12, label: '매우아니다', color: '#ef4444' },
        { val: -2, x: 0.24, label: '아니다', color: '#f87171' },
        { val: -1, x: 0.37, label: '약간아니다', color: '#fca5a5' },
        { val: 0, x: 0.5, label: '보통', color: '#94a3b8' },
        { val: 1, x: 0.63, label: '약간그렇다', color: '#86efac' },
        { val: 2, x: 0.76, label: '그렇다', color: '#4ade80' },
        { val: 3, x: 0.88, label: '매우그렇다', color: '#22c55e' },
      ];

      const optionY = height * 0.72;
      optionPositions.forEach((opt) => {
        const cx = opt.x * width;
        ctx.beginPath();
        ctx.arc(cx, optionY, 14, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
        ctx.strokeStyle = opt.color;
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(opt.label, cx, optionY + 28);
      });

      // Filter points up to current playback time
      const visiblePoints = trajectory.filter((pt) => pt.timestamp <= currentTime);

      // Draw trajectory path with gradient glow
      if (visiblePoints.length > 1) {
        ctx.beginPath();
        ctx.moveTo(visiblePoints[0].x * width, visiblePoints[0].y * height);

        for (let i = 1; i < visiblePoints.length; i++) {
          const pt = visiblePoints[i];
          ctx.lineTo(pt.x * width, pt.y * height);
        }

        ctx.strokeStyle = 'rgba(99, 102, 241, 0.7)';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Glowing outer shadow
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
        ctx.lineWidth = 7;
        ctx.stroke();
      }

      // Draw clicks up to current time
      const pastClicks = clicks.filter((c) => c.timestamp <= currentTime);
      pastClicks.forEach((c, idx) => {
        // Find matching opt position
        const opt = optionPositions.find((o) => o.val === c.value);
        if (opt) {
          const cx = opt.x * width;
          // Pulse animation based on click age
          const clickAge = currentTime - c.timestamp;
          const pulseRadius = Math.min(30, 14 + (clickAge / 50) % 20);

          ctx.beginPath();
          ctx.arc(cx, optionY, pulseRadius, 0, Math.PI * 2);
          ctx.strokeStyle = idx === pastClicks.length - 1 ? '#eab308' : 'rgba(234, 179, 8, 0.4)';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Click badge
          ctx.beginPath();
          ctx.arc(cx, optionY, 8, 0, Math.PI * 2);
          ctx.fillStyle = '#eab308';
          ctx.fill();

          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 9px sans-serif';
          ctx.fillText(`${idx + 1}`, cx, optionY + 3);
        }
      });

      // Draw active cursor head
      if (visiblePoints.length > 0) {
        const lastPt = visiblePoints[visiblePoints.length - 1];
        const cx = lastPt.x * width;
        const cy = lastPt.y * height;

        // Glowing cursor head
        ctx.beginPath();
        ctx.arc(cx, cy, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0; // reset

        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
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
    <div className="flex flex-col items-center bg-slate-900/90 border border-slate-700/60 rounded-2xl p-4 shadow-xl text-slate-100 max-w-full">
      <div className="flex items-center justify-between w-full mb-3 px-1">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span className="text-sm font-semibold text-slate-200">실제 마우스 궤적 및 고민 리플레이</span>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          {(playbackProgress * (duration / 1000)).toFixed(1)}s / {(duration / 1000).toFixed(1)}s
        </div>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-slate-700/70 shadow-inner bg-slate-950 w-full flex justify-center">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full max-w-full h-auto block object-contain"
        />
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden cursor-pointer">
        <div
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-400 h-full transition-all duration-75"
          style={{ width: `${playbackProgress * 100}%` }}
        />
      </div>

      {/* Controls and Click Stats */}
      <div className="flex items-center justify-between w-full mt-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <button
            onClick={handleTogglePlay}
            className="p-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white transition-colors flex items-center gap-1 px-2.5 font-medium"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" /> 일시정지
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> 재생
              </>
            )}
          </button>
          <button
            onClick={handleRestart}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1 px-2"
          >
            <RotateCcw className="w-3.5 h-3.5" /> 다시보기
          </button>
        </div>

        <div className="flex items-center gap-3">
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
