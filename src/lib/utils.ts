import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * 밀리초(ms)를 초 단위 소수점 1자리 문자열(예: '3.5')로 변환
 */
export function formatSeconds(ms: number, digits = 1): string {
  return (Math.max(0, ms) / 1000).toFixed(digits);
}

/**
 * 밀리초(ms)를 단위가 붙은 문자열(예: '3.5초' 또는 '3.5s')로 변환
 */
export function formatDurationSec(ms: number, unit: 's' | '초' = '초', digits = 1): string {
  return `${formatSeconds(ms, digits)}${unit}`;
}
