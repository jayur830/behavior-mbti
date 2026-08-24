import { NextRequest, NextResponse } from 'next/server';
import { saveResultToSupabase, deleteResultFromSupabase, generateShortId } from '../../../lib/supabase';
import { FullAnalysisResult } from '../../../types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result: FullAnalysisResult = body?.result;

    if (!result || !result.mbti) {
      return NextResponse.json({ error: 'Invalid result payload' }, { status: 400 });
    }

    // 1. Try saving to DB (Supabase / Prisma)
    let shortId: string | null = null;
    try {
      shortId = await saveResultToSupabase(result);
    } catch (dbErr) {
      console.warn('DB save warning:', dbErr);
    }

    // 2. If DB save failed or DB is not configured, generate 10-char fallback ID
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

    try {
      await deleteResultFromSupabase(id);
    } catch (delErr) {
      console.warn('DB delete warning:', delErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('API DELETE /api/results error:', err);
    return NextResponse.json({ success: false });
  }
}
