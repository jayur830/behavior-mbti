import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 });
    }

    // 1. is.gd 초고속 단축 API 시도 (불투명 6~7자리 랜덤 링크 반환)
    try {
      const isGdRes = await fetch(
        `https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`,
        { signal: AbortSignal.timeout(2500) }
      );
      if (isGdRes.ok) {
        const json = await isGdRes.json();
        if (json.shorturl) {
          return NextResponse.json({ shortUrl: json.shorturl });
        }
      }
    } catch {
      // Fallback to next provider
    }

    // 2. TinyURL 백업 단축 API 시도
    try {
      const tinyRes = await fetch(
        `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`,
        { signal: AbortSignal.timeout(2500) }
      );
      if (tinyRes.ok) {
        const short = await tinyRes.text();
        if (short && short.startsWith('http')) {
          return NextResponse.json({ shortUrl: short });
        }
      }
    } catch {
      // Fallback to original url
    }

    return NextResponse.json({ shortUrl: url });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
