import { getRandomQuestions } from '../data/questions';
import { analyzeBehaviorAndMBTI } from '../lib/analyzer';
import { AnswerSelectionEvent, QuestionBehaviorLog } from '../types';

describe('행동 궤적 분석 엔진 테스트 (Behavior Analyzer)', () => {
  it('40문항 전체에 대해 특정 성향(예: INTJ)으로 답변했을 때 정확한 MBTI 유형이 도출되어야 한다', () => {
    const testQuestions = getRandomQuestions(10);

    const mockLogs: QuestionBehaviorLog[] = testQuestions.map((q, idx) => {
      // INTJ 성향에 맞춘 응답 설정:
      // EI 축: leftType='E', rightType='I' -> I를 위해 val = -3
      // SN 축: leftType='N', rightType='S' -> N을 위해 val = +3
      // TF 축: leftType='T', rightType='F' -> T를 위해 val = +3
      // JP 축: leftType='J', rightType='P' -> J를 위해 val = +3
      let finalVal = 3;
      if (q.dimension === 'EI') finalVal = -3;
      else if (q.dimension === 'SN') finalVal = 3;
      else if (q.dimension === 'TF') finalVal = 3;
      else if (q.dimension === 'JP') finalVal = 3;

      const selections: AnswerSelectionEvent[] = [
        {
          value: finalVal,
          timestamp: 1000 + idx * 2000,
        },
      ];

      return {
        questionId: q.id,
        startTime: Date.now() - 2000,
        endTime: Date.now(),
        initialValue: finalVal,
        finalValue: finalVal,
        changeCount: 0,
        selectionHistory: selections,
        totalDwellTime: 2000,
        firstInteractionTime: 500,
        mouseTrajectory: [
          { x: 0.5, y: 0.5, timestamp: 200 },
          { x: 0.8, y: 0.7, timestamp: 1200 },
        ],
        hoverLogs: [],
        directionChanges: 0,
        hesitationScore: 10,
        tabBlurCount: 0,
        primaryDevice: 'mouse' as const,
        keyStrokeCount: 0,
      };
    });

    const result = analyzeBehaviorAndMBTI(mockLogs, testQuestions);

    expect(result.mbti).toBe('INTJ');
    expect(result.mbtiTitle).toBeDefined();
    expect(result.dimensions.EI.winner).toBe('I');
    expect(result.dimensions.SN.winner).toBe('N');
    expect(result.dimensions.TF.winner).toBe('T');
    expect(result.dimensions.JP.winner).toBe('J');
    expect(result.overallCertainty).toBeGreaterThan(50);
  });

  it('답변 수정(번복)이 발생한 문항이 있을 경우 Instinct vs Persona Gap이 정상 탐지되어야 한다', () => {
    const testQuestions = getRandomQuestions(10);

    const mockLogs: QuestionBehaviorLog[] = testQuestions.map((q, idx) => {
      const isRevised = idx === 0 || idx === 1; // 1번, 2번 문항에서 번복 발생
      const initialVal = isRevised ? -3 : 2;
      const finalVal = 3;

      const selections: AnswerSelectionEvent[] = isRevised
        ? [
            { value: initialVal, timestamp: 800 },
            { value: finalVal, timestamp: 2500 },
          ]
        : [{ value: finalVal, timestamp: 1000 }];

      return {
        questionId: q.id,
        startTime: Date.now() - 3000,
        endTime: Date.now(),
        initialValue: initialVal,
        finalValue: finalVal,
        changeCount: isRevised ? 1 : 0,
        selectionHistory: selections,
        totalDwellTime: 3000,
        firstInteractionTime: 800,
        mouseTrajectory: [],
        hoverLogs: [],
        directionChanges: isRevised ? 2 : 0,
        hesitationScore: isRevised ? 50 : 15,
        tabBlurCount: 0,
        primaryDevice: 'mouse' as const,
        keyStrokeCount: 0,
      };
    });

    const result = analyzeBehaviorAndMBTI(mockLogs, testQuestions);

    expect(result.totalAnswerChanges).toBe(2);
    expect(result.personaGap.detected).toBe(true);
    expect(result.personaGap.items.length).toBeGreaterThan(0);
    expect(result.personaGap.items[0].question).toBeDefined();
    expect(result.personaGap.items[0].initialChoiceText).toBeDefined();
    expect(result.personaGap.items[0].finalChoiceText).toBeDefined();
  });

  it('빠른 속도와 번복 없는 응답일 경우 초고속 직진 결단파 페르소나로 분류되어야 한다', () => {
    const testQuestions = getRandomQuestions(10);

    const mockLogs: QuestionBehaviorLog[] = testQuestions.map((q) => ({
      questionId: q.id,
      startTime: Date.now() - 800,
      endTime: Date.now(),
      initialValue: 2,
      finalValue: 2,
      changeCount: 0,
      selectionHistory: [{ value: 2, timestamp: 500 }],
      totalDwellTime: 800,
      firstInteractionTime: 500,
      mouseTrajectory: [],
      hoverLogs: [],
      directionChanges: 0,
      hesitationScore: 5,
      tabBlurCount: 0,
      primaryDevice: 'mouse' as const,
      keyStrokeCount: 0,
    }));

    const result = analyzeBehaviorAndMBTI(mockLogs, testQuestions);

    expect(result.behaviorPersona.code).toBe('THE_DECISIVE');
    expect(result.behaviorPersona.title).toContain('초고속 직진 결단파');
  });

  it('빈 배열이나 불완전한 로그가 주어져도 런타임 크래시 없이 안전하게 결과를 반환해야 한다', () => {
    const result = analyzeBehaviorAndMBTI([]);
    expect(result).toBeDefined();
    expect(result.mbti.length).toBe(4);
    expect(result.overallCertainty).toBeDefined();
    expect(result.behaviorPersona).toBeDefined();
  });
});
