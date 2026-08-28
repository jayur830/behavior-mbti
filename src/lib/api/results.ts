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
