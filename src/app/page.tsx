'use client';

import React, { useState } from 'react';
import { QUESTIONS } from '../data/questions';
import { QuestionBehaviorLog, FullAnalysisResult } from '../types';
import { analyzeBehaviorAndMBTI } from '../lib/analyzer';
import { TestIntro } from '../components/TestIntro';
import { QuestionCard } from '../components/QuestionCard';
import { ResultView } from '../components/ResultView';
import { BrainCircuit, Activity, Sparkles } from 'lucide-react';

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
      // Finished all questions -> show analyzing transition
      setStep('analyzing');
      setTimeout(() => {
        const result = analyzeBehaviorAndMBTI(updatedLogs);
        setAnalysisResult(result);
        setStep('result');
      }, 1800);
    }
  };

  const handleRestart = () => {
    setStep('intro');
    setBehaviorLogs([]);
    setCurrentQuestionIdx(0);
    setAnalysisResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-900/20 via-purple-900/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Navigation Header */}
      <header className="w-full border-b border-slate-800/60 backdrop-blur-md sticky top-0 z-40 bg-slate-950/70">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div
            onClick={handleRestart}
            className="flex items-center gap-2.5 font-extrabold text-lg sm:text-xl tracking-tight cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
              BEHAVIOR MBTI
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">Micro-interaction Tracking Engine Active</span>
            <span className="sm:hidden">Engine Active</span>
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
          <div className="flex flex-col items-center justify-center text-center p-8 max-w-md animate-fade-in">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              <div className="absolute inset-2 rounded-full border-4 border-purple-500/20 border-b-purple-500 animate-spin-reverse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Activity className="w-8 h-8 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">마우스 행동 데이터 종합 분석 중</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              마우스 궤적 흔적, 옵션 체류 시간, 답변 수정 패턴, 망설임 지수를 역추적하여 진짜 성향을 계산하고 있습니다...
            </p>
          </div>
        )}

        {step === 'result' && analysisResult && (
          <ResultView result={analysisResult} onRestart={handleRestart} />
        )}
      </main>

      {/* Global Footer */}
      <footer className="w-full border-t border-slate-800/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 Behavior MBTI Lab. All rights reserved.</span>
          <span className="flex items-center gap-1 text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Micro-interaction Psycho-Analysis
          </span>
        </div>
      </footer>
    </div>
  );
}
