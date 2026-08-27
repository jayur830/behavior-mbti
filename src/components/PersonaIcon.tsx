import { Brain, Compass, Sparkles, Target, Zap } from 'lucide-react';

export interface PersonaIconProps {
  name: string;
  className?: string;
}

/**
 * 페르소나 코드에 대응하는 직관적인 Lucide 아이콘을 렌더링하는 공통 컴포넌트
 */
export default function PersonaIcon({ name, className = 'w-5 h-5 text-indigo-400' }: PersonaIconProps) {
  switch (name) {
    case 'Zap':
      return <Zap className={className} />;
    case 'Brain':
      return <Brain className={className} />;
    case 'Compass':
      return <Compass className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'Target':
    default:
      return <Target className={className} />;
  }
}
