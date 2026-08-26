'use client';

import { useRouter } from 'next/navigation';

import { TestCatalogGrid } from '@/components/TestCatalogGrid';
import { TestIntro } from '@/components/TestIntro';

export default function Page() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/test');
  };

  const handleScrollToCatalog = () => {
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
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

          <button
            type="button"
            onClick={handleScrollToCatalog}
            className="text-xs font-semibold text-slate-400 hover:text-white px-3.5 py-1.5 rounded-full bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-all cursor-pointer touch-manipulation"
          >
            검사 목록 둘러보기
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-4 py-8 sm:py-12 space-y-16">
        {/* Featured Test Hero (MBTI) */}
        <section className="w-full">
          <TestIntro onStart={handleStart} onExploreCatalog={handleScrollToCatalog} />
        </section>

        {/* Multi-Test Catalog Section */}
        <section id="catalog-section" className="w-full scroll-mt-20">
          <TestCatalogGrid />
        </section>
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
