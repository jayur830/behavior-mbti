'use client';

import { Activity, ArrowRight, Compass } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import { ResultView } from '@/components/ResultView';
import { decodeResultFromCompressedString } from '@/lib/shareResult';

function PreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const compressedData = searchParams.get('data') || searchParams.get('r');

  const result = compressedData ? decodeResultFromCompressedString(compressedData) : null;

  const handleGoTest = () => {
    router.push('/test');
  };

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto my-auto">
        <div className="w-12 h-12 rounded-full border border-white/10 bg-neutral-900 flex items-center justify-center mb-6">
          <Activity className="w-5 h-5 text-amber-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">공유된 분석 리포트를 찾을 수 없습니다</h2>
        <p className="text-xs text-neutral-400 mb-8 leading-relaxed">
          올바르지 않거나 손상된 결과 링크입니다. 지금 바로 나만의 행동 분석 MBTI 검사를 시작해보세요!
        </p>
        <button
          type="button"
          onClick={handleGoTest}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-xs sm:text-sm bg-neutral-100 hover:bg-white text-neutral-950 shadow-md transition-all cursor-pointer touch-manipulation"
        >
          <span>MBTI 검사 시작하기</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return <ResultView result={result} isSharedView={true} onRestart={handleGoTest} />;
}

export default function PreviewClient() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#090a0f] text-neutral-100 flex flex-col justify-between selection:bg-neutral-200 selection:text-neutral-900 bg-grid-pattern relative">
      {/* Navigation Header */}
      <header className="w-full border-b border-white/6 backdrop-blur-md sticky top-0 z-40 bg-[#090a0f]/80">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex items-center gap-2.5 font-mono text-sm tracking-widest text-neutral-200 hover:text-white transition-colors cursor-pointer touch-manipulation"
          >
            <div className="w-7 h-7 rounded-lg bg-white/8 border border-white/10 flex items-center justify-center text-neutral-100">
              <Compass className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="font-bold">
              PERSONA<span className="text-neutral-500">LENS</span>
            </span>
          </button>

          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">SHARED PREVIEW</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-8">
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-12 text-xs font-mono text-neutral-400">
              LOADING SHARED REPORT...
            </div>
          }
        >
          <PreviewContent />
        </Suspense>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full border-t border-white/4 py-6 text-center text-xs text-neutral-500 font-mono">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 PersonaLens. All rights reserved.</span>
          <span className="text-neutral-500 text-[11px]">BEHAVIORAL INTERACTION ANALYSIS</span>
        </div>
      </footer>
    </div>
  );
}
