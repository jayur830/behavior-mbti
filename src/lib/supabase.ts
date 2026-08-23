import { createClient } from '@supabase/supabase-js';
import { FullAnalysisResult } from '../types';

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
 * 검사 결과를 Supabase mbti_results 테이블에 저장하고 7자리 단축 ID를 반환합니다.
 */
export async function saveResultToSupabase(result: FullAnalysisResult): Promise<string | null> {
  if (!supabase) {
    console.warn('Supabase client is not configured. (Missing NEXT_PUBLIC_SUPABASE_URL / ANON_KEY)');
    return null;
  }

  const shortId = generateShortId(7);

  try {
    const { error } = await supabase.from('mbti_results').insert({
      id: shortId,
      mbti: result.mbti,
      persona_code: result.behaviorPersona?.code || 'THE_DECISIVE',
      overall_certainty: result.overallCertainty,
      result_data: result,
    });

    if (error) {
      console.error('Supabase insert error:', error);
      return null;
    }

    return shortId;
  } catch (err) {
    console.error('Failed to save result to Supabase:', err);
    return null;
  }
}

/**
 * 7자리 단축 ID로 Supabase에서 진단서 데이터를 조회합니다.
 */
export async function getResultFromSupabase(id: string): Promise<FullAnalysisResult | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('mbti_results')
      .select('result_data')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return data.result_data as FullAnalysisResult;
  } catch (err) {
    console.error('Failed to fetch result from Supabase:', err);
    return null;
  }
}
