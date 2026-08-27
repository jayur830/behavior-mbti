'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

import Button from '@/components/ui/button';

export interface ThemeToggleProps {
  className?: string;
}

const emptySubscribe = () => () => {};

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const isDark = (theme === 'system' ? resolvedTheme : theme) === 'dark';

  const toggleTheme = () => {
    const current = theme === 'system' ? resolvedTheme : theme;
    setTheme(current === 'dark' ? 'light' : 'dark');
  };

  if (!isMounted) {
    return (
      <div className={`w-14 h-8 rounded-full bg-muted border border-border p-1 flex items-center ${className || ''}`}>
        <div className="w-6 h-6 rounded-full bg-muted-foreground/30" />
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      role="switch"
      aria-checked={isDark}
      aria-label="테마 전환"
      onClick={toggleTheme}
      className={`
        relative inline-flex items-center justify-start w-14 h-8 min-h-8 max-h-8 p-1 rounded-full transition-colors duration-300 hover:bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 shrink-0
        ${isDark ? 'bg-card border border-border' : 'bg-muted border border-border'}
        ${className || ''}
      `}
    >
      {/* Background Track Icons */}
      <span className="absolute left-2 text-amber-500 opacity-80 pointer-events-none">
        <Sun className="w-3.5 h-3.5" />
      </span>
      <span className="absolute right-2 text-emerald-400 opacity-80 pointer-events-none">
        <Moon className="w-3.5 h-3.5" />
      </span>

      {/* Sliding Circle Thumb */}
      <span
        className={`
          relative z-10 flex items-center justify-center w-6 h-6 rounded-full shadow-md transition-transform duration-300 ease-in-out
          ${isDark ? 'translate-x-6 bg-card border border-border text-emerald-400' : 'translate-x-0 bg-white text-amber-500'}
        `}
      >
        {isDark ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
      </span>
    </Button>
  );
}
