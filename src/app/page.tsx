'use client';

import { useRouter } from 'next/navigation';

import { TestIntro } from '../components/TestIntro';

export default function HomePage() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/test');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-indigo-500/20 selection:text-indigo-200 relative">
      {/* Modern Floating Navigation */}
      <header className="w-full border-b border-slate-800/60 backdrop-blur-xl sticky top-0 z-40 bg-[#0b0f17]/70">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 font-semibold text-slate-100">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-indigo-400 font-bold text-sm tracking-tighter shadow-xs">
              P
            </div>
            <span className="tracking-tight text-base font-bold">
              Persona<span className="text-indigo-400 font-normal">Lens</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 py-12">
        <TestIntro onStart={handleStart} />
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
