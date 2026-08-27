import type { Metadata } from 'next';
import Link from 'next/link';

import ResultView from '@/components/ResultView';
import ThemeToggle from '@/components/ThemeToggle';
import Button from '@/components/ui/button';
import { getResultFromDb } from '@/lib/db';
import { decodeResultFromCompressedString } from '@/lib/shareResult';
import type { FullAnalysisResult, PageProps } from '@/types';

/**
 * /s/[hash] 동적 라우트 URL 파라미터(params) 인터페이스
 */
export interface ShareRouteParams {
  /** DB에 저장된 단축 식별자(5~15자) 또는 압축 인코딩된 결과 해시 문자열 */
  hash: string;
}

/**
 * /s/[hash] 공유 결과 페이지 Props 타입
 */
export type Props = PageProps<ShareRouteParams>;

async function resolveResult(hash: string): Promise<FullAnalysisResult | null> {
  if (!hash) return null;

  // 1. If it's a short 5~15 char ID, try fetching from persona.mbti_results DB first
  if (hash.length <= 15) {
    const fromDb = await getResultFromDb(hash);
    if (fromDb) return fromDb;
  }

  // 2. Fallback to stateless encrypted hash decoding
  return decodeResultFromCompressedString(hash);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { hash } = (await params) || { hash: '' };
  const decoded = await resolveResult(hash);

  if (!decoded) {
    return {
      title: 'PersonaLens | 친구의 무의식 행동 성향 리포트',
      description: '친구의 마우스 궤적과 고민 시간으로 도출된 무의식 성향 분석 결과를 확인해보세요!',
    };
  }

  const title = `[${decoded.mbti} · ${decoded.behaviorPersona?.title || '성격 진단'}] 친구의 무의식 행동 MBTI 분석 리포트 | PersonaLens`;
  const description = `${decoded.mbtiTitle || 'MBTI 분석'} | 종합 확신도 ${decoded.overallCertainty || 85}% · 총 소요 시간 ${((decoded.totalTestDuration || 45000) / 1000).toFixed(1)}초`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://mbti.opentoyapp.kr/s/${hash}`,
      siteName: 'PersonaLens',
      locale: 'ko_KR',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function Page({ params }: Props) {
  const { hash } = (await params) || { hash: '' };
  const result = await resolveResult(hash);

  if (!result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6">
          <span className="text-2xl font-black text-amber-400">?</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">분석 리포트를 찾을 수 없습니다</h1>
        <p className="text-sm text-slate-400 max-w-md mb-8">
          링크가 만료되었거나 올바르지 않은 주소입니다. 지금 나만의 무의식 행동 MBTI를 직접 검사해보세요!
        </p>
        <Button asChild variant="gradient" size="lg" className="rounded-full px-6 py-3 font-semibold text-sm">
          <Link href="/test">
            <span>내 성향 직접 검사해보기</span>
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-indigo-500/20 selection:text-indigo-200">
      {/* Navigation Header */}
      <header className="w-full border-b border-border backdrop-blur-xl sticky top-0 z-40 bg-background/80">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 font-semibold text-foreground hover:text-indigo-500 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <span className="font-bold text-sm">PL</span>
            </div>
            <span className="tracking-tight text-base font-bold text-foreground">
              Persona<span className="text-indigo-500 dark:text-indigo-400 font-normal">Lens</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="gradient" size="sm" className="rounded-full px-4 py-2 text-xs font-semibold">
              <Link href="/test">
                <span>나도 검사하기</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Shared Result View */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <ResultView result={result} isSharedView />
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
