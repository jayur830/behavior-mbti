import { TEST_CATALOG } from '@/data/tests';

describe('다중 검사 카탈로그 데이터 테스트 (Test Catalog)', () => {
  it('카탈로그에는 최소 1개 이상의 활성(active) 검사가 포함되어야 한다', () => {
    const activeTests = TEST_CATALOG.filter((t) => t.status === 'active');
    expect(activeTests.length).toBeGreaterThanOrEqual(1);
    expect(activeTests[0].id).toBe('mbti');
    expect(activeTests[0].route).toBe('/test');
  });

  it('모든 검사 아이템은 필수 메타데이터(id, title, estimatedTime, questionCount, route)를 갖추어야 한다', () => {
    TEST_CATALOG.forEach((item) => {
      expect(item.id).toBeDefined();
      expect(item.title.length).toBeGreaterThan(0);
      expect(item.subtitle.length).toBeGreaterThan(0);
      expect(item.category.length).toBeGreaterThan(0);
      expect(item.questionCount).toBeGreaterThan(0);
      expect(item.route).toBeDefined();
      expect(['active', 'coming_soon']).toContain(item.status);
    });
  });
});
