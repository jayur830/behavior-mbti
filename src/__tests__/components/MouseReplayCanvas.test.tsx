import { fireEvent, render, screen } from '@testing-library/react';

import { MouseReplayCanvas } from '@/components/MouseReplayCanvas';
import type { QuestionBehaviorLog } from '@/types';

const mockBehaviorLog: QuestionBehaviorLog = {
  questionId: 1,
  startTime: Date.now() - 2500,
  endTime: Date.now(),
  totalDwellTime: 2500,
  firstInteractionTime: 400,
  finalValue: 3,
  selectionHistory: [{ value: 3, timestamp: 1200 }],
  changeCount: 0,
  hoverLogs: [
    {
      optionValue: 3,
      enterTime: 400,
      leaveTime: 1200,
      duration: 800,
    },
  ],
  mouseTrajectory: [
    { x: 0.1, y: 0.2, timestamp: 100 },
    { x: 0.5, y: 0.5, timestamp: 600 },
    { x: 0.9, y: 0.8, timestamp: 1200 },
  ],
  directionChanges: 0,
  hesitationScore: 10,
  tabBlurCount: 0,
  primaryDevice: 'mouse',
  keyStrokeCount: 0,
};

describe('MouseReplayCanvas 컴포넌트 테스트', () => {
  it('Canvas 및 궤적/히트맵 모드 토글 버튼이 정상적으로 렌더링되어야 한다', () => {
    render(<MouseReplayCanvas behaviorLog={mockBehaviorLog} />);

    expect(screen.getByRole('button', { name: /궤적 재생/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /히트맵/i })).toBeInTheDocument();
  });

  it('히트맵 모드로 토글하면 히트맵 안내 문구가 표시되어야 한다', () => {
    render(<MouseReplayCanvas behaviorLog={mockBehaviorLog} />);

    const heatmapButton = screen.getByRole('button', { name: /히트맵/i });
    fireEvent.click(heatmapButton);

    expect(screen.getByText(/붉은 영역일수록 마우스가 오래 머물며 고민한 지점입니다/i)).toBeInTheDocument();
  });

  it('히트맵 모드에서 다시 궤적 재생으로 돌아오면 재생 컨트롤러가 다시 렌더링되어야 한다', () => {
    render(<MouseReplayCanvas behaviorLog={mockBehaviorLog} />);

    const heatmapButton = screen.getByRole('button', { name: /히트맵/i });
    fireEvent.click(heatmapButton);
    expect(screen.getByText(/붉은 영역일수록 마우스가 오래 머물며 고민한 지점입니다/i)).toBeInTheDocument();

    const replayButton = screen.getByRole('button', { name: /궤적 재생/i });
    fireEvent.click(replayButton);

    expect(screen.getByRole('button', { name: /^(일시정지|재생)$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /처음부터/i })).toBeInTheDocument();
  });
});
