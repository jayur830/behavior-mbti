import { expect, test } from '@playwright/test';

test.describe('MBTI 성향 검사 진행 플로우 E2E 테스트', () => {
  test('전체 문항을 응답하고 결과 페이지로 이동하여 MBTI 결과를 확인한다', async ({ page }) => {
    // 40개 문항 응답 및 분석에 충분한 타임아웃 부여 (60초)
    test.setTimeout(60000);

    await page.goto('/test');

    // 문항 카드가 나타나고 결과 페이지로 넘어갈 때까지 순차 응답
    for (let q = 1; q <= 40; q++) {
      // 1. 리커트 척도 동의 버튼 클릭
      const optionBtn = page.getByRole('button', { name: '그렇다' }).first();
      await expect(optionBtn).toBeVisible({ timeout: 5000 });
      await optionBtn.click();

      // 2. '다음 문항' 또는 '결과 분석하기' 버튼 확인 후 클릭
      const nextBtn = page.locator('button').filter({ hasText: /다음 문항|결과 분석하기/ });
      await expect(nextBtn).toBeEnabled({ timeout: 5000 });

      const btnText = await nextBtn.innerText();
      await nextBtn.click();

      if (btnText.includes('결과 분석하기')) {
        break;
      }

      await page.waitForTimeout(50);
    }

    // 3. 결과 분석 완료 및 /result 페이지 이동 대기
    await expect(page).toHaveURL(/\/result/, { timeout: 20000 });

    // 4. 결과 화면 핵심 요소 렌더링 확인
    await expect(page.getByText('종합 확신도').first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('나의 행동 데이터 요약')).toBeVisible();
  });
});
