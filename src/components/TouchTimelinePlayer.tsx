'use client';

import { ArrowRight, Clock, Fingerprint, Pause, Play, RotateCcw, Smartphone } from 'lucide-react';
import { FC, useEffect, useRef, useState } from 'react';

import { getOptionLabel } from '../data/questions';
import { QuestionBehaviorLog } from '../types';

interface TouchTimelinePlayerProps {
  behaviorLog: QuestionBehaviorLog;
}

export const TouchTimelinePlayer: FC<TouchTimelinePlayerProps> = ({ behaviorLog }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const duration = Math.max(1200, behaviorLog.totalDwellTime || 3500);
  const touchMetrics = behaviorLog.touchMetrics || {
    firstTapLatency: behaviorLog.firstInteractionTime ?? duration * 0.6,
    averagePressDuration: 95,
    confirmationDelay: Math.max(200, duration * 0.2),
    tapCount: behaviorLog.selectionHistory.length || 1,
  };

  const taps = behaviorLog.selectionHistory || [];
  const latencySec = (touchMetrics.firstTapLatency / 1000).toFixed(1);
  const pressMs = touchMetrics.averagePressDuration;
  const confirmSec = (touchMetrics.confirmationDelay / 1000).toFixed(1);

  useEffect(() => {
    if (!isPlaying) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    const start = performance.now();
    startTimeRef.current = start;

    const tick = (now: number) => {
      const elapsed = now - start;
      const curProg = Math.min(1, elapsed / duration);
      setProgress(curProg);

      if (curProg < 1) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        setIsPlaying(false);
      }
    };

    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, duration]);

  const handleToggle = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (progress >= 1) setProgress(0);
      setIsPlaying(true);
    }
  };

  const handleRestart = () => {
    setProgress(0);
    setIsPlaying(true);
  };

  return (
    <div className="w-full bg-neutral-950 border border-white/[0.08] rounded-2xl p-4 sm:p-5 shadow-xl text-neutral-100 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Smartphone className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-xs font-mono text-neutral-300 uppercase tracking-wide">
            Mobile Touch Dynamics Timeline
          </span>
        </div>
        <span className="text-xs font-mono text-neutral-500">
          {(progress * (duration / 1000)).toFixed(1)}s / {(duration / 1000).toFixed(1)}s
        </span>
      </div>

      {/* Touch Latency & Timeline Visualization */}
      <div className="space-y-3 bg-[#07080c] border border-white/[0.06] rounded-xl p-4 mb-4">
        {/* Timeline Flow Bar */}
        <div className="relative w-full h-3 bg-neutral-900 rounded-full overflow-hidden mb-3">
          {/* First Tap Latency Zone */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-sky-500/20 border-r border-sky-400/40"
            style={{ width: `${Math.min(100, (touchMetrics.firstTapLatency / duration) * 100)}%` }}
          />

          {/* Active playback sweep */}
          <div
            className="h-full bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-400 transition-all duration-75"
            style={{ width: `${progress * 100}%` }}
          />

          {/* Tap Points markers */}
          {taps.map((t, idx) => {
            const tapRatio = Math.min(1, t.timestamp / duration);
            return (
              <div
                key={idx}
                className="absolute top-0 bottom-0 w-2.5 -ml-1 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)] flex items-center justify-center text-[7px] text-neutral-950 font-bold"
                style={{ left: `${tapRatio * 100}%` }}
              >
                {idx + 1}
              </div>
            );
          })}
        </div>

        {/* Phase Breakdown Badges */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
          <div className="bg-white/[0.03] border border-white/[0.06] p-2.5 rounded-xl flex flex-col items-center">
            <span className="text-[10px] text-neutral-500 flex items-center gap-1 mb-1">
              <Clock className="w-3 h-3 text-sky-400" />첫 터치 잠복기
            </span>
            <span className="text-sm font-bold text-sky-400">{latencySec}초</span>
            <span className="text-[9px] text-neutral-500 mt-0.5">질문 숙고 시간</span>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.06] p-2.5 rounded-xl flex flex-col items-center">
            <span className="text-[10px] text-neutral-500 flex items-center gap-1 mb-1">
              <Fingerprint className="w-3 h-3 text-emerald-400" />
              터치 프레스 시간
            </span>
            <span className="text-sm font-bold text-emerald-400">{pressMs}ms</span>
            <span className="text-[9px] text-neutral-500 mt-0.5">{pressMs < 120 ? '단호한 탭' : '신중한 롱터치'}</span>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.06] p-2.5 rounded-xl flex flex-col items-center">
            <span className="text-[10px] text-neutral-500 flex items-center gap-1 mb-1">
              <ArrowRight className="w-3 h-3 text-amber-400" />
              확정 딜레이
            </span>
            <span className="text-sm font-bold text-amber-400">{confirmSec}초</span>
            <span className="text-[9px] text-neutral-500 mt-0.5">최종 확인 시간</span>
          </div>
        </div>

        {/* Tap Selection Path */}
        {taps.length > 0 && (
          <div className="pt-2 border-t border-white/[0.04] text-xs flex items-center gap-2 text-neutral-400 font-mono overflow-x-auto">
            <span className="text-[11px] text-neutral-500 shrink-0">터치 시퀀스:</span>
            {taps.map((t, idx) => (
              <span key={idx} className="flex items-center gap-1 shrink-0">
                <span className="px-2 py-0.5 rounded bg-white/[0.06] text-neutral-200 font-semibold text-[11px]">
                  #{idx + 1} {getOptionLabel(t.value)}
                </span>
                {idx < taps.length - 1 && <span className="text-neutral-600">➔</span>}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggle}
            className="p-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-white transition-colors flex items-center gap-1.5 px-3 font-sans text-xs"
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
          </button>
          <button
            type="button"
            onClick={handleRestart}
            className="p-1.5 rounded-lg bg-transparent hover:bg-white/[0.06] text-neutral-400 hover:text-white transition-colors flex items-center gap-1 px-2 font-sans text-xs"
          >
            <RotateCcw className="w-3 h-3" /> 다시보기
          </button>
        </div>

        <div className="text-[11px] text-neutral-400">
          최종 결정:{' '}
          <strong className="text-emerald-400">
            {behaviorLog.finalValue !== null ? getOptionLabel(behaviorLog.finalValue) : '미선택'}
          </strong>
        </div>
      </div>
    </div>
  );
};
