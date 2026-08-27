/**
 * MBTI 8대 단일 성향 지표
 * E(외향), I(내향), S(감각), N(직관), T(사고), F(감정), J(판단), P(인식)
 */
export type MBTIType = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';

/**
 * MBTI 4대 대립 성향 축
 * EI: 외향/내향, SN: 감각/직관, TF: 사고/감정, JP: 판단/인식
 */
export type Dimension = 'EI' | 'SN' | 'TF' | 'JP';

/**
 * 사용자가 테스트에 활용한 주 입력 장치 유형
 */
export type InputDevice = 'mouse' | 'touch' | 'keyboard';

/**
 * Next.js App Router 공통 PageProps 제네릭 타입
 * params 및 searchParams 비동기 Promise 구조를 지원합니다.
 */
export interface PageProps<
  TParams = Record<string, string | string[] | undefined>,
  TSearchParams = Record<string, string | string[] | undefined>,
> {
  /** 동적 라우트 URL 파라미터 Promise (예: { hash: string }) */
  params?: Promise<TParams>;
  /** 쿼리스트링 파라미터 Promise (예: { r: string }) */
  searchParams?: Promise<TSearchParams>;
}

/**
 * 설문 문항 정보 인터페이스
 */
export interface Question {
  /** 문항 고유 ID */
  id: number;
  /** 문항이 속한 4대 성향 축 (EI, SN, TF, JP) */
  dimension: Dimension;
  /** 동의(양수 척도) 시 가산되는 성향 (예: 'E') */
  positiveType: MBTIType;
  /** 비동의(음수 척도) 시 가산되는 성향 (예: 'I') */
  negativeType: MBTIType;
  /** 질문 본문 */
  title: string;
  /** 질문에 대한 부가 설명 (선택) */
  description?: string;
  /** 질문 범주 분류 (사회적 관계, 인지/정보수집, 의사결정, 생활양식) */
  category: 'social' | 'cognition' | 'decision' | 'lifestyle';
}

/**
 * 마우스/포인터의 실시간 2D 좌표 및 시점 로그
 */
export interface MousePoint {
  /** 0~1로 정규화된 컨테이너 기준 X 좌표 */
  x: number;
  /** 0~1로 정규화된 컨테이너 기준 Y 좌표 */
  y: number;
  /** 문항 진입 시점부터의 상대 경과 시간 (ms) */
  timestamp: number;
  /** 포인터 이동 속도 (px/ms) */
  speed?: number;
  /** 포인터 이벤트 유형 (이동, 터치, 키보드) */
  type?: 'move' | 'touch' | 'key';
}

/**
 * 선택지 호버(Hover) 체류 로그 인터페이스
 */
export interface OptionHoverLog {
  /** 호버된 리커트 척도 값 (-3 ~ +3) */
  optionValue: number;
  /** 호버 진입 시점 (문항 시작 기준 ms) */
  enterTime: number;
  /** 호버 이탈 시점 (문항 시작 기준 ms) */
  leaveTime: number;
  /** 호버 지속 시간 (ms) */
  duration: number;
}

/**
 * 답변 선택(클릭/탭/키보드) 발생 이벤트 인터페이스
 */
export interface AnswerSelectionEvent {
  /** 선택한 리커트 척도 값 (-3 ~ +3) */
  value: number;
  /** 선택이 일어난 시점 (문항 시작 기준 ms) */
  timestamp: number;
  /** 직전 선택 변경 이후 경과한 시간 (ms) */
  timeSinceLastChange?: number;
  /** 모바일 터치 다운부터 업까지의 누름 시간 (ms) */
  pressDuration?: number;
  /** 선택 시 사용된 입력 장치 */
  inputDevice?: InputDevice;
}

/**
 * 모바일/터치 환경 전용 세부 터치 메트릭
 */
export interface TouchMetrics {
  /** 문항 진입 후 첫 터치 발생까지의 반응 잠복기 (ms) */
  firstTapLatency: number;
  /** 터치 화면을 누르고 있던 평균 시간 (ms) */
  averagePressDuration: number;
  /** 마지막 선택 후 '다음' 버튼을 누르기까지의 확정 딜레이 (ms) */
  confirmationDelay: number;
  /** 문항 내에서 발생한 총 탭(터치) 횟수 */
  tapCount: number;
}

/**
 * 단일 문항에 대한 행동 추적(Telemetry) 종합 로그
 */
export interface QuestionBehaviorLog {
  /** 대상 문항 ID */
  questionId: number;
  /** 문항 진입 타임스탬프 (Unix epoch ms) */
  startTime: number;
  /** 다음 문항 이동 타임스탬프 (Unix epoch ms) */
  endTime: number;
  /** 문항에 머무른 총 체류 시간 (ms) */
  totalDwellTime: number;
  /** 첫 마우스 이동/키 입력/터치가 발생한 시점 (ms) */
  firstInteractionTime: number | null;
  /** 최종 제출된 리커트 척도 선택값 (-3 ~ +3) */
  finalValue: number | null;
  /** 선택 번복 및 클릭 이력 배열 */
  selectionHistory: AnswerSelectionEvent[];
  /** 선택지를 번복/변경한 총 횟수 */
  changeCount: number;
  /** 선택지 위에 머무른 호버 이력 목록 */
  hoverLogs: OptionHoverLog[];
  /** 마우스 이동 궤적 포인트 배열 */
  mouseTrajectory: MousePoint[];
  /** 마우스 이동 중 급격한 방향 전환(머뭇거림) 횟수 */
  directionChanges: number;
  /** 체류 시간, 방향 전환, 번복 횟수를 종합한 망설임 지수 (0~100) */
  hesitationScore: number;
  /** 문항 진행 중 브라우저 탭 이탈(Blur) 횟수 */
  tabBlurCount: number;
  /** 주 사용 입력 장치 */
  primaryDevice: InputDevice;
  /** 키보드 단축키 사용 횟수 */
  keyStrokeCount: number;
  /** 모바일 환경일 경우 터치 메트릭 데이터 */
  touchMetrics?: TouchMetrics;
}

/**
 * 4대 성향 축별 분석 결과 인터페이스
 */
export interface DimensionAnalysis {
  /** 분석 대상 성향 축 (EI, SN, TF, JP) */
  dimension: Dimension;
  /** 좌측 성향 지표 (E, S, T, J) */
  leftType: MBTIType;
  /** 우측 성향 지표 (I, N, F, P) */
  rightType: MBTIType;
  /** 좌측 지표 환산 점수 (0~100) */
  leftScore: number;
  /** 우측 지표 환산 점수 (0~100) */
  rightScore: number;
  /** 최종 우세한 성향 지표 */
  winner: MBTIType;
  /** 우세 지표의 백분율 비율 (50~100%) */
  winnerPercentage: number;
  /** 행동 궤적과 답변 강도를 종합한 축별 확신도 점수 (0~100%) */
  certaintyScore: number;
  /** 축에 속한 문항들의 평균 망설임 시간 (ms) */
  averageHesitation: number;
  /** 축에 속한 문항들의 총 번복 횟수 */
  changeCount: number;
  /** 행동 패턴 기반 심리적 해석 인사이트 문구 */
  behaviorInsight: string;
}

/**
 * 무의식 행동 패턴 기반 페르소나 프로필 인터페이스
 */
export interface BehaviorPersona {
  /** 페르소나 고유 코드 (예: 'INTUITIVE_SPRINTER') */
  code: string;
  /** 페르소나 메인 타이틀 (예: '직관적 돌격형') */
  subtitle: string;
  /** 페르소나 서브 설명 */
  title: string;
  /** 페르소나 상세 해설 */
  description: string;
  /** 대표 아이콘 이름 (Zap, Brain, Compass, Sparkles, Target) */
  iconName: string;
  /** 페르소나 핵심 키워드 태그 목록 */
  tags: string[];
}

/**
 * 가장 고민이 깊었던 딜레마 문항의 상세 분석 정보
 */
export interface DilemmaQuestionDetail {
  /** 해당 문항 메타데이터 */
  question: Question;
  /** 해당 문항의 행동 궤적 로그 */
  behavior: QuestionBehaviorLog;
  /** 결정까지 소요된 망설임 시간 (ms) */
  hesitationTime: number;
  /** 선택 번복 과정 요약 텍스트 */
  changeHistorySummary: string;
  /** 심층 심리 해석 인사이트 */
  insight: string;
  /** 호버 체류 요약 */
  hoverSummary?: string;
  /** 가장 오래 머뭇거렸던 선택지 척도 값 */
  longestHoveredOption?: number | null;
}

/**
 * 선택지 호버 심리 분석 결과 인터페이스
 */
export interface HoverPsychologyAnalysis {
  /** 총 선택지 호버 횟수 */
  totalHoverCount: number;
  /** 호버로 머무른 총 시간 (ms) */
  totalHoverDurationMs: number;
  /** 1초 이상 고민하며 맴돌았던 선택지 개수 */
  hesitatedOptionsCount: number;
  /** 호버 패턴 종합 인사이트 */
  hoverInsight: string;
  /** 호버로 고민하다가 다른 선택지로 바꾼 갈등 문항 목록 */
  conflictedHoverItems: {
    questionTitle: string;
    hoveredOptionLabel: string;
    finalOptionLabel: string;
    hoverDurationMs: number;
    interpretation: string;
  }[];
}

/**
 * 첫 직감과 최종 선택 간의 차이(사회적 페르소나 갭) 분석
 */
export interface PersonaGapAnalysis {
  /** 무의식적 본능과 최종 답변 간의 괴리 감지 여부 */
  detected: boolean;
  /** 괴리가 발생한 문항 수 */
  count: number;
  /** 페르소나 갭 종합 요약 문구 */
  summary: string;
  /** 페르소나 갭이 발생한 세부 문항 분석 */
  items: {
    question: Question;
    initialChoiceText: string;
    finalChoiceText: string;
    hesitationDuration: number;
    psychologicalInterpretation: string;
  }[];
}

/**
 * 전체 참여자 대비 실시간 벤치마크 통계 인터페이스
 */
export interface BenchmarkStats {
  /** 총 소요 시간 기준 상위 백분위 (%) */
  dwellTimePercentile: number;
  /** 번복 횟수 기준 결정력 상위 백분위 (%) */
  changeCountPercentile: number;
  /** 전체 참여자의 평균 체류 시간 (초) */
  globalAverageDwellSec: number;
  /** 전체 참여자의 평균 선택 번복 횟수 */
  globalAverageChanges: number;
  /** 행동 페르소나별 전체 분포 비율 */
  personaDistribution: {
    personaCode: string;
    name: string;
    percentage: number;
  }[];
  /** 가장 번복률이 높았던 고난도 문항 랭킹 */
  topRevisedQuestionsRank: {
    rank: number;
    questionId: number;
    questionTitle: string;
    revisionRate: number;
  }[];
}

/**
 * 행동 궤적 및 무의식 성향 종합 분석 결과 인터페이스
 */
export interface FullAnalysisResult {
  /** 4자리 최종 MBTI 유형 코드 (예: 'INTJ') */
  mbti: string;
  /** MBTI 유형 타이틀 (예: '용의주도한 전략가') */
  mbtiTitle: string;
  /** MBTI 유형 상세 설명 */
  mbtiDescription: string;
  /** 4대 성향 축(EI, SN, TF, JP)별 세부 분석 결과 */
  dimensions: {
    EI: DimensionAnalysis;
    SN: DimensionAnalysis;
    TF: DimensionAnalysis;
    JP: DimensionAnalysis;
  };
  /** 전체 종합 확신도 점수 (0~100%) */
  overallCertainty: number;
  /** 테스트에 소요된 총 시간 (ms) */
  totalTestDuration: number;
  /** 테스트 진행 중 발생한 총 답변 번복 횟수 */
  totalAnswerChanges: number;
  /** 행동 패턴 기반 도출된 페르소나 프로필 */
  behaviorPersona: BehaviorPersona;
  /** 전체 문항별 궤적 및 세부 상세 데이터 */
  allQuestionDetails: DilemmaQuestionDetail[];
  /** 가장 고민과 갈등이 깊었던 상위 딜레마 문항 목록 */
  topDilemmas: DilemmaQuestionDetail[];
  /** 마우스/터치 호버 심리 분석 리포트 */
  hoverAnalysis: HoverPsychologyAnalysis;
  /** 첫 직감 vs 최종 선택 간 페르소나 갭 분석 */
  personaGap: PersonaGapAnalysis;
  /** 마우스 궤적 및 포인터 물리 데이터 통계 요약 */
  mouseTrajectoryStats: {
    totalDistanceNormalized: number;
    averageSpeed: number;
    indecisivenessIndex: number;
    primaryDevice: InputDevice;
    keyStrokeCount: number;
    totalHoverCount: number;
  };
  /** 전체 데이터셋 대비 벤치마크 통계 */
  benchmark: BenchmarkStats;
}
