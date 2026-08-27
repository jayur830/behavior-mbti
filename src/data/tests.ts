export interface TestCatalogItem {
  id: string;
  seriesNumber: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  estimatedTime: string;
  questionCount: number;
  status: 'active' | 'coming_soon';
  badge?: string;
  badgeColor?: string;
  route: string;
  tags: string[];
  gradient: string;
  borderColor: string;
}

export const TEST_CATALOG: TestCatalogItem[] = [
  {
    id: 'mbti',
    seriesNumber: 'TEST 01',
    title: '무의식 궤적 기반 MBTI 성향 검사',
    subtitle: '선택지 위의 머뭇거림으로 밝혀내는 16가지 본능적 성향',
    description:
      '정제된 답변 뒤에 남겨진 마우스 커서의 궤적, 체류 시간, 답변 번복을 실시간 캡처하여 진짜 내면과 사회적 페르소나의 차이를 정밀 분석합니다.',
    category: '성격 유형',
    estimatedTime: '약 3~5분',
    questionCount: 40,
    status: 'active',
    badge: 'HOT · 대표 검사',
    badgeColor: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
    route: '/test',
    tags: ['마우스 궤적 분석', '16가지 성향', '본능 vs 고민 갭', '확신도 지표'],
    gradient: 'from-emerald-500/15 via-teal-500/10 to-transparent',
    borderColor: 'border-emerald-500/30 hover:border-emerald-500/60',
  },
  {
    id: 'decision-hesitation',
    seriesNumber: 'TEST 02',
    title: '결정 장애 & 망설임 지수 테스트',
    subtitle: '양자택일 딜레마 상황에서의 동공과 커서 방황 지수 측정',
    description:
      '극단적인 밸런스 게임과 딜레마 문항을 제시하여, 버튼 사이를 오간 거리와 지그재그 회수율로 나의 결정 장애 등급과 결단 유형을 도출합니다.',
    category: '의사결정 스타일',
    estimatedTime: '약 2분',
    questionCount: 20,
    status: 'coming_soon',
    badge: 'PREPARING',
    badgeColor: 'bg-muted/80 border-border text-muted-foreground',
    route: '#',
    tags: ['딜레마 시뮬레이션', '결정 속도 랭킹', '우유부단 지수', '단호함 측정'],
    gradient: 'from-muted/40 via-muted/20 to-transparent',
    borderColor: 'border-border hover:border-border/80',
  },
  {
    id: 'big-five',
    seriesNumber: 'TEST 03',
    title: 'Big-5 무의식 인터랙션 성격 특성',
    subtitle: '5대 성격 요인(개방성, 성실성, 외향성, 친화성, 신경증) 정밀 분석',
    description:
      '학술적 Big-5 모델 척도에 인터랙션 텔레메트리를 결합하여, 각 성격 특성의 일관성과 반응 잠복기를 다차원 그래프로 시각화합니다.',
    category: '심리 특성',
    estimatedTime: '약 4~6분',
    questionCount: 50,
    status: 'coming_soon',
    badge: 'PREPARING',
    badgeColor: 'bg-muted/80 border-border text-muted-foreground',
    route: '#',
    tags: ['Big 5 모델', '오각형 방사형 차트', '일관성 지표', '반응 잠복기'],
    gradient: 'from-muted/40 via-muted/20 to-transparent',
    borderColor: 'border-border hover:border-border/80',
  },
  {
    id: 'cognitive-reflex',
    seriesNumber: 'TEST 04',
    title: '직관 vs 이성 인지 리플렉스 검사',
    subtitle: '감각적 직관(System 1)과 분석적 사고(System 2)의 작동 비중',
    description:
      '문항 노출 직후 첫 번째 터치/클릭까지의 반응 속도와 최종 선택 간의 교차 상관관계를 분석하여 직관형과 숙고형의 황금 비율을 계산합니다.',
    category: '인지 스타일',
    estimatedTime: '약 2분',
    questionCount: 15,
    status: 'coming_soon',
    badge: 'PREPARING',
    badgeColor: 'bg-muted/80 border-border text-muted-foreground',
    route: '#',
    tags: ['인지 반사 속도', '직관 vs 이성 비율', '시스템 1 & 2', '반응 시간'],
    gradient: 'from-muted/40 via-muted/20 to-transparent',
    borderColor: 'border-border hover:border-border/80',
  },
];
