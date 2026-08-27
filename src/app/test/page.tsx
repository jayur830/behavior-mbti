'use client';

import { Activity, Compass } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useSyncExternalStore } from 'react';

import QuestionCard from '@/components/QuestionCard';
import ThemeToggle from '@/components/ThemeToggle';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { getRandomQuestions } from '@/data/questions';
import { analyzeBehaviorAndMBTI } from '@/lib/analyzer';
import type { Question, QuestionBehaviorLog } from '@/types';

const emptySubscribe = () => () => {};

export default function Page() {
  const router = useRouter();
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const [questions] = useState<Question[]>(() => getRandomQuestions(10));
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [behaviorLogs, setBehaviorLogs] = useState<(QuestionBehaviorLog | null)[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const handleQuestionNext = (log: QuestionBehaviorLog) => {
    const updated = [...behaviorLogs];
    updated[currentQuestionIdx] = log;
    setBehaviorLogs(updated);

    if (currentQuestionIdx + 1 < questions.length) {
      setCurrentQuestionIdx((prev) => prev + 1);
    } else {
      // Completed all questions
      setIsAnalyzing(true);
      const validLogs = updated.filter((l): l is QuestionBehaviorLog => l !== null);

      setTimeout(() => {
        try {
          const result = analyzeBehaviorAndMBTI(validLogs, questions);
          if (typeof window !== 'undefined') {
            try {
              sessionStorage.setItem('current_mbti_result', JSON.stringify(result));
            } catch {}
          }
          router.push('/result');
        } catch (err) {
          console.error('Error analyzing behavioral data:', err);
          const fallbackResult = analyzeBehaviorAndMBTI(validLogs, questions);
          if (typeof window !== 'undefined') {
            try {
              sessionStorage.setItem('current_mbti_result', JSON.stringify(fallbackResult));
            } catch {}
          }
          router.push('/result');
        }
      }, 1000);
    }
  };

  const handleQuestionPrev = (log: QuestionBehaviorLog) => {
    const updated = [...behaviorLogs];
    updated[currentQuestionIdx] = log;
    setBehaviorLogs(updated);

    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx((prev) => prev - 1);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#090a0f] text-neutral-100 flex flex-col justify-center items-center font-mono text-xs">
        <div className="flex items-center gap-2 text-neutral-400">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>GENERATING RANDOMIZED QUESTION SET...</span>
        </div>
      </div>
    );
  }

  const currentLog = behaviorLogs[currentQuestionIdx];
  const activeQuestion = questions[currentQuestionIdx];

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-lime-300/30 relative">
      {/* Navigation Header */}
      <header className="w-full border-b border-border backdrop-blur-xl sticky top-0 z-40 bg-background/80">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="h-auto p-0 hover:bg-transparent flex items-center gap-3 font-semibold text-foreground hover:text-emerald-500 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-xs">
              <Compass className="w-4 h-4" />
            </div>
            <span className="tracking-tight text-base font-bold text-foreground">
              Persona<span className="accent-ink font-normal">Lens</span>
            </span>
          </Button>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Badge variant="secondary" className="flex items-center gap-2 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>실시간 측정 중</span>
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-8">
        {isAnalyzing || !isMounted || !activeQuestion ? (
          <div className="flex flex-col items-center justify-center text-center p-8 max-w-sm animate-fade-in">
            <div className="w-12 h-12 rounded-full border border-border bg-card flex items-center justify-center mb-6 shadow-inner">
              <Activity className="w-5 h-5 text-emerald-500 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-foreground mb-1.5 font-mono">ANALYZING TELEMETRY...</h3>
            <p className="text-xs text-muted-foreground font-light leading-relaxed">
              마우스 궤적, 문항별 체류 시간, 세부 상호작용 데이터를 종합하여 무의식적 성향을 분석하고 있습니다.
            </p>
          </div>
        ) : (
          <QuestionCard
            key={activeQuestion.id}
            question={activeQuestion}
            currentIndex={currentQuestionIdx}
            totalQuestions={questions.length}
            initialValue={currentLog?.finalValue ?? null}
            existingLog={currentLog}
            onNext={handleQuestionNext}
            onPrev={handleQuestionPrev}
          />
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="w-full border-t border-border py-6 text-center text-xs text-muted-foreground font-mono">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 PersonaLens. All rights reserved.</span>
          <span className="text-[11px]">BEHAVIORAL INTERACTION ANALYSIS</span>
        </div>
      </footer>
    </div>
  );
}
