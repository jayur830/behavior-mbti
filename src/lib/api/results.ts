import type { FullAnalysisResult } from '@/types';

export interface SaveResultResponse {
  id: string;
  shortUrl: string;
  savedToDb?: boolean;
}

export interface DeleteResultResponse {
  success: boolean;
}

/**
 * 결과 진단서를 API를 통해 DB에 저장합니다.
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
 * 미공유 진단서를 API를 통해 DB에서 삭제합니다.
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
