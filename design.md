# Toss Contract App - Design & UX Guidelines

본 문서는 **전자 근로계약서 미니앱** 구축에 사용된 디자인 시스템, UX 철학, 그리고 카피라이팅(Tone & Manner) 규칙을 정의합니다.

## 1. Core Philosophy (핵심 철학)
* **어려운 법률 용어를 친숙하게:** 근로계약, 4대보험, 주휴수당 등 어렵고 딱딱한 개념을 사용자가 직관적으로 이해하고 쉽게 넘길 수 있도록 돕습니다.
* **Smart Defaults (스마트 디폴트):** 사용자가 직접 계산하거나 고민해야 할 요소(최저임금, 보험 가입 여부 등)를 입력된 근무 조건에 맞춰 앱이 선제적으로 계산하고 기본값으로 세팅해줍니다.
* **Toss T&M (토스 톤앤매너):** 모든 과정은 "내가 존중받고 있으며, 안전하고 쉽게 가이드받고 있다"는 느낌을 줍니다.

---

## 2. Copywriting & Tone & Manner
* **어미 사용:** 친절하고 부드러운 해요체(`~해요`, `~했어요`, `~해보세요`)를 기본으로 사용합니다.
* **명확성과 간결성:** 문장은 짧게, 행동을 유도하는 단어는 직관적으로 작성합니다.
* **법적 용어의 순화:** 
  * *예시 (Before):* "관련 법령 조항에 의거하여 확인 요망"
  * *예시 (After):* "서명 전, 이런 부분들을 챙겨보세요" / "체크해보면 좋은 기준들을 정리했어요"
* **부정적 상황 안내:** 에러나 경고는 질책하는 톤이 아닌, 해결 방법을 제시하는 톤으로 작성합니다.

---

## 3. UI/UX Design System (TDS Mobile)
이 프로젝트는 토스 디자인 시스템인 `@toss/tds-mobile` 패키지를 적극적으로 활용하여 일관된 룩앤필을 유지합니다.

### 3.1 주요 컴포넌트 활용 규칙
* **`ListRow`:** 리스트 형태의 선택지나 정보를 나열할 때 사용합니다. (예: 보험 선택, 계약 조건 요약)
* **`BottomSheet`:** 페이지 이동 없이 빠르게 수정하거나 추가 정보를 입력받을 때 사용합니다. (예: 휴게시간 수정, 급여 입력)
* **`Button` (CTA):** 화면 최하단에 고정된(Fixed) CTA 버튼을 배치하여 다음 단계로의 명확한 진입을 유도합니다.
* **`TextButton`:** 서브 액션(수정하기, 자세히 보기 등)은 시선을 빼앗지 않는 텍스트 형태의 버튼을 활용합니다. (`size="small"`, 토스 블루 색상)
* **`Spacing`:** 컴포넌트 간의 여백은 임의의 `margin` 대신 `Spacing` 컴포넌트로 명확하게 구분합니다.

### 3.2 Color Palette (토스 컬러 기반)
* **Primary (강조/액션):** Toss Blue `#3182F6` (버튼, 링크, 활성화 상태)
* **Text Title (제목):** Grey 800 `#333D4B`
* **Text Body (본문):** Grey 700 `#4E5968`
* **Text Description (설명/보조):** Grey 500 `#8B95A1` 또는 Grey 600 `#505967`
* **Background (배경):** White `#FFFFFF` 또는 영역 구분을 위한 옅은 회색 `#F2F4F6`

### 3.3 Typography
* 제목은 눈에 띄게 (약 `24px`~`26px`), 폰트 두께는 `bold`를 사용하여 화면의 핵심 목표를 즉각적으로 인지시킵니다.
* 설명글은 작고(`14px`~`15px`) 부드러운 색상으로 배치하여 정보의 위계를 명확히 나눕니다.

---

## 4. UX Patterns & Flow (조건부 컴포넌트 및 여백 배치 논리)
디자인 시스템에서 모든 배치는 사용자의 맥락(Context)과 데이터 성격에 따른 명확한 조건(Condition) 하에 이루어집니다.

* **CTA(Call To Action) 버튼 배치 조건:**
  * **하단 고정 버튼(Fixed Button):** 퍼널의 모든 필수 입력을 마치고 '다음 단계로 명확하게 넘어가야 하는 주 흐름'일 때 적용하여 스크롤 시 버튼을 찾는 수고를 없앱니다.
  * **인라인 텍스트 버튼(TextButton):** 메인 흐름의 시선을 빼앗지 않으면서 특정 항목 하나만 '부분적으로 조작(수정)'해야 할 때 정보의 우측에 배치합니다.
* **리스트 구조(ListRow) 배치 조건:**
  * **ListRow 적용:** 대상의 이름(Label)과 상태/조작(Action)이 1:1 매칭되어 좌측에서 읽고 우측에서 제어해야 할 때 인지 부하를 낮추기 위해 사용합니다.
  * **일반 텍스트/카드 적용:** 사용자 조작(Control)이 불필요한 단순 법적 안내문이나 가이드 문구일 때 사용합니다.
* **여백(Spacing) 적용 조건:**
  * **넓은 여백 (40px 이상):** 새로운 태스크나 주제가 시작되는 영역(최상단 타이틀 위)에 두어 시각적인 환기를 유도합니다.
  * **좁은 여백 (12px 이하):** 타이틀과 서브타이틀 등 논리적으로 묶여서 한 번에 읽혀야 하는 정보 군집 내부에 적용합니다.
* **강제성(Disabled) 및 뱃지 표시 조건:**
  * 근로 조건에 의해 법적 선택 권한이 박탈된 항목(예: 산재보험 의무가입)은 단순 미입력 상태와 구분하기 위해 회색 톤 처리(Disabled)와 함께 반드시 '필수/의무' 뱃지를 동반하여 배치합니다.

---

## 5. UI Components List (TDS 기반 컴포넌트 목록)
앱 내에서 주로 사용되는 UI 컴포넌트와 그 용도는 다음과 같습니다.
* **`Button`**: 최하단 고정 CTA 버튼 (다음 단계 이동, 완료 등)
* **`TextButton`**: 시선을 분산시키지 않는 서브 액션 버튼 (작은 사이즈의 '수정하기' 등)
* **`BottomSheet`**: 화면 하단에서 올라오는 오버레이 패널. 퍼널 이탈 없이 값을 수정할 때 사용.
* **`ListRow`**: 좌측에 텍스트(Title/Subtitle), 우측에 컨트롤(Toggle, Badge, Button 등)을 배치하는 기본 리스트 아이템.
* **`TextField`**: 사용자로부터 텍스트나 숫자(급여, 시간 등)를 입력받는 폼 요소.
* **`Badge`**: '의무', '선택' 등 상태나 속성을 작게 강조하는 태그.
* **`Top`**: 화면 상단의 내비게이션 바 (뒤로가기, 타이틀 노출).
* **`Spacing`**: 요소 간의 수직 여백을 일관되게 제어하는 레이아웃 컴포넌트.
* **`Paragraph`**: 텍스트 단락을 일관된 타이포그래피(크기, 색상)로 렌더링.

---

## 6. AI & User Collaboration Workflow (디자인 반영 프로세스)
새로운 UI/UX 피처를 개발할 때, 사장님(User)과 AI 에이전트 간의 **"HTML 프로토타이핑 기반 점진적 개발 플로우"**를 따릅니다.

1. **옵션 제안 (HTML Mockups)**: 
   * AI가 요구사항을 분석하여 서로 다른 3가지 디자인 옵션(A, B, C안)을 구성합니다.
   * 실제 React 코드를 건드리기 전에, 단일 `.html` 아티팩트로 만들어 시각적 예시를 제공합니다.
2. **리뷰 및 선택 (User Selection)**: 
   * 사장님이 3가지 예시를 브라우저에서 직접 눈으로 확인한 뒤, 가장 적합한 옵션을 하나 선택합니다. (필요 시 세부 텍스트/정책 수정 요청 포함)
3. **코드 반영 (Implementation)**: 
   * 선택된 옵션의 UI 구조를 바탕으로 AI가 실제 프로젝트의 `React(TSX)` 코드에 컴포넌트와 상태(State) 로직을 연결하여 최종 반영합니다.


---
## 7. 상세 스펙 및 컴포넌트 카탈로그 (Data-Driven Rules)

> **출처**: 2026-06-12~13 4개 세션 (`21486c72`·`f55a90fb`·`f3fa25d9`·`0fe8927d`) 및 소스코드 전수 분석 (omp 에이전트 추출)
> 본 섹션은 코드베이스에서 실제 사용된 모든 속성값과 패턴을 스캐닝하여 카탈로그화한 자료입니다.

---

### 7.2. 여백 (Spacing)

#### 7.2.1. Spacing 컴포넌트 규칙 (TDS)

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

#### 7.2.2. CSS Module / Inline 여백

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

#### 7.2.3. 여백 규칙 요약

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

### 7.3. 타이포그래피 규칙

#### 7.3.1. 이중 타이포 시스템

| 시스템 | 사용처 | 키 |
|---|---|---|
| **`t` (document/main)** | 일반 페이지, 대시보드, 리스트, 상세, 로그인, 404 | `t1`~`t7` |
| **`st` (survey/funnel)** | ContractFormPage funnel steps, ContractSignPage sign flow | `st2`~`st7` |

#### 7.3.2. `t` 계층 (메인 문서)

| 레벨 | 역할 | fontWeight | color | 사용 위치 |
|---|---|---|---|---|
| `t1` | 아이콘 텍스트 전용 (단순 플레이스홀더) | — | — | NotFoundPage(🔍) |
| `t2` | 단순 이모지 타이포 | — | — | 서브 텍스트 보조용 |
| **`3D PNG`** | **히어로 비주얼 및 빈 상태 전용** (규칙 업데이트: 2D 이모지 대신 3D PNG 최우선) | — | — | LoginPage hero, ContractListPage empty state 등 메인 비주얼 |
| **`t3`** | **페이지 제목 / 헤드라인** | **bold 항상** | 기본(#333D4B) | 모든 페이지 메인 타이틀, 대시보드 히어로, 시트 제목, 완료 화면 |
| `t4` | 섹션 제목 / 통계 숫자 / 오류 텍스트 | bold | grey-600(오류) | DashboardPage 통계카드, BusinessVerify 섹션, 오류 상태 |
| **`t5`** | **본문 1차**: 부제, 설명, 데이터 값, 리스트 이름, 상태 메시지, 버튼 레이블 대체 | bold (제목 역할일 때만) | grey-600(본문), grey-500(부제), grey-800(강조), blue-500(반려), danger500(에러) | 가장 많이 사용 — 모든 페이지에 존재 |
| `t6` | 본문 2차: 필드 라벨, 힌트, 안내문, 개발모드 공지 | — | grey-500, grey-600, yellow700 | ContractDetailPage 라벨, ContractResult 단계, DashboardPage 힌트 |
| `t7` | 메타데이터/캡션: 타임스탬프, 날짜, 부가정보, 각주 | — | grey-500, grey-600, blue-500 | 모든 리스트의 보조 정보, 서명 시간, 법적 고지 |

#### 7.3.3. `st` 계층 (Funnel/Survey)

| 레벨 | 역할 | fontWeight | 사용 위치 |
|---|---|---|---|
| `st2` | 서명/완료 단계 제목 | bold | ContractSignPage Sign step, Completion step |
| `st3` | 데이터 입력 단계 제목 | bold | ContractSignPage Phone/Address/Account steps |
| `st4` | 로딩 상태 | — | DeeplinkHandler |
| `st5` | 본문/오류/부제 | — | ContractSignPage |
| `st6` | 필드 라벨 / 값 | bold (FieldLabel) | FieldLabel 컴포넌트, Step4WageInsurance, Step6Preview |
| `st7` | 설명/캡션 | — | Step4WageInsurance SwitchRow 설명, Step6Preview 라벨 |

#### 7.3.4. color prop 규칙

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

#### 7.3.5. 인라인 폰트 오버라이드 (소수)

| 값 | 파일 | 용도 |
|---|---|---|
| `fontSize: 26px` | FinalChecklistStep | 서명 전 안내 제목 |
| `fontSize: 24px` | funnel-huge-input | Funnel 대형 입력 필드 |
| `fontSize: 15px` | ContractFormPage, FinalChecklistStep | 체크리스트 본문, 필드 라벨 |
| `fontSize: 14px` | ContractFormPage | 휴게시간 법정 안내 |
| `fontSize: 13px` | ContractFormPage, DashboardPage | 경고/에러, 통계 보조 |
| `fontSize: 12px` | ErrorBoundary | 디버그 메시지 |

---

### 7.4. 계층 (Z-Index / Layer)

#### 7.4.1. 페이지 레이어 모델

```
Layer 3 (최상위): overlay-kit BottomSheet / SendContractSheet  ← 동적 생성
Layer 2:          fixed bottom CTA bar (z-index 암묵적: DOM 순서상 최상단)
Layer 1:          Top header bar (position: sticky-like, TDS 내장)
Layer 0:          스크롤 콘텐츠 영역 (position: static)
```

#### 7.4.2. 실제 구현

- **BottomSheet**: `overlay-kit` 라이브러리에서 z-index 관리 (TDS Dialog 미사용)
- **fixed bottom CTA**: `position: fixed; bottom: 0; max-width: 480px; left: 50%; transform: translateX(-50%)` — CSS module `.bottomCta`
- **Top**: TDS 내장 sticky 동작
- **명시적 z-index 선언 없음** — DOM 순서 + `position: fixed` + overlay-kit에 위임

---

### 7.5. 디자인 문법 (Design Grammar)

#### 7.5.1. 페이지 템플릿 — 3종

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

#### 7.5.2. Section / Row 패턴 (상세 페이지)

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

#### 7.5.3. 상태 배너 문법 (4종)

```
완료(completed): bg=#E4F4EC, border=#C3E8D7, 텍스트=🎉 + t5 bold grey-800 → t7 grey-600
취소(cancelled): bg=#FFF0F0, border=#FFD4D4, 텍스트=🚫 + t5 bold grey-800 → t7 grey-600
반려(rejected):  bg=#E8F3FF, border=#D1E4FF, 텍스트=💬 + t5 bold blue-500 → t7 blue-500 (사유)
만료(expired):   bg=#F2F4F6, border=#E5E8EB, 텍스트=⏰ + t5 bold grey-800 → t7 grey-600
```

#### 7.5.4. 리스트 아이템 내부 문법

```
ListRow
  left:  ContractStatusBadge(status)
  contents:
    <Paragraph typography="t5" bold>근로자 이름</Paragraph>
    <Spacing size={4} />
    <Paragraph typography="t7" color="grey-500">사업장 · 날짜</Paragraph>
  right: <Badge>상태</Badge>
```

#### 7.5.5. Funnel 단계 전환 문법

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

### 7.6. 컴포넌트 카탈로그

#### 7.6.1. 커스텀 컴포넌트 (12개)

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

#### 7.6.2. TDS 컴포넌트 (19개)

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

#### 7.6.3. 배제된 TDS 컴포넌트

| 컴포넌트 | 배제 사유 |
|---|---|
| **Flex** | `spacing` prop API 불일치 → div + inline style로 대체 |
| **Header** | Top이 더 간단 |
| **Dialog** | overlay-kit BottomSheet가 더 적합 |
| **Card** | custom div로 대체 (ContractCard.module.css) |

---

### 7.7. 상황별 컴포넌트

#### 7.7.1. 네비게이션 / 레이아웃

| 상황 | 사용 |
|---|---|
| 페이지 진입 | `<Top title="..." />` (항상 최상단) |
| 페이지 컨텐츠 래핑 | `<ContentContainer>` 또는 CSS `.page` 클래스 (max-width:480px) |
| Funnel 단계 진입 | `<FunnelQuestion title={...} isActive={true}>` |
| 딥링크 입구 | `<DeeplinkHandler>` (App.tsx에서 라우팅) |
| 역할 보호 | `<RoleGuard role="employer\|worker">` |
| 오류 경계 | `<ErrorBoundary>` (App.tsx 최상위) |

#### 7.7.2. 폼 / 입력

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

#### 7.7.3. 표시 / 정보

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
| 메인 비주얼 (Hero/Empty) | `<img src="/assets/marquee/*.png">` 등 **3D 일러스트 PNG 최우선 적용** |
| 단순 보조 이모지 | `Paragraph(t1)` or `Paragraph(t2)` |
| 리스트 | `<List>` → `<ListRow contents={...} right={...}>` |

#### 7.7.4. 액션 / 피드백

| 상황 | 사용 |
|---|---|
| 주 액션 | `<Button color="primary" variant="fill" display="block" size="xlarge">` |
| 보조 액션 | `<Button color="light" variant="weak" size="large">` |
| Funnel 다음 | 주 액션 + `Spacing(12)` + 보조 액션("이전으로") |
| 모달 시트 | `<BottomSheet open header headerDescription cta>` |
| 계약서 전송 | `openSendContractSheet(id, title)` |
| 인라인 수정 | `<TextButton>` |
| 로딩 | `<Spacing(24)>` + `Paragraph(t5, grey-500) "불러오는 중..."` |
| 빈 상태 | **3D PNG 이미지** + `Spacing(16)` + `Paragraph(t5, bold, grey-600)` |
| 오류 상태 | `Spacing(40)` + `Paragraph(t4, grey-600)` + `Spacing(16)` + Button |

#### 7.7.5. 인증

| 상황 | 사용 |
|---|---|
| 로그인 화면 | `<LoginPage>`: **3D PNG 히어로 비주얼** → t3 히어로 → List 장점 → Button |
| 본인인증 | `<AuthScreen onAuthComplete={fn}>` |
| 개발 모드 | `Paragraph(t6, yellow700) "개발 모드"` |
| 오류 | `Paragraph(t5, danger500) 오류메시지` |
| 성공 | `Paragraph(t5, primary500) 성공메시지` |

---
