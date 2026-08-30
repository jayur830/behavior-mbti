'use client';

import { ArrowLeft, ArrowRight, Keyboard, Mouse, Radio, Smartphone } from 'lucide-react';
import { useCallback, useRef } from 'react';

import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { useBehaviorTracker } from '@/hooks/useBehaviorTracker';
import type { Question, QuestionBehaviorLog } from '@/types';

export interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  onNext: (log: QuestionBehaviorLog) => void;
  onPrev?: (log: QuestionBehaviorLog) => void;
  initialValue?: number | null;
  existingLog?: QuestionBehaviorLog | null;
}

const LIKERT_OPTIONS = [
  { value: -3, label: '매우 아니다' },
  { value: -2, label: '아니다' },
  { value: -1, label: '약간 아니다' },
  { value: 0, label: '보통 / 중립' },
  { value: 1, label: '약간 그렇다' },
  { value: 2, label: '그렇다' },
  { value: 3, label: '매우 그렇다' },
];

function getCategoryLabel(category: Question['category']) {
  switch (category) {
    case 'social':
      return '사회적 상호작용 및 에너지';
    case 'cognition':
      return '인식 및 정보 수용 방식';
    case 'decision':
      return '의사 결정 및 판단 기준';
    case 'lifestyle':
      return '생활 양식 및 계획성';
  }
}

function DeviceIcon({ device }: { device: 'mouse' | 'touch' | 'keyboard' }) {
  if (device === 'touch') return <Smartphone className="h-3 w-3" />;
  if (device === 'keyboard') return <Keyboard className="h-3 w-3" />;
  return <Mouse className="h-3 w-3" />;
}

export default function QuestionCard({
  question,
  currentIndex,
  totalQuestions,
  onNext,
  onPrev,
  initialValue = null,
  existingLog = null,
}: QuestionCardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const {
    selectedVal,
    handleSelectOption,
    handleOptionMouseEnter,
    handleOptionMouseLeave,
    finalizeLog,
    primaryDevice,
    changeCount,
    directionChanges,
    hoverLogs,
  } = useBehaviorTracker({
    questionId: question.id,
    containerRef,
    initialValue,
    existingLog,
    onAutoSubmit: () => {
      const log = finalizeLog();
      onNext(log);
    },
  });

  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  const onSubmit = useCallback(() => {
    if (selectedVal === null) return;
    onNext(finalizeLog());
  }, [selectedVal, finalizeLog, onNext]);

  const onGoBack = useCallback(() => {
    if (onPrev) onPrev(finalizeLog());
  }, [finalizeLog, onPrev]);

  return (
    <div ref={containerRef} className="w-full max-w-5xl mx-auto px-5 py-4 sm:px-8 sm:py-8">
      {/* Top Telemetry & Progress Bar */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="text-xs font-bold text-accent-ink">실시간 무의식 성향 검사</div>
          <div className="mt-2.5 flex items-center gap-3">
            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">진행률</span>
            <div className="h-2 w-36 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-accent-ink transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-mono text-xs font-extrabold text-foreground">
              {currentIndex + 1} / {totalQuestions}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-xs font-bold border-border/80 text-foreground bg-muted/40">
            {getCategoryLabel(question.category)}
          </Badge>
          <span className="flex items-center gap-1.5 text-accent-ink font-semibold">
            <DeviceIcon device={primaryDevice} />
            <span className="pulse-dot" />{' '}
            {primaryDevice === 'mouse' ? '마우스' : primaryDevice === 'touch' ? '터치' : '키보드'} 연결됨
          </span>
          <span className="hidden sm:flex items-center gap-1.5 text-warning font-medium">
            <Radio className="w-3.5 h-3.5" /> 실시간 분석 중
          </span>
        </div>
      </div>

      {/* Main Grid Layout: Question on Left, Telemetry Aside on Right */}
      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        {/* Left: Main Question Section */}
        <section className="rounded-2xl border border-border bg-card/80 p-6 sm:p-10 shadow-xl flex flex-col justify-between">
          <div>
            <div className="mb-8 flex items-center justify-between text-xs font-bold text-muted-foreground">
              <span className="text-accent-ink">문항 #{String(currentIndex + 1).padStart(2, '0')}</span>
              <span className="text-warning flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-warning animate-pulse" /> 실시간 관측 중
              </span>
            </div>

            <h1 className="max-w-2xl text-balance text-2xl font-extrabold leading-snug tracking-tight sm:text-3xl lg:text-4xl text-foreground">
              {question.title}
            </h1>

            {question.description && (
              <p className="mt-4 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 font-medium leading-relaxed">
                {question.description}
              </p>
            )}

            {/* 7-Point Likert Scale Grid */}
            <div className="mt-10 grid grid-cols-7 gap-1.5 sm:gap-2">
              {LIKERT_OPTIONS.map((option, index) => {
                const isSelected = selectedVal === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelectOption(option.value, 'mouse')}
                    onMouseEnter={() => handleOptionMouseEnter(option.value)}
                    onMouseLeave={() => handleOptionMouseLeave(option.value)}
                    aria-label={option.label}
                    className={`likert ${isSelected ? 'selected' : ''}`}
                  >
                    <span>{index + 1}</span>
                    <small className="hidden sm:block text-[9px] font-bold mt-1 text-center">{option.label}</small>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex justify-between text-xs font-semibold text-neutral-600 dark:text-neutral-400">
              <span className="text-rose-500 font-bold">← 전혀 아니다</span>
              <span className="text-neutral-500">중립</span>
              <span className="text-emerald-500 font-bold">매우 그렇다 →</span>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="mt-12 flex items-center justify-between border-t border-border/80 pt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={onGoBack}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-foreground cursor-pointer disabled:opacity-30"
            >
              <ArrowLeft className="w-4 h-4" /> 이전 문항
            </Button>

            <Button
              type="button"
              disabled={selectedVal === null}
              onClick={onSubmit}
              className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-lime-400 dark:hover:bg-lime-300 dark:text-neutral-950 text-xs font-bold px-7 py-5 rounded-xl shadow-md cursor-pointer disabled:opacity-40"
            >
              <span>{currentIndex + 1 === totalQuestions ? '결과 분석하기' : '다음 문항'}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </section>

        {/* Right Aside: Telemetry Live Monitor */}
        <aside className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border bg-card/60 p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold text-foreground border-b border-border/60 pb-3">
              <span className="flex items-center gap-1.5 text-accent-ink">
                <span className="pulse-dot" /> 실시간 센서
              </span>
              <span className="text-warning font-mono">99.1%</span>
            </div>

            <div className="mt-5 space-y-4 text-xs font-medium">
              <div>
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>커서 흔들림</span>
                  <span className="text-foreground font-bold">{directionChanges > 2 ? '고민 발생' : '안정적'}</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-accent-ink transition-all"
                    style={{ width: `${Math.min(100, Math.max(20, directionChanges * 25))}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>선택 번복 신호</span>
                  <span className="text-foreground font-bold">{changeCount > 0 ? '재고민' : '직진형'}</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-warning transition-all"
                    style={{ width: `${changeCount > 0 ? 88 : 30}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>선택지 탐색</span>
                  <span className="text-foreground font-bold font-mono">{hoverLogs?.length || 0}회 이벤트</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-foreground transition-all"
                    style={{ width: `${Math.min(100, (hoverLogs?.length || 0) * 20)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card/40 p-5">
            <Keyboard className="mb-2.5 w-4 h-4 text-warning" />
            <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-300 font-medium">
              숫자키 <span className="text-foreground font-extrabold">1 — 7</span> 로 즉시 선택하고,{' '}
              <span className="text-foreground font-extrabold">Enter</span> 또는{' '}
              <span className="text-foreground font-extrabold">→</span> 로 빠르게 다음으로 이동할 수 있습니다.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
