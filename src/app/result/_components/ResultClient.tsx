'use client';

import { Activity, ArrowRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useSyncExternalStore } from 'react';

import AppFooter from '@/components/AppFooter';
import AppHeader from '@/components/AppHeader';
import ResultView from '@/components/ResultView';
import Button from '@/components/ui/button';
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

export interface ResultContentProps {
  onHome: () => void;
  onRestart: () => void;
}

function ResultContent({ onHome, onRestart }: ResultContentProps) {
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

  if (!isMounted) {
    return (
      <div className="analysis-state my-auto w-full max-w-2xl border-0 bg-transparent shadow-none">
        <div>
          <div className="analysis-state__icon mx-auto">
            <Activity className="h-5 w-5 animate-pulse" />
          </div>
          <h2>리포트 데이터를 불러오는 중입니다...</h2>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="analysis-state my-auto w-full max-w-2xl border-0 bg-transparent shadow-none">
        <div>
          <div className="analysis-state__icon mx-auto">
            <span className="text-2xl font-black">?</span>
          </div>
          <h2>분석 결과를 찾을 수 없습니다</h2>
          <p>저장된 검사 세션이 만료되었거나 올바르지 않은 접근입니다. 새로운 성향 검사를 진행해보세요.</p>
          <Button
            onClick={onRestart}
            className="mt-8 inline-flex rounded-full px-6 py-3 text-xs font-semibold sm:text-sm"
          >
            <span>MBTI 검사 시작하기</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return <ResultView result={result} onRestart={onRestart} onHome={onHome} />;
}

export default function ResultClient() {
  const router = useRouter();

  const confirmLeave = (targetPath: string) => {
    const isConfirmed = window.confirm(
      '이 페이지를 나가시겠습니까?\n지금 페이지를 벗어나면 검사 결과가 사라질 수 있습니다.',
    );

    if (!isConfirmed) {
      // '아니오' 클릭 시 아무 동작도 하지 않고 현재 페이지 유지
      return;
    }

    // '네' 클릭 시: 결과 세션 정리 후 목적지 페이지로 이동 (DB row는 삭제하지 않고 유지)
    try {
      sessionStorage.removeItem('current_mbti_result');
    } catch {}

    router.push(targetPath);
  };

  const handleHome = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    confirmLeave('/');
  };

  const handleRestart = () => {
    confirmLeave('/test');
  };

  useEffect(() => {
    // 1. 브라우저 탭 닫기 / 새로고침 시 이탈 경고 (표준 preventDefault 방식)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    // 2. 브라우저 뒤로가기 버튼 감지 및 확인창 띄우기
    window.history.pushState(null, '', window.location.href);

    const handlePopState = () => {
      const isConfirmed = window.confirm(
        '이 페이지를 나가시겠습니까?\n지금 페이지를 벗어나면 검사 결과가 사라질 수 있습니다.',
      );

      if (isConfirmed) {
        try {
          sessionStorage.removeItem('current_mbti_result');
        } catch {}
        router.push('/');
      } else {
        // '아니오' 클릭 시 결과 페이지 상태 복구
        window.history.pushState(null, '', window.location.href);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router]);

  return (
    <div className="app-shell flex min-h-screen flex-col">
      <AppHeader mode="result" onLogoClick={handleHome} />

      {/* Result Main View */}
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="analysis-state my-auto border-0 bg-transparent shadow-none">
              <div className="flex flex-col items-center gap-3 text-xs text-muted-foreground">
                <Activity className="h-6 w-6 animate-spin text-emerald-500" />
                <span>진단 결과 리포트를 불러오는 중입니다...</span>
              </div>
            </div>
          }
        >
          <ResultContent onHome={handleHome} onRestart={handleRestart} />
        </Suspense>
      </main>

      <AppFooter />
    </div>
  );
}
