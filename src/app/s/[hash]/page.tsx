import { Activity, ArrowRight, Compass } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

import { ResultView } from '../../../components/ResultView';
import { getResultFromDb } from '../../../lib/db';
import { decodeResultFromCompressedString } from '../../../lib/shareResult';
import { FullAnalysisResult } from '../../../types';

interface Props {
  params: Promise<{ hash: string }>;
}

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
  const { hash } = await params;
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

export default async function ShortLinkPage({ params }: Props) {
  const { hash } = await params;
  const decoded = await resolveResult(hash);

  if (!decoded) {
    return (
      <div className="min-h-screen bg-[#090a0f] text-neutral-100 flex flex-col justify-between selection:bg-neutral-200 selection:text-neutral-900 bg-grid-pattern relative">
        <header className="w-full border-b border-white/[0.06] backdrop-blur-md sticky top-0 z-40 bg-[#090a0f]/80">
          <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2.5 font-mono text-sm tracking-widest text-neutral-200 hover:text-white transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-white/[0.08] border border-white/[0.1] flex items-center justify-center text-neutral-100">
                <Compass className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="font-bold">
                PERSONA<span className="text-neutral-500">LENS</span>
              </span>
            </Link>
          </div>
        </header>

        <main className="flex-1 flex flex-col justify-center items-center px-4 py-8">
          <div className="flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto my-auto">
            <div className="w-12 h-12 rounded-full border border-white/[0.1] bg-neutral-900 flex items-center justify-center mb-6">
              <Activity className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">분석 리포트 데이터를 찾을 수 없습니다</h2>
            <p className="text-xs text-neutral-400 mb-8 leading-relaxed">
              만료되었거나 유효하지 않은 결과 링크입니다. 지금 바로 나만의 행동 분석 MBTI 검사를 시작해보세요!
            </p>
            <Link
              href="/test"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-xs sm:text-sm bg-neutral-100 hover:bg-white text-neutral-950 shadow-md transition-all cursor-pointer touch-manipulation"
            >
              <span>MBTI 검사 시작하기</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-indigo-500/20 selection:text-indigo-200 relative">
      <header className="w-full border-b border-slate-800/60 backdrop-blur-xl sticky top-0 z-40 bg-[#0b0f17]/70">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 font-semibold text-slate-100 hover:text-white transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-indigo-400 font-bold text-sm tracking-tighter shadow-xs">
              P
            </div>
            <span className="tracking-tight text-base font-bold">
              Persona<span className="text-indigo-400 font-normal">Lens</span>
            </span>
          </Link>

          <Link
            href="/test"
            className="px-4 py-2 rounded-full text-xs font-semibold bg-white hover:bg-slate-100 text-slate-950 transition-all cursor-pointer touch-manipulation"
          >
            나도 검사하기
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center items-center px-4 py-10">
        <ResultView result={decoded} isSharedView={true} />
      </main>

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
