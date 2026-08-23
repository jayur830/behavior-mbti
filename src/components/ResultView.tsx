'use client';

import React, { useEffect, useState } from 'react';
import { FullAnalysisResult } from '../types';
import { MouseReplayCanvas } from './MouseReplayCanvas';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Zap,
  Brain,
  Compass,
  Target,
  RotateCcw,
  Share2,
  Check,
  Activity,
  ArrowRightLeft,
  Flame,
  MousePointer,
  Clock,
  HelpCircle,
} from 'lucide-react';

interface ResultViewProps {
  result: FullAnalysisResult;
  onRestart: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ result, onRestart }) => {
  const [selectedDilemmaIdx, setSelectedDilemmaIdx] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    // Fire festive confetti
    confetti({
      particleCount: 80,
      spread: 70,
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
        return <Zap className="w-8 h-8 text-amber-400" />;
      case 'Brain':
        return <Brain className="w-8 h-8 text-purple-400" />;
      case 'Compass':
        return <Compass className="w-8 h-8 text-rose-400" />;
      case 'Sparkles':
        return <Sparkles className="w-8 h-8 text-sky-400" />;
      case 'Target':
      default:
        return <Target className="w-8 h-8 text-emerald-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-10 text-slate-100">
      {/* 1. Top Hero: MBTI & Behavioral Diagnosis */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950/50 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl text-center flex flex-col items-center">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs sm:text-sm font-semibold mb-4">
          <Sparkles className="w-4 h-4" />
          <span>행동 데이터 기반 정밀 심리 진단 결과</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-2">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
            {result.mbti}
          </span>
        </h1>
        <div className="text-xl sm:text-2xl font-bold text-slate-200 mb-4">{result.mbtiTitle}</div>
        <p className="text-sm sm:text-base text-slate-400 max-w-xl mb-6 leading-relaxed">
          {result.mbtiDescription}
        </p>

        {/* Global Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
          <div className="flex flex-col items-center p-2">
            <span className="text-xs text-slate-500 mb-1 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              종합 확신도
            </span>
            <span className="text-lg sm:text-xl font-bold text-amber-400">
              {result.overallCertainty}%
            </span>
          </div>

          <div className="flex flex-col items-center p-2">
            <span className="text-xs text-slate-500 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              총 검사 시간
            </span>
            <span className="text-lg sm:text-xl font-bold text-sky-400">
              {(result.totalTestDuration / 1000).toFixed(1)}초
            </span>
          </div>

          <div className="flex flex-col items-center p-2">
            <span className="text-xs text-slate-500 mb-1 flex items-center gap-1">
              <ArrowRightLeft className="w-3.5 h-3.5 text-rose-400" />
              선택 번복 횟수
            </span>
            <span className="text-lg sm:text-xl font-bold text-rose-400">
              {result.totalAnswerChanges}회
            </span>
          </div>

          <div className="flex flex-col items-center p-2">
            <span className="text-xs text-slate-500 mb-1 flex items-center gap-1">
              <MousePointer className="w-3.5 h-3.5 text-emerald-400" />
              방황 지수
            </span>
            <span className="text-lg sm:text-xl font-bold text-emerald-400">
              {result.mouseTrajectoryStats.indecisivenessIndex}/100
            </span>
          </div>
        </div>
      </div>

      {/* 2. Behavior Persona Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3">
          <Activity className="w-4 h-4" />
          <span>마우스 움직임 행동 분석 프로필</span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0">
            {getPersonaIcon(result.behaviorPersona.iconName)}
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
              {result.behaviorPersona.title}
            </h3>
            <p className="text-sm font-medium text-purple-300 mb-2">
              {result.behaviorPersona.subtitle}
            </p>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-3">
              {result.behaviorPersona.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {result.behaviorPersona.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-800/40 text-purple-300 text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. 4 MBTI Dimensions with Certainty & Behavior Insight */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-400" />
          <span>4대 성향 축 및 행동 기반 확신도 분석</span>
        </h2>

        <div className="space-y-6">
          {Object.entries(result.dimensions).map(([key, dim]) => {
            return (
              <div
                key={key}
                className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-slate-200">
                    {dim.leftType} 성향 ({dim.leftScore}%)
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    확신도 {dim.certaintyScore}%
                  </span>
                  <span className="text-sm font-bold text-slate-200">
                    {dim.rightType} 성향 ({dim.rightScore}%)
                  </span>
                </div>

                {/* Score Ratio Bar */}
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden flex mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${dim.leftScore}%` }}
                  />
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-500"
                    style={{ width: `${dim.rightScore}%` }}
                  />
                </div>

                {/* Behavioral Note */}
                <div className="flex items-start gap-2 text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/40">
                  <Activity className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span>{dim.behaviorInsight}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Top Dilemmas with Real Interactive Replay */}
      {result.topDilemmas.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-400" />
                <span>가장 치열하게 고뇌했던 문항 TOP 3</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                체류 시간, 마우스 지그재그 방향 전환, 선택지 수정을 기반으로 추출된 심리적 갈등 문항
              </p>
            </div>

            {/* Dilemma Selector Tabs */}
            <div className="flex gap-2">
              {result.topDilemmas.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedDilemmaIdx(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedDilemmaIdx === idx
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  TOP {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Active Dilemma View */}
          {result.topDilemmas[selectedDilemmaIdx] && (
            <div className="space-y-4">
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
                <div className="text-xs font-semibold text-indigo-400 mb-1">
                  질문 #{result.topDilemmas[selectedDilemmaIdx].question.id}
                </div>
                <h4 className="text-base font-bold text-white mb-2">
                  {result.topDilemmas[selectedDilemmaIdx].question.title}
                </h4>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-2">
                  <span className="text-amber-400 font-medium">
                    {result.topDilemmas[selectedDilemmaIdx].changeHistorySummary}
                  </span>
                  <span>•</span>
                  <span>{result.topDilemmas[selectedDilemmaIdx].insight}</span>
                </div>
              </div>

              {/* Canvas Replayer */}
              <MouseReplayCanvas
                key={result.topDilemmas[selectedDilemmaIdx].behavior.questionId}
                behaviorLog={result.topDilemmas[selectedDilemmaIdx].behavior}
              />
            </div>
          )}
        </div>
      )}

      {/* 5. Persona Gap Analysis (본능 vs 사회적 가면) */}
      {result.personaGap.detected && (
        <div className="bg-slate-900/80 border border-rose-500/20 rounded-3xl p-6 sm:p-8 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-rose-400" />
            <span>사회적 페르소나 vs 본능적 충동 분석</span>
          </h2>
          <p className="text-xs text-slate-400 mb-6">{result.personaGap.summary}</p>

          <div className="space-y-4">
            {result.personaGap.items.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5"
              >
                <h4 className="text-sm font-semibold text-slate-200 mb-2">
                  {item.question.title}
                </h4>
                <div className="flex items-center gap-2 text-xs mb-3">
                  <span className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono">
                    첫 본능: {item.initialChoiceText}
                  </span>
                  <span className="text-rose-400 font-bold">➔</span>
                  <span className="px-2 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                    최종 수정: {item.finalChoiceText}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/40">
                  💡 {item.psychologicalInterpretation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Bottom Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <button
          onClick={handleCopyLink}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          <span>{copied ? '결과 링크 복사 완료!' : '결과 공유하기'}</span>
        </button>

        <button
          onClick={onRestart}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>테스트 다시하기</span>
        </button>
      </div>
    </div>
  );
};
