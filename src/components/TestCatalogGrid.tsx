'use client';

import { ArrowRight, BarChart3, Clock, HelpCircle, Lock, MousePointer2, Sparkles } from 'lucide-react';
import Link from 'next/link';

import type { TestCatalogItem } from '@/data/tests';
import { TEST_CATALOG } from '@/data/tests';

export interface TestCatalogGridProps {
  onSelectTest?: (test: TestCatalogItem) => void;
}

function CatalogIcon({ testId }: { testId: string }) {
  if (testId === 'mbti') return <MousePointer2 className="h-4 w-4" />;
  if (testId === 'decision-hesitation') return <BarChart3 className="h-4 w-4" />;
  if (testId === 'big-five') return <Sparkles className="h-4 w-4" />;
  return <HelpCircle className="h-4 w-4" />;
}

export default function TestCatalogGrid() {
  return (
    <section className="w-full max-w-7xl mx-auto px-5 pb-24 sm:px-8 pt-6" aria-labelledby="catalog-title">
      <div className="catalog-header">
        <div>
          <p className="text-xs font-bold text-accent-ink">PersonaLens test series / 04</p>
          <h2 id="catalog-title" className="catalog-header__title">
            무의식 행동 분석 검사 카탈로그
          </h2>
        </div>
        <p className="catalog-header__description">
          같은 질문에도 선택하는 방식은 모두 다릅니다. 움직임, 머뭇거림, 터치 제스처를 함께 읽어 지금의 나를
          탐색해보세요.
        </p>
      </div>

      <div className="catalog-grid">
        {TEST_CATALOG.map((test) => {
          const isActive = test.status === 'active';

          const cardContent = (
            <article className={`catalog-card ${isActive ? 'catalog-card--active' : ''}`}>
              <div className="catalog-card__top">
                <span className="catalog-card__index">{test.seriesNumber}</span>
                <span>{test.category}</span>
                {test.badge ? <span className="catalog-card__badge">{test.badge}</span> : null}
              </div>

              <div className="catalog-card__body">
                <div className="catalog-card__icon">
                  <CatalogIcon testId={test.id} />
                </div>
                <h3>{test.title}</h3>
                <p className="catalog-card__subtitle">{test.subtitle}</p>
                <p className="catalog-card__description">{test.description}</p>

                <div className="catalog-card__tags">
                  {test.tags.map((tag) => (
                    <span key={tag} className="catalog-card__tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="catalog-card__footer">
                <div className="catalog-card__meta">
                  <span>
                    <Clock className="h-3.5 w-3.5" /> {test.estimatedTime}
                  </span>
                  <span>
                    <HelpCircle className="h-3.5 w-3.5" /> {test.questionCount}문항
                  </span>
                </div>

                {isActive ? (
                  <span className="catalog-card__action">
                    검사 시작하기 <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                ) : (
                  <span className="catalog-card__action text-muted-foreground">
                    <Lock className="h-3.5 w-3.5" /> 출시 예정
                  </span>
                )}
              </div>

              {!isActive ? (
                <div className="catalog-card__overlay" aria-label="출시 준비 중">
                  <div className="catalog-card__overlay-icon">
                    <Lock className="h-4 w-4" />
                  </div>
                  <strong>출시 준비 중</strong>
                  <span>곧 새로운 분석 검사가 공개됩니다</span>
                </div>
              ) : null}
            </article>
          );

          if (isActive) {
            return (
              <Link key={test.id} href={test.route} className="catalog-card-link catalog-card-link--featured">
                {cardContent}
              </Link>
            );
          }

          return (
            <div key={test.id} className="catalog-card-wrap" aria-disabled="true">
              {cardContent}
            </div>
          );
        })}
      </div>
    </section>
  );
}
