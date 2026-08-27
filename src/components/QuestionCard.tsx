'use client';

import { ArrowLeft, ArrowRight, Check, Keyboard, Mouse, Smartphone } from 'lucide-react';
import { useCallback, useRef } from 'react';

import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import Progress from '@/components/ui/progress';
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
    const log = finalizeLog();
    onNext(log);
  }, [selectedVal, finalizeLog, onNext]);

  const onGoBack = useCallback(() => {
    const log = finalizeLog();
    if (onPrev) {
      onPrev(log);
    }
  }, [finalizeLog, onPrev]);

  const getCategoryLabel = (cat: Question['category']) => {
    switch (cat) {
      case 'social':
        return '사회적 상호작용 및 에너지';
      case 'cognition':
        return '인식 및 정보 수용 방식';
      case 'decision':
        return '의사 결정 및 판단 기준';
      case 'lifestyle':
        return '생활 양식 및 계획성';
    }
  };

  const getDeviceIcon = () => {
    switch (primaryDevice) {
      case 'touch':
        return <Smartphone className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />;
      case 'keyboard':
        return <Keyboard className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />;
      case 'mouse':
      default:
        return <Mouse className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />;
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-2xl mx-auto glass-card rounded-3xl p-6 sm:p-10 shadow-2xl transition-all duration-300 text-foreground flex flex-col justify-between min-h-125"
    >
      {/* Top Header: Progress & Category */}
      <div>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4 font-medium">
          <Badge variant="indigo" className="font-medium">
            {getCategoryLabel(question.category)}
          </Badge>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1.5 text-xs font-normal">
              {getDeviceIcon()}
              <span>{primaryDevice === 'touch' ? '터치 감지' : '움직임 분석 중'}</span>
            </Badge>
            <span className="font-semibold text-sm">
              <span className="text-foreground">{currentIndex + 1}</span>
              <span className="text-muted-foreground font-normal"> / {totalQuestions}</span>
            </span>
          </div>
        </div>

        {/* Smooth Modern Progress Bar */}
        <div className="mb-8">
          <Progress value={progressPercent} className="h-1.5 bg-muted" />
        </div>

        {/* Question Text */}
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-relaxed tracking-tight">
            {question.title}
          </h2>
          {question.description && (
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-2 font-normal">
              {question.description}
            </p>
          )}
        </div>
      </div>

      {/* Likert Scale Choices */}
      <div className="my-auto py-4">
        <div className="flex justify-between items-center text-xs font-semibold mb-4 px-2">
          <span className="text-rose-500 dark:text-rose-400">비동의 (그렇지 않다)</span>
          <span className="text-muted-foreground font-normal text-[11px]">중립</span>
          <span className="text-indigo-600 dark:text-indigo-400">동의 (매우 그렇다)</span>
        </div>

        <div className="flex items-center justify-between gap-1.5 sm:gap-3 px-3 sm:px-6 py-6 bg-slate-100/80 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800/80 backdrop-blur-md">
          {LIKERT_OPTIONS.map((opt, idx) => {
            const isSelected = selectedVal === opt.value;
            const sizeClass =
              Math.abs(opt.value) === 3
                ? 'w-12 h-12 sm:w-13 sm:h-13'
                : Math.abs(opt.value) === 2
                  ? 'w-10 h-10 sm:w-11 sm:h-11'
                  : opt.value === 0
                    ? 'w-8 h-8 sm:w-9 sm:h-9'
                    : 'w-9 h-9 sm:w-10 sm:h-10';

            return (
              <div
                key={opt.value}
                className="flex flex-col items-center gap-2 group flex-1"
                onMouseEnter={() => handleOptionMouseEnter(opt.value)}
                onMouseLeave={() => handleOptionMouseLeave(opt.value)}
              >
                <Button
                  aria-label={opt.label}
                  onClick={() => handleSelectOption(opt.value, 'mouse')}
                  className={`
                    relative rounded-full transition-all duration-200 p-0 flex items-center justify-center touch-manipulation shadow-xs
                    ${sizeClass}
                    ${
                      isSelected
                        ? 'bg-linear-to-tr from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/40 ring-4 ring-indigo-500/20 scale-110 hover:from-indigo-600 hover:to-violet-600'
                        : 'bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700/60 hover:border-indigo-400 text-transparent hover:scale-105 active:scale-95 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }
                  `}
                >
                  {isSelected && <Check className="w-5 h-5 stroke-3 text-white" />}
                </Button>
                <span
                  className={`text-[11px] sm:text-xs text-center transition-colors hidden sm:block ${
                    isSelected
                      ? 'text-indigo-600 dark:text-indigo-300 font-semibold'
                      : 'text-muted-foreground group-hover:text-foreground'
                  }`}
                >
                  {opt.label}
                </span>
                {/* Keyboard Shortcut Hint */}
                <span className="hidden sm:inline text-[9px] text-muted-foreground bg-white dark:bg-slate-800/80 px-1.5 py-0.5 rounded border border-border shadow-xs">
                  {idx + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Navigation Controls */}
      <div className="flex items-center justify-between pt-6 border-t border-border mt-6">
        {currentIndex > 0 ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onGoBack}
            className="flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>이전 문항</span>
          </Button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-3">
          <Button
            type="button"
            disabled={selectedVal === null}
            onClick={onSubmit}
            variant={selectedVal !== null ? 'gradient' : 'secondary'}
            className="rounded-full px-6 py-3 text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/25"
          >
            <span>{currentIndex + 1 === totalQuestions ? '결과 분석하기' : '다음 문항'}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
