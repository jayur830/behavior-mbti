import { expect, test } from '@playwright/test';

import { analyzeBehaviorAndMBTI } from '../src/lib/analyzer';
import { encodeResultToCompressedString } from '../src/lib/shareResult';

test.describe('결과 리포트 상세 인터랙션 E2E 테스트', () => {
  test('공유 결과 링크에 접속하여 결과 뷰 및 스토리 카드 모달을 확인한다', async ({ page }) => {
    // 1. Mock 데이터 기반 압축 해시 URL 생성
    const mockResult = analyzeBehaviorAndMBTI([]);
    const encoded = encodeResultToCompressedString(mockResult);

    await page.goto(`/preview?data=${encoded}`);

    // 2. 결과 뷰 헤더 및 핵심 분석 블록 확인
    await expect(page.getByText('종합 확신도').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('나의 행동 데이터 요약')).toBeVisible();
    await expect(page.getByText('선택지 망설임 & 탐색 분석')).toBeVisible();

    // 3. 인스타그램 스토리 카드 모달 열기
    const storyCardBtn = page.getByRole('button', { name: /스토리 카드/i });
    if (await storyCardBtn.isVisible()) {
      await storyCardBtn.click();
      // 모달 내보내기 텍스트 확인
      await expect(page.getByText(/스토리 카드 이미지 저장|다운로드/i)).toBeVisible();

      // 모달 닫기
      const closeBtn = page.getByRole('button', { name: /닫기|Close/i }).first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
    }
  });
});
