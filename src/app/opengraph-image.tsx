import { ImageResponse } from 'next/og';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';
export const alt = 'Behavior MBTI | 마우스 궤적 & 고민 분석 심리검사';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#07080c',
          backgroundImage:
            'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.22) 0%, transparent 65%), radial-gradient(circle at 100% 100%, rgba(56, 189, 248, 0.15) 0%, transparent 50%), radial-gradient(circle at 0% 100%, rgba(168, 85, 247, 0.12) 0%, transparent 50%)',
          padding: '52px 64px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34d399',
                fontSize: '20px',
                fontWeight: 'bold',
              }}
            >
              +
            </div>
            <span style={{ display: 'flex', fontSize: '26px', fontWeight: 800, letterSpacing: '2px' }}>
              BEHAVIOR<span style={{ color: '#34d399' }}>.MBTI</span>
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: '14px',
              padding: '6px 18px',
              borderRadius: '999px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#a1a1aa',
              fontWeight: 600,
              letterSpacing: '1px',
            }}
          >
            MICRO-INTERACTION PSYCHOMETRICS
          </div>
        </div>

        {/* Center Main Hero */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            margin: 'auto 0',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '680px' }}>
            <div
              style={{
                display: 'flex',
                fontSize: '15px',
                color: '#34d399',
                fontWeight: 700,
                letterSpacing: '1.5px',
              }}
            >
              무의식 마우스 궤적 & 고민 시간 기반 심리검사
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                fontSize: '54px',
                fontWeight: 900,
                letterSpacing: '-1.5px',
                color: '#ffffff',
                lineHeight: '1.15',
              }}
            >
              <span>당신의 진짜 성향은</span>
              <span style={{ color: '#34d399' }}>마우스 커서가 알고 있습니다</span>
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: '20px',
                color: '#a1a1aa',
                marginTop: '6px',
                fontWeight: 400,
              }}
            >
              선택을 망설인 0.1초와 마우스 궤적으로 밝혀내는 16가지 성격 유형
            </div>
          </div>

          {/* Right Feature Badges */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              padding: '24px 28px',
              width: '380px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#34d399' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>200개 문항 풀 기반</span>
                <span style={{ fontSize: '12px', color: '#71717a' }}>4개 축 균등 40문항 무작위 추출</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#38bdf8' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>마우스 궤적 텔레메트리</span>
                <span style={{ fontSize: '12px', color: '#71717a' }}>망설임 지수 및 선택 번복 추적</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#fbbf24' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>행동 페르소나 도출</span>
                <span style={{ fontSize: '12px', color: '#71717a' }}>결단파 / 사색파 / 탐색형 분석</span>
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
          <span style={{ display: 'flex' }}>© 2026 BEHAVIOR MBTI LAB</span>
          <span style={{ display: 'flex', color: '#34d399', fontWeight: 700 }}>mbti.opentoyapp.kr</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
