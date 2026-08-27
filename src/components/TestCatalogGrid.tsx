'use client';

import { ArrowRight, Clock, HelpCircle, Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';

import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import type { TestCatalogItem } from '@/data/tests';
import { TEST_CATALOG } from '@/data/tests';

export interface TestCatalogGridProps {
  onSelectTest?: (test: TestCatalogItem) => void;
}

export default function TestCatalogGrid() {
  return (
    <section className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-border gap-4">
        <div>
          <Badge variant="emerald" className="mb-2 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PersonaLens Test Series</span>
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            무의식 행동 분석 검사 카탈로그
          </h2>
        </div>
        <p className="text-xs text-muted-foreground max-w-sm font-normal">
          마우스의 움직임, 머뭇거림, 터치 제스처를 실시간 추적하여 당신의 내면과 성향을 다각도로 분석합니다.
        </p>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TEST_CATALOG.map((test) => {
          const isActive = test.status === 'active';

          const cardContent = (
            <Card
              className={`relative h-full flex flex-col justify-between p-6 sm:p-7 rounded-3xl overflow-hidden border-border ${
                isActive
                  ? 'group transition-all duration-300 bg-card/80 dark:bg-card/90 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/10 cursor-pointer'
                  : 'bg-muted/30 opacity-75 select-none cursor-not-allowed'
              }`}
            >
              {/* Card Ambient Glow for Active Test */}
              {isActive && (
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-500" />
              )}

              <div>
                {/* Top Meta Bar */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-muted-foreground tracking-wider">
                      {test.seriesNumber}
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-xs font-medium text-muted-foreground">{test.category}</span>
                  </div>

                  {test.badge && (
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${test.badgeColor}`}>
                      {test.badge}
                    </span>
                  )}
                </div>

                {/* Title & Subtitle */}
                <h3
                  className={`text-lg sm:text-xl font-bold text-foreground mb-2 transition-colors ${
                    isActive ? 'group-hover:text-emerald-500 dark:group-hover:text-emerald-300' : ''
                  }`}
                >
                  {test.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium mb-3 leading-snug">
                  {test.subtitle}
                </p>
                <p className="text-xs text-muted-foreground font-normal leading-relaxed mb-6">{test.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {test.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[11px] px-2.5 py-1 rounded-lg font-medium">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Card Footer Meta & Action */}
              <div className="pt-4 border-t border-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {test.estimatedTime}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    {test.questionCount}문항
                  </span>
                </div>

                {isActive ? (
                  <div className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500 transition-colors">
                    <span>검사 시작하기</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 font-medium text-muted-foreground">
                    <Lock className="w-3.5 h-3.5" />
                    <span>출시 예정</span>
                  </div>
                )}
              </div>

              {/* Preparing State: Translucent Glass Overlay Blocking Touch/Click */}
              {!isActive && (
                <div className="absolute inset-0 bg-background/80 dark:bg-background/85 backdrop-blur-[2px] rounded-3xl z-20 flex flex-col items-center justify-center p-6 text-center cursor-not-allowed select-none transition-all">
                  <div className="w-11 h-11 rounded-2xl bg-card border border-border flex items-center justify-center mb-2.5 shadow-md text-muted-foreground">
                    <Lock className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-foreground tracking-wider">출시 준비 중</span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">곧 새로운 분석 검사가 공개됩니다</span>
                </div>
              )}
            </Card>
          );

          if (isActive) {
            return (
              <Link key={test.id} href={test.route} className="block focus:outline-none">
                {cardContent}
              </Link>
            );
          }

          return (
            <div key={test.id} className="cursor-not-allowed">
              {cardContent}
            </div>
          );
        })}
      </div>
    </section>
  );
}
