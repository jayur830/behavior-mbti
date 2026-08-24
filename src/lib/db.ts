import { Pool } from 'pg';
import { FullAnalysisResult } from '../types';

const globalForPg = globalThis as unknown as {
  pgPool: Pool | undefined;
};

/**
 * PostgreSQL 커넥션 풀 싱글톤 인스턴스 반환
 * DIRECT_URL (세션 모드 5432) 또는 DATABASE_URL을 최우선으로 사용하여 persona 스키마에 직접 연결합니다.
 */
export function getPgPool(): Pool | null {
  const connectionString =
    process.env.DIRECT_URL ||
    process.env.DATABASE_URL?.replace(':6543', ':5432').replace('?pgbouncer=true&', '?').replace('?pgbouncer=true', '') ||
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
 * 10자리 영문 대소문자 + 숫자 난수 ID 생성
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
 * persona.mbti_results 테이블에 진단 결과 적재
 */
export async function saveResultToDb(
  result: FullAnalysisResult,
  customId?: string
): Promise<string | null> {
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
 * persona.mbti_results 테이블에서 10자리 단축 ID로 결과 조회
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

/**
 * 미공유 진단서 row 삭제 (페이지 이탈 시 실행)
 */
export async function deleteResultFromDb(id: string): Promise<boolean> {
  if (!id) return false;
  const pool = getPgPool();
  if (!pool) return false;

  try {
    const query = `
      DELETE FROM persona.mbti_results
      WHERE id = $1;
    `;
    await pool.query(query, [id]);
    return true;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Failed to delete from persona.mbti_results:', errorMsg);
    return false;
  }
}
