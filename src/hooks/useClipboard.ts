import { useCallback, useState } from 'react';

/**
 * 클립보드 복사 훅 옵션
 */
export interface UseClipboardOptions {
  /** 복사 완료 상태 유지 시간 (기본값: 2000ms) */
  timeoutMs?: number;
}

/**
 * 클립보드 텍스트 복사 및 복사 성공 피드백(일시적 플래그) 상태를 관리하는 커스텀 훅
 *
 * @param options {@link UseClipboardOptions}
 * @returns `copied`: 복사 완료 피드백 상태, `copy`: 텍스트 복사 실행 함수
 */
export function useClipboard({ timeoutMs = 2000 }: UseClipboardOptions = {}) {
  const [copied, setCopied] = useState<boolean>(false);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      if (typeof window === 'undefined') return false;

      let success = false;
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        try {
          await navigator.clipboard.writeText(text);
          success = true;
        } catch {
          success = false;
        }
      }

      if (!success) {
        try {
          const textArea = document.createElement('textarea');
          textArea.value = text;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          success = document.execCommand('copy');
          document.body.removeChild(textArea);
        } catch {
          success = false;
        }
      }

      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), timeoutMs);
      }

      return success;
    },
    [timeoutMs],
  );

  return { copied, copy };
}
