'use client';

import React, { useRef, useState } from 'react';
import { FullAnalysisResult } from '../types';
import { toPng } from 'html-to-image';
import { X, Download, Sparkles, Zap, Brain, Compass, Target, ShieldCheck } from 'lucide-react';

interface StoryCardModalProps {
  result: FullAnalysisResult;
  isOpen: boolean;
  onClose: () => void;
}

export const StoryCardModal: React.FC<StoryCardModalProps> = ({
  result,
  isOpen,
  onClose,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);

    try {
      // Small pause to ensure fonts and styles are fully painted
      await new Promise((r) => setTimeout(r, 150));
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2.5, // Crisp 1080x1920 scale
        quality: 0.95,
        backgroundColor: '#07080c',
      });

      const link = document.createElement('a');
      link.download = `behavior_mbti_${result.mbti}_story.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export story card image:', err);
      alert('이미지 생성 중 오류가 발생했습니다. 브라우저 설정을 확인해주세요.');
    } finally {
      setIsExporting(false);
    }
  };

  const getPersonaIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'Brain':
        return <Brain className="w-5 h-5 text-purple-400" />;
      case 'Compass':
        return <Compass className="w-5 h-5 text-sky-400" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-emerald-400" />;
      default:
        return <Target className="w-5 h-5 text-rose-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-sm flex flex-col items-center my-auto">
        {/* Modal Controls Header */}
        <div className="w-full flex items-center justify-between mb-3 text-xs font-mono text-neutral-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>9:16 STORY CARD PREVIEW</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 9:16 Card Container (Captured by html-to-image) */}
        <div
          ref={cardRef}
          className="w-[340px] h-[604px] bg-[#07080c] text-white rounded-[32px] p-6 border border-white/[0.12] shadow-2xl relative overflow-hidden flex flex-col justify-between selection:bg-none"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.12) 0%, transparent 65%),
              radial-gradient(circle at 100% 100%, rgba(56, 189, 248, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 0% 100%, rgba(168, 85, 247, 0.08) 0%, transparent 50%)
            `,
          }}
        >
          {/* Subtle Grid Accent */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

          {/* Top Brand Header */}
          <div className="relative z-10 flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-white/[0.08] border border-white/[0.12] flex items-center justify-center text-emerald-400">
                <Compass className="w-3.5 h-3.5" />
              </div>
              <span className="font-mono text-xs font-bold tracking-wider">
                BEHAVIOR<span className="text-emerald-400">.MBTI</span>
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-neutral-400 border border-white/[0.06]">
              TELEMETRY DOSSIER
            </span>
          </div>

          {/* Center MBTI Hero */}
          <div className="relative z-10 text-center my-auto py-2">
            <div className="inline-block px-3 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-[10px] font-mono mb-2">
              무의식 행동 진단 완료
            </div>
            <h1 className="text-6xl font-black tracking-tight font-mono text-transparent bg-clip-text bg-gradient-to-b from-white via-neutral-100 to-neutral-400 drop-shadow-sm">
              {result.mbti}
            </h1>
            <h2 className="text-base font-bold text-neutral-100 mt-1">
              {result.mbtiTitle}
            </h2>
            <p className="text-[11px] text-neutral-400 font-light mt-0.5 line-clamp-1">
              {result.mbtiDescription}
            </p>

            {/* Persona Badge */}
            <div className="mt-3.5 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm text-left flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-white/[0.1] flex items-center justify-center shrink-0 shadow-inner">
                {getPersonaIcon(result.behaviorPersona.iconName)}
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-mono text-neutral-500 block uppercase">
                  행동 페르소나
                </span>
                <span className="text-xs font-bold text-white block truncate">
                  {result.behaviorPersona.title}
                </span>
                <span className="text-[10px] text-neutral-400 block truncate">
                  {result.behaviorPersona.subtitle}
                </span>
              </div>
            </div>

            {/* 4-Axis Certainty Mini Bars */}
            <div className="mt-3 grid grid-cols-2 gap-1.5 text-left">
              {Object.entries(result.dimensions).map(([key, dim]) => (
                <div key={key} className="bg-neutral-950/80 p-1.5 px-2.5 rounded-xl border border-white/[0.04]">
                  <div className="flex justify-between text-[10px] font-mono mb-1">
                    <span className="text-white font-bold">{dim.winner}</span>
                    <span className="text-emerald-400">{dim.winnerPercentage}%</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full"
                      style={{ width: `${dim.certaintyScore}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Stats Row */}
          <div className="relative z-10 grid grid-cols-3 gap-1.5 p-2 rounded-2xl bg-neutral-950/80 border border-white/[0.06] text-center my-1">
            <div>
              <span className="text-[9px] font-mono text-neutral-500 block">종합 확신도</span>
              <span className="text-xs font-bold text-amber-400 font-mono">
                {result.overallCertainty}%
              </span>
            </div>
            <div>
              <span className="text-[9px] font-mono text-neutral-500 block">고민 속도</span>
              <span className="text-xs font-bold text-sky-400 font-mono">
                상위 {result.benchmark.dwellTimePercentile}%
              </span>
            </div>
            <div>
              <span className="text-[9px] font-mono text-neutral-500 block">일관성 순위</span>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                상위 {result.benchmark.changeCountPercentile}%
              </span>
            </div>
          </div>

          {/* Tags & Domain Footer */}
          <div className="relative z-10 pt-2 border-t border-white/[0.06] flex flex-col gap-1.5">
            <div className="flex flex-wrap justify-center gap-1">
              {result.behaviorPersona.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] text-neutral-300 border border-white/[0.06]"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 pt-1">
              <span className="text-neutral-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                mbti.opentoyapp.kr
              </span>
              <span>나도 검사하기 ➔</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          disabled={isExporting}
          onClick={handleDownload}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] text-neutral-950 font-bold text-sm shadow-lg shadow-emerald-950/50 transition-all cursor-pointer touch-manipulation disabled:opacity-50"
        >
          {isExporting ? (
            <>
              <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
              <span>고화질 이미지 생성 중...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>스토리 카드 이미지 저장 (PNG)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
