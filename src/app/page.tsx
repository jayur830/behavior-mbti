'use client';

import React, { useState } from 'react';
import { QUESTIONS } from '../data/questions';
import { QuestionBehaviorLog, FullAnalysisResult } from '../types';
import { analyzeBehaviorAndMBTI } from '../lib/analyzer';
import { TestIntro } from '../components/TestIntro';
import { QuestionCard } from '../components/QuestionCard';
import { ResultView } from '../components/ResultView';
import { Compass, Activity } from 'lucide-react';

export default function Home() {
  const [step, setStep] = useState<'intro' | 'test' | 'analyzing' | 'result'>('intro');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [behaviorLogs, setBehaviorLogs] = useState<QuestionBehaviorLog[]>([]);
  const [analysisResult, setAnalysisResult] = useState<FullAnalysisResult | null>(null);

  const handleStartTest = () => {
    setBehaviorLogs([]);
    setCurrentQuestionIdx(0);
    setAnalysisResult(null);
    setStep('test');
  };

  const handleQuestionNext = (log: QuestionBehaviorLog) => {
    const updatedLogs = [...behaviorLogs, log];
    setBehaviorLogs(updatedLogs);

    if (currentQuestionIdx + 1 < QUESTIONS.length) {
      setCurrentQuestionIdx((prev) => prev + 1);
    } else {
      setStep('analyzing');
      setTimeout(() => {
        try {
          const result = analyzeBehaviorAndMBTI(updatedLogs);
          setAnalysisResult(result);
          setStep('result');
        } catch (err) {
          console.error('Error analyzing behavioral data:', err);
          const fallbackResult = analyzeBehaviorAndMBTI(updatedLogs);
          setAnalysisResult(fallbackResult);
          setStep('result');
        }
      }, 1200);
    }
  };

  const handleRestart = () => {
    setStep('intro');
    setBehaviorLogs([]);
    setCurrentQuestionIdx(0);
    setAnalysisResult(null);
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-neutral-100 flex flex-col justify-between selection:bg-neutral-200 selection:text-neutral-900 bg-grid-pattern relative">
      {/* Navigation Header */}
      <header className="w-full border-b border-white/[0.06] backdrop-blur-md sticky top-0 z-40 bg-[#090a0f]/80">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={handleRestart}
            className="flex items-center gap-2.5 font-mono text-sm tracking-widest text-neutral-200 hover:text-white transition-colors cursor-pointer touch-manipulation"
          >
            <div className="w-7 h-7 rounded-lg bg-white/[0.08] border border-white/[0.1] flex items-center justify-center text-neutral-100">
              <Compass className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="font-bold">BEHAVIOR<span className="text-neutral-500">.MBTI</span></span>
          </button>

          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">TELEMETRY ONLINE</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-8">
        {step === 'intro' && <TestIntro onStart={handleStartTest} />}

        {step === 'test' && (
          <QuestionCard
            key={QUESTIONS[currentQuestionIdx].id}
            question={QUESTIONS[currentQuestionIdx]}
            currentIndex={currentQuestionIdx}
            totalQuestions={QUESTIONS.length}
            onNext={handleQuestionNext}
          />
        )}

        {step === 'analyzing' && (
          <div className="flex flex-col items-center justify-center text-center p-8 max-w-sm animate-fade-in">
            <div className="w-12 h-12 rounded-full border border-white/[0.1] bg-neutral-900 flex items-center justify-center mb-6 shadow-inner">
              <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5 font-mono">
              ANALYZING TELEMETRY...
            </h3>
            <p className="text-xs text-neutral-400 font-light leading-relaxed">
              마우스 궤적, 문항별 체류 시간, 세부 상호작용 데이터를 종합하여 무의식적 성향을 분석하고 있습니다.
            </p>
          </div>
        )}

        {step === 'result' && analysisResult && (
          <ResultView result={analysisResult} onRestart={handleRestart} />
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="w-full border-t border-white/[0.04] py-6 text-center text-xs text-neutral-500 font-mono">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 BEHAVIOR MBTI RESEARCH</span>
          <span className="text-neutral-400 text-[11px]">
            MICRO-INTERACTION BEHAVIORAL PSYCHOMETRICS
          </span>
        </div>
      </footer>
    </div>
  );
}
