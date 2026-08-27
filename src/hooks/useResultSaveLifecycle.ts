import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { deleteResultApi, saveResultApi } from '@/lib/api/results';
import type { FullAnalysisResult } from '@/types';

export interface UseResultSaveLifecycleOptions {
  result: FullAnalysisResult;
  isSharedView?: boolean;
}

/**
 * TanStack React Query의 useMutation을 활용하여
 * 결과 진단서의 자동 저장 및 페이지 이탈(미공유 시 삭제) 생명주기를 관리하는 훅
 */
export function useResultSaveLifecycle({ result, isSharedView = false }: UseResultSaveLifecycleOptions) {
  const savedDbIdRef = useRef<string | null>(null);
  const isCopiedRef = useRef<boolean>(false);
  const hasSavedRef = useRef<boolean>(false);

  // TanStack React Query Mutation for Saving
  const saveMutation = useMutation({
    mutationFn: (payload: { result: FullAnalysisResult; id?: string }) => saveResultApi(payload.result, payload.id),
    onSuccess: (data) => {
      if (data?.id) {
        savedDbIdRef.current = data.id;
        hasSavedRef.current = true;
        try {
          sessionStorage.setItem('unsaved_mbti_id', data.id);
        } catch {}
      }
    },
    onError: (err) => {
      console.error('React Query Save Mutation Error:', err);
    },
  });

  // TanStack React Query Mutation for Deleting
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteResultApi(id),
    onError: (err) => {
      console.error('React Query Delete Mutation Error:', err);
    },
  });

  const { mutate: mutateSave } = saveMutation;
  const { mutate: mutateDelete } = deleteMutation;

  // 링크 복사를 하지 않고 이탈할 경우 DB에서 해당 row 삭제 (sendBeacon / keepalive 유지)
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

      // 1. sendBeacon (브라우저 탭 닫기 전송 보장)
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        try {
          const blob = new Blob([idToDelete], { type: 'text/plain;charset=UTF-8' });
          navigator.sendBeacon(deleteUrl, blob);
        } catch {
          // fallback
        }
      }

      // 2. fetch keepalive
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

    // 0. 이전 세션에서 미공유 상태로 남아있던 ID가 있다면 Mutation으로 즉시 정리
    try {
      const prevUnsavedId = sessionStorage.getItem('unsaved_mbti_id');
      if (prevUnsavedId) {
        deleteMutation.mutate(prevUnsavedId);
        sessionStorage.removeItem('unsaved_mbti_id');
      }
    } catch {}

    if (hasSavedRef.current || saveMutation.isPending) return;

    mutateSave({ result });

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
  }, [isSharedView, result, mutateDelete, mutateSave, saveMutation.isPending, deleteMutation]);

  // 링크 복사 시 호출하여 DB row를 영구 보존하고 short ID를 반환하는 함수
  const markAsSaved = async (): Promise<string | null> => {
    isCopiedRef.current = true;

    if (savedDbIdRef.current) {
      try {
        sessionStorage.removeItem('unsaved_mbti_id');
      } catch {}
      return savedDbIdRef.current;
    }

    if (saveMutation.isPending) {
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

    if (!hasSavedRef.current) {
      try {
        const data = await saveMutation.mutateAsync({ result });
        if (data?.id) {
          savedDbIdRef.current = data.id;
          hasSavedRef.current = true;
          try {
            sessionStorage.removeItem('unsaved_mbti_id');
          } catch {}
          return data.id;
        }
      } catch (err) {
        console.error('Instant save error:', err);
      }
    }

    return null;
  };

  return {
    markAsSaved,
    savedDbIdRef,
    isSaving: saveMutation.isPending,
  };
}
