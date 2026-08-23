'use client';

import React from 'react';
import { MousePointerClick, Activity, BrainCircuit, Sparkles, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

interface TestIntroProps {
  onStart: () => void;
}

export const TestIntro: React.FC<TestIntroProps> = ({ onStart }) => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 flex flex-col items-center text-center">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs sm:text-sm font-medium mb-6 animate-pulse">
        <Sparkles className="w-4 h-4" />
        <span>무의식적 행동 데이터로 분석하는 차세대 심리검사</span>
      </div>

      {/* Main Title */}
      <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
        진짜 당신의 MBTI는 <br className="hidden sm:inline" />
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
          마우스의 떨림
        </span>
        이 알고 있습니다
      </h1>

      <p className="text-slate-400 text-sm sm:text-base max-w-xl mb-8 leading-relaxed">
        답변만 보는 일반 검사는 거짓말을 할 수 있습니다. <br />
        하지만 <strong className="text-slate-200">선택지를 바꾸기까지의 망설임 시간</strong>,{' '}
        <strong className="text-slate-200">마우스 포인터의 궤적</strong>,{' '}
        <strong className="text-slate-200">호버 흔적</strong>은 무의식의 진실을 증명합니다.
      </p>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-10 text-left">
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md shadow-lg flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
              <MousePointerClick className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">마우스 궤적 추적</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              선택지 사이를 방황하고 머뭇거린 마우스 커서의 동선을 1ms 단위로 캡처하여 시각화합니다.
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md shadow-lg flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">고민 시간 & 수정 감지</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              첫 직감으로 누른 답과 고민 끝에 바꾼 답을 비교하여 사회적 페르소나와 본능의 갭을 분석합니다.
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md shadow-lg flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center mb-3">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">성향별 확신도 측정</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              단순 E/I 비율뿐 아니라 각 축별로 얼마나 확신을 갖고 결정을 내렸는지 확신도(0~100%)를 도출합니다.
            </p>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={onStart}
        className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 text-base sm:text-lg font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl hover:shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer overflow-hidden"
      >
        <span className="relative z-10 flex items-center gap-2">
          행동 분석 MBTI 검사 시작하기 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </span>
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
      </button>

      {/* Footer Info */}
      <div className="mt-8 flex items-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>약 3~4분 소요 (12문항) | 수집된 행동 데이터는 브라우저 내에서만 안전하게 분석됩니다</span>
      </div>
    </div>
  );
};
