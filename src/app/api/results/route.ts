import { NextRequest, NextResponse } from 'next/server';

import { deleteResultFromDb, generateShortId, saveResultToDb } from '@/lib/db';
import type { FullAnalysisResult } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const idParam = req.nextUrl.searchParams.get('id');

    // 1. sendBeacon 이탈 삭제 요청인 경우 (POST /api/results?id=...)
    if (idParam) {
      const deleted = await deleteResultFromDb(idParam);
      console.log(`[API /api/results] 🗑️ sendBeacon 미공유 row 삭제: ID=${idParam}, 결과=${deleted ? '성공' : '실패'}`);
      return NextResponse.json({ success: deleted });
    }

    const body = await req.json().catch(() => null);

    // 2. Body 기반 삭제 요청인 경우 ({ id } 만 전송 시)
    if (body?.id && !body?.result) {
      const deleted = await deleteResultFromDb(body.id);
      console.log(`[API /api/results] 🗑️ 미공유 row 삭제: ID=${body.id}, 결과=${deleted ? '성공' : '실패'}`);
      return NextResponse.json({ success: deleted });
    }

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
    console.error('[API /api/results] ❌ POST Error:', errorMsg);
    const fallbackId = generateShortId(10);
    return NextResponse.json({
      id: fallbackId,
      shortUrl: `/s/${fallbackId}`,
    });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const bodyJson = await req.json().catch(() => null);
    const id = req.nextUrl.searchParams.get('id') || bodyJson?.id;

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const deleted = await deleteResultFromDb(id);
    console.log(`[API /api/results] 🗑️ DELETE 미공유 row 삭제: ID=${id}, 결과=${deleted ? '성공' : '실패'}`);

    return NextResponse.json({ success: deleted });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[API /api/results] ❌ DELETE Error:', errorMsg);
    return NextResponse.json({ success: false });
  }
}
