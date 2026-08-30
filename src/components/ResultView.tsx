'use client';

import confetti from 'canvas-confetti';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Briefcase,
  Check,
  Clock,
  Eye,
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
  const [replayerMode, setReplayerMode] = useState<'canvas' | 'timeline'>(isTouchDevice ? 'timeline' : 'canvas');
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-16 space-y-12 text-foreground font-sans">
      {/* Shared View CTA Banner */}
      {isSharedView && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-lg">
          <div className="flex items-center gap-2 text-sm text-emerald-300">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>공유받은 행동 분석 결과입니다. 당신의 무의식적 MBTI도 측정해보세요!</span>
          </div>
          <Button
            size="sm"
            onClick={onRestart}
            className="rounded-full bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-bold text-xs shadow-md shrink-0"
          >
            나도 검사하러 가기 ➔
          </Button>
        </div>
      )}

      {/* 1. Top Dossier Hero */}
      <div className="relative overflow-hidden glass-card rounded-3xl p-6 sm:p-12 shadow-2xl flex flex-col items-center text-center">
        {/* Glow ambient background in card */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-linear-to-b from-lime-300/20 to-transparent blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-muted border border-border text-muted-foreground text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-lime-400" />
          <span>무의식 행동 분석 리포트</span>
        </div>

        <h1 className="text-6xl sm:text-8xl font-extrabold tracking-tight text-foreground dark:text-transparent dark:bg-clip-text dark:bg-linear-to-r dark:from-white dark:via-neutral-100 dark:to-emerald-200 mb-2">
          {result.mbti}
        </h1>
        <div className="text-2xl sm:text-3xl font-bold text-foreground mb-4">{result.mbtiTitle}</div>
        <p className="text-sm sm:text-base text-muted-foreground max-w-lg mb-8 leading-relaxed font-normal">
          {result.mbtiDescription}
        </p>

        {/* Global Key Metrics Summary Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-xl bg-card/80 dark:bg-card/90 p-3.5 rounded-2xl border border-border backdrop-blur-md">
          <div className="flex flex-col items-center p-2">
            <span className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5 font-medium">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              종합 확신도
            </span>
            <span className="text-lg sm:text-xl font-bold text-foreground font-mono">{result.overallCertainty}%</span>
          </div>

          <div className="flex flex-col items-center p-2">
            <span className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-lime-500" />총 소요 시간
            </span>
            <span className="text-lg sm:text-xl font-bold text-foreground font-mono">
              {(result.totalTestDuration / 1000).toFixed(1)}초
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 flex flex-col items-center p-2">
            <span className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5 font-medium">
              <MousePointer className="w-3.5 h-3.5 text-emerald-500" />
              입력 환경
            </span>
            <span className="text-xs font-semibold text-foreground mt-1">{getDeviceLabel()}</span>
          </div>
        </div>
      </div>

      {/* 2. Personal Telemetry Metrics */}
      <div className="bg-card/80 dark:bg-neutral-900/60 border border-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <BarChart3 className="w-4 h-4 text-emerald-500" />
            <span>나의 행동 데이터 요약</span>
          </div>
          <span className="text-xs text-lime-700 dark:text-lime-300 font-medium">
            총 {totalQuestionsCount}문항 실측 데이터
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-muted/50 dark:bg-neutral-950/70 border border-border p-4.5 rounded-2xl flex flex-col justify-between">
            <div>
              <span className="text-xs text-muted-foreground block mb-1">문항별 응답 템포</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black font-mono text-lime-600 dark:text-lime-300">
                  {avgDurationPerQuestion}s
                </span>
                <span className="text-xs text-muted-foreground">
                  (
                  {Number(avgDurationPerQuestion) < 3.0
                    ? '신속한 직관파'
                    : Number(avgDurationPerQuestion) < 6.0
                      ? '안정적 템포'
                      : '심사숙고형'}
                  )
                </span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-3 font-light">
              문항을 읽고 최종 클릭을 완료하기까지 문항당 평균 순수 인터랙션 소요 시간입니다.
            </p>
          </div>

          <div className="bg-muted/50 dark:bg-neutral-950/70 border border-border p-4.5 rounded-2xl flex flex-col justify-between">
            <div>
              <span className="text-xs text-muted-foreground block mb-1">선택지 번복 / 고민</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black font-mono text-rose-500 dark:text-rose-400">
                  {result.totalAnswerChanges || 0}회
                </span>
                <span className="text-xs text-muted-foreground">(번복률 {changeRatePercent}%)</span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-3 font-light">
              첫 번째 선택지를 클릭한 후 다른 보기를 다시 누르며 생각을 수정한 횟수입니다.
            </p>
          </div>

          <div className="bg-muted/50 dark:bg-neutral-950/70 border border-border p-4.5 rounded-2xl flex flex-col justify-between">
            <div>
              <span className="text-xs text-muted-foreground block mb-1">내면의 결정 확신도</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black font-mono text-amber-500 dark:text-amber-400">
                  {result.overallCertainty}%
                </span>
                <span className="text-xs text-muted-foreground">
                  {result.overallCertainty >= 80
                    ? '매우 단호함'
                    : result.overallCertainty >= 60
                      ? '안정적'
                      : '신중한 고민'}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-3 font-light">
              마우스 커서의 떨림, 머뭇거림 궤적 및 체류 시간 패턴을 분석해 도출된 확신도입니다.
            </p>
          </div>
        </div>

        {/* Behavior Persona Summary Box */}
        {result.behaviorPersona && (
          <div className="bg-muted/50 dark:bg-neutral-950/60 border border-border p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">행동 패턴 유형 분석</span>
              <span className="text-xs font-semibold text-emerald-500 dark:text-emerald-400">
                {result.behaviorPersona.title}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-foreground font-medium mb-1">{result.behaviorPersona.subtitle}</p>
            <p className="text-xs text-muted-foreground font-light leading-relaxed mb-4">
              {result.behaviorPersona.description}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {result.behaviorPersona.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-card border border-border text-foreground font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Micro-Hover Attention & Gaze Analysis */}
      <div className="bg-card/80 dark:bg-neutral-900/60 border border-border rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2 text-sm font-bold text-foreground mb-4">
          <Eye className="w-4 h-4 text-amber-500" />
          <span>선택지 망설임 & 탐색 분석</span>
        </div>

        <div className="bg-muted/50 dark:bg-neutral-950/70 border border-border p-5 rounded-2xl mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-bold text-foreground">선택지 탐색 및 고민 체류 시간</h3>
            <span className="text-xs font-mono text-amber-500 dark:text-amber-400 font-semibold">
              총 {result.hoverAnalysis?.totalHoverCount ?? 0}회 탐색 (
              {((result.hoverAnalysis?.totalHoverDurationMs ?? 0) / 1000).toFixed(1)}초 체류)
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-light leading-relaxed">
            {result.hoverAnalysis?.hoverInsight || '선택지 간 망설임 없이 직관적인 의사결정을 보였습니다.'}
          </p>
        </div>

        {/* Conflicted Hovers if present */}
        {(result.hoverAnalysis?.conflictedHoverItems || []).length > 0 && (
          <div className="space-y-3">
            <span className="text-xs text-muted-foreground font-medium block">가장 오래 망설였던 갈등 문항</span>
            {(result.hoverAnalysis?.conflictedHoverItems || []).map((item, idx) => (
              <div
                key={idx}
                className="bg-muted/50 dark:bg-neutral-950/50 border border-border p-3.5 rounded-xl flex flex-col gap-1 text-xs"
              >
                <div className="text-foreground font-medium">{item.questionTitle}</div>
                <div className="text-muted-foreground font-light leading-relaxed">{item.interpretation}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Behavior Profile Card */}
      <div className="bg-card/80 dark:bg-neutral-900/60 border border-border rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2 text-sm font-bold text-foreground mb-4">
          <Activity className="w-4 h-4 text-emerald-500" />
          <span>나의 행동 페르소나 프로필</span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center shrink-0">
            <PersonaIcon name={result.behaviorPersona?.iconName || 'Zap'} className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1">
              {result.behaviorPersona?.title || '성향 프로필'}
            </h3>
            <p className="text-xs sm:text-sm font-medium text-foreground mb-2">
              {result.behaviorPersona?.subtitle || ''}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4 font-light">
              {result.behaviorPersona?.description || ''}
            </p>
            <div className="flex flex-wrap gap-2">
              {(result.behaviorPersona?.tags || []).map((tag: string) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg bg-muted border border-border text-foreground text-xs font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Real-world Life & Work Action Guide */}
      {MBTI_PROFILES[result.mbti] && (
        <div className="bg-card/80 dark:bg-neutral-900/60 border border-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Sparkles className="w-4 h-4 text-lime-500" />
              <span>실생활 행동 양식 & 라이프스타일 가이드</span>
            </div>
            <span className="text-xs text-muted-foreground">{result.mbti} 맞춤 행동 처방</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/50 dark:bg-neutral-950/70 border border-border p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-foreground mb-2.5">
                  <div className="w-7 h-7 rounded-lg bg-lime-500/10 flex items-center justify-center text-lime-600 dark:text-lime-400">
                    <Briefcase className="w-3.5 h-3.5" />
                  </div>
                  <span>업무 및 협업 스타일</span>
                </div>
                <p className="text-xs text-muted-foreground font-light leading-relaxed">
                  {MBTI_PROFILES[result.mbti].workStyle}
                </p>
              </div>
            </div>

            <div className="bg-muted/50 dark:bg-neutral-950/70 border border-border p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-foreground mb-2.5">
                  <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 dark:text-rose-400">
                    <Heart className="w-3.5 h-3.5" />
                  </div>
                  <span>대인관계 & 소통 방식</span>
                </div>
                <p className="text-xs text-muted-foreground font-light leading-relaxed">
                  {MBTI_PROFILES[result.mbti].relationshipStyle}
                </p>
              </div>
            </div>

            <div className="bg-muted/50 dark:bg-neutral-950/70 border border-border p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-foreground mb-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 dark:text-amber-400">
                    <Lightbulb className="w-3.5 h-3.5" />
                  </div>
                  <span>스트레스 극복 솔루션</span>
                </div>
                <p className="text-xs text-muted-foreground font-light leading-relaxed">
                  {MBTI_PROFILES[result.mbti].stressTip}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. 4 MBTI Dimensions */}
      <div className="bg-card/80 dark:bg-neutral-900/60 border border-border rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-foreground">4대 성향 축 선호도 및 확신도 분석</h2>
          <span className="text-xs text-muted-foreground">E/I · S/N · T/F · J/P 축별 확신 지표</span>
        </div>

        <div className="space-y-4">
          {Object.entries(result.dimensions || {}).map(([key, dim]) => {
            return (
              <div key={key} className="bg-muted/50 dark:bg-neutral-950/70 border border-border rounded-2xl p-4 sm:p-5">
                <div className="flex justify-between items-center mb-2.5 text-xs">
                  <span
                    className={`font-semibold font-mono ${dim.winner === dim.leftType ? 'text-foreground font-bold' : 'text-muted-foreground'}`}
                  >
                    {dim.leftType} ({dim.leftScore}%)
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-card text-muted-foreground border border-border font-mono">
                    확신도 {dim.certaintyScore}%
                  </span>
                  <span
                    className={`font-semibold font-mono ${dim.winner === dim.rightType ? 'text-foreground font-bold' : 'text-muted-foreground'}`}
                  >
                    {dim.rightType} ({dim.rightScore}%)
                  </span>
                </div>

                {/* Score Ratio Bar */}
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden flex mb-3">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${dim.leftScore}%` }}
                  />
                  <div
                    className="h-full bg-teal-400 transition-all duration-500"
                    style={{ width: `${dim.rightScore}%` }}
                  />
                </div>

                {/* Behavioral Note */}
                <div className="text-xs text-muted-foreground font-light flex items-start gap-2 bg-card p-2.5 rounded-xl border border-border">
                  <span className="text-emerald-500 dark:text-emerald-400 text-xs font-semibold shrink-0 mt-0.5">
                    행동 분석
                  </span>
                  <span>{dim.behaviorInsight}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. All Questions Full Telemetry & Trajectory Replayer */}
      {questionsList.length > 0 && (
        <div className="bg-card/80 dark:bg-neutral-900/60 border border-border rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                문항별 마우스 궤적 & 히트맵 리플레이 ({questionsList.length}문항)
              </h2>
              <p className="text-xs text-muted-foreground mt-1 font-light">
                검사한 {questionsList.length}개 전체 문항별 마우스 이동 궤적, 머뭇거림 히트맵, 체류 시간을 직접
                확인해보세요.
              </p>
            </div>

            {/* Replayer View Mode Switcher */}
            <div className="flex bg-muted p-1 rounded-xl border border-border text-xs self-start sm:self-auto gap-1">
              <Button
                size="sm"
                variant={replayerMode === 'canvas' ? 'default' : 'ghost'}
                onClick={() => setReplayerMode('canvas')}
                className="h-7 px-3 text-xs rounded-lg font-semibold"
              >
                마우스 궤적
              </Button>
              <Button
                size="sm"
                variant={replayerMode === 'timeline' ? 'default' : 'ghost'}
                onClick={() => setReplayerMode('timeline')}
                className="h-7 px-3 text-xs rounded-lg font-semibold"
              >
                타임라인
              </Button>
            </div>
          </div>

          {/* Question Responsive Grid Selector Pills */}
          <div className="flex flex-wrap gap-1.5 mb-6 p-3 bg-muted/60 dark:bg-neutral-950/80 rounded-2xl border border-border max-h-43.75 overflow-y-auto">
            {questionsList.map((qDetail, idx) => {
              const isSelected = selectedQuestionIdx === idx;
              const hasChanges = qDetail.behavior.changeCount > 0;
              return (
                <Button
                  key={qDetail.question.id}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedQuestionIdx(idx)}
                  className={`w-10.5 h-8.5 sm:w-12 sm:h-9.5 p-0 rounded-xl text-xs font-semibold flex flex-col items-center justify-center relative shrink-0 ${
                    isSelected ? 'shadow-md scale-105 z-10' : ''
                  }`}
                >
                  <span className="text-[10px] sm:text-[11px] font-bold font-mono">Q{idx + 1}</span>
                  {hasChanges && <span className="w-1.5 h-1.5 rounded-full bg-rose-400 absolute top-1 right-1" />}
                </Button>
              );
            })}
          </div>

          {/* Active Question Telemetry Card */}
          {questionsList[selectedQuestionIdx] && (
            <div className="space-y-4">
              <div className="bg-muted/50 dark:bg-neutral-950/80 border border-border p-4 rounded-2xl">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span className="font-medium">문항 #{questionsList[selectedQuestionIdx].question.id}</span>
                  <span className="font-mono text-foreground font-medium">
                    체류: {(questionsList[selectedQuestionIdx].hesitationTime / 1000).toFixed(1)}초
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-foreground mb-2 leading-relaxed">
                  {questionsList[selectedQuestionIdx].question.title}
                </h4>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-light">
                  <span className="text-amber-500 dark:text-amber-400 font-medium">
                    {questionsList[selectedQuestionIdx].changeHistorySummary}
                  </span>
                  <span>·</span>
                  <span className="text-emerald-500 dark:text-emerald-400 font-medium">
                    {questionsList[selectedQuestionIdx].hoverSummary}
                  </span>
                </div>
              </div>

              {/* Dynamic Replayer */}
              {replayerMode === 'timeline' ? (
                <TouchTimelinePlayer
                  key={questionsList[selectedQuestionIdx].behavior.questionId}
                  behaviorLog={questionsList[selectedQuestionIdx].behavior}
                />
              ) : (
                <MouseReplayCanvas
                  key={questionsList[selectedQuestionIdx].behavior.questionId}
                  behaviorLog={questionsList[selectedQuestionIdx].behavior}
                  viewMode={canvasViewMode}
                  onViewModeChange={setCanvasViewMode}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* 7. Persona Gap Analysis */}
      {result.personaGap?.detected && (
        <div className="bg-card/80 dark:bg-neutral-900/60 border border-border rounded-3xl p-6 sm:p-8 shadow-xl">
          <h2 className="text-lg font-bold text-foreground mb-2">본능 vs 사회적 페르소나 갭 분석</h2>
          <p className="text-xs text-muted-foreground mb-6 font-light">{result.personaGap?.summary}</p>

          <div className="space-y-4">
            {(result.personaGap?.items || []).map((item, idx) => (
              <div key={idx} className="bg-muted/50 dark:bg-neutral-950/70 border border-border rounded-2xl p-4 sm:p-5">
                <h4 className="text-sm font-semibold text-foreground mb-3">{item.question.title}</h4>
                <div className="flex items-center gap-2 text-xs mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-card border border-border text-muted-foreground">
                    첫 직감: {item.initialChoiceText}
                  </span>
                  <span className="text-muted-foreground">➔</span>
                  <span className="px-2.5 py-1 rounded-lg bg-card border border-border text-foreground font-semibold">
                    최종 선택: {item.finalChoiceText}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed font-light bg-card p-3 rounded-xl border border-border">
                  💡 {item.psychologicalInterpretation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. Action Controls: Story Card, Home, Share & Restart */}
      {isSharedView ? (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => setIsStoryModalOpen(true)}
            className="w-full sm:w-auto rounded-full bg-linear-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30"
          >
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>📸 인스타 스토리용 카드 (9:16)</span>
          </Button>

          {onHome && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onHome}
              className="w-full sm:w-auto rounded-full"
            >
              <Home className="w-4 h-4 text-emerald-500" />
              <span>홈으로 이동</span>
            </Button>
          )}

          <Button
            type="button"
            size="lg"
            onClick={onRestart}
            className="w-full sm:w-auto rounded-full font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>나도 행동 분석 MBTI 검사하기</span>
            <ArrowRight className="w-4 h-4 stroke-3" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => setIsStoryModalOpen(true)}
            className="w-full sm:w-auto rounded-full bg-linear-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30"
          >
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>📸 인스타 스토리용 카드 (9:16)</span>
          </Button>

          {onHome && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onHome}
              className="w-full sm:w-auto rounded-full"
            >
              <Home className="w-4 h-4 text-emerald-500" />
              <span>홈으로 이동</span>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleCopyLink}
            className="w-full sm:w-auto rounded-full"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? '공유 링크 복사 완료!' : '결과 공유 링크 복사'}</span>
          </Button>

          <Button
            type="button"
            size="lg"
            onClick={onRestart}
            variant="default"
            className="w-full sm:w-auto rounded-full font-semibold text-xs sm:text-sm shadow-md hover:scale-[1.02] active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>다시 검사하기</span>
          </Button>
        </div>
      )}

      {/* 9:16 Instagram Story Card Modal */}
      <StoryCardModal result={result} isOpen={isStoryModalOpen} onClose={() => setIsStoryModalOpen(false)} />
    </div>
  );
}
