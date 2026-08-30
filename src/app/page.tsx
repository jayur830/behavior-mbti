'use client';

import { useRouter } from 'next/navigation';

import AppFooter from '@/components/AppFooter';
import AppHeader from '@/components/AppHeader';
import TestCatalogGrid from '@/components/TestCatalogGrid';
import TestIntro from '@/components/TestIntro';

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
    <div className="flex min-h-screen flex-col selection:bg-lime-500/20">
      <AppHeader mode="home" onCatalogClick={handleScrollToCatalog} />

      <main className="flex-1">
        <section aria-labelledby="home-hero-title">
          <TestIntro onStart={handleStart} onExploreCatalog={handleScrollToCatalog} />
        </section>

        <div id="catalog-section">
          <TestCatalogGrid />
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
