import { NextRequest, NextResponse } from 'next/server';
import { saveResultToDb, deleteResultFromDb, generateShortId } from '../../../lib/db';
import { FullAnalysisResult } from '../../../types';

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

    // 3. 정상 DB 적재 (persona.mbti_results)
    const shortId = await saveResultToDb(result);

    if (shortId) {
      console.log(`[API /api/results] ✅ DB 적재 성공: ID=${shortId}, MBTI=${result.mbti}, Persona=${result.behaviorPersona?.code}`);
      return NextResponse.json({
        id: shortId,
        shortUrl: `/s/${shortId}`,
      });
    }

    const fallbackId = generateShortId(10);
    console.warn(`[API /api/results] ⚠️ DB 적재 실패 (Fallback ID=${fallbackId} 발급)`);
    return NextResponse.json({
      id: fallbackId,
      shortUrl: `/s/${fallbackId}`,
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
    let id = req.nextUrl.searchParams.get('id');

    if (!id) {
      try {
        const body = await req.json();
        id = body?.id;
      } catch {
        // ignore body parse failure
      }
    }

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
