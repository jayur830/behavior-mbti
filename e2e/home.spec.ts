import { expect, test } from '@playwright/test';

test.describe('홈 랜딩 페이지 E2E 테스트', () => {
  test('홈 화면에 접속하여 브랜드 타이틀과 검사 카탈로그를 확인한다', async ({ page }) => {
    await page.goto('/');

    // 1. 헤더 및 브랜드 로고 확인
    await expect(page.locator('header').getByText('PersonaLens')).toBeVisible();

    // 2. 메인 히어로 문구 확인
    await expect(page.getByText('당신만의 리듬')).toBeVisible();

    // 3. 카탈로그 섹션 확인
    await expect(page.getByText('무의식 행동 분석 검사 카탈로그')).toBeVisible();

    // 4. 검사 시작 버튼 클릭하여 검사 페이지로 이동
    const startButton = page.getByRole('button', { name: /MBTI 성향 검사 시작하기/i });
    await expect(startButton).toBeVisible();
    await startButton.click();

    await expect(page).toHaveURL(/\/test/);
  });
});
