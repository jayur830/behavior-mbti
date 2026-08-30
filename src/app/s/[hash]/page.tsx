import type { Metadata } from 'next';
import Link from 'next/link';

import AppFooter from '@/components/AppFooter';
import AppHeader from '@/components/AppHeader';
import ResultView from '@/components/ResultView';
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
    alternates: {
      canonical: `https://persona.opentoyapp.kr/s/${hash}`,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url: `https://persona.opentoyapp.kr/s/${hash}`,
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
      <div className="app-shell flex min-h-screen flex-col">
        <AppHeader mode="shared" />
        <main className="analysis-state my-auto mx-auto w-full max-w-2xl border-0 bg-transparent shadow-none">
          <div>
            <div className="analysis-state__icon mx-auto">
              <span className="text-2xl font-black">?</span>
            </div>
            <h2>분석 리포트를 찾을 수 없습니다</h2>
            <p>링크가 만료되었거나 올바르지 않은 주소입니다. 지금 나만의 무의식 행동 MBTI를 직접 검사해보세요!</p>
            <Button asChild variant="gradient" size="lg" className="mt-8 rounded-full px-6 py-3 font-semibold text-sm">
              <Link href="/test">내 성향 직접 검사해보기</Link>
            </Button>
          </div>
        </main>
        <AppFooter />
      </div>
    );
  }

  return (
    <div className="app-shell flex min-h-screen flex-col">
      <AppHeader mode="shared" />

      {/* Main Shared Result View */}
      <main className="flex-1">
        <ResultView result={result} isSharedView />
      </main>

      <AppFooter />
    </div>
  );
}
