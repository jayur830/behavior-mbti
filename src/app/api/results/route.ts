import { NextRequest, NextResponse } from 'next/server';
import { saveResultToSupabase, deleteResultFromSupabase } from '../../../lib/supabase';
import { FullAnalysisResult } from '../../../types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result: FullAnalysisResult = body.result;

    if (!result || !result.mbti) {
      return NextResponse.json({ error: 'Invalid result payload' }, { status: 400 });
    }

    const shortId = await saveResultToSupabase(result);

    if (shortId) {
      return NextResponse.json({
        id: shortId,
        shortUrl: `/s/${shortId}`,
      });
    }

    return NextResponse.json(
      { error: 'Could not generate short id from database' },
      { status: 500 }
    );
  } catch (err) {
    console.error('API POST /api/results error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    let id = req.nextUrl.searchParams.get('id');

    // Also support JSON body if sendBeacon/fetch sent body
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

    const deleted = await deleteResultFromSupabase(id);

    return NextResponse.json({ success: deleted });
  } catch (err) {
    console.error('API DELETE /api/results error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
