export type MBTIType = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';
export type Dimension = 'EI' | 'SN' | 'TF' | 'JP';

export interface Question {
  id: number;
  dimension: Dimension;
  positiveType: MBTIType; // e.g., 'E', 'N', 'T', 'J'
  negativeType: MBTIType; // e.g., 'I', 'S', 'F', 'P'
  title: string;
  description?: string;
  category: 'social' | 'cognition' | 'decision' | 'lifestyle';
}

export interface MousePoint {
  x: number; // 0~1 normalized relative to card / viewport
  y: number;
  timestamp: number; // relative ms from question start
  speed?: number; // px/ms
}

export interface OptionHoverLog {
  optionValue: number; // -3 to 3
  enterTime: number; // ms
  leaveTime: number; // ms
  duration: number; // ms
}

export interface AnswerSelectionEvent {
  value: number; // -3 to 3
  timestamp: number; // ms from question start
  timeSinceLastChange?: number; // ms
}

export interface QuestionBehaviorLog {
  questionId: number;
  startTime: number; // unix timestamp
  endTime: number;
  totalDwellTime: number; // ms
  firstInteractionTime: number | null; // ms from start
  finalValue: number | null; // -3 to 3
  selectionHistory: AnswerSelectionEvent[];
  changeCount: number; // number of times answer was changed
  hoverLogs: OptionHoverLog[];
  mouseTrajectory: MousePoint[];
  directionChanges: number; // mouse zig-zag count
  hesitationScore: number; // 0 to 100 calculated
  tabBlurCount: number; // if user switched tab
}

export interface DimensionAnalysis {
  dimension: Dimension;
  leftType: MBTIType;
  rightType: MBTIType;
  leftScore: number;
  rightScore: number;
  winner: MBTIType;
  winnerPercentage: number;
  certaintyScore: number; // 0~100 (high = decisive, low = conflicted)
  averageHesitation: number; // ms
  changeCount: number;
  behaviorInsight: string;
}

export interface BehaviorPersona {
  code: string;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  tags: string[];
}

export interface DilemmaQuestionDetail {
  question: Question;
  behavior: QuestionBehaviorLog;
  hesitationTime: number; // ms
  changeHistorySummary: string;
  insight: string;
}

export interface PersonaGapAnalysis {
  detected: boolean;
  count: number;
  summary: string;
  items: {
    question: Question;
    initialChoiceText: string;
    finalChoiceText: string;
    hesitationDuration: number;
    psychologicalInterpretation: string;
  }[];
}

export interface FullAnalysisResult {
  mbti: string; // e.g. "ENTJ"
  mbtiTitle: string;
  mbtiDescription: string;
  dimensions: {
    EI: DimensionAnalysis;
    SN: DimensionAnalysis;
    TF: DimensionAnalysis;
    JP: DimensionAnalysis;
  };
  overallCertainty: number; // 0~100
  totalTestDuration: number; // ms
  totalAnswerChanges: number;
  behaviorPersona: BehaviorPersona;
  topDilemmas: DilemmaQuestionDetail[];
  personaGap: PersonaGapAnalysis;
  mouseTrajectoryStats: {
    totalDistanceNormalized: number;
    averageSpeed: number;
    indecisivenessIndex: number; // 0~100
  };
}
