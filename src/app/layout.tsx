import './globals.css';

import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import type { ReactNode } from 'react';

import ReactQueryProvider from '@/components/ReactQueryProvider';
import ThemeProvider from '@/components/ThemeProvider';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://mbti.opentoyapp.kr'),
  title: {
    default: 'PersonaLens | 무의식 행동으로 읽는 나만의 페르소나',
    template: '%s | PersonaLens',
  },
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
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://mbti.opentoyapp.kr/#website',
      url: 'https://mbti.opentoyapp.kr',
      name: 'PersonaLens',
      description: '무의식 마우스 궤적과 망설임 시간으로 분석하는 신개념 MBTI 성향 검사',
      inLanguage: 'ko-KR',
    },
    {
      '@type': 'WebApplication',
      '@id': 'https://mbti.opentoyapp.kr/#app',
      name: 'PersonaLens MBTI',
      url: 'https://mbti.opentoyapp.kr',
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'All',
      browserRequirements: 'Requires JavaScript. Requires HTML5.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'KRW',
      },
    },
  ],
};

export interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} font-sans h-full antialiased selection:bg-emerald-500/20 selection:text-emerald-300 dark:selection:text-emerald-200`}
    >
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground relative overflow-x-hidden transition-colors duration-300">
        <ReactQueryProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            {/* Ambient background glow */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-40 dark:opacity-100 transition-opacity duration-300">
              <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-175 h-125 bg-lime-300/10 blur-[120px] rounded-full" />
              <div className="absolute top-[60%] left-[-10%] w-125 h-125 bg-amber-200/8 blur-[140px] rounded-full" />
              <div className="absolute top-[40%] right-[-10%] w-125 h-125 bg-lime-200/8 blur-[140px] rounded-full" />
            </div>
            <div className="relative z-10 flex-1 flex flex-col">{children}</div>
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
