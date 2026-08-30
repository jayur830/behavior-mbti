'use client';

import { ArrowRight, ChevronRight, Keyboard, ShieldCheck } from 'lucide-react';

import Button from '@/components/ui/button';

export interface TestIntroProps {
  onStart: () => void;
  onExploreCatalog?: () => void;
}

export default function TestIntro({ onStart, onExploreCatalog }: TestIntroProps) {
  return (
    <div className="w-full max-w-7xl mx-auto px-5 py-6 sm:px-8 sm:py-12">
      {/* Hero Section */}
      <section className="grid gap-12 pb-16 pt-6 lg:grid-cols-[1.06fr_.94fr] lg:items-center lg:gap-20 lg:pt-12">
        <div className="animate-rise">
          <div className="mb-6 flex items-center gap-3 text-xs font-semibold text-accent-ink">
            <span className="h-px w-8 bg-accent-ink" />
            <span>[TEST 01] 무의식 궤적 기반 MBTI 성향 검사 · 실시간 측정</span>
          </div>

          <h1 className="max-w-3xl text-balance text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl lg:text-[68px] text-foreground">
            생각과 클릭 사이,
            <br />
            <span className="accent-ink">진짜 나의 리듬</span>을 마주하다
          </h1>

          <p className="mt-6 max-w-lg text-pretty text-sm sm:text-base leading-relaxed text-neutral-700 dark:text-neutral-300 font-medium">
            클릭하기 전의 머뭇거림, 선택지를 바꾼 고민의 시간, 커서가 그린 궤적을 통해 당신의 본능적 성향과 사회적
            페르소나의 차이를 정밀하게 분석합니다.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button
              type="button"
              onClick={onStart}
              size="lg"
              className="group h-14 px-8 rounded-2xl text-base font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-lime-400 dark:hover:bg-lime-300 dark:text-neutral-950 shadow-xl shadow-emerald-600/25 dark:shadow-lime-400/20 hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer ring-4 ring-emerald-500/20 dark:ring-lime-400/20"
            >
              <span>MBTI 성향 검사 시작하기</span>
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1.5 stroke-[2.5]" />
            </Button>

            {onExploreCatalog && (
              <Button
                type="button"
                variant="outline"
                onClick={onExploreCatalog}
                className="h-14 px-6 text-sm font-bold rounded-2xl border-2 border-border hover:bg-muted text-foreground cursor-pointer"
              >
                <span>전체 검사 목록 보기</span>
              </Button>
            )}

            <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 ml-1">
              약 3~5분 소요 · 계정 불필요
            </span>
          </div>

          <div className="mt-8 flex items-center gap-4 text-xs font-medium text-neutral-600 dark:text-neutral-400 border-t border-border/80 pt-4">
            <span className="flex items-center gap-1.5 text-foreground font-semibold">
              <ShieldCheck className="w-4 h-4 text-accent-ink" /> 브라우저 내부 즉시 처리
            </span>
            <span>/</span>
            <span className="flex items-center gap-1.5 text-foreground font-semibold">
              <Keyboard className="w-4 h-4 text-warning" /> 1~7 숫자키 완벽 지원
            </span>
          </div>
        </div>

        {/* Live Cursor Telemetry Preview Visualizer */}
        <div className="animate-rise [animation-delay:120ms]">
          <div className="mb-3 flex items-center justify-between text-xs font-semibold text-neutral-600 dark:text-neutral-400">
            <span>실시간 커서 궤적 시뮬레이션</span>
            <span className="flex items-center gap-1.5 text-accent-ink font-bold">
              <span className="pulse-dot" /> 실시간 분석 중
            </span>
          </div>

          <div className="trace-canvas relative min-h-48 overflow-hidden rounded-2xl border border-border bg-card/80 p-5 shadow-2xl">
            <div className="scanline" />
            <div
              className="absolute inset-0 opacity-25 pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
                backgroundSize: '30px 30px',
              }}
            />

            <svg
              className="relative h-full min-h-36 w-full"
              viewBox="0 0 600 180"
              preserveAspectRatio="none"
              aria-label="선택지 사이를 이동하는 커서 궤적 시뮬레이션"
            >
              <defs>
                <filter id="preview-glow">
                  <feGaussianBlur stdDeviation="5" />
                </filter>
              </defs>
              <path
                d="M22 149 C80 143, 61 73, 130 98 S180 150, 231 84 S276 42, 324 75 S375 131, 410 70 S462 48, 503 95 S550 120, 579 34"
                fill="none"
                stroke="var(--accent-ink)"
                strokeWidth="2.5"
                strokeDasharray="4 6"
                opacity="0.9"
              />
              <path
                d="M22 149 C80 143, 61 73, 130 98 S180 150, 231 84 S276 42, 324 75 S375 131, 410 70 S462 48, 503 95 S550 120, 579 34"
                fill="none"
                stroke="var(--accent-ink)"
                strokeWidth="6"
                opacity="0.3"
                filter="url(#preview-glow)"
              />
              <circle cx="579" cy="34" r="5" fill="var(--accent-ink)" />
              <circle cx="579" cy="34" r="14" fill="none" stroke="var(--accent-ink)" opacity="0.5" />
            </svg>

            <span className="absolute bottom-3 left-4 font-mono text-[10px] font-bold text-neutral-400">
              TRACE_ID // 7F-A9-02
            </span>
            <span className="absolute right-4 top-3 font-mono text-[10px] font-extrabold text-accent-ink">
              실시간 리플레이
            </span>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-px rounded-xl overflow-hidden border border-border bg-border">
            <div className="bg-card p-4">
              <div className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">평균 체류 편차</div>
              <div className="mt-1 font-mono text-xl font-extrabold text-accent-ink">
                0.42<span className="text-xs font-normal">σ</span>
              </div>
            </div>
            <div className="bg-card p-4">
              <div className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">미세 망설임</div>
              <div className="mt-1 font-mono text-xl font-extrabold text-warning">12회</div>
            </div>
            <div className="bg-card p-4">
              <div className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">신호 신뢰도</div>
              <div className="mt-1 font-mono text-xl font-extrabold text-foreground">
                A<span className="text-xs font-normal text-muted-foreground">+</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Preview Section */}
      <section className="border-t border-border pt-10">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-accent-ink">원하는 검사 선택</div>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">
              짧은 검사로 확인하는 가장 날카로운 내면 분석
            </h2>
          </div>
          <span className="hidden font-mono text-xs font-semibold text-muted-foreground sm:block">01 — 03</span>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <button
            onClick={onStart}
            className="catalog-card rounded-2xl group text-left cursor-pointer hover:border-accent-ink transition-all"
          >
            <div className="font-mono text-xs font-extrabold text-accent-ink">01</div>
            <div className="mt-6 flex items-end justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-foreground group-hover:text-accent-ink transition-colors">
                  무의식 성향 (MBTI 유형)
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-300 font-medium">
                  첫 직관과 최종 수정된 선택 사이의 내면 갭을 분석합니다.
                </p>
              </div>
              <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-accent-ink" />
            </div>
            <div className="mt-6 border-t border-border/60 pt-3 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              예상 소요 시간 <span className="float-right font-bold text-foreground">약 3~5분</span>
            </div>
          </button>

          <button
            onClick={onExploreCatalog || onStart}
            className="catalog-card rounded-2xl group text-left cursor-pointer hover:border-accent-ink transition-all"
          >
            <div className="font-mono text-xs font-extrabold text-warning">02</div>
            <div className="mt-6 flex items-end justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-foreground group-hover:text-warning transition-colors">
                  결정 지연 (망설임 지수)
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-300 font-medium">
                  딜레마 상황에서 커서의 방황과 우유부단 지수를 도출합니다.
                </p>
              </div>
              <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-warning" />
            </div>
            <div className="mt-6 border-t border-border/60 pt-3 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              예상 소요 시간 <span className="float-right font-bold text-foreground">약 2분</span>
            </div>
          </button>

          <button
            onClick={onExploreCatalog || onStart}
            className="catalog-card rounded-2xl group text-left cursor-pointer hover:border-accent-ink transition-all"
          >
            <div className="font-mono text-xs font-extrabold text-neutral-500 dark:text-neutral-400">03</div>
            <div className="mt-6 flex items-end justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-foreground group-hover:text-foreground transition-colors">
                  인지 리플렉스 (반응 잠복기)
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-300 font-medium">
                  문항 노출 직후 첫 번째 인터랙션까지의 잠복기를 측정합니다.
                </p>
              </div>
              <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
            </div>
            <div className="mt-6 border-t border-border/60 pt-3 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              예상 소요 시간 <span className="float-right font-bold text-foreground">약 2분</span>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}
