import { getOptionLabel, getRandomQuestions, QUESTIONS, QUESTIONS_POOL } from '@/data/questions';

describe('질문 데이터 무결성 테스트 (Questions Integrity)', () => {
  it('전체 질문 풀(QUESTIONS_POOL)은 정확히 200문항으로 구성되어야 한다', () => {
    expect(QUESTIONS_POOL).toHaveLength(200);
  });

  it('전체 질문 풀의 모든 ID는 1부터 200까지 중복 없이 고유해야 한다', () => {
    const ids = QUESTIONS_POOL.map((q) => q.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(200);
  });

  it('전체 질문 풀(QUESTIONS_POOL)은 4개 축(EI, SN, TF, JP)마다 각각 정확히 50문항씩 균등 분배되어 있어야 한다', () => {
    const dimensionCounts = QUESTIONS_POOL.reduce(
      (acc, q) => {
        acc[q.dimension] = (acc[q.dimension] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    expect(dimensionCounts['EI']).toBe(50);
    expect(dimensionCounts['SN']).toBe(50);
    expect(dimensionCounts['TF']).toBe(50);
    expect(dimensionCounts['JP']).toBe(50);
  });

  it('getRandomQuestions(10) 실행 시 4개 축에서 10문항씩 총 40문항이 균등하게 추출되어야 한다', () => {
    const randomQuestions = getRandomQuestions(10);
    expect(randomQuestions).toHaveLength(40);

    const counts = randomQuestions.reduce(
      (acc, q) => {
        acc[q.dimension] = (acc[q.dimension] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    expect(counts['EI']).toBe(10);
    expect(counts['SN']).toBe(10);
    expect(counts['TF']).toBe(10);
    expect(counts['JP']).toBe(10);
  });

  it('모든 문항은 유효한 title, dimension, positiveType, negativeType 속성을 가지고 있어야 한다', () => {
    QUESTIONS.forEach((q) => {
      expect(q.title).toBeDefined();
      expect(q.title.trim().length).toBeGreaterThan(5);
      expect(['EI', 'SN', 'TF', 'JP']).toContain(q.dimension);
      expect(['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P']).toContain(q.positiveType);
      expect(['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P']).toContain(q.negativeType);
    });
  });

  it('getOptionLabel 함수는 7점 척도(-3 ~ +3)에 대해 올바른 한글 레이블을 반환해야 한다', () => {
    expect(getOptionLabel(-3)).toBe('매우 아니다');
    expect(getOptionLabel(-2)).toBe('아니다');
    expect(getOptionLabel(-1)).toBe('약간 아니다');
    expect(getOptionLabel(0)).toBe('보통 / 중립');
    expect(getOptionLabel(1)).toBe('약간 그렇다');
    expect(getOptionLabel(2)).toBe('그렇다');
    expect(getOptionLabel(3)).toBe('매우 그렇다');
  });
});
