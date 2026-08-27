import { useEffect, useRef } from 'react';

import type { FullAnalysisResult } from '@/types';

export interface UseResultSaveLifecycleOptions {
  result: FullAnalysisResult;
  isSharedView?: boolean;
}

/**
 * 결과 진단서의 자동 저장 및 페이지 이탈(미공유 시 삭제) 생명주기를 관리하는 훅
 */
export function useResultSaveLifecycle({ result, isSharedView = false }: UseResultSaveLifecycleOptions) {
  const savedDbIdRef = useRef<string | null>(null);
  const isCopiedRef = useRef<boolean>(false);
  const hasSavedRef = useRef<boolean>(false);
  const isSavingRef = useRef<boolean>(false);

  // 링크 복사를 하지 않고 이탈할 경우 DB에서 해당 row 삭제
  const triggerDeleteIfUnsaved = () => {
    const getTargetId = (): string | null => {
      if (savedDbIdRef.current) return savedDbIdRef.current;
      if (typeof window !== 'undefined') {
        try {
          return sessionStorage.getItem('unsaved_mbti_id');
        } catch {
          return null;
        }
      }
      return null;
    };

    const idToDelete = getTargetId();

    if (!isCopiedRef.current && idToDelete) {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const deleteUrl = `${origin}/api/results?id=${encodeURIComponent(idToDelete)}`;

      // 1. sendBeacon (CORS preflight 없는 탭 닫기 전송)
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        try {
          const blob = new Blob([idToDelete], { type: 'text/plain;charset=UTF-8' });
          navigator.sendBeacon(deleteUrl, blob);
        } catch {
          // fallback
        }
      }

      // 2. fetch keepalive POST
      if (typeof fetch !== 'undefined') {
        try {
          fetch(deleteUrl, {
            method: 'POST',
            keepalive: true,
            headers: { 'Content-Type': 'text/plain' },
            body: idToDelete,
          }).catch(() => {});
        } catch {}
      }

      // 3. fetch keepalive DELETE
      if (typeof fetch !== 'undefined') {
        try {
          fetch(deleteUrl, {
            method: 'DELETE',
            keepalive: true,
          }).catch(() => {});
        } catch {}
      }

      try {
        sessionStorage.removeItem('unsaved_mbti_id');
      } catch {}
    }
  };

  useEffect(() => {
    if (isSharedView) return;

    // 0. 이전 세션에서 미공유 상태로 남아있던 ID가 있다면 즉시 DB 정리
    try {
      const prevUnsavedId = sessionStorage.getItem('unsaved_mbti_id');
      if (prevUnsavedId) {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        fetch(`${origin}/api/results?id=${encodeURIComponent(prevUnsavedId)}`, {
          method: 'DELETE',
          keepalive: true,
        }).catch(() => {});
        sessionStorage.removeItem('unsaved_mbti_id');
      }
    } catch {}

    if (hasSavedRef.current || isSavingRef.current) return;
    isSavingRef.current = true;

    // 1. 결과 페이지 진입 후 DB에 단 1회만 자동 적재
    fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.id) {
          savedDbIdRef.current = data.id;
          hasSavedRef.current = true;
          try {
            sessionStorage.setItem('unsaved_mbti_id', data.id);
          } catch {}
        }
      })
      .catch((err) => console.error('Auto save error:', err))
      .finally(() => {
        isSavingRef.current = false;
      });

    // 2. 브라우저 탭 닫기, 창 닫기, 새로고침, 백그라운드 전환 감지
    const handleExit = () => {
      triggerDeleteIfUnsaved();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        triggerDeleteIfUnsaved();
      }
    };

    window.addEventListener('pagehide', handleExit);
    window.addEventListener('beforeunload', handleExit);
    window.addEventListener('unload', handleExit);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('pagehide', handleExit);
      window.removeEventListener('beforeunload', handleExit);
      window.removeEventListener('unload', handleExit);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      triggerDeleteIfUnsaved();
    };
  }, [isSharedView, result]);

  // 링크 복사 시 호출하여 DB row를 영구 보존하고 short ID를 반환하는 함수
  const markAsSaved = async (): Promise<string | null> => {
    isCopiedRef.current = true;

    if (savedDbIdRef.current) {
      try {
        sessionStorage.removeItem('unsaved_mbti_id');
      } catch {}
      return savedDbIdRef.current;
    }

    if (isSavingRef.current) {
      for (let i = 0; i < 10; i++) {
        if (savedDbIdRef.current) {
          try {
            sessionStorage.removeItem('unsaved_mbti_id');
          } catch {}
          return savedDbIdRef.current;
        }
        await new Promise((r) => setTimeout(r, 100));
      }
    }

    if (!hasSavedRef.current && !isSavingRef.current) {
      isSavingRef.current = true;
      try {
        const res = await fetch('/api/results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ result }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.id) {
            savedDbIdRef.current = json.id;
            hasSavedRef.current = true;
            try {
              sessionStorage.removeItem('unsaved_mbti_id');
            } catch {}
            return json.id;
          }
        }
      } catch (err) {
        console.error('Instant save error:', err);
      } finally {
        isSavingRef.current = false;
      }
    }

    return null;
  };

  return {
    markAsSaved,
    savedDbIdRef,
  };
}
