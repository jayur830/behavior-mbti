# 🧠 Behavior MBTI (행동 분석 기반 정밀 심리검사)

> **"답변 뒤에 숨겨진 마우스의 망설임을 읽습니다."**  
> 설문 응답의 텍스트뿐만 아니라, **선택지를 바꾸기까지의 고민 시간, 마우스 커서의 궤적, 망설임 지수** 등 사용자의 무의식적 마이크로 인터랙션을 정밀 추적하여 진짜 성향을 도출하는 차세대 MBTI 심리검사 플랫폼입니다.

---

## ✨ 핵심 기능 (Key Features)

### 1. 🎯 실시간 텔레메트리 행동 추적 (Telemetry Tracking)
- **마우스 궤적 캡처**: 문항 카드 내 상대 좌표(`0~1`)와 타임스탬프(`ms`)를 16ms 단위로 부드럽게 기록
- **지그재그/망설임 감지**: 마우스 방향 전환 횟수 및 옵션 버튼 `Hover` 체류 시간 분석
- **답변 번복 이력 타임라인**: 첫 직감 선택 ➔ 체류/고민 시간 ➔ 최종 수정 선택의 전체 흐름 추적
- **브라우저 탭 이탈 감지**: 검사 중 포커스 이탈 횟수 및 체류 중단 시간 감지

### 2. 📊 정밀 심리 & 행동 분석 엔진 (Behavioral Psychometrics)
- **4대 성향 축 및 확신도(Certainty)**: 단순 E/I, S/N, T/F, J/P 비율뿐 아니라 망설임 지수를 결합한 성향별 확신도(0~100%) 산출
- **사회적 페르소나 vs 본능 갭 분석**: 첫 본능적 선택과 수정된 최종 선택 간의 심리적 의도 및 차이 해석
- **고뇌의 문항 TOP 3 추출**: 마우스 흔들림과 체류 시간이 가장 길었던 심리적 갈등 문항 자동 추출
- **마우스 행동 페르소나 5종 진단**:
  - ⚡ **초고속 직진 결단파 (The Decisive Sniper)**: 망설임 없이 직선으로 타격
  - 🧠 **심사숙고 장고파 (The Deep Deliberator)**: 깊은 사색과 높은 집중력
  - 🧭 **갈팡질팡 갈대형 (The Dilemma Juggler)**: 양쪽을 오가는 유연한 입체적 성향
  - ✨ **마우스 춤추는 탐색형 (The Free Explorer)**: 풍부한 호기심으로 화면 전체 탐색
  - 🎯 **미니멀 스텔스형 (The Stealth Minimalist)**: 최소한의 움직임으로 담백하게 완료

### 3. 🎬 Canvas 마우스 궤적 인터랙티브 리플레이어
- 결과 화면에서 사용자가 가장 치열하게 고민했던 문항의 **실제 마우스 커서 이동 궤적, 펄스 애니메이션, 클릭 순번(1번, 2번...)을 HTML5 Canvas로 실시간 재생**

---

## 🛠️ 기술 스택 (Tech Stack)

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Package Manager**: [Yarn](https://yarnpkg.com/)
- **Visual Effects**: HTML5 Canvas API, `canvas-confetti`

---

## 📂 프로젝트 구조 (Directory Structure)

```
behavior-mbti/
├── src/
│   ├── app/
│   │   ├── globals.css          # 에디토리얼 미니멀리즘 테마 & 그리드 패턴
│   │   ├── layout.tsx           # 메타데이터 및 글로벌 레이아웃
│   │   └── page.tsx             # 인트로, 검사 진행, 분석, 결과 뷰 컨트롤러
│   ├── components/
│   │   ├── TestIntro.tsx        # 검사 안내 및 시작 인트로 컴포넌트
│   │   ├── QuestionCard.tsx     # 7점 척도 인터랙션 및 실시간 행동 수집 카드
│   │   ├── MouseReplayCanvas.tsx# 텔레메트리 마우스 궤적 Canvas 리플레이어
│   │   └── ResultView.tsx       # 종합 MBTI & 행동 진단서 결과 뷰
│   ├── data/
│   │   ├── questions.ts         # 12개 MBTI 문항 및 척도 데이터
│   │   └── mbtiDescriptions.ts  # 16개 MBTI 프로필 및 5개 행동 페르소나 데이터
│   ├── hooks/
│   │   └── useBehaviorTracker.ts# 마우스 좌표/호버/수정 이벤트 실시간 수집 훅
│   ├── lib/
│   │   └── analyzer.ts          # MBTI 점수 및 마우스 행동 데이터 분석 엔진
│   └── types/
│       └── index.ts             # TypeScript 인터페이스 및 타입 정의
├── package.json
├── yarn.lock
└── tsconfig.json
```

---

## 🚀 시작하기 (Getting Started)

### 1. 의존성 설치
```bash
yarn install
```

### 2. 개발 서버 실행
```bash
yarn dev
```
브라우저에서 `http://localhost:3000` 접속

### 3. 프로덕션 빌드 & 실행
```bash
yarn build
yarn start
```

---

## 🔒 개인정보 및 보안 (Privacy First)

본 서비스에서 수집되는 모든 마우스 궤적, 체류 시간, 상호작용 로그는 **외부 서버로 전송되지 않고 사용자의 웹 브라우저 내에서만 안전하게 실시간으로 분석 및 렌더링**됩니다.

---

## 📄 라이선스 (License)

MIT License © 2026 Behavior MBTI Lab.
