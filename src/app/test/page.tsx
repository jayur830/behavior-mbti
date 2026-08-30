'use client';

import { Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useSyncExternalStore } from 'react';

import AppFooter from '@/components/AppFooter';
import AppHeader from '@/components/AppHeader';
import QuestionCard from '@/components/QuestionCard';
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
  const questions = useMemo<Question[]>(() => getRandomQuestions(10), []);
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
      <div className="app-shell flex min-h-screen flex-col">
        <AppHeader mode="testing" />
        <main className="analysis-state flex-1">
          <div>
            <div className="analysis-state__icon mx-auto">
              <Activity className="h-5 w-5 animate-pulse" />
            </div>
            <h2>문항 세트를 준비하고 있어요</h2>
            <p>잠시만 기다려주세요.</p>
          </div>
        </main>
        <AppFooter />
      </div>
    );
  }

  const currentLog = behaviorLogs[currentQuestionIdx];
  const activeQuestion = questions[currentQuestionIdx];

  return (
    <div className="app-shell flex min-h-screen flex-col">
      <AppHeader mode="testing" />

      <main className="test-main flex-1">
        <div className="test-main__inner">
          <aside className="test-rail" aria-label="검사 안내">
            <div>
              <p className="test-rail__eyebrow">Live session / 01</p>
              <h1>당신의 선택 리듬을 읽는 중</h1>
              <p>정답은 없습니다. 지금 가장 가까운 답을 고르면 돼요.</p>
            </div>
            <span className="status-chip status-chip--live">
              <span className="status-chip__dot" />
              비공개 분석
            </span>
            <ul className="test-rail__list">
              <li className="is-active">문항을 읽고 솔직하게 선택</li>
              <li>머뭇거림과 수정도 함께 기록</li>
              <li>완료 후 개인 리포트 확인</li>
            </ul>
          </aside>

          <div className="test-stage">
            {isAnalyzing || !isMounted || !activeQuestion ? (
              <div className="analysis-state">
                <div>
                  <div className="analysis-state__icon mx-auto">
                    <Activity className="h-5 w-5 animate-pulse" />
                  </div>
                  <h2>선택의 리듬을 분석하고 있어요</h2>
                  <p>마우스 궤적, 체류 시간, 상호작용 데이터를 종합해 나만의 리포트를 만드는 중입니다.</p>
                </div>
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
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
