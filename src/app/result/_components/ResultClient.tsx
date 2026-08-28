'use client';

import { Activity, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useSyncExternalStore } from 'react';

import Logo from '@/assets/logo.svg';
import ResultView from '@/components/ResultView';
import ThemeToggle from '@/components/ThemeToggle';
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
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="w-12 h-12 rounded-full border border-white/10 bg-neutral-900 flex items-center justify-center mb-6 shadow-inner animate-pulse">
          <Activity className="w-5 h-5 text-emerald-400" />
        </div>
        <h3 className="text-sm font-semibold text-muted-foreground">리포트 데이터를 불러오는 중입니다...</h3>
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
        <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
          저장된 검사 세션이 만료되었거나 올바르지 않은 접근입니다. 새로운 성향 검사를 진행해보세요.
        </p>
        <Button
          onClick={onRestart}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-xs sm:text-sm bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25 transition-all"
        >
          <span>MBTI 검사 시작하기</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
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
    <div className="min-h-screen flex flex-col justify-between selection:bg-emerald-500/20 selection:text-emerald-300 dark:selection:text-emerald-200 relative">
      {/* Navigation Header */}
      <header className="w-full border-b border-border backdrop-blur-xl sticky top-0 z-40 bg-background/80">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            onClick={handleHome}
            className="flex items-center gap-3 font-semibold text-foreground hover:opacity-90 transition-opacity"
          >
            <Logo className="w-8 h-8 rounded-xl shrink-0" />
            <span className="tracking-tight text-base font-bold text-foreground">
              Persona<span className="accent-ink font-normal">Lens</span>
            </span>
          </Link>

          <ThemeToggle />
        </div>
      </header>

      {/* Result Main View */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center gap-4 text-xs font-medium text-muted-foreground my-auto py-20">
              <Activity className="w-6 h-6 text-emerald-500 animate-spin" />
              <span>진단 결과 리포트를 불러오는 중입니다...</span>
            </div>
          }
        >
          <ResultContent onHome={handleHome} onRestart={handleRestart} />
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
