import { Metadata } from 'next';
import { decodeResultFromCompressedString } from '../../lib/shareResult';
import ResultClient from './ResultClient';

interface Props {
  searchParams: Promise<{ data?: string; r?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const data = params.data || params.r;

  if (!data) {
    return {
      title: 'Behavior MBTI | 나의 무의식 행동 심리 진단서',
      description: '마우스 궤적과 고민 시간으로 도출된 나의 진짜 MBTI 진단서',
    };
  }

  try {
    const decoded = decodeResultFromCompressedString(data);
    if (!decoded) {
      return {
        title: 'Behavior MBTI | 무의식 행동 심리 진단서',
        description: '마우스 궤적과 체류 시간 기반 텔레메트리 성격 분석 리포트',
      };
    }

    const title = `[${decoded.mbti} · ${decoded.behaviorPersona.title}] 나의 무의식 행동 MBTI 진단서`;
    const description = `${decoded.mbtiTitle} | 종합 확신도 ${decoded.overallCertainty}% · 고민 속도 상위 ${decoded.benchmark.dwellTimePercentile}%`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `https://mbti.opentoyapp.kr/result?data=${data}`,
        siteName: 'Behavior MBTI',
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
      title: 'Behavior MBTI | 무의식 행동 심리 진단서',
      description: '마우스 궤적과 체류 시간 기반 텔레메트리 성격 분석 리포트',
    };
  }
}

export default function ResultPage() {
  return <ResultClient />;
}
