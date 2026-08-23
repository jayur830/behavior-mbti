'use client';

import React, { useEffect, useState } from 'react';
import { FullAnalysisResult } from '../types';
import { MouseReplayCanvas } from './MouseReplayCanvas';
import confetti from 'canvas-confetti';
import {
  Zap,
  Brain,
  Compass,
  Target,
  RotateCcw,
  Share2,
  Check,
  Activity,
  ArrowRightLeft,
  MousePointer,
  Clock,
  Sparkles,
} from 'lucide-react';

interface ResultViewProps {
  result: FullAnalysisResult;
  onRestart: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ result, onRestart }) => {
  const [selectedDilemmaIdx, setSelectedDilemmaIdx] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
  }, []);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getPersonaIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap className="w-6 h-6 text-amber-400" />;
      case 'Brain':
        return <Brain className="w-6 h-6 text-sky-400" />;
      case 'Compass':
        return <Compass className="w-6 h-6 text-rose-400" />;
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-emerald-400" />;
      case 'Target':
      default:
        return <Target className="w-6 h-6 text-neutral-300" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-16 space-y-12 text-neutral-100 font-sans">
      {/* 1. Top Dossier Hero */}
      <div className="relative overflow-hidden bg-neutral-900/80 border border-white/[0.08] rounded-3xl p-6 sm:p-12 shadow-2xl flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-neutral-400 text-xs font-mono mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          DIAGNOSIS REPORT
        </div>

        <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white mb-2 font-mono">
          {result.mbti}
        </h1>
        <div className="text-xl sm:text-2xl font-bold text-neutral-200 mb-4">{result.mbtiTitle}</div>
        <p className="text-sm sm:text-base text-neutral-400 max-w-lg mb-8 leading-relaxed font-light">
          {result.mbtiDescription}
        </p>

        {/* Global Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl bg-neutral-950/60 p-4 rounded-2xl border border-white/[0.06]">
          <div className="flex flex-col items-center p-2">
            <span className="text-[11px] font-mono text-neutral-500 mb-1 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              종합 확신도
            </span>
            <span className="text-lg sm:text-xl font-bold text-neutral-100 font-mono">
              {result.overallCertainty}%
            </span>
          </div>

          <div className="flex flex-col items-center p-2">
            <span className="text-[11px] font-mono text-neutral-500 mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-sky-400" />
              총 소요 시간
            </span>
            <span className="text-lg sm:text-xl font-bold text-neutral-100 font-mono">
              {(result.totalTestDuration / 1000).toFixed(1)}s
            </span>
          </div>

          <div className="flex flex-col items-center p-2">
            <span className="text-[11px] font-mono text-neutral-500 mb-1 flex items-center gap-1">
              <ArrowRightLeft className="w-3 h-3 text-rose-400" />
              답변 번복
            </span>
            <span className="text-lg sm:text-xl font-bold text-neutral-100 font-mono">
              {result.totalAnswerChanges}회
            </span>
          </div>

          <div className="flex flex-col items-center p-2">
            <span className="text-[11px] font-mono text-neutral-500 mb-1 flex items-center gap-1">
              <MousePointer className="w-3 h-3 text-emerald-400" />
              방황 지수
            </span>
            <span className="text-lg sm:text-xl font-bold text-neutral-100 font-mono">
              {result.mouseTrajectoryStats.indecisivenessIndex}/100
            </span>
          </div>
        </div>
      </div>

      {/* 2. Behavior Profile Card */}
      <div className="bg-neutral-900/60 border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 uppercase tracking-wide mb-4">
          <Activity className="w-3.5 h-3.5" />
          <span>Behavior Dynamics Profile</span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
            {getPersonaIcon(result.behaviorPersona.iconName)}
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
              {result.behaviorPersona.title}
            </h3>
            <p className="text-xs sm:text-sm font-medium text-neutral-300 mb-2">
              {result.behaviorPersona.subtitle}
            </p>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-4 font-light">
              {result.behaviorPersona.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {result.behaviorPersona.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg bg-neutral-950 border border-white/[0.06] text-neutral-400 text-xs font-mono"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. 4 MBTI Dimensions with Clean Precision Ratios */}
      <div className="bg-neutral-900/60 border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white font-mono tracking-tight">
            4-AXIS PREFERENCE & CERTAINTY
          </h2>
          <span className="text-xs text-neutral-500 font-mono">단호함 vs 망설임 지표</span>
        </div>

        <div className="space-y-4">
          {Object.entries(result.dimensions).map(([key, dim]) => {
            return (
              <div
                key={key}
                className="bg-neutral-950/70 border border-white/[0.06] rounded-2xl p-4 sm:p-5"
              >
                <div className="flex justify-between items-center mb-2.5 text-xs font-mono">
                  <span
                    className={`font-semibold ${
                      dim.winner === dim.leftType ? 'text-white' : 'text-neutral-500'
                    }`}
                  >
                    {dim.leftType} ({dim.leftScore}%)
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.05] text-neutral-300 border border-white/[0.08]">
                    확신도 {dim.certaintyScore}%
                  </span>
                  <span
                    className={`font-semibold ${
                      dim.winner === dim.rightType ? 'text-white' : 'text-neutral-500'
                    }`}
                  >
                    {dim.rightType} ({dim.rightScore}%)
                  </span>
                </div>

                {/* Score Ratio Bar */}
                <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden flex mb-3">
                  <div
                    className="h-full bg-neutral-200 transition-all duration-500"
                    style={{ width: `${dim.leftScore}%` }}
                  />
                  <div
                    className="h-full bg-neutral-600 transition-all duration-500"
                    style={{ width: `${dim.rightScore}%` }}
                  />
                </div>

                {/* Behavioral Note */}
                <div className="text-xs text-neutral-400 font-light flex items-start gap-2 bg-neutral-900/60 p-2.5 rounded-xl border border-white/[0.04]">
                  <span className="text-neutral-500 font-mono text-[10px] uppercase shrink-0 mt-0.5">
                    NOTE
                  </span>
                  <span>{dim.behaviorInsight}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Top Dilemmas with Telemetry Replay */}
      {result.topDilemmas.length > 0 && (
        <div className="bg-neutral-900/60 border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white font-mono tracking-tight">
                CRITICAL DILEMMAS TOP 3
              </h2>
              <p className="text-xs text-neutral-400 mt-1 font-light">
                마우스 방향 전환 횟수와 체류 시간이 가장 길었던 갈등 문항
              </p>
            </div>

            {/* Dilemma Selector Tabs */}
            <div className="flex gap-2">
              {result.topDilemmas.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedDilemmaIdx(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                    selectedDilemmaIdx === idx
                      ? 'bg-neutral-100 text-neutral-950 shadow-sm'
                      : 'bg-neutral-950 border border-white/[0.06] text-neutral-400 hover:text-white'
                  }`}
                >
                  TOP {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Active Dilemma Card */}
          {result.topDilemmas[selectedDilemmaIdx] && (
            <div className="space-y-4">
              <div className="bg-neutral-950/80 border border-white/[0.06] p-4 rounded-2xl">
                <div className="text-xs font-mono text-neutral-500 mb-1">
                  QUESTION #{result.topDilemmas[selectedDilemmaIdx].question.id}
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white mb-2 leading-relaxed">
                  {result.topDilemmas[selectedDilemmaIdx].question.title}
                </h4>
                <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 font-light">
                  <span className="text-amber-400 font-mono">
                    {result.topDilemmas[selectedDilemmaIdx].changeHistorySummary}
                  </span>
                  <span>·</span>
                  <span>{result.topDilemmas[selectedDilemmaIdx].insight}</span>
                </div>
              </div>

              {/* Canvas Telemetry Replayer */}
              <MouseReplayCanvas
                key={result.topDilemmas[selectedDilemmaIdx].behavior.questionId}
                behaviorLog={result.topDilemmas[selectedDilemmaIdx].behavior}
              />
            </div>
          )}
        </div>
      )}

      {/* 5. Persona Gap Analysis */}
      {result.personaGap.detected && (
        <div className="bg-neutral-900/60 border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-xl">
          <h2 className="text-lg font-bold text-white font-mono tracking-tight mb-2">
            INSTINCT VS PERSONA GAP
          </h2>
          <p className="text-xs text-neutral-400 mb-6 font-light">{result.personaGap.summary}</p>

          <div className="space-y-4">
            {result.personaGap.items.map((item, idx) => (
              <div
                key={idx}
                className="bg-neutral-950/70 border border-white/[0.06] rounded-2xl p-4 sm:p-5"
              >
                <h4 className="text-sm font-semibold text-neutral-200 mb-3">
                  {item.question.title}
                </h4>
                <div className="flex items-center gap-2 text-xs mb-3 font-mono">
                  <span className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-white/[0.08] text-neutral-400">
                    첫 본능: {item.initialChoiceText}
                  </span>
                  <span className="text-neutral-500">➔</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/[0.12] text-neutral-100 font-semibold">
                    최종 수정: {item.finalChoiceText}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed font-light bg-neutral-900/50 p-3 rounded-xl border border-white/[0.04]">
                  💡 {item.psychologicalInterpretation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Action Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6">
        <button
          onClick={handleCopyLink}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-medium text-xs sm:text-sm bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-white/[0.1] transition-all cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          <span>{copied ? '링크 복사됨' : '결과 링크 복사'}</span>
        </button>

        <button
          onClick={onRestart}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-semibold text-xs sm:text-sm bg-neutral-100 hover:bg-white text-neutral-950 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>다시 검사하기</span>
        </button>
      </div>
    </div>
  );
};
