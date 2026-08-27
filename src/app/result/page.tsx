import type { Metadata } from 'next';

import { decodeResultFromCompressedString } from '@/lib/shareResult';
import type { PageProps } from '@/types';

import ResultClient from './_components/ResultClient';

/**
 * /result 페이지 쿼리스트링(searchParams) 인터페이스
 */
export interface ResultSearchParams {
  /** URL을 통해 전달된 압축 인코딩 검사 결과 데이터 (우선순위 1) */
  data?: string;
  /** URL을 통해 전달된 압축 인코딩 검사 결과 데이터 단축 파라미터 (우선순위 2) */
  r?: string;
}

/**
 * /result 결과 리포트 페이지 Props 타입
 */
export type Props = PageProps<Record<string, never>, ResultSearchParams>;

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = (await searchParams) || {};
  const data = params.data || params.r;

  if (!data) {
    return {
      title: 'PersonaLens | 나의 무의식 행동 성향 리포트',
      description: '마우스 궤적과 고민 시간으로 도출된 나의 성향 분석 리포트',
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

    const title = `[${decoded.mbti} · ${decoded.behaviorPersona.title}] 나의 무의식 행동 MBTI 분석 리포트 | PersonaLens`;
    const description = `${decoded.mbtiTitle} | 종합 확신도 ${decoded.overallCertainty}% · 총 소요 시간 ${(decoded.totalTestDuration / 1000).toFixed(1)}초`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `https://mbti.opentoyapp.kr/result?data=${data}`,
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
  return <ResultClient />;
}
