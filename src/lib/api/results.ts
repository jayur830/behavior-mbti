import type { FullAnalysisResult } from '@/types';

/**
 * 결과 저장 API 성공 응답 인터페이스
 */
export interface SaveResultResponse {
  /** 생성되거나 유지된 8자리 고유 식별자 */
  id: string;
  /** 단축 공유 URL 경로 (예: '/s/a1b2c3d4') */
  shortUrl: string;
  /** DB에 실제 영구 저장되었는지 여부 */
  savedToDb?: boolean;
}

/**
 * 결과 삭제 API 성공 응답 인터페이스
 */
export interface DeleteResultResponse {
  /** 삭제 성공 여부 */
  success: boolean;
}

/**
 * 분석 완료된 진단서 결과를 서버 API(`POST /api/results`)를 통해 저장합니다.
 *
 * @param result 저장할 종합 분석 결과 객체
 * @param id 기발급된 식별자가 있을 경우 재사용할 ID (선택)
 * @returns {@link SaveResultResponse} 저장된 식별자 및 단축 URL
 */
export async function saveResultApi(result: FullAnalysisResult, id?: string): Promise<SaveResultResponse> {
  const res = await fetch('/api/results', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ result, id }),
  });

  if (!res.ok) {
    throw new Error(`Failed to save result: ${res.statusText}`);
  }

  return res.json();
}

/**
 * 미공유 상태의 임시 진단서를 서버 API(`DELETE /api/results`)를 통해 DB에서 삭제합니다.
 *
 * @param id 삭제할 진단서 고유 ID
 * @returns {@link DeleteResultResponse} 성공 플래그
 */
export async function deleteResultApi(id: string): Promise<DeleteResultResponse> {
  const res = await fetch(`/api/results?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error(`Failed to delete result: ${res.statusText}`);
  }

  return res.json();
}
