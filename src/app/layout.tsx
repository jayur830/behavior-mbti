import './globals.css';

import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import type { ReactNode } from 'react';

import { ThemeProvider } from '@/components/ThemeProvider';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://mbti.opentoyapp.kr'),
  title: 'PersonaLens | 무의식 행동으로 읽는 나만의 페르소나',
  description: '선택의 순간, 머뭇거림과 망설임의 궤적을 분석하여 당신의 진짜 내면과 페르소나를 도출합니다.',
  keywords: [
    'PersonaLens',
    '페르소나렌즈',
    'MBTI',
    '행동분석 심리검사',
    '마우스 궤적 심리검사',
    '심리테스트',
    '성격유형검사',
    '무의식 행동분석',
    'opentoyapp',
  ],
  authors: [{ name: 'PersonaLens' }],
  openGraph: {
    title: 'PersonaLens | 무의식 행동으로 읽는 나만의 페르소나',
    description: '선택의 순간, 머뭇거림과 망설임의 궤적을 분석하여 당신의 진짜 내면과 페르소나를 도출합니다.',
    url: 'https://mbti.opentoyapp.kr',
    siteName: 'PersonaLens',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PersonaLens | 무의식 행동으로 읽는 나만의 페르소나',
    description: '선택의 순간, 머뭇거림과 망설임의 궤적을 분석하여 당신의 진짜 내면과 페르소나를 도출합니다.',
  },
};

export interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} font-sans h-full antialiased selection:bg-indigo-500/20 selection:text-indigo-200`}
    >
      <body className="min-h-full flex flex-col bg-[#0b0f17] text-slate-100 relative overflow-x-hidden">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {/* Ambient background glow */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-175 h-125 bg-linear-to-br from-indigo-600/15 via-purple-600/10 to-transparent blur-[120px] rounded-full" />
            <div className="absolute top-[60%] left-[-10%] w-125 h-125 bg-blue-600/10 blur-[140px] rounded-full" />
            <div className="absolute top-[40%] right-[-10%] w-125 h-125 bg-violet-600/10 blur-[140px] rounded-full" />
          </div>
          <div className="relative z-10 flex-1 flex flex-col">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
