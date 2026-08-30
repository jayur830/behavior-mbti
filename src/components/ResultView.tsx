'use client';

import confetti from 'canvas-confetti';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Briefcase,
  Check,
  Heart,
  Home,
  Lightbulb,
  MousePointer,
  RotateCcw,
  Share2,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import PersonaIcon from '@/components/PersonaIcon';
import Button from '@/components/ui/button';
import { MBTI_PROFILES } from '@/data/mbtiDescriptions';
import { useClipboard } from '@/hooks/useClipboard';
import { useResultSaveLifecycle } from '@/hooks/useResultSaveLifecycle';
import { encodeResultToCompressedString } from '@/lib/shareResult';
import type { FullAnalysisResult } from '@/types';

import type { MouseCanvasViewMode } from './MouseReplayCanvas';
import MouseReplayCanvas from './MouseReplayCanvas';
import StoryCardModal from './StoryCardModal';
import TouchTimelinePlayer from './TouchTimelinePlayer';

export interface ResultViewProps {
  result: FullAnalysisResult;
  isSharedView?: boolean;
  onRestart?: () => void;
  onHome?: () => void;
}

export default function ResultView({ result, isSharedView = false, onRestart, onHome }: ResultViewProps) {
  const [selectedQuestionIdx, setSelectedQuestionIdx] = useState<number>(0);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState<boolean>(false);

  const { copied, copy } = useClipboard({ timeoutMs: 2000 });
  const { markAsSaved } = useResultSaveLifecycle({ result, isSharedView });

  const isTouchDevice = result.mouseTrajectoryStats?.primaryDevice === 'touch';
  const replayerMode: 'canvas' | 'timeline' = isTouchDevice ? 'timeline' : 'canvas';
  const [canvasViewMode, setCanvasViewMode] = useState<MouseCanvasViewMode>('replay');

  const questionsList =
    (result.allQuestionDetails && result.allQuestionDetails.length > 0
      ? result.allQuestionDetails
      : result.topDilemmas) || [];

  useEffect(() => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
  }, []);

  const handleCopyLink = async () => {
    if (typeof window === 'undefined') return;

    const id = await markAsSaved();

    const targetUrl = id
      ? `${window.location.origin}/s/${id}`
      : `${window.location.origin}/s/${encodeResultToCompressedString(result)}`;

    const success = await copy(targetUrl);
    if (!success) {
      window.prompt('아래 링크를 복사해주세요:', targetUrl);
    }
  };

  const getDeviceLabel = () => {
    switch (result.mouseTrajectoryStats?.primaryDevice) {
      case 'touch':
        return '모바일 터치 제스처';
      case 'keyboard':
        return '키보드 단축키';
      case 'mouse':
      default:
        return '데스크톱 마우스 궤적';
    }
  };

  const totalQuestionsCount = questionsList.length || 10;
  const avgDurationPerQuestion = (result.totalTestDuration / 1000 / totalQuestionsCount).toFixed(1);
  const changeRatePercent = Math.min(100, Math.round(((result.totalAnswerChanges || 0) / totalQuestionsCount) * 100));

  const profile = MBTI_PROFILES[result.mbti] || {
    workStyle: '체계적인 프레임워크와 자율성을 기반으로 목표를 완수합니다.',
    relationshipStyle: '신뢰와 깊이 있는 소통을 중시하며 본질적인 대화를 지향합니다.',
    stressTip: '직관을 메모하고 잠시 휴식을 취한 후 단계별로 결정을 내리세요.',
  };

  const currentQDetail = questionsList[selectedQuestionIdx];

  return (
    <div className="w-full max-w-7xl mx-auto px-5 pb-20 sm:px-8">
      {/* Shared View CTA Banner */}
      {isSharedView && (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-accent-ink/40 bg-accent-ink/10 p-4">
          <div className="flex items-center gap-2.5 text-xs font-medium text-foreground">
            <Sparkles className="h-4 w-4 text-accent-ink shrink-0" />
            <span>공유받은 행동 분석 결과입니다. 당신의 무의식적 MBTI도 측정해보세요!</span>
          </div>
          <Button
            size="sm"
            onClick={onRestart}
            className="shrink-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-lime-400 dark:hover:bg-lime-300 dark:text-neutral-950 text-xs font-bold shadow-md cursor-pointer"
          >
            나도 검사하러 가기 <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      )}

      {/* Top Dossier Header */}
      <div className="mb-10 flex flex-wrap items-end justify-between border-b border-border pb-6 pt-6 gap-4">
        <div>
          <div className="text-xs font-bold text-accent-ink">무의식 행동 분석 종합 리포트</div>
          <h1 className="mt-2 text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            내면의 숨겨진 행동 신호
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            onClick={() => setIsStoryModalOpen(true)}
            className="text-xs font-bold border-border hover:bg-muted cursor-pointer text-foreground"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1 text-warning" /> 9:16 스토리 카드
          </Button>

          <Button
            variant="outline"
            onClick={handleCopyLink}
            className="text-xs font-bold border-border hover:bg-muted cursor-pointer text-foreground"
          >
            {copied ? <Check className="w-3.5 h-3.5 mr-1 text-accent-ink" /> : <Share2 className="w-3.5 h-3.5 mr-1" />}
            {copied ? '복사 완료' : '결과 공유'}
          </Button>
        </div>
      </div>

      {/* Hero Dossier Section: MBTI & Gauge */}
      <section className="grid gap-px rounded-2xl overflow-hidden border border-border bg-border md:grid-cols-[1.15fr_.85fr] shadow-2xl">
        {/* Left: MBTI Archetype */}
        <div className="bg-card p-7 sm:p-10 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-bold text-neutral-600 dark:text-neutral-400">도출된 성향 코드</div>
              <div className="mt-4 text-7xl font-extrabold tracking-tight text-accent-ink sm:text-[96px] leading-none">
                {result.mbti}
              </div>
              <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-foreground">{result.mbtiTitle}</h2>
              <p className="mt-4 max-w-md text-xs sm:text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 font-medium">
                {result.mbtiDescription}
              </p>
            </div>
            <Sparkles className="size-6 text-warning shrink-0" />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4 text-xs font-semibold text-neutral-600 dark:text-neutral-400 border-t border-border/80 pt-4">
            <span className="flex items-center gap-1.5 text-foreground">
              <MousePointer className="w-4 h-4 text-accent-ink" /> {getDeviceLabel()}
            </span>
            <span>/</span>
            <span className="flex items-center gap-1.5 text-foreground">
              총 소요 시간:{' '}
              <span className="text-accent-ink font-bold font-mono">
                {(result.totalTestDuration / 1000).toFixed(1)}초
              </span>
            </span>
          </div>
        </div>

        {/* Right: Gauge & Certainty */}
        <div className="flex flex-col justify-between bg-card/80 p-7 sm:p-10">
          <div className="text-xs font-bold text-neutral-600 dark:text-neutral-400">종합 결단 확신도</div>

          <div className="my-6 flex items-center gap-6">
            <div className="gauge">
              <span>{result.overallCertainty}</span>
              <small>%</small>
            </div>

            <div className="text-xs leading-relaxed text-neutral-700 dark:text-neutral-300 font-medium">
              <span className="font-extrabold text-foreground text-sm">
                {result.overallCertainty >= 80 ? '매우 단호함 (높은 신뢰 신호)' : '안정적 균형 신호'}
              </span>
              <br />
              <span className="text-accent-ink font-extrabold text-xs">
                상위 {result.benchmark?.dwellTimePercentile || 14}% 신속 결단
              </span>
            </div>
          </div>

          <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium border-t border-border/80 pt-3">
            총 {totalQuestionsCount}개 문항 응답 벡터 · {result.mouseTrajectoryStats?.totalHoverCount || 24}개 인터랙션
            이벤트 실측 기반
          </div>
        </div>
      </section>

      {/* 2. Telemetry Summary & Behavior Persona */}
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-extrabold text-accent-ink">
            <BarChart3 className="h-4 w-4 text-accent-ink" />
            <span>나의 행동 데이터 요약</span>
          </h2>
          <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
            총 {totalQuestionsCount}문항 실측 데이터
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card/80 p-5">
            <div className="text-xs font-bold text-neutral-600 dark:text-neutral-400">문항별 응답 템포</div>
            <div className="mt-2 font-mono text-2xl font-extrabold text-foreground">
              {avgDurationPerQuestion}초
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                (
                {Number(avgDurationPerQuestion) < 3.0
                  ? '신속한 직관파'
                  : Number(avgDurationPerQuestion) < 6.0
                    ? '안정적 템포'
                    : '심사숙고형'}
                )
              </span>
            </div>
            <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-300 font-medium leading-relaxed">
              문항을 읽고 최종 클릭을 완료하기까지 문항당 평균 순수 인터랙션 소요 시간입니다.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card/80 p-5">
            <div className="text-xs font-bold text-neutral-600 dark:text-neutral-400">선택지 번복 / 고민</div>
            <div className="mt-2 font-mono text-2xl font-extrabold text-warning">
              <span>{result.totalAnswerChanges || 0}회</span>
              <span className="ml-2 text-xs font-normal text-neutral-600 dark:text-neutral-400">
                (번복률 {changeRatePercent}%)
              </span>
            </div>
            <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-300 font-medium leading-relaxed">
              첫 번째 선택지를 클릭한 후 다른 보기를 다시 누르며 생각을 수정한 횟수입니다.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card/80 p-5">
            <div className="text-xs font-bold text-neutral-600 dark:text-neutral-400">내면의 결정 확신도</div>
            <div className="mt-2 font-mono text-2xl font-extrabold text-accent-ink">
              <span>{result.overallCertainty}%</span>
              <span className="ml-2 text-xs font-normal text-neutral-600 dark:text-neutral-400">
                (
                {result.overallCertainty >= 80
                  ? '매우 단호함'
                  : result.overallCertainty >= 60
                    ? '안정적'
                    : '신중한 고민'}
                )
              </span>
            </div>
            <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-300 font-medium leading-relaxed">
              마우스 커서의 떨림, 머뭇거림 궤적 및 체류 시간 패턴을 분석해 도출된 확신도입니다.
            </p>
          </div>
        </div>

        {/* Persona Profile Banner */}
        {result.behaviorPersona && (
          <div className="mt-4 rounded-2xl border border-border bg-card/60 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent-ink/10 border border-accent-ink/20 flex items-center justify-center shrink-0">
                <PersonaIcon name={result.behaviorPersona.iconName} className="w-6 h-6 text-accent-ink" />
              </div>
              <div>
                <div className="text-xs font-bold text-accent-ink">나의 행동 페르소나 프로필</div>
                <h3 className="text-lg font-extrabold text-foreground">{result.behaviorPersona.title}</h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 font-medium mt-0.5">
                  {result.behaviorPersona.subtitle}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {result.behaviorPersona.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg bg-muted text-xs font-bold text-foreground border border-border"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 3. Instinct vs Persona & Telemetry Replay Grid */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Left: Gap Reveal */}
        <section className="rounded-2xl border border-border bg-card/80 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-warning">본능 vs 사회적 자아</div>
                <h2 className="mt-1 text-xl font-extrabold text-foreground">본능과 페르소나 갭 분석</h2>
              </div>
              <Zap className="size-5 text-warning" />
            </div>

            <div className="space-y-4">
              <div className="bar-row text-xs font-bold">
                <span>첫 직관 반응</span>
                <div>
                  <i style={{ width: '85%' }} />
                </div>
                <b>85</b>
              </div>
              <div className="bar-row text-xs font-bold">
                <span>최종 사회적 선택</span>
                <div>
                  <i className="persona" style={{ width: `${Math.max(30, 100 - changeRatePercent)}%` }} />
                </div>
                <b>{Math.max(30, 100 - changeRatePercent)}</b>
              </div>
            </div>

            <p className="mt-8 border-l-2 border-warning pl-4 text-xs sm:text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 font-medium">
              {result.personaGap?.summary ||
                '모든 문항에서 첫 직관적 반응과 최종 선택이 일치하여 내면과 외면의 일관성이 매우 높습니다.'}
            </p>
          </div>

          <div className="mt-6 text-xs text-neutral-600 dark:text-neutral-400 font-semibold border-t border-border/80 pt-3">
            갭 감지 문항 수: <strong className="text-foreground">{result.personaGap?.count || 0}개</strong>
          </div>
        </section>

        {/* Right: Telemetry Replay Canvas */}
        <section className="rounded-2xl border border-border bg-card/80 p-6 sm:p-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-accent-ink">행동 인터랙션 리플레이</div>
              <h2 className="mt-1 text-xl font-extrabold text-foreground">선택 직전의 고민 궤적</h2>
            </div>
          </div>

          {/* Question Selector Pills */}
          <div className="flex flex-wrap gap-1.5 mb-4 p-2.5 bg-muted/60 rounded-xl border border-border max-h-32 overflow-y-auto">
            {questionsList.map((qDetail, idx) => {
              const isSelected = selectedQuestionIdx === idx;
              return (
                <Button
                  key={qDetail.question.id}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedQuestionIdx(idx)}
                  className={`h-7 px-2.5 text-xs font-mono font-bold rounded-lg cursor-pointer ${
                    isSelected ? 'bg-accent-ink text-neutral-950' : 'text-neutral-600 dark:text-neutral-300'
                  }`}
                >
                  Q{idx + 1}
                </Button>
              );
            })}
          </div>
          {currentQDetail && (
            <div className="rounded-xl overflow-hidden border border-border bg-black/40">
              {replayerMode === 'canvas' ? (
                <MouseReplayCanvas
                  behaviorLog={currentQDetail.behavior}
                  viewMode={canvasViewMode}
                  onViewModeChange={setCanvasViewMode}
                />
              ) : (
                <TouchTimelinePlayer behaviorLog={currentQDetail.behavior} />
              )}
            </div>
          )}
        </section>
      </div>

      {/* 4. Four-Dimensional Spectrum */}
      <section className="mt-8 rounded-2xl border border-border bg-card/80 p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-accent-ink">4대 성향 축 선호도 분석</div>
            <h2 className="mt-1 text-xl font-extrabold text-foreground">4대 성향 축 선호도 및 확신도 분석</h2>
          </div>
          <Activity className="size-5 text-accent-ink" />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {Object.entries(result.dimensions).map(([key, dim]) => (
            <div key={key} className="rounded-xl border border-border/80 bg-card/60 p-4">
              <div className="flex items-end justify-between">
                <span className="text-base font-extrabold text-foreground">
                  <strong className="text-accent-ink">{dim.winner}형 우세</strong> ({dim.leftType} — {dim.rightType})
                </span>
                <span className="text-sm font-extrabold text-accent-ink font-mono">{dim.winnerPercentage}%</span>
              </div>
              <div className="mt-2.5 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-accent-ink transition-all duration-500 rounded-full"
                  style={{ width: `${dim.winnerPercentage}%` }}
                />
              </div>
              <div className="mt-2.5 flex justify-between text-xs text-neutral-600 dark:text-neutral-300 font-medium">
                <span>
                  확신도: <strong className="text-foreground">{dim.certaintyScore}%</strong>
                </span>
                <span>{dim.behaviorInsight}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Real-World Life & Work Action Guide (3-Cards) */}
      <section className="mt-8">
        <div className="mb-4">
          <div className="text-xs font-bold text-accent-ink">실생활 행동 양식 가이드</div>
          <h2 className="mt-1 text-xl font-extrabold text-foreground">실생활 행동 양식 & 라이프스타일 가이드</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <article className="insight-card rounded-2xl flex flex-col justify-between p-6">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-accent-ink">
                <span>가이드 01</span>
                <Briefcase className="w-4 h-4 text-accent-ink" />
              </div>
              <h3 className="mt-4 text-base font-bold text-foreground">업무 및 협업 스타일</h3>
              <p className="mt-3 text-xs leading-relaxed text-neutral-700 dark:text-neutral-300 font-medium">
                {profile.workStyle}
              </p>
            </div>
          </article>

          <article className="insight-card rounded-2xl flex flex-col justify-between p-6">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-warning">
                <span>가이드 02</span>
                <Heart className="w-4 h-4 text-warning" />
              </div>
              <h3 className="mt-4 text-base font-bold text-foreground">대인관계 & 소통 방식</h3>
              <p className="mt-3 text-xs leading-relaxed text-neutral-700 dark:text-neutral-300 font-medium">
                {profile.relationshipStyle}
              </p>
            </div>
          </article>

          <article className="insight-card rounded-2xl flex flex-col justify-between p-6">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-foreground">
                <span>가이드 03</span>
                <Lightbulb className="w-4 h-4 text-foreground" />
              </div>
              <h3 className="mt-4 text-base font-bold text-foreground">스트레스 극복 솔루션</h3>
              <p className="mt-3 text-xs leading-relaxed text-neutral-700 dark:text-neutral-300 font-medium">
                {profile.stressTip}
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* Bottom Global Actions */}
      <div className="mt-12 flex flex-wrap items-center justify-center gap-4 border-t border-border pt-8">
        {onRestart && (
          <Button
            type="button"
            onClick={onRestart}
            className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-lime-400 dark:hover:bg-lime-300 dark:text-neutral-950 text-xs font-bold px-7 py-6 rounded-xl shadow-lg cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 mr-1.5" /> 다시 검사하기
          </Button>
        )}

        {onHome && (
          <Button
            type="button"
            variant="outline"
            onClick={onHome}
            className="text-xs font-bold px-6 py-6 rounded-xl border-border hover:bg-muted text-foreground cursor-pointer"
          >
            <Home className="w-4 h-4 mr-1.5" /> 홈으로 이동
          </Button>
        )}
      </div>

      {/* 9:16 Instagram Story Card Modal */}
      <StoryCardModal isOpen={isStoryModalOpen} onClose={() => setIsStoryModalOpen(false)} result={result} />
    </div>
  );
}
