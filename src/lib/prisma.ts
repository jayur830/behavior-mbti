import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { FullAnalysisResult } from '../types';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | null | undefined;
  pool: Pool | undefined;
};

function createPrismaClient(): PrismaClient | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return null;
  }

  try {
    const pool = globalForPrisma.pool ?? new Pool({ connectionString });
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.pool = pool;
    }

    const adapter = new PrismaPg(pool);
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  } catch (err) {
    console.error('Failed to initialize Prisma adapter:', err);
    return null;
  }
}

export const prisma = globalForPrisma.prisma !== undefined ? globalForPrisma.prisma : createPrismaClient();

if (process.env.NODE_ENV !== 'production' && prisma) {
  globalForPrisma.prisma = prisma;
}

/**
 * Prisma ORM을 통해 mbti_results 테이블에 진단서 저장
 */
export async function saveResultWithPrisma(
  id: string,
  result: FullAnalysisResult
): Promise<boolean> {
  if (!prisma) return false;
  try {
    await prisma.mbtiResult.create({
      data: {
        id,
        mbti: result.mbti,
        personaCode: result.behaviorPersona?.code || 'THE_DECISIVE',
        overallCertainty: result.overallCertainty,
        resultData: result as unknown as object,
      },
    });
    return true;
  } catch (err) {
    console.error('Prisma save error:', err);
    return false;
  }
}

/**
 * Prisma ORM을 통해 mbti_results 테이블에서 진단서 조회
 */
export async function getResultWithPrisma(id: string): Promise<FullAnalysisResult | null> {
  if (!prisma) return null;
  try {
    const found = await prisma.mbtiResult.findUnique({
      where: { id },
    });
    if (!found) return null;
    return found.resultData as unknown as FullAnalysisResult;
  } catch (err) {
    console.error('Prisma fetch error:', err);
    return null;
  }
}

/**
 * Prisma ORM을 통해 mbti_results 테이블에서 미공유 진단서 삭제
 */
export async function deleteResultWithPrisma(id: string): Promise<boolean> {
  if (!prisma) return false;
  try {
    await prisma.mbtiResult.delete({
      where: { id },
    });
    return true;
  } catch (err) {
    console.error('Prisma delete error:', err);
    return false;
  }
}
