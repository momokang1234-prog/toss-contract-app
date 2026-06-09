# TDS 인라인 스타일 → TDS 컴포넌트 교체 작업지시서

> **For Hermes:** Use subagent-driven-development skill. Each task = one file. Flash model OK.
> **Goal:** 20개 파일의 131건 인라인 스타일을 TDS 컴포넌트로 교체. `grep -r "style={{" src/` 결과 0건 (pdf.ts 제외).
> **Created:** 2026-06-10 (KST)

---

## 변환 규칙 (모든 Task에 공통 적용)

### 금지 → 허용
| 패턴 | 금지 | TDS 대체 |
|------|------|----------|
| 레이아웃 div | `<div style={{ padding: X, maxWidth: Y }}>` | `<Top>` + `<Spacing size={X}>` + 레이아웃 구조 |
| 간격 | `<div style={{ marginBottom: 8 }}>` | `<Spacing size={8} />` |
| flex container | `<div style={{ display: 'flex', gap: N }}>` | `<FlexBox>` 또는 TDS `ListRow` |
| 텍스트 | `<p style={{ color, fontSize }}>` | `<Paragraph typography="stN" color="...">` |
| 제목 | `<h2>, <h3>` | `<Paragraph typography="st3" fontWeight="bold">` |
| 인라인 span | `<span style={{ fontSize: 13 }}>` | `<Paragraph typography="st6">` |
| 버튼 | `<button style={{...}}>` | `<Button color="..." variant="...">` |
| 뱃지/라벨 | 직접 만든 뱃지 | `<Badge>` |
| 카드 | `<div style={{ borderRadius: 12, border: '...' }}>` | TDS 컨테이너 + `<Border>` |
| 로딩/빈 상태 | `<div style={{ textAlign: 'center', color: '...' }}>` | `<Spacing>` + `<Paragraph color="grey500">` |
| 링크 | `<Link style={{ color: '...' }}>` | `<Paragraph color="blue500">`로 감싸기 또는 `<Button variant="weak">` |
| 폰트사이즈 | `fontSize: 13` | `typography="st6"` |
| 폰트사이즈 | `fontSize: 24` / `fontWeight: 700` | `typography="st1"` / `typography="st2" fontWeight="bold"` |

### TDS Typography 매핑
| 사이즈 | typography | 용도 |
|--------|-----------|------|
| 24px+ | st1 | 페이지 타이틀 |
| 20px | st2 | 섹션 헤더 |
| 18px | st3 | 서브헤더 |
| 16px | st4 | 본문 |
| 14px | st5 | 보조 텍스트 |
| 13px | st6 | 캡션 |
| 12px | st7 | 작은 라벨 |

### 필수 TDS Import
각 파일은 필요한 TDS 컴포넌트를 `@toss/tds-mobile`에서 import 해야 함:
```ts
import { Button, Paragraph, Spacing, Top, ListRow, List, Badge, SegmentedControl, Switch, TextField, FixedBottomCTA, Border, Skeleton, FlexBox } from "@toss/tds-mobile";
```

### 예외
- `src/utils/pdf.ts` — HTML-to-PDF 변환용 인라인 스타일은 예외 (브라우저 렌더링 아님)
- `canvas` 요소, `signature` 패드 등 불가피한 경우는 허용

---

## Phase 0: Pre-flight (사전 준비)

### Task 0.1: Git backup
```bash
cd toss-contract-app
git add -A && git commit -m "chore: backup before TDS inline cleanup"
```
**검증:** `git log --oneline -1` 에서 커밋 확인

---

## Phase 1: 간단 파일 (TDS import + div→TDS 컴포넌트)

### Task 1.1: `src/pages/shared/NotFoundPage.tsx`
- **현재**: `<Paragraph>` 사용 중이나 `style={{ fontSize: 48 }}` 있음
- **작업**: `style={{ fontSize: 48 }}` 제거, 대신 `typography` 변경
- **검증**: `grep "style={{" src/pages/shared/NotFoundPage.tsx` 결과 0건

### Task 1.2: `src/pages/shared/DeeplinkHandler.tsx`
- **현재**: 인라인 스타일 1건
- **검증**: `grep "style={{" src/pages/shared/DeeplinkHandler.tsx` 결과 0건

### Task 1.3: `src/pages/worker/ContractListPage.tsx`
- **현재**: 인라인 스타일 1건 미만, TDS Paragraph 사용 중
- **검증**: `grep "style={{" src/pages/worker/ContractListPage.tsx` 결과 0건

---

## Phase 2: 중간 복잡도 (layout 재구성)

### Task 2.1: `src/pages/auth/RoleSelectPage.tsx`
- **현재**: `<p>` 태그 직접 사용, `<div style={...}>` 다수
- **작업**: `<Top>` + `<Paragraph>` + `<ListRow>` 구조로 재구성
- **검증**: `grep "style={{" src/pages/auth/RoleSelectPage.tsx` 결과 0건

### Task 2.2: `src/pages/employer/ContractListPage.tsx`
- **현재**: `<div style={{ padding: 24 }}>` 컨테이너, `<Link style={{...}}>`
- **작업**: `<Top>` + `<Spacing>` + `<Paragraph color="blue500">` 링크
- **검증**: `grep "style={{" src/pages/employer/ContractListPage.tsx` 결과 0건

### Task 2.3: `src/pages/employer/BusinessFormPage.tsx`
- **현재**: `<div style={{ padding: 24 }}>` 컨테이너
- **작업**: `<Top>` + TDS TextField/Button이 이미 있는지 확인 후 컨테이너만 교체
- **검증**: `grep "style={{" src/pages/employer/BusinessFormPage.tsx` 결과 0건

### Task 2.4: `src/pages/employer/DashboardPage.tsx`
- **현재**: `<div style={{ fontSize: 24, fontWeight: 700 }}>` 통계 숫자, `<Link style={{...}}>`
- **작업**: 통계 숫자 → `<Paragraph typography="st1" fontWeight="bold">`, 링크 → `<Paragraph color="blue500">`
- **검증**: `grep "style={{" src/pages/employer/DashboardPage.tsx` 결과 0건

### Task 2.5: `src/components/delivery/DeliveryStatus.tsx`
- **현재**: `<div style={{ display: 'flex' }}>` 스텝 표시
- **작업**: 현재 TDS `Paragraph`만 import → `Spacing` 추가, flex 레이아웃 재구성
- **검증**: `grep "style={{" src/components/delivery/DeliveryStatus.tsx` 결과 0건

### Task 2.6: `src/pages/worker/ContractSignPage.tsx`
- **현재**: `<Paragraph typography="st1" style={{ fontSize: 48 }}>` (이모지 크기)
- **작업**: 이모지에는 `typography` 제거하고 `style` 최소화, 또는 `<span>` 허용
- **검증**: 불가피한 경우를 제외한 `style={{}}` 0건

### Task 2.7: `src/pages/worker/ContractDetailPage.tsx`
- **현재**: 일부 인라인 스타일
- **검증**: `grep "style={{" src/pages/worker/ContractDetailPage.tsx` 결과 0건

---

## Phase 3: 복잡한 파일 (대규모 재구성)

### Task 3.1: `src/pages/auth/LoginPage.tsx`
- **현재**: 20건+ 인라인 스타일, TDS import 있음(Paragraph, Spacing, Button, ListRow, List)
- **작업**: 
  - `<div style={{ minHeight: "100vh" }}>` → `<Top>` + 구조
  - `<div style={{ padding: "0 24px 32px" }}>` → `<Spacing>` + `<FixedBottomCTA>`
  - `<Paragraph style={{ textAlign: "center" }}>` → `textAlign` prop 사용 또는 감싸는 구조
  - `<span>` 이모지 → `<Paragraph>`로 통일
- **검증**: `grep "style={{" src/pages/auth/LoginPage.tsx` 결과 0건

### Task 3.2: `src/pages/employer/ContractFormPage.tsx`
- **현재**: 25건+ 인라인 스타일, TDS import 없음 (❗)
- **작업**:
  - TDS import 추가: `TextField, Button, Paragraph, Spacing, SegmentedControl, FixedBottomCTA`
  - `<div style={{ padding: 24, maxWidth: 480 }}>` → `<Top>` + 레이아웃
  - `<div style={{ fontSize: 13, fontWeight: 600 }}>` → `<Paragraph typography="st6" fontWeight="bold">`
  - `<span style={{ color: '#FF5252', fontSize: 12 }}>` → `<Paragraph typography="st7" color="red500">`
  - 섹션 헤더 → `<Paragraph typography="st3" fontWeight="bold">`
  - flex 2컬럼 → `<Spacing>` + flex 구조
- **검증**: `grep "style={{" src/pages/employer/ContractFormPage.tsx` 결과 0건

### Task 3.3: `src/pages/employer/ContractHistoryPage.tsx`
- **현재**: 15건+ 인라인 스타일, TDS import 없음 (❗)
- **작업**:
  - TDS import 추가: `Paragraph, Spacing, Badge, Top`
  - 타임라인 UI → `<List>` + `<ListRow>` 구조로 재구성
  - `<div style={{ textAlign: 'center', color: '...' }}>` → `<Paragraph color="grey500">`
- **검증**: `grep "style={{" src/pages/employer/ContractHistoryPage.tsx` 결과 0건

### Task 3.4: `src/pages/employer/ContractDetailPage.tsx`
- **현재**: 15건+ 인라인 스타일, TDS import 없음 (❗)
- **작업**:
  - TDS import 추가: `Paragraph, Spacing, Button, Badge, FixedBottomCTA, Top`
  - 계약서 상세 카드 → TDS 컨테이너 + `<Paragraph>` + `<Border>`
  - 서명 이미지 → 적절한 크기로 `<Spacing>` + `<Border>` 감싸기
  - 완료 뱃지 → `<Badge color="teal">`
  - 하단 버튼 → `<FixedBottomCTA>`
- **검증**: `grep "style={{" src/pages/employer/ContractDetailPage.tsx` 결과 0건

### Task 3.5: `src/components/contract/ContractCard.tsx`
- **현재**: 전체가 `<div style={...}>`, TDS import 없음 (❗)
- **작업**:
  - TDS import 추가: `Paragraph, Spacing, Border, Badge`
  - 카드 → `<Border radius={12}>` + 내부 `<Spacing>`
  - flex 헤더 → `<Spacing>` + `<Paragraph>`
- **검증**: `grep "style={{" src/components/contract/ContractCard.tsx` 결과 0건

### Task 3.6: `src/components/contract/ContractPreview.tsx`
- **현재**: 10건+ 인라인 스타일, Paragraph만 import
- **작업**:
  - TDS import 추가: `Spacing, Border, Top`
  - 헤더 영역 → `<Top>` + `<Paragraph>`
  - 서명 박스 → `<Border>` + 내부 `<Spacing>`
  - `<div style={{ display: 'flex', borderBottom: '...' }}>` → `<ListRow>` 변환
  - 각 항목 `<Paragraph>` 통일
- **검증**: `grep "style={{" src/components/contract/ContractPreview.tsx` 결과 0건

### Task 3.7: `src/components/ContractResult.tsx`
- **현재**: 5건+ 인라인 스타일, TDS import 있음(Button, Paragraph, Spacing)
- **작업**:
  - `<div style={{ textAlign: "center" }}>` → `<Spacing>` 구조
  - 이모지 아이콘 → `<Paragraph>`로 통일
  - 진행상태 `<span style={{ fontSize: 11 }}>` → `<Paragraph typography="st7">`
- **검증**: `grep "style={{" src/components/ContractResult.tsx` 결과 0건

### Task 3.8: `src/components/AuthScreen.tsx`
- **현재**: 5건+ 인라인 스타일, TDS import 있음(Button, Paragraph, Spacing)
- **작업**:
  - `<div style={{ textAlign: "center", paddingTop: 80 }}>` → `<Top>` + `<Paragraph>`
  - 진행 표시기 → TDS 컴포넌트로 구성
- **검증**: `grep "style={{" src/components/AuthScreen.tsx` 결과 0건

### Task 3.9: `src/components/BusinessVerify.tsx`
- **현재**: 8건+ 인라인 스타일, TDS import 있음(TextField, Button, Paragraph, Spacing, List, ListRow)
- **작업**:
  - `<div style={{...}}>` 컨테이너 → `<Top>` + 구조
  - 폼 레이아웃 → 이미 ListRow 사용 중이므로 컨테이너만 교체
- **검증**: `grep "style={{" src/components/BusinessVerify.tsx` 결과 0건

### Task 3.10: `src/components/delivery/SendContractSheet.tsx`
- **현재**: 6건+ 인라인 스타일, Button만 import
- **작업**:
  - TDS import 추가: `Paragraph, Spacing, FlexBox, Top`
  - 시트 핸들(회색 바) → TDS 컴포넌트로 대체 (또는 `<Border>` + `<Spacing>`)
  - flex 버튼 그룹 → `<FlexBox>` + `<Spacing>`
  - `<Button style={{ flex: 1 }}>` → TDS Button의 `fullWidth` prop 사용
- **검증**: `grep "style={{" src/components/delivery/SendContractSheet.tsx` 결과 0건

---

## Phase 4: 최종 검증

### Task 4.1: 전역 inline style 검사
```bash
cd toss-contract-app
grep -rn "style={{" src/ | grep -v pdf.ts | grep -v node_modules
```
**예상 결과: 0건**

### Task 4.2: TDS import 누락 검사
```bash
# 사용된 TDS 컴포넌트 vs import 목록 대조
cd toss-contract-app
grep -rn "<Button\|"<Paragraph\|"<Spacing\|"<Badge\|"<ListRow\|"<List\|"<SegmentedControl\|"<Switch\|"<TextField\|"<FixedBottomCTA\|"<Border\|"<Skeleton\|"<Top\|"<FlexBox" src/ --include="*.tsx" | cut -d: -f1 | sort -u
```
**수동 확인**: 각 파일이 해당 컴포넌트를 import하고 있는지

### Task 4.3: 빌드 검증
```bash
cd toss-contract-app
npx tsc --noEmit 2>&1 | head -30
```
**예상 결과: TDS 관련 type error 없음**

### Task 4.4: dev server + 브라우저 확인
```bash
# npm run dev 후 http://toss-contract-app.private-apps.tossmini.com:5173 열기
```
**예상 결과: 콘솔에 "Element type is invalid" 없음, 모든 페이지 정상 렌더링**

---

## Task 요약

| Phase | Task | 파일 | 난이도 |
|-------|------|------|--------|
| 0 | 0.1 | Git backup | 쉬움 |
| 1 | 1.1 | NotFoundPage.tsx | 쉬움 |
| 1 | 1.2 | DeeplinkHandler.tsx | 쉬움 |
| 1 | 1.3 | worker/ContractListPage.tsx | 쉬움 |
| 2 | 2.1 | RoleSelectPage.tsx | 중간 |
| 2 | 2.2 | employer/ContractListPage.tsx | 중간 |
| 2 | 2.3 | BusinessFormPage.tsx | 중간 |
| 2 | 2.4 | DashboardPage.tsx | 중간 |
| 2 | 2.5 | DeliveryStatus.tsx | 중간 |
| 2 | 2.6 | worker/ContractSignPage.tsx | 중간 |
| 2 | 2.7 | worker/ContractDetailPage.tsx | 중간 |
| 3 | 3.1 | LoginPage.tsx | 어려움 |
| 3 | 3.2 | ContractFormPage.tsx | 어려움 |
| 3 | 3.3 | ContractHistoryPage.tsx | 어려움 |
| 3 | 3.4 | ContractDetailPage.tsx | 어려움 |
| 3 | 3.5 | ContractCard.tsx | 어려움 |
| 3 | 3.6 | ContractPreview.tsx | 어려움 |
| 3 | 3.7 | ContractResult.tsx | 어려움 |
| 3 | 3.8 | AuthScreen.tsx | 어려움 |
| 3 | 3.9 | BusinessVerify.tsx | 어려움 |
| 3 | 3.10 | SendContractSheet.tsx | 어려움 |
| 4 | 4.1-4.4 | 전역 검증 | 쉬움 |

**총 22 tasks, 20개 파일**
