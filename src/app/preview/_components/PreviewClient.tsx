'use client';

import { Activity, ArrowRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import AppFooter from '@/components/AppFooter';
import AppHeader from '@/components/AppHeader';
import ResultView from '@/components/ResultView';
import Button from '@/components/ui/button';
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
      <div className="analysis-state my-auto w-full max-w-2xl border-0 bg-transparent shadow-none">
        <div>
          <div className="analysis-state__icon mx-auto">
            <Activity className="h-5 w-5" />
          </div>
          <h2>공유된 분석 리포트를 찾을 수 없습니다</h2>
          <p>올바르지 않거나 손상된 결과 링크입니다. 지금 바로 나만의 행동 분석 MBTI 검사를 시작해보세요!</p>
          <Button
            onClick={handleGoTest}
            className="mt-8 inline-flex rounded-full px-6 py-3 text-xs font-semibold sm:text-sm"
          >
            <span>MBTI 검사 시작하기</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return <ResultView result={result} isSharedView={true} onRestart={handleGoTest} onHome={() => router.push('/')} />;
}

export default function PreviewClient() {
  return (
    <div className="app-shell flex min-h-screen flex-col">
      <AppHeader mode="shared" />

      {/* Main Content Area */}
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="analysis-state my-auto border-0 bg-transparent shadow-none text-xs">
              LOADING SHARED REPORT...
            </div>
          }
        >
          <PreviewContent />
        </Suspense>
      </main>

      <AppFooter />
    </div>
  );
}
