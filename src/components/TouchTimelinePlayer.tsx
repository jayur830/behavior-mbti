'use client';

import { Clock, Fingerprint, Pause, Play, RotateCcw, Smartphone, Timer } from 'lucide-react';
import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { QuestionBehaviorLog } from '@/types';

export interface TouchTimelinePlayerProps {
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
    <Card className="w-full bg-card dark:bg-neutral-950 border-border rounded-2xl p-4 sm:p-5 shadow-xl text-foreground font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Smartphone className="w-3.5 h-3.5 text-sky-500" />
          <span className="text-xs font-mono text-foreground font-semibold uppercase tracking-wide">
            Mobile Touch Dynamics Timeline
          </span>
        </div>
        <span className="text-xs font-mono text-muted-foreground">
          {(progress * (duration / 1000)).toFixed(1)}s / {(duration / 1000).toFixed(1)}s
        </span>
      </div>

      {/* Touch Latency & Timeline Visualization */}
      <div className="space-y-3 bg-muted/40 dark:bg-[#07080c] border border-border rounded-xl p-4 mb-4">
        {/* Timeline Flow Bar */}
        <div className="relative w-full h-3 bg-muted rounded-full overflow-hidden mb-3">
          {/* First Tap Latency Zone */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-sky-500/20 border-r border-sky-400/40"
            style={{ width: `${Math.min(100, (touchMetrics.firstTapLatency / duration) * 100)}%` }}
          />

          {/* Active playback sweep */}
          <div
            className="h-full bg-linear-to-r from-sky-400 via-emerald-400 to-amber-400 transition-all duration-75"
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
          <div className="bg-card border border-border p-2.5 rounded-xl flex flex-col items-center">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1 mb-1">
              <Clock className="w-3 h-3 text-sky-500" />첫 터치 잠복기
            </span>
            <span className="text-sm font-bold text-sky-500">{latencySec}초</span>
            <span className="text-[9px] text-muted-foreground mt-0.5">질문 숙고 시간</span>
          </div>

          <div className="bg-card border border-border p-2.5 rounded-xl flex flex-col items-center">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1 mb-1">
              <Fingerprint className="w-3 h-3 text-emerald-500" />
              터치 프레스 시간
            </span>
            <span className="text-sm font-bold text-emerald-500">{pressMs}ms</span>
            <span className="text-[9px] text-muted-foreground mt-0.5">
              {pressMs < 120 ? '단호한 탭' : '신중한 롱터치'}
            </span>
          </div>

          <div className="bg-card border border-border p-2.5 rounded-xl flex flex-col items-center">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1 mb-1">
              <Timer className="w-3 h-3 text-amber-500" />총 터치 횟수
            </span>
            <span className="text-sm font-bold text-amber-500">{taps.length}회</span>
            <span className="text-[9px] text-muted-foreground mt-0.5">
              {taps.length > 1 ? '선택 번복 발생' : '단일 직진 터치'}
            </span>
          </div>
        </div>
      </div>

      {/* Play Controls & Replay Status */}
      <div className="flex items-center justify-between text-xs pt-1">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={handleToggle}
            className="flex items-center gap-1.5 px-3 text-xs"
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
          </Button>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleRestart}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> 처음부터
          </Button>
        </div>

        <span className="text-[11px] text-muted-foreground font-mono">
          터치 상호작용 속도:{' '}
          <strong className="text-foreground">
            {behaviorLog.primaryDevice === 'touch' ? 'Mobile Touch' : 'Touch Gesture'}
          </strong>
        </span>
      </div>
    </Card>
  );
};
