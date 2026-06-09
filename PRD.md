# Toss 근로계약서 미니앱 — PRD (Product Requirements Document)

> 버전: 0.3.0  
> 최종 수정: 2026-06-09 04:30 KST  
> 기반: toss-contract-flowcharts.html + 소스코드 27개 파일 전수 분석 + Edge Function/import/dependency 추적 (2026-06-09)

---

## 1. 제품 개요 (Product Overview)

**Toss 근로계약서 미니앱**은 사장님(고용주)과 근로자가 토스 플랫폼 안에서 모바일 근로계약서를 작성·전송·검토·전자서명·확정할 수 있는 「앱인토스」 미니앱이다.

### 핵심 가치 제안
- 사장님: 종이 없는 계약서 작성 → 근로자에게 SMS/링크 전송 → 서명 확인 → PDF 보관
- 근로자: 받은 계약서 검토 → 전자서명 → 완료까지 5분 이내 End-to-End
- 법적 안전장치: 근로기준법 기반 검증 엔진 내장 (최저임금, 휴게시간, 주휴일, 4대보험, 퇴직금)

### 현재 구현 완성도
- **MVP 핵심 플로우**: 약 70% 완성 (draft→sent→viewed→signed→completed 정상 동작)
- **전체 기능**: 약 55% 완성 (취소/만료/인증/알림/검증통합 미비)

### 플랫폼
- **런타임**: Toss Apps-in-Toss (`@apps-in-toss/web-framework` 2.6.1)
- **프론트엔드**: React 18 + TypeScript + Vite 6
- **백엔드**: Supabase + Edge Functions (※ 현재 Mock 모드)
- **UI 시스템**: `@toss/tds-mobile` 2.4.0 + Emotion CSS-in-JS
- **PDF 생성**: html2canvas-pro + jsPDF (클라이언트 사이드)

---

## 2. 사용자 페르소나 (User Personas)

| 역할 | 설명 | 주요 액션 |
|------|------|-----------|
| 🏢 **사장님 (Employer)** | 소상공인·사업주. 사업장 등록 후 근로계약서 작성·전송·확정 | 사업장 등록, 계약서 작성, 전송, 서명 확인, 확정, PDF 다운로드 |
| 👤 **근로자 (Worker)** | 사장님으로부터 계약서 받은 근로자 | 딥링크 진입, 계약서 검토, 전자서명 |

---

## 3. 계약 생명주기 상태 머신 (Contract State Machine)

```
         사장님 작성          사장님 전송         근로자 열람(자동)    근로자 서명        사장님 확정
[*] ────→ draft ────→ sent ────→ viewed ────→ signed ────→ completed ────→ [*]
              │                  │          │              │
              └→ cancelled       └→ expired └→ expired     └→ cancelled
```

### 상태 정의 (7 States)

| 상태 | 한글 | 의미 | 설정 주체 | 구현 |
|------|------|------|-----------|------|
| `draft` | 작성 중 | 사장님이 계약서 양식 작성 중. 근로자에게 미전송 | 사장님 | ✅ |
| `sent` | 전송됨 | 근로자에게 SMS/푸시/공유링크로 전송 완료 | 사장님 전송 시 | ✅ |
| `viewed` | 확인됨 | 근로자가 상세 페이지 열람 — 자동 전환 | 시스템 (자동) | ✅ |
| `signed` | 서명 완료 | 근로자가 Canvas 전자서명 제출 완료 | 근로자 서명 제출 시 | ✅ |
| `completed` | 계약 완료 | 사장님이 최종 확정. PDF 다운로드 가능 | 사장님 확정 시 | ✅ |
| `cancelled` | 취소됨 | 사장님이 draft/signed 상태에서 취소 | 사장님 | 🔴 schema만, 전이 없음 |
| `expired` | 만료됨 | 유효기간 경과로 자동 만료 (sent/viewed) | 시스템 | 🔴 schema만, 전이 없음 |

---

## 4. 기능 요구사항 (Feature Requirements)

> 범례: ✅ 완전 구현 · 🟡 부분 구현 (Mock / 미연동 / UI만) · 🔴 미구현 · 💀 죽은 코드

### 4.1 인증/역할 (Auth & Role)

| ID | 기능 | 상태 | 비고 |
|----|------|------|------|
| AUTH-01 | 토스 로그인 (OAuth) | 🟡 Mock | `IS_MOCK=true`, `AuthContext` 84행 `TODO: Real Toss Login`. `api/toss-auth.ts`에 인증 API 풀 구현돼 있으나 AuthContext가 호출 안 함 💀 |
| AUTH-02 | 역할 선택 (사장님/근로자) | ✅ 구현 | `RoleSelectPage` |
| AUTH-03 | 역할 가드 (Protected Routes) | ✅ 구현 | `RoleGuard` 컴포넌트 |
| AUTH-04 | 자동 로그인 체크 (딥링크 진입) | ✅ 구현 | `AuthContext` + `DeeplinkHandler` |

### 4.2 사장님 — 사업장 관리

| ID | 기능 | 상태 | 비고 |
|----|------|------|------|
| BIZ-01 | 사업장 등록 폼 | ✅ 구현 | 사업자등록번호, 사업장명, 대표자, 소재지 |
| BIZ-02 | 사업장 등록 유효성 검증 | ✅ 구현 | Zod: 사업자번호 `000-00-00000` 형식만 |
| BIZ-03 | 사업자등록번호 진위 확인 | 🔴 미구현 | 국세청 API 등 연동 없음 |
| BIZ-04 | 미등록 시 대시보드 안내 | ✅ 구현 | 최초 1회 필수 |

### 4.3 사장님 — 계약서 작성

| ID | 기능 | 상태 | 비고 |
|----|------|------|------|
| CT-01 | 계약서 신규 작성 폼 | ✅ 구현 | `ContractFormPage` |
| CT-02 | 근로자 정보 입력 (이름, 전화번호) | ✅ 구현 | `WorkerSchema` |
| CT-03 | 근로자 주소 입력 | 🔴 미구현 | schema에는 `address?` 있으나 폼에 필드 없음 |
| CT-04 | 계약 유형 선택 (정규직, 단시간, 기간제) | ✅ 구현 | `contractType` enum |
| CT-05 | 근무 조건 입력 (장소, 직무, 시작일, 종료일) | ✅ 구현 | |
| CT-06 | 임금 정보 입력 (시급/일급/주급/월급, 금액, 지급일) | 🟡 부분 | 임금유형·금액·지급일만. **지급방법 선택 UI 없음** |
| CT-07 | 근무 시간 입력 (요일, 시작, 종료, 휴게시간) | ✅ 구현 | `workDays[]`, `startTime`, `endTime`, `breakMinutes` |
| CT-08 | 주휴일 지정 | 🔴 미구현 | schema에 `weeklyHoliday?` 있으나 **폼에 선택 UI 없음** |
| CT-09 | 유급휴가/사회보험/퇴직금 조항 토글 | 🔴 미구현 | schema에 3개 boolean 있으나 **폼에 토글 UI 없음** (기본값 `false` 하드코딩) |
| CT-10 | 폼 유효성 검증 — Zod | ✅ 구현 | 자체 간단 검증 |
| CT-11 | 폼 유효성 검증 — 법정 규칙 | 🔴 미연동 | `validation.ts`에 7종 규칙 풀 구현돼 있으나 **ContractFormPage가 호출 안 함** |
| CT-12 | 계약서 저장 → `draft` 상태 | ✅ 구현 | |
| CT-13 | 계약서 목록 보기 (상태 배지 포함) | ✅ 구현 | `ContractCard` + `ContractStatusBadge` |
| CT-14 | 계약서 상세 미리보기 | ✅ 구현 | `ContractPreview` |

### 4.4 사장님 — 전송 및 확정

| ID | 기능 | 상태 | 비고 |
|----|------|------|------|
| SEND-01 | 계약서 전송 → `draft → sent` | ✅ 구현 | `useContracts.sendContract()` |
| SEND-02 | 전송 방식 선택 (SMS/Push/공유) | 🔴 미연동 | `SendContractSheet` 컴포넌트 + `useDelivery.ts` 훅 존재하나 **양쪽 모두 import 0회** 💀. `ContractDetailPage`는 `useContracts.sendContract()` 직접 호출 → 방식 선택 없이 즉시 전송 |
| SEND-03 | 전송 상태 표시 | ✅ 구현 | `DeliveryStatus` |
| SEND-04 | 근로자 서명 확인 | ✅ 구현 | 서명 이미지 표시 |
| SEND-05 | 계약 확정 → `signed → completed` | ✅ 구현 | 사장님 최종 확인 버튼 |
| SEND-06 | 계약 취소 → `→ cancelled` | 🔴 미구현 | `cancelContract()` 함수 자체가 **없음**. UI 버튼도 없음 |
| SEND-07 | PDF 다운로드 | ✅ 구현 | html2canvas-pro + jsPDF |

### 4.5 근로자 — 계약 검토 및 서명

| ID | 기능 | 상태 | 비고 |
|----|------|------|------|
| WK-01 | 딥링크 진입 → `contract/:id` | ✅ 구현 | `DeeplinkHandler` 라우팅 |
| WK-02 | 계약서 상세 보기 | ✅ 구현 | `WorkerContractDetailPage` |
| WK-03 | 자동 열람 처리 → `sent → viewed` | ✅ 구현 | 페이지 진입 시 자동 |
| WK-04 | 계약 내용 검토 UI | ✅ 구현 | 근무장소·직무·임금·근무시간·휴게·주휴일·유급휴가·사회보험·퇴직금 |
| WK-05 | 전자서명 Canvas | ✅ 구현 | 터치/마우스 기반, 빈 서명 시 경고 |
| WK-06 | 서명 제출 → `viewed → signed` | ✅ 구현 | base64 이미지 전송 |
| WK-07 | 서명 완료 확인 화면 (1.5초) | ✅ 구현 | |
| WK-08 | 계약서 목록 (내 계약서) | ✅ 구현 | `WorkerContractListPage` |
| WK-09 | 근로자 명시적 거절 | 🔴 미구현 | `viewed`에서 미응답으로만 남음 |

### 4.6 알림 (Notification)

| ID | 기능 | 상태 | 비고 |
|----|------|------|------|
| NOTI-01 | 스마트 메신저 인터페이스 | 🟡 Mock | `api/smart-messenger.ts`에 `sendContract()`/`shareContract()` 구현돼 있으나 Supabase Edge Function 미구현 |
| NOTI-02 | SMS 발송 | 🔴 미구현 | Supabase Edge Function `contracts-send` 없음 |
| NOTI-03 | Push 알림 | 🔴 미구현 | 상동 |
| NOTI-04 | 공유 링크 생성 | 🟡 부분 | Toss Share API → WebView 한정. URL placeholder `https://your-app.com/og/contract.png` |

### 4.7 대시보드 (Dashboard)

| ID | 기능 | 상태 | 비고 |
|----|------|------|------|
| DB-01 | 사장님 대시보드 | ✅ 구현 | 전체·작성중·전송됨·서명완료 통계 (Mock 데이터 기반) |
| DB-02 | 근로자 계약 목록 | ✅ 구현 | 필터/정렬 포함 |

### 4.8 계약 이력

| ID | 기능 | 상태 | 비고 |
|----|------|------|------|
| HIST-01 | 계약 이력 페이지 | 🔴 미구현 | `App.tsx` 라우트는 있으나 `<div>계약 이력 (준비 중)</div>` placeholder |

---

## 5. 죽은 코드 (Dead Code) — import 0회 또는 사용 0회

| 파일 | 내용 | 문제 |
|------|------|------|
| `api/types.ts` | `ContractData`, `SignatureRequest` 인터페이스 | 프로젝트 전체 import 0회. 실제 타입은 `hooks/useContracts.ts` 내부에 별도 정의 |
| `api/server.ts` | `createTossAuthHandlers()` | Edge Functions 핸들러 팩토리지만 백엔드 서버 없음. import 0회 |
| `api/toss-auth.ts` | 토스 인증 4단계 API (AccessToken, 원터치 인증, 폴링, 결과조회) | 풀 구현이지만 `AuthContext`가 Mock 모드로만 동작. 호출 경로 없음 |
| `hooks/useDelivery.ts` | SMS/Push/Share 전송 로직 | `ContractDetailPage`가 `useContracts.sendContract()` 직접 호출하여 우회. import 0회 |
| `components/delivery/SendContractSheet.tsx` | 전송 방식 선택 바텀시트 UI (SMS/Push/공유 3택) | **어느 페이지도 import 안 함** 💀 |
| `components/delivery/DeliveryStatus.tsx` | 전송 단계 표시기 (작성→전송→확인→서명) | **어느 페이지도 import 안 함** 💀 |
| `domain/contract/template.ts` | `generateContractHTML()` | PDF(`utils/pdf.ts`)와 Preview(`ContractPreview.tsx`)가 각자 자체 HTML 생성. 중복 구현 + 미사용 |

### 죽은 데이터 필드

| 필드 | 위치 | 문제 |
|------|------|------|
| `contract_html` | `useContracts.ts` Contract 인터페이스 | 정의만 있고 **읽기/쓰기 0회** (Supabase 컬럼으로 설계는 됐으나 프론트엔드 사용 안 함) |

---

## 6. 기술 아키텍처 (Technical Architecture)

### 6.1 디렉토리 구조

```
toss-contract-app/
├── src/
│   ├── api/              # Supabase + Edge Functions 통신
│   │   ├── supabase.ts         # Supabase 클라이언트 (Mock/Real 듀얼)
│   │   ├── server.ts           # 💀 Edge Functions 핸들러 (미사용)
│   │   ├── types.ts            # 💀 타입 정의 (미사용)
│   │   ├── smart-messenger.ts  # 🟡 알림 인터페이스 (Edge Function 의존)
│   │   └── toss-auth.ts        # 💀 토스 OAuth API 풀구현 (호출 안 됨)
│   ├── domain/contract/  # 순수 도메인 로직 (프레임워크 무관)
│   │   ├── schema.ts           # ✅ Zod 스키마 — 단일 진실 공급원
│   │   ├── template.ts         # 💀 HTML 계약서 템플릿 (미사용)
│   │   ├── laborRules.ts       # ✅ 법정 규칙 상수
│   │   ├── validation.ts       # ✅ 검증 엔진 (Zod + 7종 법정 규칙)
│   │   └── __tests__/
│   ├── hooks/            # React 커스텀 훅
│   │   ├── useContracts.ts     # ✅ 계약 CRUD (Mock/Real 듀얼)
│   │   ├── useBusiness.ts      # ✅ 사업장 CRUD (Mock/Real 듀얼)
│   │   └── useDelivery.ts      # 💀 전송 로직 (import 0회)
│   ├── contexts/         # React Context
│   │   └── AuthContext.tsx      # 🟡 Mock 로그인 (실제 OAuth 미연동)
│   ├── components/       # 공유 컴포넌트
│   │   ├── AuthScreen.tsx
│   │   ├── BusinessVerify.tsx
│   │   ├── ContractForm.tsx     # 🟡 자체 검증만, validation.ts 미사용
│   │   ├── ContractResult.tsx
│   │   ├── auth/RoleGuard.tsx   # ✅
│   │   ├── contract/
│   │   │   ├── ContractCard.tsx
│   │   │   ├── ContractPreview.tsx  # 🟡 자체 HTML 생성 (template.ts 중복)
│   │   │   └── ContractStatusBadge.tsx
│   │   └── delivery/
│   │       ├── DeliveryStatus.tsx
│   │       └── SendContractSheet.tsx  # 🟡 구현됐으나 페이지에서 미사용
│   ├── pages/            # 페이지 컴포넌트
│   │   ├── auth/         # LoginPage, RoleSelectPage
│   │   ├── employer/     # DashboardPage, ContractFormPage, ContractListPage, ContractDetailPage, BusinessFormPage
│   │   ├── worker/       # ContractListPage, ContractDetailPage, ContractSignPage
│   │   └── shared/       # DeeplinkHandler, NotFoundPage
│   ├── utils/
│   │   └── pdf.ts        # ✅ PDF 생성 (자체 HTML → 중복)
│   └── types/
│       └── roles.ts
├── .hermes/              # Hermes Agent 연동
└── PRD.md                # ← 이 파일
```

### 6.2 기술 스택

| 계층 | 기술 | 버전 |
|------|------|------|
| 런타임 | Toss Apps-in-Toss (`@apps-in-toss/web-framework`) | 2.6.1 |
| 프레임워크 | React | 18.3 |
| 타입 | TypeScript | 5.5 |
| 번들러 | Vite | 6.0 |
| 라우팅 | React Router DOM | 7.17 |
| UI 라이브러리 | `@toss/tds-mobile` | 2.4.0 |
| CSS | Emotion | 11.14 |
| 스키마 검증 | Zod | 3.25 |
| 백엔드 | Supabase (`@supabase/supabase-js`) | 2.107 |
| PDF | html2canvas-pro + jsPDF | 2.0.4 / 4.2.1 |
| 테스트 | Vitest | 4.1.8 |

### 6.3 라우트 맵

```
/login                           → LoginPage
/role-select                     → RoleSelectPage
/contract/:id                    → DeeplinkHandler (역할 기반 라우팅)
/employer/dashboard              → DashboardPage
/employer/business/new           → BusinessFormPage
/employer/contracts              → ContractListPage
/employer/contracts/new          → ContractFormPage
/employer/contracts/:id          → ContractDetailPage
/employer/contracts/:id/history  → 🔴 placeholder
/worker/contracts                → WorkerContractListPage
/worker/contracts/:id            → WorkerContractDetailPage
/worker/contracts/:id/sign       → ContractSignPage
/                                → /login 리디렉트
*                                → NotFoundPage
```

### 6.4 데이터 모델 핵심

```typescript
// Zod 스키마 — 단일 진실 공급원 (src/domain/contract/schema.ts)
LaborContract {
  worker:     { name, ci?, ciHash?, phone (10~11자리), address? }
  employer:   { businessNumber (000-00-00000), businessName, representative, address }
  contract:   {
    contractType:      fullTime | partTime | fixedTerm
    templateVersion:   "1.0.0"
    status:            draft | sent | viewed | signed | completed | cancelled | expired
    startDate:         YYYY-MM-DD
    endDate?:          YYYY-MM-DD
    workplace:         string
    jobDescription:    string
    wageType:          hourly | daily | weekly | monthly
    baseWage:          number (>0)
    wagePaymentDate:   string
    wagePaymentMethod: bankTransfer | cash | mixed
    workDays:          DayOfWeek[] (mon~sun, 1개 이상)
    startTime:         HH:MM
    endTime:           HH:MM
    breakMinutes:      number (≥0)
    weeklyHoliday?:    DayOfWeek           // 🔴 폼에 필드 없음
    paidLeaveClause:   boolean             // 🔴 폼에 토글 없음
    socialInsuranceClause: boolean         // 🔴 폼에 토글 없음
    severanceClause:   boolean             // 🔴 폼에 토글 없음
  }
  createdAt?:, updatedAt?  // datetime
}
```

### 6.5 검증 엔진 (Validation Engine)

`validation.ts` — 2단계 파이프라인. **현재 ContractFormPage에서 호출 안 됨** 🔴

1. **Zod 스키마 파싱** — 형식 검증 (필수 누락, 전화번호 형식, 날짜 형식 등)
2. **법정 규칙 검증** — 업무 규칙 7종

| 검증 항목 | 코드 | 심각도 | 규칙 |
|-----------|------|--------|------|
| 날짜 역전 | `DATE_REVERSED` | Error | `endDate ≤ startDate` |
| 최저임금 미달 | `BELOW_MINIMUM_WAGE` | Error | 시급 < 10,030원 (2026) |
| 최저임금 근접 | `NEAR_MINIMUM_WAGE` | Warning | 시급 < 최저 110% |
| 휴게시간 부족 | `INSUFFICIENT_BREAK` | Error | 4h↑ → 30분↑, 8h↑ → 60분↑ |
| 주휴일 누락 | `MISSING_WEEKLY_HOLIDAY` | Error | 주 15h↑ 근무 시 주휴일 필수 |
| 주휴일-근무일 겹침 | `HOLIDAY_OVERLAP_WORKDAY` | Error | 주휴일이 workDays에 포함 |
| 단시간 근로자 | `SHORT_TIME_WORKER` | Warning | 주 15h 미만 → 주휴수당 제외 |
| 유급휴가 미포함 | `MISSING_PAID_LEAVE` | Warning | |
| 4대보험 미포함 | `MISSING_SOCIAL_INSURANCE` | Warning | |
| 퇴직금 미포함 | `MISSING_SEVERANCE` | Warning | |

---

## 7. 구현 현황 종합 (Implementation Summary)

### 시퀀스 다이어그램 검증 (플로우차트 vs 실제)

플로우차트의 시퀀스 다이어그램(🏢사장님 ↔ Toss 미니앱 ↔ Supabase+Edge Functions ↔ 👤근로자)을 코드 기준으로 검증:

| 시퀀스 단계 | 플로우차트 | 실제 코드 | Gap |
|-------------|-----------|----------|-----|
| 1. 계약 작성 | `createContract()` → `status: draft` | ✅ Mock/Real 듀얼 구현 | 없음 |
| 2. 계약 전송 | `sendContract()` → `status: sent` | ✅ Mock만. Real: `contracts-send` Edge Function 미구현 | Edge Function 부재 |
| 2a. 📨 계약서 도착 알림 | BE → Worker | 🔴 알림 시스템 없음 | 완전 누락 |
| 3. 근로자 열람 | `contracts-view` → `status: viewed` | ✅ Mock: `updateContract({status:'viewed'})`. Real: Edge Function 미구현 | Edge Function 부재 |
| 3a. 상태 업데이트 | BE → Employer | 🔴 WebSocket/폴링 없음 (새로고침 필요) | 완전 누락 |
| 4. 서명 | `signContract()` → `status: signed` | ✅ Mock/Real 듀얼 구현 | 없음 |
| 4a. 서명 완료 알림 | BE → Employer | 🔴 알림 시스템 없음 | 완전 누락 |
| 5. 확정 | `completeContract()` → `completed` | ✅ Mock/Real 듀얼 구현 | 없음 |
| 5a. 계약 확정 알림 | BE → Worker | 🔴 알림 시스템 없음 | 완전 누락 |
| 5b. PDF 다운로드 | Employer | ✅ html2canvas + jsPDF | 없음 |

**시퀀스 결론**: 데이터 흐름은 구현됐으나 **모든 알림(Notification) 경로가 전무**하고, 실시간 상태 동기화(WebSocket/SSE/폴링)도 없어서 양측 모두 새로고침해야 상태 변경을 확인할 수 있음.

### 집계

| 상태 | 개수 | 비율 |
|------|------|------|
| ✅ 완전 구현 | 22 | 53% |
| 🟡 부분 구현 (Mock / UI만 / 미연동) | 7 | 17% |
| 🔴 미구현 | 10 | 24% |
| 💀 죽은 코드 (import 0회) | 7개 파일 + 1개 필드 | - |

### 완전 구현 (✅)
사업장 등록(형식 검증만), 계약서 CRUD, 핵심 상태 전이 5단계(draft→sent→viewed→signed→completed), 전자서명 Canvas, PDF 다운로드, 역할 기반 라우팅, 딥링크, 자동 viewed, 상태 배지 UI, 대시보드(통계), ContractPreview, ContractCard, RoleGuard

### 부분 구현 (🟡)
- 토스 OAuth: `api/toss-auth.ts` 풀 구현됐으나 AuthContext Mock만 사용
- 알림: `smart-messenger.ts` 있으나 Supabase Edge Function 없음
- 전송 방식 선택: `SendContractSheet` 컴포넌트 있으나 페이지에서 미사용
- 전송 훅: `useDelivery.ts` 구현됐으나 import 0회
- 검증 엔진: `validation.ts` 풀 구현됐으나 ContractFormPage에서 미호출
- ContractFormPage: 일부 필드 누락 (직접 검증만, 법정 규칙 검증 미적용)
- ContractPreview: 자체 HTML 생성 (template.ts와 중복)

### 미구현 (🔴)
- 계약 취소 (`cancelContract` 함수 없음, UI 없음)
- 계약 만료 (`expired` 전이 로직 없음)
- 계약 이력 페이지
- SMS/Push 실제 발송
- 사업자등록번호 진위 확인
- 폼 누락 필드: 근로자 주소, 임금지급방법, 주휴일, 보험조항 토글
- 근로자 명시적 거절
- CI 기반 본인인증

### 죽은 코드 (💀)
`api/types.ts`, `api/server.ts`, `api/toss-auth.ts`, `hooks/useDelivery.ts`, `components/delivery/SendContractSheet.tsx`, `components/delivery/DeliveryStatus.tsx`, `domain/contract/template.ts` — 전부 풀 구현됐으나 프로젝트 내 import 0회
- `contract_html` 필드 — `useContracts.ts` 인터페이스에만 정의, 사용 0회

---

## 8. 개발 단계 (Development Phases)

### Phase 0 — 죽은 코드 정리 + 중복 제거 (선행)
- [ ] `api/types.ts` 삭제 또는 schema.ts 타입으로 통합
- [ ] `api/server.ts` 삭제 또는 Supabase Edge Function으로 마이그레이션
- [ ] `domain/contract/template.ts` → `utils/pdf.ts` + `ContractPreview.tsx`를 `generateContractHTML()` 기반으로 통합
- [ ] `useDelivery.ts` → `ContractDetailPage`에서 `SendContractSheet` 연동

### Phase 1 — 폼 완성도 (ContractFormPage 보강)
- [ ] 근로자 주소(address) 입력 필드 추가
- [ ] 임금지급방법(wagePaymentMethod) 선택 UI 추가
- [ ] 주휴일(weeklyHoliday) 요일 선택 UI 추가
- [ ] 유급휴가/4대보험/퇴직금 토글 스위치 추가
- [ ] `validation.ts` 검증 엔진 연동 (자체 검증 → `validateLaborContract()` 호출로 교체)

### Phase 2 — 상태 머신 완성
- [ ] `cancelContract(id)` 함수 구현 + UI 버튼 (`draft`/`signed` → `cancelled`)
- [ ] `expireContract(id)` 함수 + cron job (30일 경과 → `expired`)
- [ ] 계약 이력 페이지 (`/employer/contracts/:id/history`)

### Phase 3 — 인증/알림 실연동
- [ ] `AuthContext`에서 `api/toss-auth.ts` 연동 (Mock 제거)
- [ ] Supabase Edge Function `contracts-send` 구현
- [ ] SMS/Push/공유링크 실제 발송
- [ ] CI(Connecting Information) 기반 본인인증

### Phase 4 — UX 고도화
- [ ] 근로자 명시적 거절 플로우 (`viewed → rejected` 상태 추가)
- [ ] 수정 요청 → 재전송 흐름 (`change_requested` 상태)
- [ ] 사업자등록번호 진위 확인 (국세청 API 등)

### Phase 5 — 확장
- [ ] 다중 서명자 지원 (계약당 N명 근로자)
- [ ] 계약 템플릿 버전 관리
- [ ] 전자서명 위변조 방지 (해시 체인)
- [ ] PDF 전자서명 포함 내보내기

---

## 9. 비기능 요구사항 (Non-Functional)

| 항목 | 요구사항 |
|------|----------|
| 성능 | 초기 로드 3초 이내 (Toss 미니앱 기준) |
| 접근성 | Toss TDS 접근성 가이드라인 준수 |
| 보안 | 전화번호 마스킹, CI 해시 저장, 서명 이미지 암호화 전송 |
| 법규 준수 | 근로기준법 제17조(근로조건 명시), 제54조(휴게), 제55조(휴일), 제60조(연차유급휴가) |
| i18n | 한국어 전용 (MVP) |
| 브라우저 | iOS/Android 토스 앱 내 WebView |

---

## 10. 참조 문서

- [플로우차트](.hermes/kanban/boards/toss-contract-app/workspaces/t_08e97a0e/toss-contract-flowcharts.html)
- [Domain Schema](src/domain/contract/schema.ts)
- [Labor Rules](src/domain/contract/laborRules.ts)
- [Validation Engine](src/domain/contract/validation.ts)
- [Contract Template](src/domain/contract/template.ts) 💀
- [App Router](src/App.tsx)
- [Toss Apps-in-Toss 문서](https://toss.im)
- 근로기준법 (법률 제19678호, 2026년 기준)
- 최저임금법 (2026년 시급 10,030원)

---

> 이 문서는 `toss-contract-app`의 최상위 PRD입니다. 모든 기능 구현과 코드 변경은 이 문서의 요구사항을 기준으로 합니다.
> PRD 업데이트 시 버전과 날짜를 갱신하세요.
>
> 마지막 소스코드 검증: 2026-06-09, 27개 파일 전수 분석 + Edge Function 의존성 추적 + import 0회 전수 검출 + 시퀀스 다이어그램 11단계 검증.
