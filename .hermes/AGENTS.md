# Toss Contract App — Agent Rules

Global Baseline
- 글로벌 규칙은 `~/.hermes/AGENTS.md` (강한하네스) 우선 적용.
- 이 파일은 toss-contract-app 프로젝트 전용 오버라이드만 정의.

## 절대 규칙 (Absolute Rules)

1. **모든 UI는 TDS(@toss/tds-mobile) 컴포넌트만 사용. 인라인 스타일(style={{}}) 금지.**
2. TDS에 없는 컴포넌트가 필요하면, TDS 조합으로 해결. 신규 컴포넌트 생성 금지.
3. TDS 컴포넌트 import 누락 시 빌드 실패로 간주. `Button, Paragraph, Spacing, Badge, ListRow, List, SegmentedControl, Switch, TextField, FixedBottomCTA, Border, Skeleton, Top` 등 가용.
4. PRD.md가 모든 기능의 진실 공급원(Single Source of Truth).

## 피해야 할 패턴 (Anti-Patterns)

- `<div style={{ padding: 24 }}>` → `<Spacing size={24} />` + TDS 컨테이너
- `<p style={{ color: '#6B7684' }}>` → `<Paragraph typography="st4" color="grey600">`
- `<button style={{...}}>` → `<Button color="primary" variant="fill">`
- `<h2>, <h3>` → `<Paragraph typography="st3" fontWeight="bold">`
- 직접 만든 뱃지/라벨 → `<Badge>`

## UI 작업 완료 전 체크리스트

- [ ] `grep -r "style={{" src/` 결과 0건 (canvas 등 불가피한 경우 제외)
- [ ] 모든 텍스트가 `<Paragraph>` 또는 `<TextField label>`로 렌더링
- [ ] 브라우저에서 실제 렌더링 확인 (open으로 열기)
- [ ] 콘솔에 "Element type is invalid" 에러 없음

## 작업 시작 형식

- Goal / Source of truth(PRD.md) / Editable scope / Prohibitions / Completion criteria / Verification method
- 수정 전 항상 `search_files`로 현황 파악 먼저.

## 기술 스택

- TDS(@toss/tds-mobile) v2.4.0 — UI 컴포넌트
- React 18 + TypeScript + Vite
- Supabase (Mock mode: IS_MOCK=true)
- granite.config.ts — 앱 설정/브랜드

## 관련 문서

- PRD.md — 기능 명세
- toss-apps-in-toss skill — TDS/SDK 레퍼런스
- ~/obsidian-vault/seCall/wiki/projects/toss-contract-flowcharts.html — 플로우차트
