import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { saveResultApi } from '@/lib/api/results';
import type { FullAnalysisResult } from '@/types';

/**
 * 결과 진단서 저장 생명주기 관리 훅 옵션
 */
export interface UseResultSaveLifecycleOptions {
  /** 분석 완료된 최종 MBTI 및 행동 궤적 결과 데이터 */
  result: FullAnalysisResult;
  /** 타인에게 공유받은 결과 뷰 여부 (공유 뷰일 때는 자동 저장/삭제 생명주기 스킵) */
  isSharedView?: boolean;
}

/**
 * TanStack React Query의 useMutation을 활용하여
 * 결과 진단서의 자동 적재, 세션 관리 및 페이지 이탈(미공유 시 DB row 정리) 생명주기를 전담하는 커스텀 훅
 *
 * @param options {@link UseResultSaveLifecycleOptions}
 * @returns `markAsSaved`: 링크 복사 시 호출하여 결과를 영구 보존하고 식별자를 반환하는 함수, `isSaving`: 저장 중 여부
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

  const { mutate: mutateSave } = saveMutation;

  useEffect(() => {
    if (isSharedView) return;

    // 1. 이미 세션에 unsaved_mbti_id가 존재하면 (새로고침 등), 중복 저장하지 않고 해당 ID를 유지
    try {
      const existingUnsavedId = sessionStorage.getItem('unsaved_mbti_id');
      if (existingUnsavedId) {
        savedDbIdRef.current = existingUnsavedId;
        hasSavedRef.current = true;
        return;
      }
    } catch {}

    if (hasSavedRef.current || saveMutation.isPending) return;

    mutateSave({ result });
  }, [isSharedView, result, mutateSave, saveMutation.isPending]);

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
