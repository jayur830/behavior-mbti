import { Pool } from 'pg';

import type { FullAnalysisResult } from '@/types';

const globalForPg = globalThis as unknown as {
  pgPool: Pool | undefined;
};

/**
 * PostgreSQL 커넥션 풀 싱글톤 인스턴스를 반환합니다.
 * DIRECT_URL (세션 모드 5432) 또는 DATABASE_URL을 최우선으로 사용하여 persona 스키마에 직접 연결합니다.
 *
 * @returns 연결된 {@link Pool} 인스턴스 또는 연결 정보 부재 시 `null`
 */
export function getPgPool(): Pool | null {
  const connectionString =
    process.env.DIRECT_URL ||
    process.env.DATABASE_URL?.replace(':6543', ':5432')
      .replace('?pgbouncer=true&', '?')
      .replace('?pgbouncer=true', '') ||
    process.env.DATABASE_URL;

  if (!connectionString) return null;

  if (!globalForPg.pgPool) {
    globalForPg.pgPool = new Pool({
      connectionString,
      connectionTimeoutMillis: 5000,
      max: 10,
    });
  }

  return globalForPg.pgPool;
}

/**
 * URL 공유용 10자리 영문 대소문자 + 숫자 난수 식별자 ID를 생성합니다.
 *
 * @param length 생성할 ID 길이 (기본값: 10)
 * @returns 생성된 영숫자 식별자 문자열
 */
export function generateShortId(length = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
}

/**
 * persona.mbti_results 테이블에 진단 결과 전체를 적재합니다.
 *
 * @param result 저장할 종합 분석 결과 객체
 * @param customId 이미 발급된 단축 ID가 있는 경우 지정
 * @returns 저장 완료된 단축 ID 문자열 또는 실패 시 `null`
 */
export async function saveResultToDb(result: FullAnalysisResult, customId?: string): Promise<string | null> {
  const shortId = customId || generateShortId(10);
  const pool = getPgPool();

  if (!pool) {
    console.warn('PostgreSQL connection string (DIRECT_URL / DATABASE_URL) is not configured.');
    return null;
  }

  try {
    const query = `
      INSERT INTO persona.mbti_results (id, mbti, persona_code, overall_certainty, result_data)
      VALUES ($1, $2, $3, $4, $5);
    `;
    const values = [
      shortId,
      result.mbti,
      result.behaviorPersona?.code || 'THE_DECISIVE',
      result.overallCertainty,
      JSON.stringify(result),
    ];

    await pool.query(query, values);
    return shortId;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Failed to insert into persona.mbti_results:', errorMsg);
    return null;
  }
}

/**
 * persona.mbti_results 테이블에서 단축 ID로 진단 결과 객체를 조회합니다.
 *
 * @param id 조회할 진단서 고유 ID
 * @returns 복원된 {@link FullAnalysisResult} 객체 또는 데이터 부재 시 `null`
 */
export async function getResultFromDb(id: string): Promise<FullAnalysisResult | null> {
  if (!id) return null;
  const pool = getPgPool();
  if (!pool) return null;

  try {
    const query = `
      SELECT result_data FROM persona.mbti_results
      WHERE id = $1
      LIMIT 1;
    `;
    const res = await pool.query(query, [id]);

    if (res.rows.length === 0) {
      return null;
    }

    const raw = res.rows[0].result_data;
    return typeof raw === 'string' ? JSON.parse(raw) : (raw as FullAnalysisResult);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Failed to get from persona.mbti_results:', errorMsg);
    return null;
  }
}
