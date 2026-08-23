'use client';

import React, { useRef } from 'react';
import { Question, QuestionBehaviorLog } from '../types';
import { LIKERT_OPTIONS } from '../data/questions';
import { useBehaviorTracker } from '../hooks/useBehaviorTracker';
import { ArrowRight, Activity, HelpCircle, CheckCircle2 } from 'lucide-react';

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
  const {
    selectedVal,
    handleSelectOption,
    handleOptionMouseEnter,
    handleOptionMouseLeave,
    finalizeLog,
    changeCount,
  } = useBehaviorTracker({ questionId: question.id, containerRef });

  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  const handleNextClick = () => {
    if (selectedVal === null) return;
    const log = finalizeLog();
    onNext(log);
  };

  const getCategoryLabel = (cat: Question['category']) => {
    switch (cat) {
      case 'social':
        return '대인 관계 및 에너지';
      case 'cognition':
        return '인식 및 사고 방식';
      case 'decision':
        return '판단 및 의사 결정';
      case 'lifestyle':
        return '생활 양식 및 계획성';
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-2xl mx-auto bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-300 text-slate-100 flex flex-col justify-between min-h-[460px]"
    >
      {/* Top Header: Progress & Tracking Indicator */}
      <div>
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-semibold text-indigo-400 uppercase tracking-wider">
            {getCategoryLabel(question.category)}
          </span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-emerald-400/90 font-mono bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-800/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              행동 로그 기록 중
            </span>
            <span className="font-mono text-slate-300 font-bold">
              {currentIndex + 1} / {totalQuestions}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-2 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Question Title */}
        <div className="mb-8 text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-white leading-relaxed mb-2">
            {question.title}
          </h2>
          {question.description && (
            <p className="text-sm text-slate-400 flex items-center gap-1.5 justify-center sm:justify-start">
              <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" />
              {question.description}
            </p>
          )}
        </div>
      </div>

      {/* Likert Scale Choices */}
      <div className="my-6">
        <div className="flex justify-between items-center text-xs sm:text-sm font-semibold mb-4 px-2">
          <span className="text-rose-400">비동의 (아니다)</span>
          <span className="text-slate-500">중립</span>
          <span className="text-emerald-400">동의 (그렇다)</span>
        </div>

        <div className="flex items-center justify-between gap-1 sm:gap-2 px-1 py-4 bg-slate-950/50 rounded-2xl border border-slate-800/60">
          {LIKERT_OPTIONS.map((opt) => {
            const isSelected = selectedVal === opt.value;
            return (
              <div
                key={opt.value}
                className="flex flex-col items-center gap-2 group flex-1"
                onMouseEnter={() => handleOptionMouseEnter(opt.value)}
                onMouseLeave={() => handleOptionMouseLeave(opt.value)}
              >
                <button
                  type="button"
                  onClick={() => handleSelectOption(opt.value)}
                  className={`
                    relative rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center
                    ${isSelected ? 'scale-110 shadow-lg ring-4 ring-offset-2 ring-offset-slate-900' : 'hover:scale-105 opacity-70 hover:opacity-100'}
                  `}
                  style={{
                    width: opt.value === -3 || opt.value === 3 ? '42px' : opt.value === -2 || opt.value === 2 ? '36px' : opt.value === 0 ? '28px' : '32px',
                    height: opt.value === -3 || opt.value === 3 ? '42px' : opt.value === -2 || opt.value === 2 ? '36px' : opt.value === 0 ? '28px' : '32px',
                    backgroundColor: isSelected ? opt.color : 'transparent',
                    border: `2.5px solid ${opt.color}`,
                    borderColor: opt.color,
                  }}
                >
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-slate-950 stroke-[3]" />}
                </button>
                <span
                  className={`text-[10px] sm:text-xs text-center transition-colors hidden sm:block ${
                    isSelected ? 'text-white font-bold' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                >
                  {opt.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
        <div className="text-xs text-slate-400">
          {changeCount > 0 && (
            <span className="text-amber-400 font-medium flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" />
              선택지 {changeCount}번 수정됨 (망설임 감지)
            </span>
          )}
        </div>

        <button
          onClick={handleNextClick}
          disabled={selectedVal === null}
          className={`
            inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer
            ${
              selectedVal !== null
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
            }
          `}
        >
          <span>{currentIndex === totalQuestions - 1 ? '결과 분석하기' : '다음 문항'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
