import { NextRequest, NextResponse } from 'next/server';

import { generateShortId, saveResultToDb } from '@/lib/db';
import type { FullAnalysisResult } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const result: FullAnalysisResult = body?.result;

    if (!result || !result.mbti) {
      return NextResponse.json({ error: 'Invalid result payload' }, { status: 400 });
    }

    const clientGivenId = body?.id;
    const shareId = clientGivenId && clientGivenId.length >= 5 ? clientGivenId : generateShortId(10);

    const saved = await saveResultToDb(result, shareId);

    if (!saved) {
      console.warn(`[API /api/results] ⚠️ DB 저장 실패, 클라이언트 폴백 유도: ID=${shareId}`);
    }

    return NextResponse.json({
      id: shareId,
      shortUrl: `/s/${shareId}`,
      savedToDb: saved,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[API /api/results] ❌ Error:', errorMsg);

    const fallbackId = generateShortId(10);
    return NextResponse.json({
      id: fallbackId,
      shortUrl: `/s/${fallbackId}`,
    });
  }
}
