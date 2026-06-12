# 🎯 Toss 전자 근로계약서 앱 — Subagent-Driven 바이브 코딩 계획서 (for DeepSeek V4 Pro)

> **프로젝트 루트**: `/Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app`

이 문서는 사용자의 **Global AI Engineering Principles**를 엄격히 반영하여, **Tier 2 Worker (DeepSeek V4 Pro)**가 **Subagent-Driven** 방식으로 코딩 작업을 수행하기 위해 설계된 작업 명세서입니다. 
모든 파일 참조는 투명성 및 무결성 원칙에 따라 Command+Click으로 즉시 확인할 수 있도록 **절대 경로 링크**로 제공됩니다.

## 🤖 Tier 2 Worker 행동 수칙
1. **Subagent-Driven (Option 1)**: 하나의 Task는 하나의 독립된 Subagent 세션에서 수행하십시오.
2. **Two-Stage Review**: 코드 수정 완료 후 스스로 무결성 검증을 거치고, 사용자(Tier 1)의 확인 및 피드백을 받은 후 다음 Task로 넘어가십시오.
3. **투명한 파일 수정**: 모든 수정 사항은 절대 경로를 제시하여 보고하십시오.
4. **Zod Schema SSOT**: [src/domain/contract/schema.ts](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/domain/contract/schema.ts)의 enum을 기준으로 Mock과 로직을 맞추십시오.
5. **사내 에이전트 룰 반영**: 구현 후 [.omp/agents/](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/.omp/agents/) 에 정의된 OMP 서브에이전트 3종(ux-auditor, robustness-auditor, functional-qa)을 `task` 도구로 호출하여 QA/UX 가이드를 스스로 점검하십시오.

---
> 기준: `code_review_report.md` (2026-06-12 심층 분석 반영, 카테고리 1~10 전수 반영)  
> 목표: Phase 0 ~ Phase 5.5 전체 로드맵을 **실행 가능한 Task 단위**로 분해

---

## 📌 사전 컨텍스트

이 프로젝트는 **Toss Design System (TDS)** 기반 React + TypeScript 앱입니다.

### 기술 스택
- **프레임워크**: React 18 + TypeScript + Vite
- **디자인 시스템**: `@simsimhae/granite` (Toss Design System 래퍼)
- **상태 관리**: React Context (`AuthContext`) + Custom Hooks (`useContracts`, `useBusiness`)
- **백엔드**: Supabase (현재 Mock 모드) + Edge Functions (Deno)
- **도메인 계층**: [src/domain/contract/](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/domain/contract/) — Zod 스키마 + 순수 검증 함수
- **패키지 매니저**: npm
- **오버레이**: `overlay-kit` (Promise 기반 바텀시트)
- **한글 처리**: `es-hangul` (조사 자동화)
- **로딩 UX**: `@suspensive/react` (Delay + Skeleton)
- **위자드 (예정)**: `@use-funnel/browser` (설치 완료, 리팩토링 미적용)

### 프로젝트 구조
```
toss-contract-app/
├── [src/](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/)
│   ├── api/              # [supabase.ts](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/supabase.ts), toss-auth.ts, smart-messenger.ts
│   ├── components/       # ContractResult, ErrorBoundary, delivery/SendContractSheet
│   ├── contexts/         # AuthContext (인증 상태 관리)
│   ├── domain/contract/  # schema.ts, validation.ts, laborRules.ts, index.ts
│   ├── hooks/            # useContracts.ts, useBusiness.ts (Mock/Real 듀얼)
│   ├── pages/
│   │   ├── auth/         # LoginPage
│   │   ├── employer/     # Dashboard, ContractForm/List/Detail/History, BusinessForm
│   │   ├── worker/       # ContractList/Detail/Sign
│   │   └── shared/       # 공용 페이지
│   ├── types/            # 타입 정의
│   └── utils/            # pdf.ts, format 유틸
├── [supabase/](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/supabase/)
│   ├── functions/        # contracts-send / contracts-sign / contracts-view
│   └── migrations/       # 001_schema.sql, 002_rls_policies.sql
├── [server/](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/server/)               # ❌ 결제 서버 (근로계약서와 무관 — 절대 수정 금지)
└── package.json
```

### 핵심 파일 위치 (수정 빈도 높음)
| 파일 | 경로 | 역할 |
|------|------|------|
| 계약서 작성 위저드 | [src/pages/employer/ContractFormPage.tsx](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/pages/employer/ContractFormPage.tsx) | 613줄 모놀리스, 7단계 폼 |
| 계약서 상세 (사장님) | [src/pages/employer/ContractDetailPage.tsx](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/pages/employer/ContractDetailPage.tsx) | 전송/확정/PDF 다운로드 |
| 계약서 서명 (근로자) | [src/pages/worker/ContractSignPage.tsx](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/pages/worker/ContractSignPage.tsx) | Canvas 전자서명 |
| 계약서 CRUD Hook | [src/hooks/useContracts.ts](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/hooks/useContracts.ts) | Mock/Real 분기, 상태 전이, Mock 데이터 5건 |
| Zod 스키마 | [src/domain/contract/schema.ts](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/domain/contract/schema.ts) | LaborContract 스키마 (SSOT) |
| 검증 엔진 | [src/domain/contract/validation.ts](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/domain/contract/validation.ts) | 7종 법정 검증 규칙 |
| 법정 규칙 상수 | [src/domain/contract/laborRules.ts](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/domain/contract/laborRules.ts) | 최저임금, 휴게시간 등 |
| Supabase 클라이언트 | [src/api/supabase.ts](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/api/supabase.ts) | IS_MOCK 플래그, Mock Store |
| PDF 생성 | [src/utils/pdf.ts](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/utils/pdf.ts) | A4 규격 HTML→PDF 변환 |
| 앱 라우터 | [src/App.tsx](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/App.tsx) | React Router, Suspense 설정 |
| 엔트리포인트 | [src/main.tsx](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/main.tsx) | OverlayProvider 래핑 |
| 토스 인증 | [src/api/toss-auth.ts](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/api/toss-auth.ts) | API_BASE 하드코딩, 토스 OAuth |
| 스마트 메신저 | [src/api/smart-messenger.ts](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/api/smart-messenger.ts) | shareContract placeholder URL |
| 인증 컨텍스트 | [src/contexts/AuthContext.tsx](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/contexts/AuthContext.tsx) | Mock 프로필, sessionStorage 복구 |

### 이미 해결된 항목 (작업 불필요)
아래는 code_review_report.md 카테고리 7에서 **이미 수정 완료**된 항목이므로 plan에서 제외합니다:

| 기존 항목 | 상태 |
|------|------|
| 6-3: OverlayProvider 누락 | ✅ main.tsx에 래핑 완료 |
| 6-1: 로딩 상태 부족 | ✅ @suspensive/react 스켈레톤 추가 |
| 2-1: Step 5 건너뛰기 가능 | ✅ validateStep(5) false 시 Step 7 진입 불가 |
| 4-1: 죽은 코드 | ✅ types.ts, useDelivery.ts, DeliveryStatus.tsx, template.ts 삭제 |
| 품질: 빈 useEffect (ContractSignPage L22) | ✅ 삭제 |
| 품질: 미사용 import 3건 | ✅ 정리 |
| 품질: smart-messenger.ts 누락 catch | ✅ 추가 |
| QA: 시작 > 종료 시간 허용 | ✅ 수정 |
| QA: 산재보험 OFF 통과 | ✅ 수정 |
| QA: case 4 break 누락 | ✅ 수정 |

---

## 🏗️ Phase 0: 빌드 안정화 (예상 1~2시간)

### Task 1: TypeScript 컴파일 오류 수정 (5건) 🔴

> 리뷰 출처: 카테고리 1-4, 카테고리 8  
> 빌드가 깨지면 아무것도 못 하므로 최우선

#### 1-1. `ContractResult.tsx` — `spacing` prop 제거

**파일**: [src/components/ContractResult.tsx](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/components/ContractResult.tsx)  
**오류**: TDS `Flex` 컴포넌트에 `spacing` prop이 존재하지 않음  
**수정**: `spacing` prop을 제거하고, 자식 요소에 `gap` CSS를 적용

```
변경 전: <Flex spacing={...}>
변경 후: <Flex style={{ gap: '적절한 값' }}>  또는 spacing prop 단순 제거
```

#### 1-2. `BusinessFormPage.tsx` — `Top` 컴포넌트 `onBack` prop (2곳)

**파일**: [src/pages/employer/BusinessFormPage.tsx](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/pages/employer/BusinessFormPage.tsx)  
**오류**: TDS `Top` 컴포넌트에는 `onBack` prop이 없음  
**수정 방법**:
1. `Top` 컴포넌트의 실제 API를 `node_modules/@simsimhae/granite`의 타입 정의에서 확인
2. `onBack` 대신 TDS가 제공하는 뒤로가기 방식 사용 (예: `Top.Left`에 버튼 배치, 또는 `granite.config.ts`의 `withBackButton` 활용)
3. 만약 TDS에서 뒤로가기를 자체 제공하면 `onBack` prop을 단순 제거

#### 1-3. `ContractListPage.tsx` (Employer) — `Badge` color 타입

**파일**: [src/pages/employer/ContractListPage.tsx](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/pages/employer/ContractListPage.tsx)  
**오류**: `Badge` 컴포넌트의 `color` prop에 전달하는 값이 허용 타입과 불일치  
**수정**: `Badge`가 허용하는 color union 타입을 확인하고, 상태별 color 매핑을 수정

```typescript
// Badge가 허용하는 color 타입에 맞게 매핑
// 변경 전: color={statusColorMap[contract.status]}  // 'red' | 'blue' 등 임의 값
// 변경 후: color={statusColorMap[contract.status] as BadgeColor}  // 또는 허용값으로 변경
```

#### 1-4. `ContractListPage.tsx` (Worker) — 동일 `Badge` color 타입

**파일**: [src/pages/worker/ContractListPage.tsx](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/pages/worker/ContractListPage.tsx)  
**수정**: 1-3과 동일한 방식

#### 검증 방법
```bash
npx tsc --noEmit
# 0 errors 확인
```

---

### Task 2: PDF 다운로드 버튼 연결 🟢

> 리뷰 출처: 카테고리 1-5

**파일**: [src/pages/employer/ContractDetailPage.tsx](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/pages/employer/ContractDetailPage.tsx) (L191 부근)  
**현상**: `completed` 상태에서 PDF 다운로드 버튼이 `alert('추후 제공')`  
**해결**: 이미 구현된 [src/utils/pdf.ts](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/utils/pdf.ts)의 `downloadContractPDF()` 함수를 import하여 연결

```typescript
// 1. import 추가
import { downloadContractPDF } from '../../utils/pdf';

// 2. alert 제거 → 실제 함수 호출
// 변경 전: onClick={() => alert('추후 제공')}
// 변경 후: onClick={() => downloadContractPDF(contract)}
```

**주의**: `downloadContractPDF()`의 파라미터 타입이 현재 페이지의 `contract` 객체와 호환되는지 확인. `Contract` (hook, snake_case) vs `LaborContract` (Zod, camelCase) 차이가 있을 수 있음. 필요 시 변환 함수 추가.

---

### Task 3: Suspense fallback 스켈레톤 UI 🟢

> 리뷰 출처: 카테고리 6-2

**파일**: [src/App.tsx](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/App.tsx) (L23 부근)  
**현상**: `Suspense fallback={null}` → 페이지 전환 시 빈 화면 깜빡임

```typescript
// 변경 전
<Suspense fallback={null}>

// 변경 후
<Suspense fallback={
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'var(--toss-bg, #fff)',
  }}>
    {/* TDS Spinner가 있다면 사용, 없다면 간단한 로딩 UI */}
    <div className="loading-spinner">로딩 중...</div>
  </div>
}>
```

---

### Task 4: API_BASE 환경변수 분리 🔵

> 리뷰 출처: 카테고리 5-5

**파일**: [src/api/toss-auth.ts](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/api/toss-auth.ts) (L3)

```typescript
// 변경 전
const API_BASE = 'https://bossimclockedin-api.fly.dev';

// 변경 후
const API_BASE = import.meta.env.VITE_API_BASE || 'https://bossimclockedin-api.fly.dev';
```

`.env.example`에도 추가:
```
VITE_API_BASE=https://bossimclockedin-api.fly.dev
```

---

### Task 5: `businesses[0]` null 가드 추가 🟡

> 리뷰 출처: 카테고리 9-10

**파일**: [src/pages/employer/ContractFormPage.tsx](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/pages/employer/ContractFormPage.tsx) (L181 부근)

```typescript
// 변경 전
const business = businesses[0];
const laborContract = {
  employer: { businessNumber: business.business_number, ... }

// 변경 후
if (!businesses || businesses.length === 0) {
  // 사업장 미등록 시 등록 페이지로 리다이렉트
  alert('사업장 정보를 먼저 등록해주세요.');
  navigate('/employer/business/new');
  return;
}
const business = businesses[0];
```

---

## ⚖️ Phase 1: 법적 안전장치 강화 (예상 3~5일)

### Task 6: 최저임금 검증 — 모든 임금유형 확장 🟡

> 리뷰 출처: 카테고리 2-2

**파일**: [src/domain/contract/validation.ts](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/domain/contract/validation.ts) (L117 부근)  
**현상**: `wageType === 'hourly'`일 때만 최저임금 검증  
**법적 리스크**: 월급 200만원(시급 환산 시 최저임금 미달) 계약서가 무검증 통과

**수정 로직**:
```typescript
// laborRules.ts 에서 최저임금 상수 가져옴 (이미 있음)
// 시급 환산 공식:
// - hourly: wage >= MINIMUM_WAGE
// - daily: wage / dailyWorkHours >= MINIMUM_WAGE
// - weekly: wage / (dailyWorkHours * weeklyWorkDays) >= MINIMUM_WAGE
// - monthly: wage / (monthlyStandardHours) >= MINIMUM_WAGE
//   (월 소정근로시간 = 주 소정근로시간 × 4.345)

// 수정 위치: validateMinimumWage() 함수 또는 관련 검증 블록
// wageType별 시급 환산 후 최저임금 비교
```

**참고 상수**: [src/domain/contract/laborRules.ts](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/domain/contract/laborRules.ts)에 `MINIMUM_HOURLY_WAGE` 등이 이미 정의. 환산 공식만 추가.

---

### Task 7: 4대보험 개별 항목 → Schema 매핑 수정 🟡

> 리뷰 출처: 카테고리 2-4

**파일들**:
- [src/pages/employer/ContractFormPage.tsx](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/pages/employer/ContractFormPage.tsx) — 폼 상태 (4개 토글)
- [src/domain/contract/schema.ts](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/domain/contract/schema.ts) — `socialInsuranceClause` boolean
- [src/hooks/useContracts.ts](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/hooks/useContracts.ts) — 폼→DB 변환 로직
- [src/utils/pdf.ts](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/utils/pdf.ts) — PDF 내 보험 표시

**현상**: 4개 보험 토글 중 하나라도 `true`면 `socialInsuranceClause: true`  
**문제**: 산재보험만 가입해도 "4대보험 적용"으로 표시

**수정 방안** (2가지 중 선택):

#### 방안 A: Schema 확장 (권장)
```typescript
// schema.ts — socialInsuranceClause를 객체로 변경
socialInsurance: z.object({
  pension: z.boolean(),             // 국민연금
  healthInsurance: z.boolean(),     // 건강보험
  employmentInsurance: z.boolean(), // 고용보험
  accidentInsurance: z.boolean(),   // 산재보험
}),
```
→ DB 마이그레이션도 필요하므로 Phase 2까지 영향

#### 방안 B: 표시 텍스트만 수정 (빠른 수정)
```typescript
// PDF 생성 시 개별 항목을 나열
// 변경 전: "4대보험 적용: O"
// 변경 후: "국민연금: O, 건강보험: X, 고용보험: O, 산재보험: O"
```

**결정 필요**: 방안 A vs B.

---

### Task 8: `employer_signed_at` 타임스탬프 기록 🟡

> 리뷰 출처: 카테고리 9-8

**현상**: DB 스키마에 `employer_signed_at` 컬럼 존재, 그러나 프론트엔드 어디에서도 값을 저장하지 않음  
**법적 영향**: 사업주 전자서명 시점이 기록되지 않아 법적 효력 약화

**수정 위치**: 사장님 "확정" 액션 실행 시
- Mock 모드: `useContracts.ts`의 `completeContract()` 함수에서 `employer_signed_at: new Date().toISOString()` 추가
- Real 모드: Task 12의 `contracts-complete` Edge Function에서 서버 측 `NOW()` 기록

---

## 🔧 Phase 0.5: Mock→Real 전환 준비 (예상 3~4시간)

### Task 9: Mock 데이터 Schema enum 값 전면 수정 🔴🔴

> 리뷰 출처: 카테고리 9-2  
> ⚠️ Real 모드 전환 시 5/5 필드가 Zod 파싱에서 실패 → 즉시 크래시

**파일**: [src/hooks/useContracts.ts](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/hooks/useContracts.ts) (L40-L175)

#### 수정 매핑표

| 필드 | Mock 현재 값 → Schema 정의 값 |
|------|------|
| `contract_type` | `'정규직'` → `'fullTime'`, `'아르바이트'` → `'partTime'`, `'계약직'` → `'fixedTerm'`, `'프리랜서'` → `'fixedTerm'` |
| `wage_payment_method` | `'계좌이체'` → `'bankTransfer'` |
| `work_days` | `['월','화','수','목','금']` → `['mon','tue','wed','thu','fri']` 등 |
| `weekly_holiday` | `'일요일'` → `'sun'`, `'월요일'` → `'mon'`, `'토요일,일요일'` → `'sat,sun'`, `'주말'` → `'sat,sun'` |
| `wage_type` | `'project'` → `'monthly'` (Schema enum에 project 없음) |

**주의사항**:
1. 수정 후 앱을 실행하여 목록/상세 페이지에서 한글 표시가 깨지지 않는지 확인
2. 한글 표시는 **UI 레이어**에서 매핑해야 함 (enum → 한글 레이블 함수)
3. 표시용 매핑 객체 **반드시 함께 생성**:

```typescript
// [src/utils/labels.ts](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/utils/labels.ts) (신규 생성)
export const CONTRACT_TYPE_LABEL: Record<string, string> = {
  fullTime: '정규직',
  partTime: '아르바이트',
  fixedTerm: '계약직',
};

export const WAGE_TYPE_LABEL: Record<string, string> = {
  hourly: '시급', daily: '일급', weekly: '주급', monthly: '월급',
};

export const WORK_DAY_LABEL: Record<string, string> = {
  mon: '월', tue: '화', wed: '수', thu: '목', fri: '금', sat: '토', sun: '일',
};

export const WAGE_PAYMENT_METHOD_LABEL: Record<string, string> = {
  bankTransfer: '계좌이체', cash: '현금', mixed: '혼합',
};
```

4. 이 레이블 매핑을 사용하는 모든 UI 파일 수정:
   - [src/pages/employer/ContractListPage.tsx](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/pages/employer/ContractListPage.tsx)
   - [src/pages/employer/ContractDetailPage.tsx](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/pages/employer/ContractDetailPage.tsx)
   - [src/pages/worker/ContractListPage.tsx](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/pages/worker/ContractListPage.tsx)
   - [src/pages/worker/ContractDetailPage.tsx](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/pages/worker/ContractDetailPage.tsx)
   - [src/utils/pdf.ts](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/utils/pdf.ts) (PDF 내 한글 표시)

---

### Task 10: 타입 이중 정의 정리 (LaborContract vs Contract) 🟡

> 리뷰 출처: 카테고리 4-2

**현상**:
- **Zod 스키마** (`schema.ts`): `LaborContract` — `camelCase` (employerName, wageType 등)
- **Hook 인터페이스** (`useContracts.ts` L5-L37): `Contract` — `snake_case` (employer_name, wage_type 등)
- 두 타입 간 변환 없이 각자 사용 → 동기화 깨짐 위험

**수정 방안** (2가지):

#### 방안 A: 변환 함수 생성 (권장 — 최소 변경)
```typescript
// [src/domain/contract/converter.ts](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/domain/contract/converter.ts) (신규)
import type { LaborContract } from './schema';
import type { Contract } from '../../hooks/useContracts';

// Contract (snake_case, DB) → LaborContract (camelCase, 도메인)
export function toLabor(c: Contract): LaborContract { ... }

// LaborContract (camelCase) → Contract (snake_case, DB)
export function toContract(l: LaborContract): Partial<Contract> { ... }
```

#### 방안 B: Contract 인터페이스를 Zod에서 derive (이상적이지만 변경 범위 큼)
```typescript
// useContracts.ts의 Contract 인터페이스를 제거하고
// z.infer<typeof laborContractSchema>를 snake_case로 변환한 타입 사용
```

---

### Task 11: `contract_html` 및 `contract_pdf_url` DB 저장 로직 추가 🟡

> 리뷰 출처: 카테고리 9-9

**현상**: DB에 `contract_html` TEXT, `contract_pdf_url` TEXT 컬럼이 존재하나 아무 데이터도 저장되지 않음  
**영향**: `completed` 상태에서도 계약서 원본이 DB에 영속화되지 않음

**수정**:
1. `completeContract()` 호출 시점에 `pdf.ts`를 재사용하여 `contract_html` 생성 후 DB 저장
2. 생성된 PDF Blob을 Supabase Storage(`contracts` 버킷 등)에 업로드
3. 업로드 성공 후 발급된 Public URL을 `contract_pdf_url` 컬럼에 업데이트
4. Real 모드에서는 Edge Function 내에서 HTML 생성/업로드를 처리하거나, 프론트에서 업로드 후 Edge Function(contracts-complete) 호출 시 URL 전달

---

### Task 12: `contracts-complete` Edge Function 생성 🔴

> 리뷰 출처: 카테고리 9-1

**위치**: [supabase/functions/contracts-complete/index.ts](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/supabase/functions/contracts-complete/index.ts) (신규)  
**기존 패턴 참고**: [supabase/functions/contracts-sign/index.ts](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/supabase/functions/contracts-sign/index.ts)

**로직**:
1. 인증 검증 (JWT에서 사용자 ID 추출)
2. 계약서 조회 — `employer_id === 요청자` 확인
3. 상태 전이 검증 — `status === 'signed'`일 때만 `completed`로 전이 허용
4. `employer_signed_at = NOW()` 기록
5. `contract_html` 저장 (옵션)
6. 상태 업데이트: `status: 'completed'`

```typescript
// 골격 (contracts-sign 패턴 복사)
import { serve } from 'https://deno.land/std@0.168.0/http/[server.ts](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/server.ts)'
import { createClient } from 'https://esm.sh/@[supabase/supabase-js](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/supabase/supabase-js)@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Task 19에서 도메인 제한 예정
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  
  // 1. JWT 인증
  // 2. body에서 contract_id 추출
  // 3. 계약서 조회 + employer_id 검증
  // 4. status === 'signed' 확인
  // 5. UPDATE SET status='completed', employer_signed_at=NOW()
  // 6. 응답
})
```

---

### Task 13: `viewContract()` — Edge Function 사용으로 전환 🟡

> 리뷰 출처: 카테고리 9-3

**파일**: [src/hooks/useContracts.ts](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/hooks/useContracts.ts)  
**현상**: Real 모드에서 `[supabase.from](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/supabase.from)('contracts').update()` 직접 호출 → RLS 실패 가능  
**해결**: 이미 존재하는 `contracts-view` Edge Function 사용

```typescript
// 변경 전
const viewContract = async (id: string) => {
  await [supabase.from](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/supabase.from)('contracts').update({ status: 'viewed' }).eq('id', id);
};

// 변경 후
const viewContract = async (id: string) => {
  const { data, error } = await [supabase.functions.invoke](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/supabase.functions.invoke)('contracts-view', {
    body: { contractId: id },
  });
  if (error) throw error;
  return data;
};
```

---

### Task 14: `cancelContract()`, `expireContract()` 서버 측 검증 🟡

> 리뷰 출처: 카테고리 9-3

**파일**: [src/hooks/useContracts.ts](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/hooks/useContracts.ts)

#### 방안 A: Edge Function 신규 생성 (권장)

[supabase/functions/contracts-cancel/index.ts](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/supabase/functions/contracts-cancel/index.ts):
- `draft`, `sent`, `viewed` 상태에서만 취소 허용
- `completed` 상태는 취소 불가 (법적 효력 발생)

[supabase/functions/contracts-expire/index.ts](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/supabase/functions/contracts-expire/index.ts):
- `sent`, `viewed` 상태에서만 만료 처리 허용
- `signed`, `completed` 상태는 만료 불가

#### 방안 B: DB Trigger로 검증 (대안)
```sql
-- [supabase/migrations/003_state_transition_trigger.sql](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/supabase/migrations/003_state_transition_trigger.sql)
CREATE OR REPLACE FUNCTION check_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status NOT IN ('draft', 'sent', 'viewed') THEN
    RAISE EXCEPTION 'Cannot cancel contract in % status', OLD.status;
  END IF;
  IF NEW.status = 'expired' AND OLD.status NOT IN ('sent', 'viewed') THEN
    RAISE EXCEPTION 'Cannot expire contract in % status', OLD.status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_status
  BEFORE UPDATE OF status ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION check_status_transition();
```

---

### Task 15: `createContract()`, `updateContract()` 서버 측 검증 보완 🟡

> 리뷰 출처: 카테고리 9-3 (나머지 2개 함수)

**파일**: [src/hooks/useContracts.ts](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/hooks/useContracts.ts)

**현상**:
- `createContract()`: `business_id` FK 검증 없이 직접 INSERT
- `updateContract()`: 상태 불변 검증 없이 직접 UPDATE (`completed` 상태에서도 수정 가능)

**수정**:
- `createContract()`: INSERT 전에 `businesses` 테이블에서 `business_id` 존재 + 소유권 확인
- `updateContract()`: `status IN ('draft')` 일 때만 수정 허용 가드 추가

---

## 🔐 Phase 2.5: 보안 강화 (예상 2~3시간)

### Task 16: 서명 이미지 해시 + 타임스탬프 첨부 🟠

> 리뷰 출처: 카테고리 5-1

**파일**: [src/pages/worker/ContractSignPage.tsx](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/pages/worker/ContractSignPage.tsx) (L75 부근)  
**현상**: `canvas.toDataURL('image/png')` → base64 그대로 Supabase 저장, 위변조 방지 없음

**수정**:
```typescript
// 서명 데이터에 메타데이터 추가
const signatureData = {
  image: canvas.toDataURL('image/png'),
  hash: await crypto.subtle.digest('SHA-256', new TextEncoder().encode(imageData)),
  signedAt: new Date().toISOString(),
  userAgent: navigator.userAgent,
};
// 해시값을 hex 문자열로 변환하여 저장
```

---

### Task 17: 전화번호 마스킹 처리 🟣

> 리뷰 출처: 카테고리 5-3

**영향 파일**: 계약서 상세 페이지 (employer/worker 모두)

```typescript
// [src/utils/format.ts](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/utils/format.ts) (기존 파일에 추가 또는 신규)
export function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 8) return phone;
  // 01012345678 → 010****5678
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3');
}
```

적용 위치:
- [src/pages/employer/ContractDetailPage.tsx](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/pages/employer/ContractDetailPage.tsx) — 근로자 전화번호 표시
- [src/pages/worker/ContractDetailPage.tsx](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/pages/worker/ContractDetailPage.tsx) — 사업주 전화번호 표시
- [src/utils/pdf.ts](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/utils/pdf.ts) — PDF 내 전화번호 (PDF에는 마스킹 **미적용** — 법적 문서이므로)

---

### Task 18: RLS 정책과 프론트엔드 호출 패턴 검증 🟠

> 리뷰 출처: 카테고리 5-2

**파일**: [supabase/migrations/002_rls_policies.sql](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/supabase/migrations/002_rls_policies.sql) (L56)  
**현상**: 근로자 UPDATE 정책이 `FOR UPDATE USING (false)` → 프론트엔드가 `.update()` 직접 호출 시 실패

**검증 체크리스트**:
- [ ] Real 모드에서 각 함수별로 실제 Supabase 호출 테스트
- [ ] `contracts-view` Edge Function이 `SECURITY DEFINER`인지 확인
- [ ] `sign_contract()` RPC가 정상 동작하는지 확인
- [ ] Task 13, 14에서 Edge Function으로 전환한 후 RLS 충돌 없는지 확인

---

### Task 19: Edge Functions CORS 도메인 제한 🟠

> 리뷰 출처: 카테고리 9-6

**영향 파일**: `[supabase/functions/](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/supabase/functions/)*/index.ts` (기존 3개 + 신규 생성분)

```typescript
// 변경 전 (모든 Edge Function 공통)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
};

// 변경 후
const ALLOWED_ORIGINS = [
  'https://bossimclockedin.private-apps.tossmini.com', // 프로덕션
  'http://localhost:5173', // 개발
];

const corsHeaders = (origin: string) => ({
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
});
```

---

### Task 20: XSS 방지 — PDF HTML 생성 시 이스케이프 🟠

> 리뷰 출처: 카테고리 4 로드맵 Phase 4

**파일**: [src/utils/pdf.ts](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/utils/pdf.ts)  
**위험**: 사용자 입력(이름, 주소 등)이 HTML 템플릿에 직접 삽입 → XSS 가능

```typescript
// [src/utils/sanitize.ts](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/utils/sanitize.ts) (신규)
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// pdf.ts에서 모든 사용자 입력에 escapeHtml() 적용
```

---

## 🚀 Phase 3: 핵심 기능 완성 (예상 1~2주)

### Task 21: 근로자 명시적 거절 플로우 🟡

> 리뷰 출처: 카테고리 3-4

**현상**: 근로자가 계약서를 거부할 UI/API 없음 → `viewed` 상태에서 무한정 대기

**구현 필요**:
1. **UI**: [src/pages/worker/ContractDetailPage.tsx](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/pages/worker/ContractDetailPage.tsx)에 "거절" 버튼 추가
2. **상태**: 상태 머신에 `rejected` 상태 추가 (`viewed → rejected`)
3. **Schema**: `contracts` 테이블에 `rejected_at`, `rejection_reason` 컬럼 추가
4. **Edge Function**: `contracts-reject` 함수 생성 또는 `contracts-view` 확장
5. **사장님 UI**: 거절된 계약서 표시 + 사유 확인

---

### Task 21-B: 계약 취소 UI 구현 🟡

> 리뷰 출처: 기존 로드맵 Phase 3 (L219)

**현상**: `cancelContract()` 함수는 존재하지만, 프론트엔드에서 취소를 트리거하는 **UI가 없음**  
**파일**: [src/pages/employer/ContractDetailPage.tsx](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/pages/employer/ContractDetailPage.tsx)

**구현 필요**:
1. `draft`, `sent`, `viewed` 상태에서 "계약서 취소" 버튼 표시
2. 취소 사유 입력 확인 다이얼로그 (예: confirm 또는 바텀시트)
3. `cancelContract(id)` 호출 → Task 14의 Edge Function 연동
4. 취소 후 상태 배지 및 목록 반영 확인

**주의**: `completed` 또는 `signed` 상태에서는 취소 버튼 비노출

---

### Task 22: 알림 시스템 — 최소 1가지 채널 구현 🟡

> 리뷰 출처: 카테고리 3-1 + 카테고리 9-1 (`contracts-send`의 SMS/Push `// TODO` 스텁)

**현상**: SMS, Push, 인박스 — 모든 알림 경로가 미구현  
**파일들**:
- [src/api/smart-messenger.ts](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/api/smart-messenger.ts) — 인터페이스만 존재
- [supabase/functions/contracts-send/index.ts](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/supabase/functions/contracts-send/index.ts) — SMS/Push 발송 부분이 `// TODO` 스텁

**최소 구현 (택 1)**:
- **A) 토스 스마트 메시지**: `smart-messenger.ts`의 인터페이스를 실제 API 호출로 연결
- **B) 링크 공유**: `SendContractSheet.tsx`의 "링크 복사" 기능 강화 — Deep Link 생성
- **C) SMS**: `contracts-send` Edge Function의 `// TODO` 스텁을 SMS API 호출로 교체 (예: NHN Cloud, CoolSMS)

**관련 파일**: [src/components/delivery/SendContractSheet.tsx](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/components/delivery/SendContractSheet.tsx) — 현재 3가지 전송 옵션(스마트메시지, 공유, 링크복사) UI는 있으나 실제 전송 미구현

**연동 주의**: `contracts-send` Edge Function 내부의 `// TODO` 부분을 방안 C로 교체 시, Edge Function 코드 수정 + `CORS` 설정이 Task 19와 겹치므로 함께 작업 권장

---

### Task 23: `shareContract()` placeholder URL 교체 🟡

> 리뷰 출처: 카테고리 9-7

**파일**: [src/api/smart-messenger.ts](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/api/smart-messenger.ts) (L21)

```typescript
// 변경 전
'https://your-app.com/og/contract.png'

// 변경 후
const OG_IMAGE_URL = import.meta.env.VITE_OG_IMAGE_URL || '/og-contract.png';
```

- [public/og-contract.png](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/public/og-contract.png) OG 이미지 생성 필요 (1200×630px 권장)
- 또는 동적 OG 이미지 생성 Edge Function 구현

---

### Task 24: 계약 만료 자동화 🟡

> 리뷰 출처: 카테고리 3-3

**현상**: Mock 모드에서만 `getContract()` 내부에서 30일 만료 처리  
**Real 모드 필요 작업**:

```sql
-- [supabase/migrations/004_expire_cron.sql](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/supabase/migrations/004_expire_cron.sql)
-- pg_cron 확장을 사용하여 매일 00:00에 만료 계약 처리
SELECT cron.schedule(
  'expire-contracts',
  '0 0 * * *',
  $$
    UPDATE contracts
    SET status = 'expired', updated_at = NOW()
    WHERE status IN ('sent', 'viewed')
    AND sent_at < NOW() - INTERVAL '30 days'
  $$
);
```

---

### Task 25: 실시간 상태 동기화 🔵

> 리뷰 출처: 카테고리 3-2

**현상**: WebSocket/SSE/폴링 없음 → 양측 새로고침 필요

**최소 구현**: Supabase Realtime 구독

```typescript
// [src/hooks/useContracts.ts](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/hooks/useContracts.ts) — Real 모드에 추가
useEffect(() => {
  if (IS_MOCK) return;
  
  const channel = supabase
    .channel('contract-changes')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'contracts',
    }, (payload) => {
      // 로컬 상태 업데이트
      setContracts(prev => prev.map(c => 
        c.id === payload.new.id ? { ...c, ...payload.new } : c
      ));
    })
    .subscribe();

  return () => { [supabase.removeChannel](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/supabase.removeChannel)(channel); };
}, []);
```

---

### Task 25-B: 계약 이력 페이지 실 데이터 연결 🟡

> 리뷰 출처: 기존 로드맵 Phase 3 (L222)

**파일**: [src/pages/employer/ContractHistoryPage.tsx](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/pages/employer/ContractHistoryPage.tsx)  
**현상**: 계약 이력 페이지가 존재하지만 실 데이터와 연결되지 않음

**수정**:
1. `useContracts` 훅에서 이력 데이터 가져오기 (상태별 필터링: `completed`, `cancelled`, `expired`)
2. 기간별 조회 기능 추가 (선택)
3. 상세 페이지로의 네비게이션 연결 확인

---

## 🔵 Phase 4: 코드 품질 개선 (예상 1~2주)

### Task 26: ContractFormPage 613줄 모놀리스 분리 🔵

> 리뷰 출처: 카테고리 4-3

**현상**: 7단계 위자드가 단일 컴포넌트에 전부 포함 (613줄)  
**도구**: `@use-funnel/browser` (이미 설치됨, 적용 대기 중)

**리팩토링 구조**:
```
[src/pages/employer/contract-form/](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/pages/employer/contract-form/)
├── ContractFormPage.tsx          # 위자드 컨테이너 (@use-funnel/browser)
├── steps/
│   ├── Step1BasicInfo.tsx        # 기본 정보 (근로자명, 계약기간)
│   ├── Step2WorkConditions.tsx   # 근무 조건 (장소, 업무)
│   ├── Step3WorkSchedule.tsx     # 근무 시간/요일
│   ├── Step4WageInsurance.tsx    # 임금/보험
│   ├── Step5LegalValidation.tsx  # 법정 검증
│   ├── Step6Preview.tsx          # 최종 확인
│   └── Step7Complete.tsx         # 완료
├── hooks/
│   └── useContractForm.ts        # 폼 상태 관리 (sessionStorage 포함)
└── types.ts                      # Step별 폼 데이터 타입
```

---

### Task 27: 에러 핸들링 체계화 + 모니터링 🔵

> 리뷰 출처: 카테고리 4-5 + 로드맵 Phase 5 (L239 "Sentry 등 모니터링")

**현상**: `catch` 블록 대부분이 `alert()` 또는 빈 `catch {}`  
**영향 파일**: `useContracts.ts`, `ContractFormPage.tsx`, `ContractSignPage.tsx`, `ContractDetailPage.tsx`

**Part A: 에러 핸들러 유틸리티**
```typescript
// [src/utils/errorHandler.ts](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/utils/errorHandler.ts) (신규)
export function handleApiError(error: unknown, context: string): string {
  console.error(`[${context}]`, error);
  
  // (선택) Sentry 등 외부 모니터링 전송
  // if (typeof Sentry !== 'undefined') Sentry.captureException(error, { tags: { context } });
  
  if (error instanceof Error) {
    if (error.message.includes('network')) return '네트워크 연결을 확인해주세요.';
    if (error.message.includes('auth')) return '인증이 만료되었습니다. 다시 로그인해주세요.';
    if (error.message.includes('permission')) return '해당 작업에 대한 권한이 없습니다.';
    if (error.message.includes('status')) return '이 상태에서는 해당 작업을 수행할 수 없습니다.';
  }
  
  return '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
}
```

모든 `catch` 블록을 이 함수로 교체. TDS에 Toast 컴포넌트가 있다면 `alert()` 대신 활용.

**Part B: 에러 모니터링 (선택)**
- Sentry 또는 LogRocket 도입 시 `errorHandler.ts`에 전송 로직 추가
- `ErrorBoundary.tsx` (이미 존재)와 연동하여 렌더링 에러도 포착
- 프로덕션 배포 시점에 활성화 (개발 중에는 console.error만 사용)

---

### Task 28: 접근성 (a11y) 개선 🔵

> 리뷰 출처: 카테고리 6-4

**현상**:
- Canvas 전자서명에 키보드/스크린리더 대안 없음
- 색상 대비비 미검증 (특히 경고 텍스트 `#8B6F00`)

**수정**:
1. **Canvas 서명**: `aria-label="전자서명 입력 영역"` 추가, 서명 패드 아래에 "이름 타이핑으로 서명" 대안 옵션 제공
2. **색상 대비**: WCAG 2.1 AA 기준 (4.5:1) 충족하도록 경고 텍스트 색상 조정 (`#8B6F00` → 더 진한 색)
3. **키보드 네비게이션**: 위자드 Step 간 Tab/Enter 네비게이션 확인

---

## 🧪 Phase 5.5: 테스트 인프라 (예상 1주)

### Task 29: 검증 엔진 단위 테스트 🔴

> 리뷰 출처: 카테고리 9-5

**현상**: [src/](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/) 디렉토리에 테스트 파일 0건. `vitest.config.ts`는 존재.

**파일**: [src/domain/contract/__tests__/validation.test.ts](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/domain/contract/__tests__/validation.test.ts) (신규 — 디렉토리 이미 존재)

```typescript
import { describe, it, expect } from 'vitest';
import { validateLaborContract } from '../validation';

describe('validateLaborContract', () => {
  describe('최저임금 검증', () => {
    it('시급이 최저임금 미만이면 오류', () => { ... });
    it('월급의 시급 환산이 최저임금 미만이면 오류', () => { ... }); // Task 6 이후
    it('시급이 최저임금 이상이면 통과', () => { ... });
  });
  
  describe('휴게시간 검증', () => {
    it('4시간 초과 근무 시 30분 미만 휴게는 오류', () => { ... });
    it('8시간 초과 근무 시 1시간 미만 휴게는 오류', () => { ... });
  });
  
  describe('주휴일 검증', () => {
    it('주 15시간 이상 근무 시 주휴일 미지정이면 경고', () => { ... });
  });
  
  // ... 7종 규칙 전부
});
```

---

### Task 30: Zod 스키마 엣지 케이스 테스트 🟡

> 리뷰 출처: 카테고리 9-5

**파일**: [src/domain/contract/__tests__/schema.test.ts](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/domain/contract/__tests__/schema.test.ts) (신규)

```typescript
import { describe, it, expect } from 'vitest';
import { laborContractSchema } from '../schema';

describe('laborContractSchema', () => {
  it('올바른 데이터는 파싱 성공', () => { ... });
  it('contract_type이 유효하지 않은 enum이면 실패', () => { ... });
  it('wage_type이 project면 실패', () => { ... }); // 9-2 회귀 방지
  it('필수 필드 누락 시 실패', () => { ... });
});
```

---

### Task 31: 상태 전이 시퀀스 테스트 🟡

> 리뷰 출처: 카테고리 9-5

**파일**: [src/hooks/__tests__/useContracts.test.ts](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/hooks/__tests__/useContracts.test.ts) (신규)

```typescript
// 상태 전이 유효성 검증
// draft → sent ✅
// sent → viewed ✅
// viewed → signed ✅
// signed → completed ✅
// completed → cancelled ❌ (불가)
// expired → signed ❌ (불가)
```

#### 검증 방법
```bash
npx vitest run
# 모든 테스트 통과 확인
```

---


### Task 32-B: 사내 감사 에이전트 연동 점검 🔵

**위치**: [.omp/agents/](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/.omp/agents/)
**내용**: 기존 작성된 프롬프트 에이전트 3종의 규칙을 준수하는지 자가 점검 (DeepSeek V4 Pro 자체 검토)
- `ux-auditor.md`: 한글화(`es-hangul`) 및 접근성 점검
- `robustness-auditor.md`: 폼 이탈 방지(`beforeunload`) 및 새로고침 복구 점검
- `functional-qa.md`: 18개 E2E 시나리오 기반 기능 검증

---

### Task 32: E2E 테스트 — MVP 플로우 🔵

> 리뷰 출처: 로드맵 Phase 5 (L240)

**현상**: 전체 플로우를 커버하는 E2E 테스트 없음  
**도구**: Playwright 또는 Cypress (선택)

**최소 시나리오**:
1. 사장님 로그인 → 계약서 작성 (위저드 7단계) → 전송
2. 근로자 로그인 → 계약서 열람 → 서명
3. 사장님 재로그인 → 계약서 확정 → PDF 다운로드
4. 계약서 취소 플로우
5. 법정 검증 실패 시 저장 차단 확인

**참고**: Mock 모드에서 실행 가능하도록 테스트 환경 설정

```bash
# Playwright 설치 (프로젝트에 추가)
npx -y playwright install
npx playwright test
```

---

## 📋 전체 실행 순서 요약

| 순서 | Phase | Task | 심각도 | 예상 시간 | 의존성 |
|------|-------|------|--------|----------|--------|
| 1 | 0 | Task 1: TS 컴파일 오류 5건 | 🔴 | 30분 | 없음 |
| 2 | 0 | Task 2: PDF 다운로드 연결 | 🟢 | 15분 | 없음 |
| 3 | 0 | Task 3: Suspense fallback | 🟢 | 10분 | 없음 |
| — | 0 | Task 3-B: 상세/서명 페이지 로딩 일관성 | 🟢 | 20분 | 없음 |
| 4 | 0 | Task 4: API_BASE 환경변수 | 🔵 | 5분 | 없음 |
| 5 | 0 | Task 5: businesses[0] null 가드 | 🟡 | 10분 | 없음 |
| 6 | 1 | Task 6: 최저임금 전 임금유형 확장 | 🟡 | 30분 | 없음 |
| 7 | 1 | Task 7: 4대보험 매핑 수정 | 🟡 | 30분 | 방안 결정 |
| 8 | 1 | Task 8: employer_signed_at 기록 | 🟡 | 15분 | 없음 |
| 9 | 0.5 | Task 9: Mock 데이터 enum 전면 수정 | 🔴🔴 | 60분 | 없음 |
| 10 | 0.5 | Task 10: 타입 이중 정의 정리 | 🟡 | 45분 | Task 9 이후 |
| 11 | 0.5 | Task 11: contract_html, PDF Storage 업로드 | 🟡 | 45분 | 없음 |
| 12 | 0.5 | Task 12: contracts-complete 생성 | 🔴 | 30분 | Edge Function 패턴 |
| 13 | 0.5 | Task 13: viewContract Edge Function 전환 | 🟡 | 15분 | Task 12 이후 |
| 14 | 0.5 | Task 14: cancel/expire 서버 검증 | 🟡 | 45분 | Task 12 이후 |
| 15 | 0.5 | Task 15: create/update 서버 검증 | 🟡 | 30분 | Task 12 이후 |
| 16 | 2.5 | Task 16: 서명 해시+타임스탬프 | 🟠 | 30분 | 없음 |
| 17 | 2.5 | Task 17: 전화번호 마스킹 | 🟣 | 15분 | 없음 |
| 18 | 2.5 | Task 18: RLS 정책 검증 | 🟠 | 30분 | Task 13-15 이후 |
| 19 | 2.5 | Task 19: CORS 도메인 제한 | 🟠 | 20분 | 없음 |
| 20 | 2.5 | Task 20: XSS 방지 | 🟠 | 20분 | 없음 |
| 21 | 3 | Task 21: 근로자 거절 플로우 | 🟡 | 2시간 | 없음 |
| 22 | 3 | Task 22: 알림 시스템 최소 1채널 | 🟡 | 3시간 | 없음 |
| 23 | 3 | Task 23: shareContract URL 교체 | 🟡 | 15분 | 없음 |
| 24 | 3 | Task 24: 계약 만료 자동화 | 🟡 | 1시간 | Supabase 실연동 |
| 25 | 3 | Task 25: 실시간 상태 동기화 | 🔵 | 1시간 | Supabase 실연동 |
| 26 | 4 | Task 26: ContractFormPage 분리 | 🔵 | 3시간 | 없음 |
| 27 | 4 | Task 27: 에러 핸들링 체계화 | 🔵 | 45분 | 없음 |
| 28 | 4 | Task 28: 접근성 개선 | 🔵 | 1시간 | 없음 |
| 29 | 5.5 | Task 29: 검증 엔진 단위 테스트 | 🔴 | 1시간 | Task 6 이후 |
| 30 | 5.5 | Task 30: Zod 스키마 테스트 | 🟡 | 30분 | Task 9 이후 |
| 31 | 5.5 | Task 31: 상태 전이 테스트 | 🟡 | 30분 | Task 14 이후 |
| 32 | 5.5 | Task 32: E2E 테스트 (MVP 플로우) | 🔵 | 3시간 | 전체 이후 |
| — | 3 | Task 21-B: 계약 취소 UI | 🟡 | 30분 | Task 14 이후 |
| — | 3 | Task 25-B: 계약 이력 실 데이터 연결 | 🟡 | 30분 | 없음 |

**총 예상 시간**: ~27시간 (모든 Phase 포함, Task 32 E2E 3시간 + Task 21-B, 25-B 포함)

---

## 🗺️ 커버리지 매트릭스 — 리뷰 항목 ↔ Task 추적

> 이 표로 code_review_report.md의 **모든 항목이 빠짐없이** 커버되는지 확인합니다.

| 리뷰 항목 | Plan Task | 상태 |
|-----------|-----------|------|
| **1-1** Mock 모드 전환 불가 | Phase 2 범위 (Supabase 프로젝트 생성) | ⏳ 별도 Phase |
| **1-2** 토스 인증 미연동 | Phase 2 범위 (토스 앱 WebView 테스트) | ⏳ 별도 Phase |
| **1-3** Edge Functions 미구현 | ✅ Task 12 (complete 생성) + 기존 3개 확인 | ✅ |
| **1-4** TS 컴파일 오류 6건 | ✅ Task 1 (5건 — 1건은 이미 해결) | ✅ |
| **1-5** PDF 다운로드 미연결 | ✅ Task 2 | ✅ |
| **2-1** 검증 엔진 미연동 | ✅ 이미 해결 (7-2 QA) | ✅ |
| **2-2** 최저임금 시급만 | ✅ Task 6 | ✅ |
| **2-3** 주휴일 경고만 | ✅ 2-1 해결로 Step 5 강제 → 간접 해결 | ✅ |
| **2-4** 4대보험 매핑 불일치 | ✅ Task 7 | ✅ |
| **3-1** 알림 시스템 전무 | ✅ Task 22 | ✅ |
| **3-2** 실시간 동기화 없음 | ✅ Task 25 | ✅ |
| **3-3** 계약 만료 자동화 | ✅ Task 24 | ✅ |
| **3-4** 근로자 거절 플로우 없음 | ✅ Task 21 | ✅ |
| **3-5** 역할 전환 보안 | ⏳ Phase 2 범위 (인증 기반 역할) | ⏳ |
| **로드맵 Phase 3**: 계약 취소 UI | ✅ Task 21-B | ✅ |
| **로드맵 Phase 3**: 계약 이력 실 데이터 | ✅ Task 25-B | ✅ |
| **4-1** 죽은 코드 (대부분) | ✅ 이미 해결 | ✅ |
| **4-1** `toss-auth.ts` 죽은 코드 | ⏳ Phase 2에서 실연동 시 활성화 예정 | ⏳ |
| **4-1** `contract_html` 필드 (읽기/쓰기 0회) | ✅ Task 11에서 저장 로직 추가 | ✅ |
| **4-2** 타입 이중 정의 | ✅ Task 10 | ✅ |
| **4-3** ContractFormPage 모놀리스 | ✅ Task 26 | ✅ |
| **4-4** Mock 데이터 불일치 | ✅ Task 9 | ✅ |
| **4-5** 에러 핸들링 부족 | ✅ Task 27 | ✅ |
| **5-1** 서명 이미지 평문 | ✅ Task 16 | ✅ |
| **5-2** RLS 우회 가능성 | ✅ Task 18 | ✅ |
| **5-3** 전화번호 마스킹 | ✅ Task 17 | ✅ |
| **5-4** CI 미활용 | ⏳ Phase 2 범위 (토스 인증 연동 시) | ⏳ |
| **5-5** API Key 노출 | ✅ Task 4 | ✅ |
| **6-1** 로딩 상태 부족 (목록) | ✅ 이미 해결 | ✅ |
| **6-1** 상세/서명 페이지 로딩 | ✅ Task 3-B | ✅ |
| **6-2** Suspense fallback null | ✅ Task 3 | ✅ |
| **6-3** OverlayProvider 누락 | ✅ 이미 해결 | ✅ |
| **6-4** 접근성 | ✅ Task 28 | ✅ |
| **9-1** contracts-complete 누락 | ✅ Task 12 | ✅ |
| **9-2** Mock enum 전면 불일치 | ✅ Task 9 | ✅ |
| **9-3** 상태 전이 검증 부재 | ✅ Task 13, 14, 15 | ✅ |
| **9-4** [server/](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/server/) 무관 | ✅ 주의사항에 명시 | ✅ |
| **9-1** `contracts-send` SMS/Push TODO 스텁 | ✅ Task 22 (연동 명시) | ✅ |
| **9-5** 테스트 0건 | ✅ Task 29, 30, 31, 32 | ✅ |
| **9-6** CORS * | ✅ Task 19 | ✅ |
| **9-7** shareContract placeholder | ✅ Task 23 | ✅ |
| **9-8** employer_signed_at 미사용 | ✅ Task 8, Task 12 | ✅ |
| **9-9** contract_html / pdf url | ✅ Task 11 | ✅ |
| **9-10** businesses[0] null | ✅ Task 5 | ✅ |
| **Phase 4 로드맵**: XSS 방지 | ✅ Task 20 | ✅ |
| **Phase 5 로드맵**: E2E 테스트 | ✅ Task 32 | ✅ |
| **Phase 5 로드맵**: Sentry 모니터링 | ✅ Task 27 Part B | ✅ |

**⏳ Phase 2 범위** (이 plan 외 — Supabase 프로젝트 생성, DB 마이그레이션 실행, 토스 인증 실연동, CI 본인확인, 역할 보안):
이 항목들은 **Supabase 프로젝트 실생성 + 토스 앱 WebView 테스트 환경**이 필요하므로 별도 plan에서 다룸.

---

## ⚠️ DeepSeek V4 Pro 주의사항

1. **TDS 컴포넌트 API**: `@simsimhae/granite` 패키지의 `Flex`, `Top`, `Badge` 등의 prop 타입을 반드시 `node_modules/@simsimhae/granite`의 타입 정의 파일에서 확인한 후 수정할 것. 추측으로 수정하면 다른 TS 오류 발생.

2. **Mock/Real 듀얼 구조**: `useContracts.ts`에서 모든 함수가 `if (IS_MOCK) { ... } else { ... }` 분기 구조. Mock 쪽만 수정하고 Real 쪽을 빠뜨리지 않도록 주의.

3. **Zod Schema가 SSOT**: [src/domain/contract/schema.ts](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/src/domain/contract/schema.ts)의 Zod 스키마가 유일한 진실 공급원(Single Source of Truth). 이 스키마의 enum 값을 기준으로 모든 곳을 맞출 것.

4. **Edge Functions는 Deno 런타임**: [supabase/functions/](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/supabase/functions/) 아래 코드는 Node.js가 아닌 Deno 환경. `import` 구문이 URL 기반 (`https://deno.land/...`, `https://esm.sh/...`).

5. **[server/](file:///Users/ganghyeon-ug/Desktop/💼 프로젝트/AI_Agents/TOSS/toss-contract-app/server/) 디렉토리 절대 수정 금지**: 결제/계좌 이체용 Express 서버로, 근로계약서 앱과 무관.

6. **한글 주석**: 모든 코드 주석은 한국어로 작성.

7. **기존 코드 스타일 유지**: 세미콜론 있음, 작은따옴표, 2칸 들여쓰기.

8. **sessionStorage 패턴 주의**: AuthContext와 ContractFormPage가 sessionStorage를 사용하여 새로고침 복구. 키 이름 충돌 주의 (`wiz_form`, `wiz_step`, `auth_user`).

9. **`@use-funnel/browser`**: Task 26에서만 사용. 다른 Task에서 위자드 구조를 건드릴 때 이 라이브러리의 API를 참고하되, 아직 미적용 상태임을 인지.

10. **테스트 프레임워크**: `vitest` 사용. `vitest.config.ts` 이미 존재. `describe/it/expect` 패턴.

---

## 🔍 검증 체크리스트

각 Phase 완료 후 확인:

```bash
# 1. TypeScript 컴파일 확인
npx tsc --noEmit

# 2. 테스트 실행 (Phase 5.5 이후)
npx vitest run

# 3. 개발 서버 정상 기동
npm run dev

# 4. 주요 플로우 수동 테스트
# - 사장님 로그인 → 대시보드 → 계약서 목록 → 상세 → PDF 다운로드
# - 근로자 로그인 → 계약서 목록 → 상세 → 서명
# - 계약서 작성 위저드 전체 스텝 통과 (법정 검증 강제 확인)
# - 전화번호 마스킹 표시 확인
# - 역할 전환 동작 확인

# 5. 콘솔 에러 없음 확인
# 브라우저 DevTools > Console

# 6. Edge Function 로컬 테스트 (Phase 0.5 이후)
# supabase functions serve contracts-complete --no-verify-jwt
```

## 📚 TDS 문서 참조 (apps-in-toss-ax)
`@toss/tds-mobile` v2.4.0 기준. 컴포넌트 사용법이 불확실할 때:
1. 검색: `bash ~/.claude/skills/docs-search/run-ax.sh search tds-web --query "컴포넌트명" --limit 3`
2. 결과의 `url` 필드를 **browser 도구로 열어야** 표·예제코드·프리뷰를 볼 수 있음 (ax CLI는 텍스트만 추출, `[Preview: Token]` 같은 React 컴포넌트 렌더링 안 함)
3. `browser open → url → tab.evaluate()` 로 DOM 접근
4. Apps-in-Toss 개발문서: `bash ~/.claude/skills/docs-search/run-ax.sh search docs --query "키워드" --limit 3`
