'use client';

import { ArrowLeft, ArrowRight, Check, Keyboard, Mouse, Smartphone } from 'lucide-react';
import type { FC } from 'react';
import { useCallback, useRef } from 'react';

import { LIKERT_OPTIONS } from '@/data/questions';
import { useBehaviorTracker } from '@/hooks/useBehaviorTracker';
import type { Question, QuestionBehaviorLog } from '@/types';

export interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  initialValue?: number | null;
  existingLog?: QuestionBehaviorLog | null;
  onNext: (log: QuestionBehaviorLog) => void;
  onPrev?: (log: QuestionBehaviorLog) => void;
}

export const QuestionCard: FC<QuestionCardProps> = ({
  question,
  currentIndex,
  totalQuestions,
  initialValue = null,
  existingLog = null,
  onNext,
  onPrev,
}) => {
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
        return <Smartphone className="w-3.5 h-3.5 text-indigo-400" />;
      case 'keyboard':
        return <Keyboard className="w-3.5 h-3.5 text-indigo-400" />;
      case 'mouse':
      default:
        return <Mouse className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-2xl mx-auto glass-card rounded-3xl p-6 sm:p-10 shadow-2xl transition-all duration-300 text-slate-100 flex flex-col justify-between min-h-125"
    >
      {/* Top Header: Progress & Category */}
      <div>
        <div className="flex items-center justify-between text-xs text-slate-400 mb-4 font-medium">
          <span className="text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            {getCategoryLabel(question.category)}
          </span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700/60">
              {getDeviceIcon()}
              <span>{primaryDevice === 'touch' ? '터치 감지' : '움직임 분석 중'}</span>
            </span>
            <span className="text-slate-300 font-semibold text-sm">
              <span className="text-white">{currentIndex + 1}</span>
              <span className="text-slate-500 font-normal"> / {totalQuestions}</span>
            </span>
          </div>
        </div>

        {/* Smooth Modern Progress Bar */}
        <div className="w-full bg-slate-800/60 h-1.5 rounded-full mb-8 overflow-hidden">
          <div
            className="bg-linear-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Question Text */}
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white leading-relaxed tracking-tight">{question.title}</h2>
          {question.description && (
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mt-2 font-normal">{question.description}</p>
          )}
        </div>
      </div>

      {/* Likert Scale Choices */}
      <div className="my-auto py-4">
        <div className="flex justify-between items-center text-xs font-semibold mb-4 px-2">
          <span className="text-rose-400">비동의 (그렇지 않다)</span>
          <span className="text-slate-500 font-normal text-[11px]">중립</span>
          <span className="text-indigo-400">동의 (매우 그렇다)</span>
        </div>

        <div className="flex items-center justify-between gap-1.5 sm:gap-3 px-3 sm:px-6 py-6 bg-slate-900/60 rounded-2xl border border-slate-800/80 backdrop-blur-md">
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
                <button
                  type="button"
                  onClick={() => handleSelectOption(opt.value, 'mouse')}
                  className={`
                    relative rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center touch-manipulation
                    ${sizeClass}
                    ${
                      isSelected
                        ? 'bg-linear-to-tr from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/40 ring-4 ring-indigo-500/20 scale-110'
                        : 'bg-slate-800/80 border border-slate-700/60 hover:border-indigo-400/50 hover:bg-slate-750 text-transparent hover:scale-105 active:scale-95'
                    }
                  `}
                >
                  {isSelected && <Check className="w-5 h-5 stroke-3" />}
                </button>
                <span
                  className={`text-[11px] sm:text-xs text-center transition-colors hidden sm:block ${
                    isSelected ? 'text-indigo-300 font-semibold' : 'text-slate-500 group-hover:text-slate-400'
                  }`}
                >
                  {opt.label}
                </span>
                {/* Keyboard Shortcut Hint */}
                <span className="hidden sm:inline text-[9px] text-slate-500 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/40">
                  {idx + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Navigation Controls */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-800/60 mt-6">
        {currentIndex > 0 ? (
          <button
            type="button"
            onClick={onGoBack}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors cursor-pointer touch-manipulation"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>이전 문항</span>
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={selectedVal === null}
            onClick={onSubmit}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer touch-manipulation select-none ${
              selectedVal !== null
                ? 'bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-slate-800/60 text-slate-500 cursor-not-allowed border border-slate-700/40'
            }`}
          >
            <span>{currentIndex + 1 === totalQuestions ? '결과 분석하기' : '다음 문항'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
