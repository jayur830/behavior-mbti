'use client';

import { Activity, ArrowRight, Compass } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useSyncExternalStore } from 'react';

import { ResultView } from '@/components/ResultView';
import { ThemeToggle } from '@/components/ThemeToggle';
import { decodeResultFromCompressedString } from '@/lib/shareResult';
import type { FullAnalysisResult } from '@/types';

const emptySubscribe = () => () => {};

function useClientMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

function ResultContent({ onHome }: { onHome?: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const compressedData = searchParams.get('data') || searchParams.get('r');
  const isMounted = useClientMounted();

  const result = useMemo<FullAnalysisResult | null>(() => {
    if (!isMounted) return null;

    if (compressedData) {
      const decoded = decodeResultFromCompressedString(compressedData);
      if (decoded) return decoded;
    }

    try {
      const cached = sessionStorage.getItem('current_mbti_result');
      if (cached) {
        return JSON.parse(cached) as FullAnalysisResult;
      }
    } catch (err) {
      console.error('Failed to parse cached result:', err);
    }
    return null;
  }, [compressedData, isMounted]);

  const handleRestart = () => {
    try {
      const unsavedId = sessionStorage.getItem('unsaved_mbti_id');
      if (unsavedId) {
        fetch(`/api/results?id=${encodeURIComponent(unsavedId)}`, {
          method: 'DELETE',
          keepalive: true,
        }).catch(() => {});
        sessionStorage.removeItem('unsaved_mbti_id');
      }
    } catch {}
    router.push('/test');
  };

  if (!isMounted) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="w-12 h-12 rounded-full border border-white/10 bg-neutral-900 flex items-center justify-center mb-6 shadow-inner animate-pulse">
          <Activity className="w-5 h-5 text-indigo-400" />
        </div>
        <h3 className="text-sm font-semibold text-slate-300">리포트 데이터를 불러오는 중입니다...</h3>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6">
          <span className="text-2xl font-black text-amber-400">?</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">분석 결과를 찾을 수 없습니다</h2>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          저장된 검사 세션이 만료되었거나 올바르지 않은 접근입니다. 새로운 성향 검사를 진행해보세요.
        </p>
        <button
          type="button"
          onClick={handleRestart}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-xs sm:text-sm bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 transition-all cursor-pointer touch-manipulation"
        >
          <span>MBTI 검사 시작하기</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return <ResultView result={result} onRestart={handleRestart} onHome={onHome} />;
}

export default function ResultClient() {
  const router = useRouter();

  const handleHome = () => {
    try {
      const unsavedId = sessionStorage.getItem('unsaved_mbti_id');
      if (unsavedId) {
        fetch(`/api/results?id=${encodeURIComponent(unsavedId)}`, {
          method: 'DELETE',
          keepalive: true,
        }).catch(() => {});
        sessionStorage.removeItem('unsaved_mbti_id');
      }
    } catch {}
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-indigo-500/20 selection:text-indigo-200 relative">
      {/* Navigation Header */}
      <header className="w-full border-b border-border backdrop-blur-xl sticky top-0 z-40 bg-background/80">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={handleHome}
            className="flex items-center gap-3 font-semibold text-foreground hover:text-indigo-500 transition-colors cursor-pointer touch-manipulation"
          >
            <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Compass className="w-4 h-4" />
            </div>
            <span className="tracking-tight text-base font-bold text-foreground">
              Persona<span className="text-indigo-500 dark:text-indigo-400 font-normal">Lens</span>
            </span>
          </button>

          <ThemeToggle />
        </div>
      </header>

      {/* Result Main View */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center gap-4 text-xs font-medium text-muted-foreground my-auto py-20">
              <Activity className="w-6 h-6 text-indigo-500 animate-spin" />
              <span>진단 결과 리포트를 불러오는 중입니다...</span>
            </div>
          }
        >
          <ResultContent onHome={handleHome} />
        </Suspense>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full border-t border-border py-8 text-center text-xs text-muted-foreground">
        <div className="max-w-5xl mx-auto px-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p>© 2026 PersonaLens. All rights reserved.</p>
          <p className="text-[11px] text-muted-foreground">
            본 서비스는 행동 궤적 분석을 통한 흥미 및 자기 탐색용 서비스이며, 공식 MBTI® 검사와는 무관합니다.
          </p>
        </div>
      </footer>
    </div>
  );
}
