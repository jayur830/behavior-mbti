import { createClient } from '@supabase/supabase-js';
import { FullAnalysisResult } from '../types';
import { saveResultWithPrisma, getResultWithPrisma } from './prisma';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

export const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
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
 * 검사 결과를 Prisma ORM 또는 Supabase REST Client(public/persona 스키마)를 통해 저장하고 7자리 단축 ID를 반환합니다.
 */
export async function saveResultToSupabase(result: FullAnalysisResult): Promise<string | null> {
  const shortId = generateShortId(7);

  // 1. Prisma ORM 우선 시도
  if (process.env.DATABASE_URL) {
    const saved = await saveResultWithPrisma(shortId, result);
    if (saved) return shortId;
  }

  // 2. Supabase REST 클라이언트 시도
  if (supabase) {
    try {
      // 2-1. public 스키마 시도
      const { error: pubErr } = await supabase.from('mbti_results').insert({
        id: shortId,
        mbti: result.mbti,
        persona_code: result.behaviorPersona?.code || 'THE_DECISIVE',
        overall_certainty: result.overallCertainty,
        result_data: result,
      });

      if (!pubErr) {
        return shortId;
      }

      // 2-2. persona 스키마 시도
      const { error: personaErr } = await supabase.schema('persona').from('mbti_results').insert({
        id: shortId,
        mbti: result.mbti,
        persona_code: result.behaviorPersona?.code || 'THE_DECISIVE',
        overall_certainty: result.overallCertainty,
        result_data: result,
      });

      if (!personaErr) {
        return shortId;
      }

      console.error('Supabase insert error (public & persona):', pubErr, personaErr);
    } catch (err) {
      console.error('Failed to save result to Supabase:', err);
    }
  }

  return null;
}

/**
 * 7자리 단축 ID로 Prisma ORM 또는 Supabase(public/persona)에서 진단서 데이터를 조회합니다.
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
      // 2-1. public 스키마 조회
      const { data: pubData, error: pubErr } = await supabase
        .from('mbti_results')
        .select('result_data')
        .eq('id', id)
        .single();

      if (!pubErr && pubData) {
        return pubData.result_data as FullAnalysisResult;
      }

      // 2-2. persona 스키마 조회
      const { data: personaData, error: personaErr } = await supabase
        .schema('persona')
        .from('mbti_results')
        .select('result_data')
        .eq('id', id)
        .single();

      if (!personaErr && personaData) {
        return personaData.result_data as FullAnalysisResult;
      }
    } catch (err) {
      console.error('Failed to fetch result from Supabase:', err);
    }
  }

  return null;
}
