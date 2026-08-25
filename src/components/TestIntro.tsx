'use client';

import React from 'react';
import { ArrowRight, MousePointer2, GitBranch, BarChart3, ShieldCheck } from 'lucide-react';

interface TestIntroProps {
  onStart: () => void;
}

export const TestIntro: React.FC<TestIntroProps> = ({ onStart }) => {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 sm:py-16 flex flex-col items-center text-center">
      {/* Top Tag */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-medium mb-8">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        <span>행동 궤적 기반 성향 검사</span>
      </div>

      {/* Main Title */}
      <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
        답변 뒤에 남겨진 <br className="hidden sm:inline" />
        마우스의 망설임을 분석합니다
      </h1>

      {/* Subtitle */}
      <p className="text-slate-400 text-sm sm:text-base max-w-xl mb-12 leading-relaxed font-normal">
        일반적인 설문은 정제된 답변만 기록합니다. <br className="hidden sm:inline" />
        클릭하기 전의 머뭇거림, 선택지를 바꾼 고민의 시간, 커서의 궤적을 통해
        당신의 본능적 성향과 사회적 페르소나를 확인해보세요.
      </p>

      {/* Clean Feature List with Smooth Hover Effects */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-14 text-left">
        <div className="group p-6 rounded-2xl bg-slate-900/50 hover:bg-slate-900/90 border border-slate-800/70 hover:border-slate-600/80 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 flex flex-col justify-between cursor-default">
          <div>
            <div className="w-10 h-10 rounded-xl bg-slate-800/80 group-hover:bg-slate-700/80 border border-slate-700/60 group-hover:border-slate-500/60 text-slate-300 group-hover:text-white flex items-center justify-center mb-4 transition-colors duration-300">
              <MousePointer2 className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white mb-1.5 transition-colors">01. 궤적 & 속도 측정</h3>
            <p className="text-xs text-slate-400 group-hover:text-slate-300 leading-relaxed font-normal transition-colors">
              커서 이동 거리와 방향 전환 횟수를 실시간 캡처하여 결정의 확신도를 측정합니다.
            </p>
          </div>
        </div>

        <div className="group p-6 rounded-2xl bg-slate-900/50 hover:bg-slate-900/90 border border-slate-800/70 hover:border-slate-600/80 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 flex flex-col justify-between cursor-default">
          <div>
            <div className="w-10 h-10 rounded-xl bg-slate-800/80 group-hover:bg-slate-700/80 border border-slate-700/60 group-hover:border-slate-500/60 text-slate-300 group-hover:text-white flex items-center justify-center mb-4 transition-colors duration-300">
              <GitBranch className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white mb-1.5 transition-colors">02. 본능 vs 고민 갭</h3>
            <p className="text-xs text-slate-400 group-hover:text-slate-300 leading-relaxed font-normal transition-colors">
              첫 직감으로 향한 답과 고민 후 조정한 최종 답을 비교해 내면의 차이를 분석합니다.
            </p>
          </div>
        </div>

        <div className="group p-6 rounded-2xl bg-slate-900/50 hover:bg-slate-900/90 border border-slate-800/70 hover:border-slate-600/80 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 flex flex-col justify-between cursor-default">
          <div>
            <div className="w-10 h-10 rounded-xl bg-slate-800/80 group-hover:bg-slate-700/80 border border-slate-700/60 group-hover:border-slate-500/60 text-slate-300 group-hover:text-white flex items-center justify-center mb-4 transition-colors duration-300">
              <BarChart3 className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white mb-1.5 transition-colors">03. 축별 확신도 지표</h3>
            <p className="text-xs text-slate-400 group-hover:text-slate-300 leading-relaxed font-normal transition-colors">
              각 성향 축(E/I, S/N, T/F, J/P)에 대한 확신도 데이터를 정량적으로 제공합니다.
            </p>
          </div>
        </div>
      </div>

      {/* Start Button with Dynamic Hover */}
      <button
        type="button"
        onClick={onStart}
        className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-4 text-sm sm:text-base font-semibold text-slate-950 bg-white hover:bg-slate-100 active:bg-slate-200 hover:shadow-lg hover:shadow-white/10 hover:-translate-y-0.5 active:translate-y-0 rounded-full transition-all duration-200 cursor-pointer touch-manipulation select-none"
      >
        <span>검사 시작하기</span>
        <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
      </button>

      {/* Privacy Notice */}
      <div className="mt-8 flex items-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
        <span>약 3~5분 소요 · 모든 측정 데이터는 브라우저 내부에서만 안전하게 실시간 처리됩니다</span>
      </div>
    </div>
  );
};
