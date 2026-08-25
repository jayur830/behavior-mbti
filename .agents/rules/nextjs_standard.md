# Next.js Standard Development Rules

1. **React Import Style**:
   - `import React from 'react'` 같은 default import는 절대 사용하지 않습니다.
   - 필요한 훅이나 타입만 named import (`import { FC, useState, useEffect } from 'react'`) 형태로 가져옵니다.

2. **Lint & Prettier**:
   - `simple-import-sort`, `unused-imports`, `eslint-config-prettier` 규칙을 준수합니다.
   - Prettier 포맷 (`printWidth: 120`, `singleQuote: true`, `semi: true`, `trailingComma: 'all'`)을 준수합니다.

3. **Git 커밋 실행**:
   - 에이전트가 `git commit` 명령을 수행할 때는 대화형 훅 인터랙션을 피하기 위해 항상 `HUSKY=0 git commit -m "..."` 형태로 실행합니다.

4. **SVG 사용**:
   - `@svgr/webpack`을 통해 SVG 파일을 React 컴포넌트로 import하여 사용합니다.
