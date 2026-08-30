'use client';

import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import type { MouseEvent } from 'react';

import ThemeToggle from '@/components/ThemeToggle';
import Button from '@/components/ui/button';

export type AppHeaderMode = 'home' | 'testing' | 'result' | 'shared';

export interface AppHeaderProps {
  mode?: AppHeaderMode;
  onLogoClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  onCatalogClick?: () => void;
}

export default function AppHeader({ mode = 'home', onLogoClick, onCatalogClick }: AppHeaderProps) {
  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 border-b border-border/60">
      <Link
        href="/"
        onClick={onLogoClick}
        className="group flex items-center gap-3"
        aria-label="PersonaLens 홈으로 이동"
      >
        <span className="brand-mark">
          <span />
        </span>
        <span className="font-mono text-sm font-bold tracking-[0.18em] text-foreground">
          PERSONA<span className="text-accent-ink font-extrabold">LENS</span>
        </span>
      </Link>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {mode === 'home' && onCatalogClick ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCatalogClick}
            className="text-xs font-semibold text-foreground hover:bg-muted cursor-pointer"
          >
            전체 검사 목록
            <ArrowUpRight className="h-3.5 w-3.5 ml-1 text-accent-ink" />
          </Button>
        ) : null}

        <ThemeToggle />
      </div>
    </header>
  );
}
