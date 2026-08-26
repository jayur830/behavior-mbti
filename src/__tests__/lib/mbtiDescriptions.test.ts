import { BEHAVIOR_PERSONAS, MBTI_PROFILES } from '@/data/mbtiDescriptions';

describe('MBTI 및 행동 페르소나 데이터 정의 테스트 (mbtiDescriptions)', () => {
  it('16가지 모든 MBTI 성향 프로필이 누락 없이 정의되어 있어야 한다', () => {
    const allMbtiTypes = [
      'INTJ',
      'INTP',
      'ENTJ',
      'ENTP',
      'INFJ',
      'INFP',
      'ENFJ',
      'ENFP',
      'ISTJ',
      'ISFJ',
      'ESTJ',
      'ESFJ',
      'ISTP',
      'ISFP',
      'ESTP',
      'ESFP',
    ];

    allMbtiTypes.forEach((type) => {
      const profile = MBTI_PROFILES[type];
      expect(profile).toBeDefined();
      expect(profile.title.length).toBeGreaterThan(0);
      expect(profile.subtitle.length).toBeGreaterThan(0);
      expect(profile.summary.length).toBeGreaterThan(0);
      expect(profile.traits.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('5대 핵심 행동 페르소나가 올바른 구조로 정의되어 있어야 한다', () => {
    const personas = Object.values(BEHAVIOR_PERSONAS);
    expect(personas.length).toBeGreaterThanOrEqual(5);

    personas.forEach((p) => {
      expect(p.code).toBeDefined();
      expect(p.title).toBeDefined();
      expect(p.subtitle).toBeDefined();
      expect(p.description).toBeDefined();
      expect(p.tags.length).toBeGreaterThanOrEqual(1);
      expect(p.iconName).toBeDefined();
    });
  });
});
