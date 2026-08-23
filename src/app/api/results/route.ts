import { NextRequest, NextResponse } from 'next/server';
import { saveResultToSupabase } from '../../../lib/supabase';
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
    console.error('API /api/results error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
