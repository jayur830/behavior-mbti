'use client';

import OpenToyAppLogo from '@/assets/opentoyapp_logo.svg';
import OpenToyAppTextLogo from '@/assets/opentoyapp_text_logo.svg';

export default function AppFooter() {
  return (
    <footer className="mt-auto w-full border-t border-border/70 bg-card/60 text-muted-foreground backdrop-blur-md transition-colors">
      <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between md:gap-12">
          {/* Left: Brand Lockup & Description */}
          <div className="flex max-w-xl flex-col gap-2.5">
            <div className="inline-flex items-center gap-2.5 text-foreground">
              <OpenToyAppLogo className="h-9 w-auto dark:invert shrink-0" aria-hidden="true" />
              <OpenToyAppTextLogo className="h-4.5 w-auto dark:invert shrink-0" aria-hidden="true" />
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              <strong className="font-semibold text-foreground">opentoyapp</strong>은 다양한 영역에서 유용한 웹 도구를
              개발하는 토이 프로젝트 연구소입니다. 무의식 궤적 심리분석 <strong>PersonaLens</strong>를 비롯해 다양하고
              실용적인 웹 애플리케이션을 만들어갑니다.
            </p>
          </div>

          {/* Right: Notice & Disclaimer */}
          <div className="flex flex-col gap-1.5 md:max-w-sm md:text-right">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-foreground">서비스 유의사항</h4>
            <p className="text-[11px] leading-relaxed text-muted-foreground/80">
              본 서비스에서 제공하는 분석 결과는 마우스 및 터치 행동 궤적 데이터를 기반으로 산출된 심리 탐색용
              시뮬레이션으로, 실제 심리 상태와 차이가 있을 수 있으며 공식 MBTI® 검사와는 무관합니다.
            </p>
          </div>
        </div>

        {/* Bottom: Copyright */}
        <div className="mt-6 border-t border-border/40 pt-4 text-[11px] text-muted-foreground/70">
          <p>© 2026 opentoyapp. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
