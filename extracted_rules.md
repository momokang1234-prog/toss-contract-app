---

# Toss 전자 근로계약서 앱 — 승인된 디자인 시스템 규칙집

> **출처**: 2026-06-12~13 4개 세션 (`21486c72`·`f55a90fb`·`f3fa25d9`·`0fe8927d`) ↔ 소스코드 전수 크로스체크
> **상태**: 구현 완료 및 승인

---

## 1. 여백 (Spacing)

### 1-1. Spacing 컴포넌트 규칙 (TDS)

| 값 | 용도 | 예시 |
|---|---|---|
| `size={4}` | 제목 행간 분리, 상태 배너 본문 간격, 메타데이터 행 내 분리 | `"계약이 확정되었습니다"` → `<Spacing size={4} />` → `"완료된 계약은 수정할 수 없습니다"` |
| `size={8}` | 서명 타임스탬프, 힌트-버튼 사이, 필드 라벨 간 | 서명 이미지 → `8` → "2026-06-13 서명 완료" |
| `size={12}` | 섹션 제목-본문, 버튼 사이, 에러 상태 간격 | CTA 버튼 → `12` → 보조 버튼 |
| `size={16}` | 컴포넌트 내부 (서명패드, 카드↔리스트, 서명 이미지↔텍스트), Section-Row 패턴의 gap | `flex-direction:column, gap:16` 대신 Spacing(16) 사용 |
| `size={20}` | 섹션 타이틀 위 (ContractPreview, ContractDetail) | Section 앞뒤 |
| `size={24}` | **표준 페이지 수직 리듬** — 제목 아래, 필드 사이, 버튼 위, 섹션 간, 로딩/에러 상태 | `Spacing(24)` → `Paragraph(t3)` → `Spacing(24)` → 콘텐츠 |
| `size={32}` | 대시보드 섹션 간, 폼 단계 전환 (Step4WageInsurance 3회), 버튼-CTA 간, FunnelQuestion 진입 | FunnelQuestion 렌더 직후 `Spacing(32)` |
| `size={36}` | 대시보드 히어로→통계카드 (특수) | DashboardPage에서만 사용 |
| `size={40}` | 페이지 하단 마진, 폼 초기/최종 간격, 상단 여백, 에러 페이지 중앙정렬 | ContractListPage 바닥, BusinessFormPage 상단 |
| `size={48}` | 로그인 페이지 히어로→리스트, 빈 상태, 4대보험 섹션 간 | LoginPage: 히어로→List |
| `size={60}` | 서명 완료 페이지 상단 | ContractSignPage Done step |
| `size={80}` | 404 페이지 중앙 | NotFoundPage |

### 1-2. CSS Module / Inline 여백

| 패턴 | 값 | 파일 |
|---|---|---|
| **페이지 콘텐츠 padding** | `padding: 40px 24px 0` | `ContractFormPage.module.css`, `FunnelQuestion.module.css` |
| **페이지 히어로** | `padding: 32px 24px 0` | `DashboardPage.module.css` |
| **bottom CTA** | `padding: 16px 24px 32px` | `LoginPage.module.css`, `ContractFormPage.module.css` |
| **카드 내부** | `padding: 20px` | `ContractCard.module.css` |
| **통계 카드** | `padding: 16px 12px` | `DashboardPage.module.css` |
| **행 구분선** | `padding: 12px 0` / `padding: 16px 0` | ContractDetailPage Row, ContractFormPage |
| **에러/경고 인라인** | `marginTop: 8` | 모든 유효성 검사 오류 |
| **상태 배너** | `padding: 20, borderRadius: 16, marginBottom: 24` | ContractDetailPage |

### 1-3. 여백 규칙 요약

```
페이지 구조 수직 리듬 (위→아래):
  24px ─ 페이지 헤더 / 첫 섹션 시작
  12px ─ 제목→부제(subtitle/count)
  32px ─ 부제→리스트/콘텐츠
  20px ─ 섹션 타이틀
  16px ─ 섹션 내 Row 반복
  40px ─ 페이지 하단 마진 (또는 48px 빈 상태)

컴포넌트 내부 수직 리듬:
  16px ─ 컴포넌트 헤더→본문
  8px  ─ 타이틀→메타데이터
  4px  ─ 연속된 짧은 텍스트 블록 사이

버튼 그룹:
  12px ─ 주 버튼↔보조 버튼 (중요: 항상 12)
  24px ─ CTA 블록 위/아래
```

---

## 2. 타이포그래피 규칙

### 2-1. 이중 타이포 시스템

| 시스템 | 사용처 | 키 |
|---|---|---|
| **`t` (document/main)** | 일반 페이지, 대시보드, 리스트, 상세, 로그인, 404 | `t1`~`t7` |
| **`st` (survey/funnel)** | ContractFormPage funnel steps, ContractSignPage sign flow | `st2`~`st7` |

### 2-2. `t` 계층 (메인 문서)

| 레벨 | 역할 | fontWeight | color | 사용 위치 |
|---|---|---|---|---|
| `t1` | 이모지/아이콘 전용 (텍스트 없음) | — | — | NotFoundPage(🔍), ContractListPage empty(📬) |
| `t2` | 이모지 전용 (LoginPage) | — | — | LoginPage hero(📄) |
| **`t3`** | **페이지 제목 / 헤드라인** | **bold 항상** | 기본(#333D4B) | 모든 페이지 메인 타이틀, 대시보드 히어로, 시트 제목, 완료 화면 |
| `t4` | 섹션 제목 / 통계 숫자 / 오류 텍스트 | bold | grey-600(오류) | DashboardPage 통계카드, BusinessVerify 섹션, 오류 상태 |
| **`t5`** | **본문 1차**: 부제, 설명, 데이터 값, 리스트 이름, 상태 메시지, 버튼 레이블 대체 | bold (제목 역할일 때만) | grey-600(본문), grey-500(부제), grey-800(강조), blue-500(반려), danger500(에러) | 가장 많이 사용 — 모든 페이지에 존재 |
| `t6` | 본문 2차: 필드 라벨, 힌트, 안내문, 개발모드 공지 | — | grey-500, grey-600, yellow700 | ContractDetailPage 라벨, ContractResult 단계, DashboardPage 힌트 |
| `t7` | 메타데이터/캡션: 타임스탬프, 날짜, 부가정보, 각주 | — | grey-500, grey-600, blue-500 | 모든 리스트의 보조 정보, 서명 시간, 법적 고지 |

### 2-3. `st` 계층 (Funnel/Survey)

| 레벨 | 역할 | fontWeight | 사용 위치 |
|---|---|---|---|
| `st2` | 서명/완료 단계 제목 | bold | ContractSignPage Sign step, Completion step |
| `st3` | 데이터 입력 단계 제목 | bold | ContractSignPage Phone/Address/Account steps |
| `st4` | 로딩 상태 | — | DeeplinkHandler |
| `st5` | 본문/오류/부제 | — | ContractSignPage |
| `st6` | 필드 라벨 / 값 | bold (FieldLabel) | FieldLabel 컴포넌트, Step4WageInsurance, Step6Preview |
| `st7` | 설명/캡션 | — | Step4WageInsurance SwitchRow 설명, Step6Preview 라벨 |

### 2-4. color prop 규칙

| 값 | 용도 |
|---|---|
| **(없음)** | 기본 본문(#333D4B) |
| `grey-500` | 보조 정보, 타임스탬프, 부제 |
| `grey-600` | 일반 본문, 설명 |
| `grey-800` | 강조 텍스트 (배너 내부 본문) |
| `grey800` (하이픈 없음) | Step4WageInsurance 섹션 제목 |
| `blue-500` | 반려(rejected) 상태 메시지 |
| `yellow700` | 개발 모드 경고 |
| `danger500` | 인증 오류 상태 |
| `primary500` | 인증 성공 상태 |

### 2-5. 인라인 폰트 오버라이드 (소수)

| 값 | 파일 | 용도 |
|---|---|---|
| `fontSize: 26px` | FinalChecklistStep | 서명 전 안내 제목 |
| `fontSize: 24px` | funnel-huge-input | Funnel 대형 입력 필드 |
| `fontSize: 15px` | ContractFormPage, FinalChecklistStep | 체크리스트 본문, 필드 라벨 |
| `fontSize: 14px` | ContractFormPage | 휴게시간 법정 안내 |
| `fontSize: 13px` | ContractFormPage, DashboardPage | 경고/에러, 통계 보조 |
| `fontSize: 12px` | ErrorBoundary | 디버그 메시지 |

---

## 3. 계층 (Z-Index / Layer)

### 3-1. 페이지 레이어 모델

```
Layer 3 (최상위): overlay-kit BottomSheet / SendContractSheet  ← 동적 생성
Layer 2:          fixed bottom CTA bar (z-index 암묵적: DOM 순서상 최상단)
Layer 1:          Top header bar (position: sticky-like, TDS 내장)
Layer 0:          스크롤 콘텐츠 영역 (position: static)
```

### 3-2. 실제 구현

- **BottomSheet**: `overlay-kit` 라이브러리에서 z-index 관리 (TDS Dialog 미사용)
- **fixed bottom CTA**: `position: fixed; bottom: 0; max-width: 480px; left: 50%; transform: translateX(-50%)` — CSS module `.bottomCta`
- **Top**: TDS 내장 sticky 동작
- **명시적 z-index 선언 없음** — DOM 순서 + `position: fixed` + overlay-kit에 위임

---

## 4. 디자인 문법 (Design Grammar)

### 4-1. 페이지 템플릿 — 3종

```
[Type A: 리스트 페이지]          [Type B: 상세 페이지]          [Type C: Funnel 페이지]
┌─────────────────────┐          ┌─────────────────────┐          ┌─────────────────────┐
│ Top                  │          │ Top + Badge(상태)   │          │ Top + progress bar  │
├─────────────────────┤          ├─────────────────────┤          ├─────────────────────┤
│ Spacing(24)          │          │ Spacing(24)          │          │ FunnelQuestion      │
│ Paragraph(t3) 제목   │          │ Paragraph(t3) 제목   │          │  auto-scroll        │
│ Spacing(12)          │          │ Spacing(24)          │          │  auto-focus         │
│ Paragraph(t5) 부제   │          │ Section("근로자")    │          │  isActive 애니메이션│
│ Spacing(32)          │          │  Row(label, value)   │          │                     │
│ List                 │          │  Row(label, value)   │          │                     │
│  ListRow + Badge     │          │ Section("임금")      │          │                     │
│ Spacing(40)          │          │  ...                 │          │                     │
└─────────────────────┘          ├─────────────────────┤          ├─────────────────────┤
                                 │ 상태 배너 (조건부)   │          │ fixed bottom CTA    │
                                 │ fixed bottom CTA     │          │  Button("다음")     │
                                 └─────────────────────┘          │  Button("이전으로") │
                                                                  └─────────────────────┘
```

### 4-2. Section / Row 패턴 (상세 페이지)

```tsx
// ContractDetailPage (employer + worker 동일)
Section = ({ title, children }) => (
  <div style={{ paddingTop: 20 }}>
    <Paragraph typography="t5" fontWeight="bold">{title}</Paragraph>
    <Spacing size={16} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {children}
    </div>
  </div>
);

Row = ({ label, value }) => (
  <div style={{ padding: '12px 0', borderBottom: '1px solid #e5e5ec',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <Paragraph typography="t6" color="grey-500">{label}</Paragraph>
    <Paragraph typography="t5" color="grey-800">{value}</Paragraph>
  </div>
);
```

### 4-3. 상태 배너 문법 (4종)

```
완료(completed): bg=#E4F4EC, border=#C3E8D7, 텍스트=🎉 + t5 bold grey-800 → t7 grey-600
취소(cancelled): bg=#FFF0F0, border=#FFD4D4, 텍스트=🚫 + t5 bold grey-800 → t7 grey-600
반려(rejected):  bg=#E8F3FF, border=#D1E4FF, 텍스트=💬 + t5 bold blue-500 → t7 blue-500 (사유)
만료(expired):   bg=#F2F4F6, border=#E5E8EB, 텍스트=⏰ + t5 bold grey-800 → t7 grey-600
```

### 4-4. 리스트 아이템 내부 문법

```
ListRow
  left:  ContractStatusBadge(status)
  contents:
    <Paragraph typography="t5" bold>근로자 이름</Paragraph>
    <Spacing size={4} />
    <Paragraph typography="t7" color="grey-500">사업장 · 날짜</Paragraph>
  right: <Badge>상태</Badge>
```

### 4-5. Funnel 단계 전환 문법

```
useFunnel() → funnel.history.push('stepName') / .back()

각 단계:
  <funnel.Render>
    stepName={() => (
      <FunnelQuestion title={<>질문</>} subtitle="설명" isActive={true}>
        <입력 컴포넌트>
        {errors.field && <div style={{ color: '#FF5252', marginTop: 8 }}>{msg}</div>}
      </FunnelQuestion>
    )}
  </funnel.Render>

  // 하단 CTA
  <BottomCTA>  ← position:fixed
    <Button color="primary" display="block" size="xlarge">다음</Button>
    <Spacing size={12} />
    <Button color="dark" variant="weak" display="block" size="xlarge">이전으로</Button>
  </BottomCTA>
```

---

## 5. 컴포넌트 카탈로그

### 5-1. 커스텀 컴포넌트 (12개)

| 컴포넌트 | Props | 파일 |
|---|---|---|
| **ContentContainer** | `{ children, paddingX? }` | `shared/ContentContainer.tsx` |
| **RoleGuard** | `{ role: 'employer'\|'worker' }` | `auth/RoleGuard.tsx` |
| **AuthScreen** | `{ onAuthComplete }` | `AuthScreen.tsx` |
| **BusinessVerify** | `{ result: BusinessInfo }` | `BusinessVerify.tsx` |
| **ContractCard** | `{ contract }` | `contract/ContractCard.tsx` |
| **ContractPreview** | `{ contract }` | `contract/ContractPreview.tsx` |
| **ContractStatusBadge** | `{ status: string }` | `contract/ContractStatusBadge.tsx` |
| **ContractResult** | 없음 (고정 UI) | `ContractResult.tsx` |
| **SignaturePad** | `{ onSign, onClear?, title? }` | `SignaturePad.tsx` |
| **SendContractSheet** | `openSendContractSheet(contractId,title)` | `delivery/SendContractSheet.tsx` |
| **FunnelQuestion** | `{ title, subtitle?, isActive, onEnter?, children }` | `funnel/FunnelQuestion.tsx` |
| **ErrorBoundary** | `{ children }` | `ErrorBoundary.tsx` |

### 5-2. TDS 컴포넌트 (19개)

| 컴포넌트 | 사용 페이지 |
|---|---|
| **Top** | 모든 페이지 (LoginPage 제외) |
| **Paragraph** | 모든 페이지 |
| **Spacing** | 모든 페이지 |
| **Button** | 모든 페이지 + 모든 funnel step |
| **Badge** | 리스트, 상세 페이지 |
| **List + ListRow** | 리스트, 히스토리, 로그인 |
| **BottomSheet** | ContractSignPage (은행), ContractDetailPage worker (거절), FinalChecklistStep (수정) |
| **TextField** | BusinessForm, ContractSignPage, Step4WageInsurance |
| **SegmentedControl** | ContractFormPage funnel, Step2WorkConditions, Step4WageInsurance |
| **WheelDatePicker** | ContractFormPage (날짜) |
| **GridList** | DashboardPage (통계카드 3열) |
| **Text** | DashboardPage (통계 숫자) |
| **Switch** | Step4WageInsurance (4대보험 토글) |
| **TextButton** | FinalChecklistStep (수정하기) |

### 5-3. 배제된 TDS 컴포넌트

| 컴포넌트 | 배제 사유 |
|---|---|
| **Flex** | `spacing` prop API 불일치 → div + inline style로 대체 |
| **Header** | Top이 더 간단 |
| **Dialog** | overlay-kit BottomSheet가 더 적합 |
| **Card** | custom div로 대체 (ContractCard.module.css) |

---

## 6. 상황별 컴포넌트

### 6-1. 네비게이션 / 레이아웃

| 상황 | 사용 |
|---|---|
| 페이지 진입 | `<Top title="..." />` (항상 최상단) |
| 페이지 컨텐츠 래핑 | `<ContentContainer>` 또는 CSS `.page` 클래스 (max-width:480px) |
| Funnel 단계 진입 | `<FunnelQuestion title={...} isActive={true}>` |
| 딥링크 입구 | `<DeeplinkHandler>` (App.tsx에서 라우팅) |
| 역할 보호 | `<RoleGuard role="employer\|worker">` |
| 오류 경계 | `<ErrorBoundary>` (App.tsx 최상위) |

### 6-2. 폼 / 입력

| 상황 | 사용 |
|---|---|
| 텍스트 입력 | `<TextField variant="line\|box" labelOption="sustain">` |
| 선택 (2~5개) | `<SegmentedControl>` + `<SegmentedControl.Item>` |
| 날짜 선택 | `<WheelDatePicker>` |
| 토글 (on/off) | `<Switch>` |
| 서명 | `<SignaturePad onSign={fn}>` |
| Funnel 대형 입력 | `<input className="funnel-huge-input">` (raw input) |
| 필드 라벨 | `<FieldLabel>` → 내부 `Paragraph(st6, bold, grey-600)` |
| 유효성 오류 | `<div style={{ color: '#FF5252', marginTop: 8 }}>` 인라인 |

### 6-3. 표시 / 정보

| 상황 | 사용 |
|---|---|
| 페이지 제목 | `Paragraph(t3, bold)` |
| 부제 / 설명 | `Paragraph(t5, grey-500\|grey-600)` |
| 데이터 항목 표시 | Section+Row 패턴 (라벨 t6, 값 t5) |
| 계약 상태 표시 | `<ContractStatusBadge status={...}>` 또는 직접 `<Badge>` |
| 계약서 요약 카드 | `<ContractCard contract={...}>` |
| 계약서 전문 미리보기 | `<ContractPreview contract={...}>` |
| 사업장 정보 | `<BusinessVerify result={...}>` |
| 완료/성공 화면 | `<ContractResult>` |
| 통계 숫자 | `<GridList column={3}>` + `<Text(t4, bold)>` |
| 상태 배너 | 배경색+테두리 div (Section 4-3 참조) |
| 이모지 | `Paragraph(t1)` or `Paragraph(t2)` |
| 리스트 | `<List>` → `<ListRow contents={...} right={...}>` |

### 6-4. 액션 / 피드백

| 상황 | 사용 |
|---|---|
| 주 액션 | `<Button color="primary" variant="fill" display="block" size="xlarge">` |
| 보조 액션 | `<Button color="light" variant="weak" size="large">` |
| Funnel 다음 | 주 액션 + `Spacing(12)` + 보조 액션("이전으로") |
| 모달 시트 | `<BottomSheet open header headerDescription cta>` |
| 계약서 전송 | `openSendContractSheet(id, title)` |
| 인라인 수정 | `<TextButton>` |
| 로딩 | `<Spacing(24)>` + `Paragraph(t5, grey-500) "불러오는 중..."` |
| 빈 상태 | 이모지 + `Spacing(16)` + `Paragraph(t5, bold, grey-600)` |
| 오류 상태 | `Spacing(40)` + `Paragraph(t4, grey-600)` + `Spacing(16)` + Button |

### 6-5. 인증

| 상황 | 사용 |
|---|---|
| 로그인 화면 | `<LoginPage>`: Paragraph(t2) 이모지 → t3 히어로 → List 장점 → Button |
| 본인인증 | `<AuthScreen onAuthComplete={fn}>` |
| 개발 모드 | `Paragraph(t6, yellow700) "개발 모드"` |
| 오류 | `Paragraph(t5, danger500) 오류메시지` |
| 성공 | `Paragraph(t5, primary500) 성공메시지` |

---

이 규칙집은 6월 12~13일 세션에서 검토·승인·구현 완료된 모든 디자인 패턴을 포괄합니다. 파일로 저장할까요?