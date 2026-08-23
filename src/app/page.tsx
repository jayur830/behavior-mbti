'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { TestIntro } from '../components/TestIntro';
import { Compass } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/test');
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-neutral-100 flex flex-col justify-between selection:bg-neutral-200 selection:text-neutral-900 bg-grid-pattern relative">
      {/* Navigation Header */}
      <header className="w-full border-b border-white/[0.06] backdrop-blur-md sticky top-0 z-40 bg-[#090a0f]/80">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-mono text-sm tracking-widest text-neutral-200">
            <div className="w-7 h-7 rounded-lg bg-white/[0.08] border border-white/[0.1] flex items-center justify-center text-neutral-100">
              <Compass className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="font-bold">
              BEHAVIOR<span className="text-neutral-500">.MBTI</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">TELEMETRY ONLINE</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-8">
        <TestIntro onStart={handleStart} />
      </main>

      {/* Minimal Footer */}
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
