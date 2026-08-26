import { render, screen } from '@testing-library/react';

import { TouchTimelinePlayer } from '@/components/TouchTimelinePlayer';
import type { QuestionBehaviorLog } from '@/types';

const mockBehaviorLog: QuestionBehaviorLog = {
  questionId: 1,
  startTime: Date.now() - 3000,
  endTime: Date.now(),
  totalDwellTime: 3000,
  firstInteractionTime: 800,
  finalValue: 2,
  selectionHistory: [
    { value: -2, timestamp: 800 },
    { value: 2, timestamp: 2500 },
  ],
  changeCount: 1,
  hoverLogs: [
    {
      optionValue: -2,
      enterTime: 600,
      leaveTime: 800,
      duration: 200,
    },
  ],
  mouseTrajectory: [
    { x: 0.2, y: 0.3, timestamp: 200 },
    { x: 0.7, y: 0.8, timestamp: 2500 },
  ],
  directionChanges: 1,
  hesitationScore: 25,
  tabBlurCount: 0,
  primaryDevice: 'mouse',
  keyStrokeCount: 0,
};

describe('TouchTimelinePlayer 컴포넌트 테스트', () => {
  it('인터랙션 타임라인 정보와 컨트롤 버튼이 정상적으로 렌더링되어야 한다', () => {
    render(<TouchTimelinePlayer behaviorLog={mockBehaviorLog} />);

    expect(screen.getByText(/Mobile Touch Dynamics Timeline/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /일시정지/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /다시보기/i })).toBeInTheDocument();
  });
});
