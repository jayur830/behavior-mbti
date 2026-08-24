import { Metadata } from 'next';
import { decodeResultFromCompressedString } from '../../../lib/shareResult';
import { getResultFromSupabase } from '../../../lib/supabase';
import { FullAnalysisResult } from '../../../types';
import { ResultView } from '../../../components/ResultView';
import { Compass, ArrowRight, Activity } from 'lucide-react';
import Link from 'next/link';

interface Props {
  params: Promise<{ hash: string }>;
}

async function resolveResult(hash: string): Promise<FullAnalysisResult | null> {
  if (!hash) return null;

  // 1. If it's a short 5~15 char ID, try fetching from Supabase DB first
  if (hash.length <= 15) {
    const fromDb = await getResultFromSupabase(hash);
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
      title: 'Behavior MBTI | 친구의 무의식 행동 심리 진단서',
      description: '친구의 마우스 궤적과 고민 시간으로 도출된 무의식 MBTI 결과를 확인해보세요!',
    };
  }

  const title = `[${decoded.mbti} · ${decoded.behaviorPersona.title}] 친구의 무의식 행동 MBTI 진단서`;
  const description = `${decoded.mbtiTitle} | 종합 확신도 ${decoded.overallCertainty}% · 고민 속도 상위 ${decoded.benchmark.dwellTimePercentile}%`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://mbti.opentoyapp.kr/s/${hash}`,
      siteName: 'Behavior MBTI',
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
                BEHAVIOR<span className="text-neutral-500">.MBTI</span>
              </span>
            </Link>
          </div>
        </header>

        <main className="flex-1 flex flex-col justify-center items-center px-4 py-8">
          <div className="flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto my-auto">
            <div className="w-12 h-12 rounded-full border border-white/[0.1] bg-neutral-900 flex items-center justify-center mb-6">
              <Activity className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">진단서 데이터를 찾을 수 없습니다</h2>
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
              BEHAVIOR<span className="text-neutral-500">.MBTI</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">SHARED PREVIEW</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center items-center px-4 py-8">
        <ResultView result={decoded} isSharedView={true} onRestart={() => {}} />
      </main>

      <footer className="w-full border-t border-white/[0.04] py-6 text-center text-xs text-neutral-500 font-mono">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 BEHAVIOR MBTI RESEARCH</span>
          <span className="text-neutral-400 text-[11px]">
            MICRO-INTERACTION BEHAVIORAL PSYCHOMETRICS
          </span>
        </div>
      </footer>
    </div>
  );
}
