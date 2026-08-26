import { ImageResponse } from 'next/og';

import { decodeResultFromCompressedString } from '../../lib/shareResult';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';
export const alt = 'PersonaLens | 나의 성향 분석 리포트';

export default async function Image({ searchParams }: { searchParams?: Promise<{ data?: string; r?: string }> }) {
  const resolvedParams = searchParams ? await searchParams : {};
  const data = resolvedParams?.data || resolvedParams?.r;

  let mbti = 'MBTI';
  let title = '행동 인터랙션 성향 리포트';
  let persona = '초고속 직진 결단파';
  let certainty = '85%';
  let duration = '45.0s';
  let isDecoded = false;

  if (data) {
    try {
      const decoded = decodeResultFromCompressedString(data);
      if (decoded) {
        mbti = decoded.mbti;
        title = decoded.mbtiTitle;
        persona = decoded.behaviorPersona.title;
        certainty = `${decoded.overallCertainty}%`;
        duration = `${(decoded.totalTestDuration / 1000).toFixed(1)}s`;
        isDecoded = true;
      }
    } catch (err) {
      console.error('OG decode error:', err);
    }
  }

  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#07080c',
        backgroundImage:
          'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.22) 0%, transparent 65%), radial-gradient(circle at 100% 100%, rgba(56, 189, 248, 0.15) 0%, transparent 50%), radial-gradient(circle at 0% 100%, rgba(168, 85, 247, 0.12) 0%, transparent 50%)',
        padding: '48px 56px',
        color: '#ffffff',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8',
              fontSize: '20px',
              fontWeight: 'bold',
            }}
          >
            P
          </div>
          <span style={{ display: 'flex', fontSize: '24px', fontWeight: 800, letterSpacing: '2px' }}>
            PERSONA<span style={{ color: '#818cf8' }}>LENS</span>
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: '14px',
            padding: '6px 16px',
            borderRadius: '999px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#a1a1aa',
            fontWeight: 600,
            letterSpacing: '1px',
          }}
        >
          BEHAVIORAL ANALYSIS REPORT
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          margin: 'auto 0',
        }}
      >
        {/* Left Main Hero */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '650px' }}>
          <div
            style={{
              display: 'flex',
              fontSize: '14px',
              color: '#34d399',
              fontWeight: 700,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
            }}
          >
            {isDecoded ? '나의 무의식 행동 성향 리포트' : '행동 궤적 기반 성향 분석 검사'}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: '88px',
              fontWeight: 900,
              letterSpacing: '-2px',
              color: '#ffffff',
              lineHeight: '1',
            }}
          >
            {mbti}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: '28px',
              fontWeight: 700,
              color: '#e4e4e7',
              marginTop: '4px',
            }}
          >
            {title}
          </div>
        </div>

        {/* Right Persona & Stats Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '24px 28px',
            width: '420px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: '12px', color: '#71717a', fontWeight: 600, marginBottom: '4px' }}>
              행동 프로필
            </div>
            <div style={{ display: 'flex', fontSize: '18px', fontWeight: 800, color: '#38bdf8' }}>{persona}</div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              paddingTop: '14px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', color: '#71717a' }}>종합 확신도</span>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#fbbf24' }}>{certainty}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', color: '#71717a' }}>총 소요 시간</span>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#34d399' }}>{duration}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', color: '#71717a' }}>문항 수</span>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#f43f5e' }}>40문항</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '16px',
          fontSize: '14px',
          color: '#71717a',
        }}
      >
        <span style={{ display: 'flex' }}>마우스 궤적 및 고민 시간 기반 무의식 행동 성향 분석</span>
        <span style={{ display: 'flex', color: '#34d399', fontWeight: 700 }}>mbti.opentoyapp.kr</span>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
