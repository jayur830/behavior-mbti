'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import type { FC } from 'react';
import { useSyncExternalStore } from 'react';

export interface ThemeToggleProps {
  className?: string;
}

const emptySubscribe = () => () => {};

export const ThemeToggle: FC<ThemeToggleProps> = ({ className }) => {
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
      <div
        className={`w-14 h-8 rounded-full bg-slate-800/80 border border-slate-700/60 p-1 flex items-center ${className || ''}`}
      >
        <div className="w-6 h-6 rounded-full bg-slate-700" />
      </div>
    );
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="테마 전환"
      onClick={toggleTheme}
      className={`
        relative inline-flex items-center w-14 h-8 rounded-full p-1 transition-colors duration-300 cursor-pointer touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
        ${isDark ? 'bg-slate-900 border border-slate-700/80' : 'bg-slate-200 border border-slate-300'}
        ${className || ''}
      `}
    >
      {/* Background Track Icons */}
      <span className="absolute left-2 text-amber-500 opacity-80 pointer-events-none">
        <Sun className="w-3.5 h-3.5" />
      </span>
      <span className="absolute right-2 text-indigo-400 opacity-80 pointer-events-none">
        <Moon className="w-3.5 h-3.5" />
      </span>

      {/* Sliding Circle Thumb */}
      <span
        className={`
          relative z-10 flex items-center justify-center w-6 h-6 rounded-full shadow-md transition-transform duration-300 ease-in-out
          ${isDark ? 'translate-x-6 bg-slate-800 text-indigo-300' : 'translate-x-0 bg-white text-amber-500'}
        `}
      >
        {isDark ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
      </span>
    </button>
  );
};
