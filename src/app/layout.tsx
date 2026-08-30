import './globals.css';

import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import type { ReactNode } from 'react';

import AmbientCursorBlob from '@/components/AmbientCursorBlob';
import ReactQueryProvider from '@/components/ReactQueryProvider';
import ThemeProvider from '@/components/ThemeProvider';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://persona.opentoyapp.kr'),
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
    url: 'https://persona.opentoyapp.kr',
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
      '@id': 'https://persona.opentoyapp.kr/#website',
      url: 'https://persona.opentoyapp.kr',
      name: 'PersonaLens',
      description: '무의식 마우스 궤적과 망설임 시간으로 분석하는 신개념 MBTI 성향 검사',
      inLanguage: 'ko-KR',
    },
    {
      '@type': 'WebApplication',
      '@id': 'https://persona.opentoyapp.kr/#app',
      name: 'PersonaLens MBTI',
      url: 'https://persona.opentoyapp.kr',
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
    <html lang="ko" suppressHydrationWarning className={`${plusJakartaSans.variable} font-sans h-full antialiased`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground relative overflow-x-hidden transition-colors duration-300">
        <ReactQueryProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <AmbientCursorBlob />
            <div className="relative z-10 flex-1 flex flex-col">{children}</div>
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
