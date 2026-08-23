export type MBTIType = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';
export type Dimension = 'EI' | 'SN' | 'TF' | 'JP';
export type InputDevice = 'mouse' | 'touch' | 'keyboard';

export interface Question {
  id: number;
  dimension: Dimension;
  positiveType: MBTIType;
  negativeType: MBTIType;
  title: string;
  description?: string;
  category: 'social' | 'cognition' | 'decision' | 'lifestyle';
}

export interface MousePoint {
  x: number; // 0~1 normalized
  y: number;
  timestamp: number; // relative ms from question start
  speed?: number; // px/ms
  type?: 'move' | 'touch' | 'key';
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
  pressDuration?: number; // ms touch down to up
  inputDevice?: InputDevice;
}

export interface TouchMetrics {
  firstTapLatency: number; // ms until first touch
  averagePressDuration: number; // ms touch press time
  confirmationDelay: number; // ms between last tap and next click
  tapCount: number;
}

export interface QuestionBehaviorLog {
  questionId: number;
  startTime: number;
  endTime: number;
  totalDwellTime: number;
  firstInteractionTime: number | null;
  finalValue: number | null;
  selectionHistory: AnswerSelectionEvent[];
  changeCount: number;
  hoverLogs: OptionHoverLog[];
  mouseTrajectory: MousePoint[];
  directionChanges: number;
  hesitationScore: number;
  tabBlurCount: number;
  primaryDevice: InputDevice;
  keyStrokeCount: number;
  touchMetrics?: TouchMetrics;
}

export interface DimensionAnalysis {
  dimension: Dimension;
  leftType: MBTIType;
  rightType: MBTIType;
  leftScore: number;
  rightScore: number;
  winner: MBTIType;
  winnerPercentage: number;
  certaintyScore: number;
  averageHesitation: number;
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
  hesitationTime: number;
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

export interface BenchmarkStats {
  dwellTimePercentile: number;
  changeCountPercentile: number;
  globalAverageDwellSec: number;
  globalAverageChanges: number;
  personaDistribution: {
    personaCode: string;
    name: string;
    percentage: number;
  }[];
  topRevisedQuestionsRank: {
    rank: number;
    questionId: number;
    questionTitle: string;
    revisionRate: number;
  }[];
}

export interface FullAnalysisResult {
  mbti: string;
  mbtiTitle: string;
  mbtiDescription: string;
  dimensions: {
    EI: DimensionAnalysis;
    SN: DimensionAnalysis;
    TF: DimensionAnalysis;
    JP: DimensionAnalysis;
  };
  overallCertainty: number;
  totalTestDuration: number;
  totalAnswerChanges: number;
  behaviorPersona: BehaviorPersona;
  topDilemmas: DilemmaQuestionDetail[];
  personaGap: PersonaGapAnalysis;
  mouseTrajectoryStats: {
    totalDistanceNormalized: number;
    averageSpeed: number;
    indecisivenessIndex: number;
    primaryDevice: InputDevice;
    keyStrokeCount: number;
  };
  benchmark: BenchmarkStats;
}
