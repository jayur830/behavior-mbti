import { NextRequest, NextResponse } from 'next/server';
import { saveResultToDb, deleteResultFromDb, generateShortId } from '../../../lib/db';
import { FullAnalysisResult } from '../../../types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result: FullAnalysisResult = body?.result;

    if (!result || !result.mbti) {
      return NextResponse.json({ error: 'Invalid result payload' }, { status: 400 });
    }

    // persona.mbti_results 테이블에 적재
    let shortId = await saveResultToDb(result);

    // DB 일시 장애 시에도 클라이언트 링크 복사가 가능하도록 Fallback ID 제공
    if (!shortId) {
      shortId = generateShortId(10);
    }

    return NextResponse.json({
      id: shortId,
      shortUrl: `/s/${shortId}`,
    });
  } catch (err) {
    console.error('API POST /api/results error:', err);
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

    return NextResponse.json({ success: deleted });
  } catch (err) {
    console.error('API DELETE /api/results error:', err);
    return NextResponse.json({ success: false });
  }
}
