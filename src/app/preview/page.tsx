import type { Metadata } from 'next';

import { decodeResultFromCompressedString } from '@/lib/shareResult';

import PreviewClient from './_components/PreviewClient';

export interface Props {
  searchParams: Promise<{ data?: string; r?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const data = params.data || params.r;

  if (!data) {
    return {
      title: 'PersonaLens | 친구의 무의식 행동 성향 리포트',
      description: '친구의 마우스 궤적과 고민 시간으로 도출된 무의식 성향 분석 결과를 확인해보세요!',
    };
  }

  try {
    const decoded = decodeResultFromCompressedString(data);
    if (!decoded) {
      return {
        title: 'PersonaLens | 무의식 행동 성향 리포트',
        description: '마우스 궤적과 체류 시간 기반 성향 분석 리포트',
      };
    }

    const title = `[${decoded.mbti} · ${decoded.behaviorPersona.title}] 친구의 무의식 행동 MBTI 분석 리포트 | PersonaLens`;
    const description = `${decoded.mbtiTitle} | 종합 확신도 ${decoded.overallCertainty}% · 총 소요 시간 ${(decoded.totalTestDuration / 1000).toFixed(1)}초`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `https://mbti.opentoyapp.kr/preview?data=${data}`,
        siteName: 'PersonaLens',
        locale: 'ko_KR',
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
    };
  } catch {
    return {
      title: 'PersonaLens | 무의식 행동 성향 리포트',
      description: '마우스 궤적과 체류 시간 기반 성향 분석 리포트',
    };
  }
}

export default function Page() {
  return <PreviewClient />;
}
