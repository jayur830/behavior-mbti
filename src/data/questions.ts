import { Question } from '../types';

export const LIKERT_OPTIONS = [
  { value: -3, label: '매우 아니다', color: '#ef4444', size: 'w-12 h-12' },
  { value: -2, label: '아니다', color: '#f87171', size: 'w-10 h-10' },
  { value: -1, label: '약간 아니다', color: '#fca5a5', size: 'w-8 h-8' },
  { value: 0, label: '보통 / 중립', color: '#94a3b8', size: 'w-7 h-7' },
  { value: 1, label: '약간 그렇다', color: '#86efac', size: 'w-8 h-8' },
  { value: 2, label: '그렇다', color: '#4ade80', size: 'w-10 h-10' },
  { value: 3, label: '매우 그렇다', color: '#22c55e', size: 'w-12 h-12' },
];

export function getOptionLabel(value: number): string {
  const found = LIKERT_OPTIONS.find((opt) => opt.value === value);
  return found ? found.label : `${value}`;
}

export const QUESTIONS: Question[] = [
  // E vs I (Positive = E, Negative = I)
  {
    id: 1,
    dimension: 'EI',
    positiveType: 'E',
    negativeType: 'I',
    title: '처음 보는 사람들과 모인 파티나 모임에서도 금방 어색함 없이 대화를 주도한다.',
    description: '낯선 공간에서 에너지를 얻고 먼저 말을 거는 편인가요?',
    category: 'social',
  },
  {
    id: 2,
    dimension: 'EI',
    positiveType: 'E',
    negativeType: 'I',
    title: '주말에 약속 없이 혼자 집에서 온종일 보내면 충전되기보다 오히려 답답하고 무기력해진다.',
    description: '휴식의 방식이 사람들과의 교류인지, 혼자만의 온전한 고요함인지 생각해보세요.',
    category: 'social',
  },
  {
    id: 3,
    dimension: 'EI',
    positiveType: 'E',
    negativeType: 'I',
    title: '생각이나 고민이 있을 때 혼자 속으로 정리하기보다는 말로 뱉으며 생각을 구체화한다.',
    description: '대화를 통해 생각을 정리하는 편인가요, 생각이 정리된 후에야 입을 여는 편인가요?',
    category: 'social',
  },

  // S vs N (Positive = N, Negative = S)
  {
    id: 4,
    dimension: 'SN',
    positiveType: 'N',
    negativeType: 'S',
    title: '영화나 책을 볼 때 줄거리보다 그 안에 담긴 숨은 은유나 철학적 의미를 곱씹는 것이 즐겁다.',
    description: '있는 그대로의 사실과 디테일보다 행간의 의미와 상상력에 더 끌리나요?',
    category: 'cognition',
  },
  {
    id: 5,
    dimension: 'SN',
    positiveType: 'N',
    negativeType: 'S',
    title: '"만약 인류가 화성으로 이주한다면?" 같은 엉뚱하고 실현 가능성 낮은 상상에 자주 빠진다.',
    description: '현실적인 현재의 문제보다 미래의 가능성과 IF 시나리오를 떠올리는 빈도를 체크해보세요.',
    category: 'cognition',
  },
  {
    id: 6,
    dimension: 'SN',
    positiveType: 'N',
    negativeType: 'S',
    title: '일할 때 구체적인 매뉴얼과 선례를 따르기보다 새로운 방식과 아이디어를 시도하는 편이다.',
    description: '검증된 실용성을 선호하는지, 파격적이고 새로운 시도를 즐기는지 돌아보세요.',
    category: 'cognition',
  },

  // T vs F (Positive = T, Negative = F)
  {
    id: 7,
    dimension: 'TF',
    positiveType: 'T',
    negativeType: 'F',
    title: '친구가 억울한 일을 당해 하소연할 때, "속상했겠다"는 위로보다 문제의 원인과 해결책이 먼저 떠오른다.',
    description: '마음의 공감과 정서적 지지가 먼저인지, 객관적 상황 파악과 해결책이 먼저인가요?',
    category: 'decision',
  },
  {
    id: 8,
    dimension: 'TF',
    positiveType: 'T',
    negativeType: 'F',
    title: '중요한 결정을 내릴 때 주변 사람의 감정이나 기분보다 논리적 타당성과 효율성을 우선한다.',
    description: '인간관계의 조화와 화합 vs 원칙과 합리성 중 무게중심이 어디에 있나요?',
    category: 'decision',
  },
  {
    id: 9,
    dimension: 'TF',
    positiveType: 'T',
    negativeType: 'F',
    title: '솔직하고 명확한 비판이 듣기 좋은 모호한 칭찬보다 훨씬 가치 있다고 생각한다.',
    description: '기분이 상할 수 있어도 팩트가 우선인가요, 상대의 감정을 배려한 전달이 우선인가요?',
    category: 'decision',
  },

  // J vs P (Positive = J, Negative = P)
  {
    id: 10,
    dimension: 'JP',
    positiveType: 'J',
    negativeType: 'P',
    title: '여행을 갈 때 엑셀이나 메모장에 시간대별 동선과 식당 후보군을 미리 철저히 계획해둔다.',
    description: '계획대로 흘러가는 안정감이 좋은지, 그날의 기분과 우연에 맡기는 자유가 좋은가요?',
    category: 'lifestyle',
  },
  {
    id: 11,
    dimension: 'JP',
    positiveType: 'J',
    negativeType: 'P',
    title: '마감일이 정해진 과제나 프로젝트는 벼락치기하기보다 여유를 두고 미리 끝내놓아야 마음이 편하다.',
    description: '체계적인 선제 완성을 선호하나요, 마감 직전의 극한 몰입감을 즐기는 편인가요?',
    category: 'lifestyle',
  },
  {
    id: 12,
    dimension: 'JP',
    positiveType: 'J',
    negativeType: 'P',
    title: '갑작스러운 일정 변경이나 예상치 못한 변수가 생기면 흥미롭기보다 스트레스를 크게 받는다.',
    description: '예측 불가능한 유연한 상황에 대처하는 본인의 솔직한 스트레스 반응은 어떤가요?',
    category: 'lifestyle',
  },
];
