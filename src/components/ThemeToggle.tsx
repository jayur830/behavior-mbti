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
      <div className={`theme-toggle theme-toggle--placeholder ${className || ''}`} aria-hidden="true">
        <div />
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
      className={`theme-toggle ${isDark ? 'theme-toggle--dark' : 'theme-toggle--light'} ${className || ''}`}
    >
      {/* Background Track Icons */}
      <span className="theme-toggle__track-icon theme-toggle__track-icon--sun" aria-hidden="true">
        <Sun />
      </span>
      <span className="theme-toggle__track-icon theme-toggle__track-icon--moon" aria-hidden="true">
        <Moon />
      </span>

      {/* Sliding Circle Thumb */}
      <span className="theme-toggle__thumb" aria-hidden="true">
        {isDark ? <Moon /> : <Sun />}
      </span>
    </Button>
  );
}
