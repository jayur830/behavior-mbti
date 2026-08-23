'use client';

import React, { useRef, useCallback } from 'react';
import { Question, QuestionBehaviorLog } from '../types';
import { LIKERT_OPTIONS } from '../data/questions';
import { useBehaviorTracker } from '../hooks/useBehaviorTracker';
import { ArrowRight, Check, Activity, Smartphone, Mouse, Keyboard } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  onNext: (log: QuestionBehaviorLog) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  currentIndex,
  totalQuestions,
  onNext,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleNextClick = useCallback(() => {
    // handled inside hook or via ref
  }, []);

  const {
    selectedVal,
    handleSelectOption,
    handleOptionMouseEnter,
    handleOptionMouseLeave,
    finalizeLog,
    changeCount,
    primaryDevice,
  } = useBehaviorTracker({
    questionId: question.id,
    containerRef,
    onAutoSubmit: () => {
      const log = finalizeLog();
      onNext(log);
    },
  });

  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  const onSubmit = () => {
    if (selectedVal === null) return;
    const log = finalizeLog();
    onNext(log);
  };

  const getCategoryLabel = (cat: Question['category']) => {
    switch (cat) {
      case 'social':
        return '사회적 상호작용 및 에너지';
      case 'cognition':
        return '인식 및 정보 수용';
      case 'decision':
        return '의사 결정 및 판단';
      case 'lifestyle':
        return '생활 양식 및 통제';
    }
  };

  const getDeviceIcon = () => {
    switch (primaryDevice) {
      case 'touch':
        return <Smartphone className="w-3 h-3 text-sky-400" />;
      case 'keyboard':
        return <Keyboard className="w-3 h-3 text-amber-400" />;
      case 'mouse':
      default:
        return <Mouse className="w-3 h-3 text-emerald-400" />;
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-2xl mx-auto bg-neutral-900/90 border border-white/[0.08] backdrop-blur-xl rounded-3xl p-6 sm:p-10 shadow-2xl transition-all duration-300 text-neutral-100 flex flex-col justify-between min-h-[480px] select-none"
    >
      {/* Top Header: Progress & Telemetry */}
      <div>
        <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-3">
          <span className="text-neutral-300 font-medium tracking-wide uppercase">
            {getCategoryLabel(question.category)}
          </span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[11px] text-neutral-300 bg-white/[0.05] px-2.5 py-0.5 rounded-full border border-white/[0.08]">
              {getDeviceIcon()}
              <span className="uppercase">{primaryDevice} TRACKING</span>
            </span>
            <span className="text-neutral-200 font-semibold">
              {String(currentIndex + 1).padStart(2, '0')} / {String(totalQuestions).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Minimal Progress Bar */}
        <div className="w-full bg-neutral-800/80 h-1 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-neutral-200 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Question Title & Description */}
        <div className="mb-10 text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-white leading-relaxed mb-3">
            {question.title}
          </h2>
          {question.description && (
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-light">
              {question.description}
            </p>
          )}
        </div>
      </div>

      {/* Likert Scale Choices */}
      <div className="my-4">
        <div className="flex justify-between items-center text-xs font-medium text-neutral-400 mb-4 px-3">
          <span className="text-rose-400 font-semibold">비동의 (아니다)</span>
          <span className="text-neutral-500 text-[11px]">중립</span>
          <span className="text-emerald-400 font-semibold">동의 (그렇다)</span>
        </div>

        <div className="flex items-center justify-between gap-1 sm:gap-2 px-2 sm:px-4 py-5 bg-neutral-950/60 rounded-2xl border border-white/[0.06]">
          {LIKERT_OPTIONS.map((opt, idx) => {
            const isSelected = selectedVal === opt.value;
            const sizeClass =
              Math.abs(opt.value) === 3
                ? 'w-11 h-11'
                : Math.abs(opt.value) === 2
                ? 'w-9 h-9'
                : opt.value === 0
                ? 'w-7 h-7'
                : 'w-8 h-8';

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
                    relative rounded-full transition-all duration-150 cursor-pointer flex items-center justify-center
                    ${sizeClass}
                    ${
                      isSelected
                        ? 'bg-neutral-100 text-neutral-950 shadow-[0_0_15px_rgba(255,255,255,0.3)] ring-2 ring-white scale-105'
                        : 'bg-neutral-900 border border-white/[0.15] hover:border-white/[0.4] text-transparent hover:scale-105'
                    }
                  `}
                >
                  {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                </button>
                <span
                  className={`text-[10px] sm:text-xs text-center transition-colors hidden sm:block ${
                    isSelected ? 'text-neutral-100 font-semibold' : 'text-neutral-500 group-hover:text-neutral-400'
                  }`}
                >
                  {opt.label}
                </span>
                {/* Keyboard Shortcut Hint */}
                <span className="hidden sm:inline text-[9px] font-mono text-neutral-600 bg-neutral-900/90 px-1.5 py-0.5 rounded border border-white/[0.05]">
                  {idx + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Action Footer & Keyboard Hint */}
      <div className="flex items-center justify-between pt-6 border-t border-white/[0.06] mt-4">
        <div className="text-xs text-neutral-400">
          {changeCount > 0 ? (
            <span className="text-amber-400 font-mono flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              선택 번복 {changeCount}회 감지됨
            </span>
          ) : (
            <span className="text-neutral-500 font-mono text-[11px] hidden sm:inline">
              단축키: <kbd className="px-1 py-0.5 rounded bg-white/[0.06] text-neutral-400">1~7</kbd> 선택,{' '}
              <kbd className="px-1 py-0.5 rounded bg-white/[0.06] text-neutral-400">Enter</kbd> 다음
            </span>
          )}
        </div>

        <button
          onClick={onSubmit}
          disabled={selectedVal === null}
          className={`
            inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-xs sm:text-sm transition-all duration-200 cursor-pointer
            ${
              selectedVal !== null
                ? 'bg-neutral-100 hover:bg-white text-neutral-950 shadow-md hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-50'
            }
          `}
        >
          <span>{currentIndex === totalQuestions - 1 ? '결과 분석하기' : '다음'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
