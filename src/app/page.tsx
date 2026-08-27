'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import Logo from '@/assets/logo.svg';
import TestCatalogGrid from '@/components/TestCatalogGrid';
import TestIntro from '@/components/TestIntro';
import ThemeToggle from '@/components/ThemeToggle';
import Button from '@/components/ui/button';

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
    <div className="min-h-screen flex flex-col justify-between selection:bg-lime-300/30 relative">
      {/* Modern Floating Navigation */}
      <header className="w-full border-b border-border backdrop-blur-xl sticky top-0 z-40 bg-background/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 font-semibold text-foreground hover:opacity-90 transition-opacity"
          >
            <Logo className="w-8 h-8 rounded-xl shadow-xs shrink-0" />
            <span className="tracking-tight text-base font-bold text-foreground">
              Persona<span className="accent-ink font-normal">Lens</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleScrollToCatalog}
              className="text-xs font-semibold px-4 py-2 rounded-full"
            >
              검사 목록 둘러보기
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-4 py-8 sm:py-12 space-y-16">
        {/* Featured Test Hero (MBTI) */}
        <section className="w-full">
          <TestIntro onStart={handleStart} onExploreCatalog={handleScrollToCatalog} />
        </section>

        {/* Multi-Test Catalog Section */}
        <div id="catalog-section" className="w-full">
          <TestCatalogGrid />
        </div>
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
