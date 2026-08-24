import { createClient } from '@supabase/supabase-js';
import { FullAnalysisResult } from '../types';
import { saveResultWithPrisma, getResultWithPrisma, deleteResultWithPrisma } from './prisma';

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
 * 영문 대소문자 + 숫자 랜덤 문자열 10자리 ID 생성
 */
export function generateShortId(length = 10): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 검사 결과를 Prisma ORM 또는 Supabase REST Client를 통해 저장하고 10자리 단축 ID를 반환합니다.
 */
export async function saveResultToSupabase(
  result: FullAnalysisResult,
  customId?: string
): Promise<string | null> {
  const shortId = customId || generateShortId(10);

  // 1. Prisma ORM 우선 시도
  if (process.env.DATABASE_URL) {
    const saved = await saveResultWithPrisma(shortId, result);
    if (saved) return shortId;
  }

  // 2. Supabase REST 클라이언트 시도
  if (supabase) {
    try {
      // 2-1. persona 스키마 시도
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

      // 2-2. public 스키마 시도
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

      console.error('Supabase insert error:', personaErr, pubErr);
    } catch (err) {
      console.error('Failed to save result to Supabase:', err);
    }
  }

  return null;
}

/**
 * 10자리 단축 ID로 Prisma ORM 또는 Supabase에서 진단서 데이터를 조회합니다.
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
      // 2-1. persona 스키마 조회
      const { data: personaData, error: personaErr } = await supabase
        .schema('persona')
        .from('mbti_results')
        .select('result_data')
        .eq('id', id)
        .single();

      if (!personaErr && personaData) {
        return personaData.result_data as FullAnalysisResult;
      }

      // 2-2. public 스키마 조회
      const { data: pubData, error: pubErr } = await supabase
        .from('mbti_results')
        .select('result_data')
        .eq('id', id)
        .single();

      if (!pubErr && pubData) {
        return pubData.result_data as FullAnalysisResult;
      }
    } catch (err) {
      console.error('Failed to fetch result from Supabase:', err);
    }
  }

  return null;
}

/**
 * 미공유 진단서 row 삭제 (페이지 이탈 시 실행)
 */
export async function deleteResultFromSupabase(id: string): Promise<boolean> {
  if (!id) return false;

  // 1. Prisma ORM 우선 삭제
  if (process.env.DATABASE_URL) {
    const deleted = await deleteResultWithPrisma(id);
    if (deleted) return true;
  }

  // 2. Supabase REST 클라이언트 삭제
  if (supabase) {
    try {
      const { error: e1 } = await supabase.schema('persona').from('mbti_results').delete().eq('id', id);
      if (!e1) return true;

      const { error: e2 } = await supabase.from('mbti_results').delete().eq('id', id);
      if (!e2) return true;
    } catch (err) {
      console.error('Failed to delete result from Supabase:', err);
    }
  }

  return false;
}
