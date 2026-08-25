import './globals.css';

import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://mbti.opentoyapp.kr'),
  title: 'Behavior MBTI | 무의식 행동으로 읽는 나만의 성향',
  description: '선택의 순간, 머뭇거림과 망설임의 궤적을 분석하여 당신의 진짜 내면과 성향을 도출합니다.',
  keywords: ['MBTI', '행동분석 MBTI', '마우스 궤적 MBTI', '심리테스트', '성격유형검사', 'Behavior MBTI', 'opentoyapp'],
  authors: [{ name: 'Behavior MBTI' }],
  openGraph: {
    title: 'Behavior MBTI | 무의식 행동으로 읽는 나만의 성향',
    description: '선택의 순간, 머뭇거림과 망설임의 궤적을 분석하여 당신의 진짜 내면과 성향을 도출합니다.',
    url: 'https://mbti.opentoyapp.kr',
    siteName: 'Behavior MBTI',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Behavior MBTI | 무의식 행동으로 읽는 나만의 성향',
    description: '선택의 순간, 머뭇거림과 망설임의 궤적을 분석하여 당신의 진짜 내면과 성향을 도출합니다.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${plusJakartaSans.variable} font-sans h-full antialiased selection:bg-indigo-500/20 selection:text-indigo-200`}
    >
      <body className="min-h-full flex flex-col bg-[#0b0f17] text-slate-100 relative overflow-x-hidden">
        {/* Ambient background glow */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-175 h-125 bg-linear-to-br from-indigo-600/15 via-purple-600/10 to-transparent blur-[120px] rounded-full" />
          <div className="absolute top-[60%] left-[-10%] w-125 h-125 bg-blue-600/10 blur-[140px] rounded-full" />
          <div className="absolute top-[40%] right-[-10%] w-125 h-125 bg-violet-600/10 blur-[140px] rounded-full" />
        </div>
        <div className="relative z-10 flex-1 flex flex-col">{children}</div>
      </body>
    </html>
  );
}
