import { BehaviorPersona } from '../types';

export interface MBTIProfile {
  title: string;
  subtitle: string;
  summary: string;
  traits: string[];
  behaviorAdvice: string;
}

export const MBTI_PROFILES: Record<string, MBTIProfile> = {
  INTJ: {
    title: '용의주도한 전략가',
    subtitle: '확고한 통찰력과 치밀한 계획의 설계자',
    summary: '전체적인 그림을 조망하며 논리와 전략으로 목표를 달성하는 타입입니다.',
    traits: ['전략적 사고', '높은 독립성', '지적 호기심', '원칙주의'],
    behaviorAdvice: '충분한 확신을 얻기 전까지 신중하게 검증하며, 행동 데이터에서도 높은 일관성을 보입니다.',
  },
  INTP: {
    title: '논리적인 사색가',
    subtitle: '끝없는 호기심과 지적 탐구의 철학자',
    summary: '복잡한 이론과 원리를 파고들며 언제나 새로운 가능성에 열려있는 탐구자입니다.',
    traits: ['분석적', '창의적 문제 해결', '유연한 사고', '객관성 추구'],
    behaviorAdvice: '선택지를 두고 여러 각도에서 생각하느라 체류 시간이 길고 마우스 탐색 반경이 넓습니다.',
  },
  ENTJ: {
    title: '대담한 통솔자',
    subtitle: '결단력과 비전으로 길을 개척하는 리더',
    summary: '명확한 비전과 강력한 추진력으로 팀과 프로젝트를 성공으로 이끄는 지도자입니다.',
    traits: ['단호한 결단', '체계적 실행', '목표 지향', '자신감'],
    behaviorAdvice: '질문을 읽고 답을 결정하기까지의 지연 시간이 가장 짧으며, 수정 횟수가 적은 편입니다.',
  },
  ENTP: {
    title: '뜨거운 논쟁을 즐기는 변론가',
    subtitle: '번뜩이는 재치와 지적 모험의 탐험가',
    summary: '새로운 발상과 위트로 통념에 도전하고 새로운 가능성을 창조하는 아이디어 뱅크입니다.',
    traits: ['독창적 아이디어', '임기응변', '논쟁 즐김', '호기심'],
    behaviorAdvice: '보통(중립)보다는 극단적인 양끝 선택지를 오가며 흥미로운 마우스 궤적을 보입니다.',
  },
  INFJ: {
    title: '선의의 옹호자',
    subtitle: '깊은 통찰과 이상을 품은 조용한 예언자',
    summary: '타인에 대한 깊은 공감과 확고한 신념을 바탕으로 더 나은 세상을 꿈꾸는 이상주의자입니다.',
    traits: ['통찰력', '인도주의', '진정성', '깊은 내면'],
    behaviorAdvice: '타인과의 관계 문항에서 첫 선택과 최종 선택 간의 심리적 고뇌가 드러나는 편입니다.',
  },
  INFP: {
    title: '열정적인 중재자',
    subtitle: '따뜻한 감성과 나만의 가치를 지키는 몽상가',
    summary: '자신만의 깊은 가치관과 이상을 간직하며 타인의 감정을 섬세하게 어루만지는 힐러입니다.',
    traits: ['풍부한 감수성', '진정성', '이타적', '예술적 감각'],
    behaviorAdvice: '자기 가치관과 맞닿은 문항에서 마우스를 지그시 머무르며 신중하게 마음을 살핍니다.',
  },
  ENFJ: {
    title: '정의로운 주인공',
    subtitle: '선한 영향력으로 사람을 이끄는 카리스마 리더',
    summary: '따뜻한 카리스마와 뛰어난 공감 능력으로 사람들의 잠재력을 이끌어내는 동기부여자입니다.',
    traits: ['공감 능력', '협동심', '타인 배려', '열정'],
    behaviorAdvice: '관계 지향적인 선택지에서 빠른 선택을 보이며, 사람에 대한 긍정적 지표가 뚜렷합니다.',
  },
  ENFP: {
    title: '재기발랄한 활동가',
    subtitle: '자유로운 영혼과 넘치는 열정의 에너지원',
    summary: '창의적이고 낙천적인 에너지로 주변에 활력을 불어넣는 분위기 메이커입니다.',
    traits: ['긍정 에너지', '창의성', '사교성', '즉흥성'],
    behaviorAdvice: '마우스 궤적이 다채롭고 빠르며, 순간적인 직관에 따라 시원시원하게 반응합니다.',
  },
  ISTJ: {
    title: '청렴결백한 논리주의자',
    subtitle: '신뢰와 책임감의 굳건한 기둥',
    summary: '철저한 사실과 원칙에 기반하여 맡은 바 책임을 빈틈없이 완수하는 완벽주의자입니다.',
    traits: ['책임감', '정확성', '원칙 준수', '현실적'],
    behaviorAdvice: '규칙과 계획 관련 문항에서 단 1초의 망설임도 없이 직진하는 궤적을 보입니다.',
  },
  ISFJ: {
    title: '용감한 수호자',
    subtitle: '따스한 헌신과 세심한 배려의 보호자',
    summary: '조용하지만 묵묵하게 주변 사람들을 세심하게 챙기고 지켜주는 든든한 조력자입니다.',
    traits: ['헌신적', '세심함', '인내심', '신뢰성'],
    behaviorAdvice: '갈등이나 비판 관련 문항에서 상대의 기분을 고려해 완화된 선택지로 수정하는 경향이 있습니다.',
  },
  ESTJ: {
    title: '엄격한 관리자',
    subtitle: '현실적 질서와 확고한 실행의 리더',
    summary: '명확한 사실과 기준을 바탕으로 조직과 일을 효율적으로 운영하는 실무형 관리자입니다.',
    traits: ['추진력', '현실 감각', '조직력', '명확성'],
    behaviorAdvice: '답변 수정 비율이 가장 낮으며, 마우스가 흔들림 없이 직선으로 이동합니다.',
  },
  ESFJ: {
    title: '사교적인 외교관',
    subtitle: '화합과 친절로 공동체를 묶는 분위기 메이커',
    summary: '친절하고 배려 깊은 태도로 사람들과 어울리며 조화로운 분위기를 만드는 친화력의 달인입니다.',
    traits: ['친화력', '봉사 정신', '따뜻한 마음', '책임감'],
    behaviorAdvice: '관계와 공감에 대한 문항에 즉각적이고 확신에 찬 반응을 보입니다.',
  },
  ISTP: {
    title: '만능 재주꾼',
    subtitle: '냉철한 이성과 뛰어난 적응력의 장인',
    summary: '호기심과 실용적 감각으로 문제를 직접 분해하고 해결책을 찾아내는 실용주의자입니다.',
    traits: ['손재주/도구 활용', '침착함', '임기응변', '효율 추구'],
    behaviorAdvice: '불필요한 마우스 움직임을 최소화하고 가장 짧은 동선으로 클릭을 완료합니다.',
  },
  ISFP: {
    title: '호기심 많은 예술가',
    subtitle: '온화한 감수성과 미적 감각의 방랑자',
    summary: '현재의 순간을 음미하며 자신만의 독창적인 감각과 따뜻한 시선으로 세상을 바라봅니다.',
    traits: ['감성적', '자유로움', '배려심', '예술적 안목'],
    behaviorAdvice: '화면의 다양한 요소를 부드럽게 훑어보며 잔잔하고 안정적인 체류 패턴을 가집니다.',
  },
  ESTP: {
    title: '모험을 즐기는 사업가',
    subtitle: '스릴과 행동력으로 현장을 휘어잡는 승부사',
    summary: '위험을 두려워하지 않고 즉각적인 행동과 직관으로 기회를 포착하는 행동파입니다.',
    traits: ['행동파', '대담함', '사교적', '위기 대처력'],
    behaviorAdvice: '전체 문항 풀이 시간이 매우 빠르고 거침없는 클릭 속도를 자랑합니다.',
  },
  ESFP: {
    title: '자유로운 영혼의 연예인',
    subtitle: '넘치는 흥과 매력으로 무대를 빛내는 스타',
    summary: '언제나 에너지가 넘치며 사람들과 함께 즐거운 순간을 나누는 천생 엔터테이너입니다.',
    traits: ['열정', '사교성', '순간 몰입', '낙천적'],
    behaviorAdvice: '빠른 반응과 함께 다양한 선택지를 경쾌하게 탐색하는 활발한 마우스 궤적을 보입니다.',
  },
};

export const BEHAVIOR_PERSONAS: Record<string, BehaviorPersona> = {
  THE_DECISIVE: {
    code: 'THE_DECISIVE',
    title: '초고속 직진 결단파 (The Decisive Sniper)',
    subtitle: '질문을 보자마자 1초의 망설임 없이 직선으로 클릭',
    description: '자기 확신이 매우 강하고 자기 인식이 명확합니다. 선택지를 바꾼 횟수가 거의 없으며 마우스 궤적이 군더더기 없이 목표 선택지로 직진했습니다.',
    iconName: 'Zap',
    tags: ['#강철확신', '#칼같은결정', '#직진마우스', '#후회제로'],
  },
  THE_DELIBERATOR: {
    code: 'THE_DELIBERATOR',
    title: '심사숙고 장고파 (The Deep Deliberator)',
    subtitle: '한 번 누를 때도 모든 경우의 수를 곱씹는 신중함',
    description: '질문의 맥락과 자신의 과거 경험을 세심하게 반추한 뒤 신중하게 답변을 확정했습니다. 평균 체류 시간이 길고 집중도가 높습니다.',
    iconName: 'Brain',
    tags: ['#진중한고민', '#디테일장인', '#깊은생각', '#신중모드'],
  },
  THE_VACILLATOR: {
    code: 'THE_VACILLATOR',
    title: '갈팡질팡 갈대형 (The Dilemma Juggler)',
    subtitle: '"이것도 나고 저것도 나인데..." 내면의 치열한 배틀',
    description: '답변을 선택했다가 다른 쪽으로 바꾼 횟수가 많습니다. 상황에 따라 유연하게 대처하는 다채로운 페르소나를 지닌 입체적인 사람입니다.',
    iconName: 'Compass',
    tags: ['#치열한고민', '#선택지유턴', '#다각도검토', '#입체적성격'],
  },
  THE_EXPLORER: {
    code: 'THE_EXPLORER',
    title: '마우스 춤추는 탐색형 (The Free Explorer)',
    subtitle: '선택지 전체를 리드미컬하게 훑어보며 탐색',
    description: '선택지를 결정하기 전 마우스로 여러 옵션을 고르게 호버하며 화면 전체를 탐색했습니다. 호기심과 관찰력이 풍부합니다.',
    iconName: 'Sparkles',
    tags: ['#호기심가득', '#화면스캔', '#리드미컬', '#탐험가'],
  },
  THE_STEALTH: {
    code: 'THE_STEALTH',
    title: '미니멀 스텔스형 (The Stealth Minimalist)',
    subtitle: '최소한의 에너지 소모로 깔끔하고 담백하게 완료',
    description: '마우스 이동 거리와 방황이 매우 적고, 필요한 순간에만 정밀하게 타격하듯 검사를 끝마쳤습니다. 에너지 효율의 극치입니다.',
    iconName: 'Target',
    tags: ['#효율극대화', '#미니멀무브', '#군더더기제로', '#담백함'],
  },
};
