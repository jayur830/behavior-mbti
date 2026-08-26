'use client';

import { Activity, ArrowRight, Compass } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useSyncExternalStore } from 'react';

import { ResultView } from '@/components/ResultView';
import { decodeResultFromCompressedString } from '@/lib/shareResult';
import { FullAnalysisResult } from '@/types';

const emptySubscribe = () => () => {};

function useClientMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

function ResultContent() {
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
      <div className="flex flex-col items-center justify-center gap-4 text-xs font-medium text-slate-400 my-auto py-20">
        <Activity className="w-6 h-6 text-indigo-400 animate-spin" />
        <span>진단 결과 리포트를 불러오는 중입니다...</span>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto my-auto glass-card rounded-3xl">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6">
          <Activity className="w-6 h-6 text-amber-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">분석 리포트 데이터를 찾을 수 없습니다</h2>
        <p className="text-xs text-slate-400 mb-8 leading-relaxed">
          올바르지 않거나 만료된 결과 링크입니다. 지금 바로 나만의 행동 분석 MBTI 검사를 시작해보세요.
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

  return <ResultView result={result} onRestart={handleRestart} />;
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
      <header className="w-full border-b border-slate-800/60 backdrop-blur-xl sticky top-0 z-40 bg-[#0b0f17]/70">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={handleHome}
            className="flex items-center gap-3 font-semibold text-slate-100 hover:text-white transition-colors cursor-pointer touch-manipulation"
          >
            <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Compass className="w-4 h-4" />
            </div>
            <span className="tracking-tight text-base font-bold">
              Persona<span className="text-indigo-400 font-normal">Lens</span>
            </span>
          </button>

          <button
            type="button"
            onClick={handleHome}
            className="px-4 py-2 rounded-full text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all cursor-pointer touch-manipulation"
          >
            홈으로 이동
          </button>
        </div>
      </header>

      {/* Result Main View */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center gap-4 text-xs font-medium text-slate-400 my-auto py-20">
              <Activity className="w-6 h-6 text-indigo-400 animate-spin" />
              <span>진단 결과 리포트를 불러오는 중입니다...</span>
            </div>
          }
        >
          <ResultContent />
        </Suspense>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full border-t border-slate-800/50 py-8 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p>© 2026 PersonaLens. All rights reserved.</p>
          <p className="text-[11px] text-slate-500">
            본 서비스는 행동 궤적 분석을 통한 흥미 및 자기 탐색용 서비스이며, 공식 MBTI® 검사와는 무관합니다.
          </p>
        </div>
      </footer>
    </div>
  );
}
