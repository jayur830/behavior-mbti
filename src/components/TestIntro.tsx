'use client';

import React from 'react';
import { ArrowRight, Compass, Shield, GitCommit, Timer } from 'lucide-react';

interface TestIntroProps {
  onStart: () => void;
}

export const TestIntro: React.FC<TestIntroProps> = ({ onStart }) => {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 sm:py-16 flex flex-col items-center text-center">
      {/* Top Monospace Label */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-neutral-300 text-xs font-mono mb-8 tracking-wide">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        BEHAVIORAL PSYCHOMETRICS ENGINE v2.0
      </div>

      {/* Main Title */}
      <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6 leading-[1.15]">
        답변 뒤에 숨겨진 <br />
        <span className="text-neutral-400">마우스의 망설임</span>을 읽습니다
      </h1>

      {/* Editorial Subtitle */}
      <p className="text-neutral-400 text-base sm:text-lg max-w-xl mb-12 leading-relaxed font-normal">
        일반적인 설문은 정제된 답변만을 기록합니다. <br className="hidden sm:inline" />
        하지만 클릭하기 직전의 머뭇거림, 선택지를 바꾼 고민 시간, 마우스 커서의 궤적은 
        당신의 무의식과 본능을 가장 솔직하게 증명합니다.
      </p>

      {/* Minimalist Feature Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full mb-12 text-left">
        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-white/[0.06] hover:border-white/[0.14] transition-colors flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white flex items-center justify-center mb-4">
              <Compass className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-100 mb-1.5">01. 궤적 & 떨림 측정</h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-light">
              마우스 커서와 터치 제스처의 이동 거리, 속도, 방향 전환(지그재그) 횟수를 16ms 단위로 캡처하여 망설임 지수를 계산합니다.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-white/[0.06] hover:border-white/[0.14] transition-colors flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white flex items-center justify-center mb-4">
              <GitCommit className="w-4 h-4 text-sky-400" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-100 mb-1.5">02. 본능 vs 페르소나 갭</h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-light">
              첫 직감으로 누른 선택지와 신중한 고민 후 조정한 최종 답의 차이를 추적해 사회적 가면과 실제 성향의 차이를 분석합니다.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-white/[0.06] hover:border-white/[0.14] transition-colors flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white flex items-center justify-center mb-4">
              <Timer className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-100 mb-1.5">03. 성향별 확신도 지표</h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-light">
              각 축(E/I, S/N, T/F, J/P)에 대해 얼마나 확고하게 결정을 내렸는지 0~100% 확신도 게이지를 제공합니다.
            </p>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <button
        type="button"
        onClick={onStart}
        className="group relative z-10 inline-flex items-center justify-center gap-3 px-8 py-4 text-sm sm:text-base font-semibold text-neutral-950 bg-neutral-100 hover:bg-white active:bg-neutral-200 rounded-full shadow-[0_0_25px_rgba(255,255,255,0.15)] hover:shadow-[0_0_35px_rgba(255,255,255,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer touch-manipulation select-none"
      >
        <span>검사 시작하기</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Footer Info */}
      <div className="mt-8 flex items-center gap-2 text-xs text-neutral-500 font-mono">
        <Shield className="w-3.5 h-3.5 text-neutral-400" />
        <span>60개 문항 풀 기반 랜덤 12문항 (약 3분) · 데이터는 외부 서버 전송 없이 브라우저 내에서 안전하게 실시간 분석됩니다</span>
      </div>
    </div>
  );
};
