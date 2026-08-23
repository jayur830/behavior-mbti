import { createClient } from '@supabase/supabase-js';
import { FullAnalysisResult } from '../types';
import { saveResultWithPrisma, getResultWithPrisma } from './prisma';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * 7자리 고유 난수 슬러그 생성 (Base62: 대소문자 + 숫자)
 */
export function generateShortId(length = 7): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 검사 결과를 Prisma ORM 또는 Supabase REST Client를 통해 mbti_results 테이블에 저장하고 7자리 단축 ID를 반환합니다.
 */
export async function saveResultToSupabase(result: FullAnalysisResult): Promise<string | null> {
  const shortId = generateShortId(7);

  // 1. Prisma ORM 우선 시도 (DATABASE_URL 설정 시)
  if (process.env.DATABASE_URL) {
    const saved = await saveResultWithPrisma(shortId, result);
    if (saved) return shortId;
  }

  // 2. Supabase REST 클라이언트 시도
  if (supabase) {
    try {
      const { error } = await supabase.from('mbti_results').insert({
        id: shortId,
        mbti: result.mbti,
        persona_code: result.behaviorPersona?.code || 'THE_DECISIVE',
        overall_certainty: result.overallCertainty,
        result_data: result,
      });

      if (!error) {
        return shortId;
      }
      console.error('Supabase insert error:', error);
    } catch (err) {
      console.error('Failed to save result to Supabase:', err);
    }
  }

  return null;
}

/**
 * 7자리 단축 ID로 Prisma ORM 또는 Supabase에서 진단서 데이터를 조회합니다.
 */
export async function getResultFromSupabase(id: string): Promise<FullAnalysisResult | null> {
  // 1. Prisma ORM 우선 조회
  if (process.env.DATABASE_URL) {
    const fromPrisma = await getResultWithPrisma(id);
    if (fromPrisma) return fromPrisma;
  }

  // 2. Supabase REST 클라이언트 조회
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('mbti_results')
        .select('result_data')
        .eq('id', id)
        .single();

      if (!error && data) {
        return data.result_data as FullAnalysisResult;
      }
    } catch (err) {
      console.error('Failed to fetch result from Supabase:', err);
    }
  }

  return null;
}
