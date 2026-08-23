import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mbti.opentoyapp.kr"),
  title: "Behavior MBTI | 마우스 궤적 & 고민 분석 심리검사",
  description:
    "선택지 변경 시간, 마우스 포인터 궤적, 망설임 지수를 함께 분석하여 당신의 진짜 MBTI와 내면의 페르소나를 도출합니다.",
  keywords: [
    "MBTI",
    "행동분석 MBTI",
    "마우스 궤적 MBTI",
    "심리테스트",
    "성격유형검사",
    "Behavior MBTI",
    "opentoyapp",
  ],
  authors: [{ name: "Behavior MBTI Lab" }],
  openGraph: {
    title: "Behavior MBTI | 마우스 행동 & 고민 분석 심리검사",
    description:
      "선택지 변경 시간, 마우스 포인터 궤적, 망설임 지수를 함께 분석하여 당신의 진짜 MBTI와 내면의 페르소나를 도출합니다.",
    url: "https://mbti.opentoyapp.kr",
    siteName: "Behavior MBTI",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Behavior MBTI | 마우스 행동 & 고민 분석 심리검사",
    description:
      "선택지 변경 시간, 마우스 포인터 궤적, 망설임 지수를 함께 분석하여 당신의 진짜 MBTI와 내면의 페르소나를 도출합니다.",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
