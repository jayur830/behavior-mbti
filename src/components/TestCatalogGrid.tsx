'use client';

import { ArrowRight, Clock, HelpCircle, Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { FC } from 'react';

import { TEST_CATALOG, TestCatalogItem } from '@/data/tests';

interface TestCatalogGridProps {
  onSelectTest?: (test: TestCatalogItem) => void;
}

export const TestCatalogGrid: FC<TestCatalogGridProps> = () => {
  return (
    <section className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-slate-800/80 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PersonaLens Test Series</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            무의식 행동 분석 검사 카탈로그
          </h2>
        </div>
        <p className="text-xs text-slate-400 max-w-sm font-normal">
          마우스의 움직임, 머뭇거림, 터치 제스처를 실시간 추적하여 당신의 내면과 성향을 다각도로 분석합니다.
        </p>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TEST_CATALOG.map((test) => {
          const isActive = test.status === 'active';

          const cardContent = (
            <div
              className={`group relative h-full flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-slate-900/60 border transition-all duration-300 overflow-hidden ${
                isActive
                  ? `${test.borderColor} hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer bg-linear-to-b ${test.gradient}`
                  : 'border-slate-800/80 opacity-75 hover:opacity-90 bg-slate-900/30'
              }`}
            >
              {/* Card Ambient Glow for Active Test */}
              {isActive && (
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-500" />
              )}

              <div>
                {/* Top Meta Bar */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400 tracking-wider">
                      {test.seriesNumber}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs font-medium text-slate-400">{test.category}</span>
                  </div>

                  {test.badge && (
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${test.badgeColor}`}>
                      {test.badge}
                    </span>
                  )}
                </div>

                {/* Title & Subtitle */}
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-indigo-200 transition-colors">
                  {test.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-medium mb-3 leading-snug">{test.subtitle}</p>
                <p className="text-xs text-slate-400 font-normal leading-relaxed mb-6">{test.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {test.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/50 text-slate-400 font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Meta & Action */}
              <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {test.estimatedTime}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    {test.questionCount}문항
                  </span>
                </div>

                {isActive ? (
                  <div className="inline-flex items-center gap-1.5 font-semibold text-indigo-400 group-hover:text-white transition-colors">
                    <span>검사 시작하기</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 font-medium text-slate-400">
                    <Lock className="w-3.5 h-3.5" />
                    <span>출시 예정</span>
                  </div>
                )}
              </div>
            </div>
          );

          if (isActive) {
            return (
              <Link key={test.id} href={test.route} className="block focus:outline-none">
                {cardContent}
              </Link>
            );
          }

          return <div key={test.id}>{cardContent}</div>;
        })}
      </div>
    </section>
  );
};
