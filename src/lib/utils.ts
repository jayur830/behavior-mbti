import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind CSS 클래스명을 조건부로 병합하고 중복/충돌을 해결하는 유틸 함수
 *
 * @param inputs 결합할 클래스명 또는 조건부 객체/배열
 * @returns 충돌이 해결된 최종 클래스 문자열
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * 밀리초(ms)를 초 단위 소수점 문자열(예: '3.5')로 변환
 *
 * @param ms 밀리초 시간값
 * @param digits 소수점 자릿수 (기본값: 1)
 * @returns 초 단위 숫자 문자열
 */
export function formatSeconds(ms: number, digits = 1): string {
  return (Math.max(0, ms) / 1000).toFixed(digits);
}

/**
 * 밀리초(ms)를 단위가 포함된 문자열(예: '3.5초' 또는 '3.5s')로 변환
 *
 * @param ms 밀리초 시간값
 * @param unit 시간 단위 접미사 ('초' 또는 's', 기본값: '초')
 * @param digits 소수점 자릿수 (기본값: 1)
 * @returns 단위가 포함된 시간 포맷 문자열
 */
export function formatDurationSec(ms: number, unit: 's' | '초' = '초', digits = 1): string {
  return `${formatSeconds(ms, digits)}${unit}`;
}
