# Toss Contract App — 전면 코드 리뷰

> **프로젝트**: toss-contract-app (근로계약 전자서명 앱)
> **리뷰어**: Gemini (LLM 기반 코드 분석)
> **방식**: 6-Phase 의존성 상향식 (Bottom-up Dependency Review)
> **최종 평결**: 화면과 기획서는 그럴싸하나, 내부 데이터 흐름과 핵심 플로우에 치명적 결함 다수 → 현 상태로 배포 불가

---

## Executive Summary

| 심각도 | 건수 | 대표 이슈 |
|--------|------|-----------|
| 🔴 P0 Blocker | 5 | 근로자 서명 페이지 무한 로딩, 딥링크 리디렉트 유실, contracts-complete API 부재, 직렬화 단절, 4대보험 데이터 유실 |
| 🟠 P1 Major | 3 | 최저임금 검증 우회(월급/일급), 주52시간 미검증, 상태 배지 색상 불일치 |
| 🟡 P2 Minor | 2 | PDF 사장님 서명 누락, 타입 불일치(userKey number/string) |
| 📝 PRD 괴리 | 3 | Dead Code 오표기, 구현 상태 오기, 상태 머신 불일치 |

---

## Review Strategy: 6-Phase 의존성 상향식

AI가 코드를 검토할 땐 **문맥 일관성**과 **의존성 흐름** 기준으로 분할해야 합니다. 아래는 toss-contract-app 구조에 맞춘 6단계 분할입니다.

### Phase 1 — 도메인 규칙 및 데이터 모델 (Foundation)
| 파일 | 역할 |
|------|------|
| `src/domain/contract/schema.ts` | Zod 스키마, 타입 정의 |
| `src/domain/contract/laborRules.ts` | 법정 근로 규칙 상수 |
| `src/domain/contract/validation.ts` | 검증 로직 |
| `src/types/roles.ts` | 역할 타입 |

### Phase 2 — API 계층 및 상태 관리 (Business Logic)
| 파일 | 역할 |
|------|------|
| `src/api/supabase.ts`, `src/api/toss-auth.ts`, `src/api/smart-messenger.ts` | API 통신 |
| `src/contexts/AuthContext.tsx` | 전역 인증 상태 |
| `src/hooks/useContracts.ts`, `src/hooks/useBusiness.ts` | 데이터 훅 |

### Phase 3 — 백엔드 (Supabase Edge Functions & DB)
| 파일 | 역할 |
|------|------|
| `supabase/migrations/001_initial_schema.sql`, `002_rls_policies.sql` | DB 스키마, RLS |
| `supabase/functions/contracts-send/index.ts` | 계약 전송 |
| `supabase/functions/contracts-sign/index.ts` | 서명 처리 |
| `supabase/functions/contracts-view/index.ts` | 열람 처리 |
| `server/` (필요시) | Express 코드 |

### Phase 4 — 공통 및 도메인 컴포넌트 (UI Building Blocks)
| 파일 | 역할 |
|------|------|
| `src/components/auth/RoleGuard.tsx` | 권한 가드 |
| `src/components/contract/ContractCard.tsx` | 계약 카드 |
| `src/components/contract/ContractPreview.tsx` | 계약 미리보기 |
| `src/components/contract/ContractStatusBadge.tsx` | 상태 뱃지 |
| `src/components/delivery/SendContractSheet.tsx` | 전송 시트 |
| `src/components/shared/ContentContainer.tsx` | 레이아웃 컨테이너 |

### Phase 5 — 사장님(Employer) 플로우
| 파일 | 역할 |
|------|------|
| `src/pages/employer/DashboardPage.tsx` | 대시보드 |
| `src/pages/employer/ContractFormPage.tsx` | 계약 작성 폼 (7-Step Wizard) |
| `src/pages/employer/ContractListPage.tsx` | 계약 목록 |
| `src/pages/employer/ContractDetailPage.tsx` | 계약 상세/취소/확정 |
| `src/pages/employer/BusinessFormPage.tsx` | 사업장 등록 |

### Phase 6 — 근로자(Worker) 플로우 및 앱 진입점
| 파일 | 역할 |
|------|------|
| `src/pages/worker/ContractDetailPage.tsx` | 근로자 계약 상세 |
| `src/pages/worker/ContractSignPage.tsx` | 서명 페이지 |
| `src/pages/worker/ContractListPage.tsx` | 근로자 계약 목록 |
| `src/pages/auth/LoginPage.tsx` | 로그인 |
| `src/pages/shared/DeeplinkHandler.tsx` | 딥링크 처리 |
| `src/App.tsx`, `src/main.tsx` | 라우팅, 진입점 |

---

## Phase 1: 도메인 규칙 및 데이터 모델

### 🔴 BUG-001: 월급/일급/주급 최저임금 검증 우회
- **파일**: `src/domain/contract/validation.ts`
- **원인**: `if (contract.wageType === "hourly")` 조건 — 시급일 때만 최저임금 검증
- **영향**: 월급/일급 선택 후 기본급 10만원 입력해도 통과
- **Fix**: 월급/일급/주급도 시급으로 환산 → `MINIMUM_HOURLY_WAGE_2026`과 비교

### 🔴 BUG-002: 주 52시간 최대 근로시간 미검증
- **파일**: `src/domain/contract/validation.ts`
- **원인**: `laborRules.ts`의 `MAX_DAILY_WORK_HOURS`, `MAX_WEEKLY_WORK_HOURS` 상수를 validation에서 미사용
- **영향**: 하루 15시간, 주 105시간 계약서도 에러 없이 통과
- **Fix**: 일 8시간/주 52시간 초과 시 Error 또는 Warning 발생

### 🟠 ISSUE-001: CamelCase ↔ snake_case 직렬화 충돌 예상
- **파일**: `src/domain/contract/schema.ts` vs Supabase DB
- **현상**: Zod 스키마는 `contractType`, `wagePaymentMethod` (CamelCase), DB는 `contract_type`, `wage_payment_method` (snake_case)
- **예상 파급**: 변환 레이어 없으면 Zod 파싱 100% 실패 (`ZOD_INVALID_TYPE`)

### ✅ 잘한 점
- `calcDailyWorkMinutes`: 자정 넘김 근무(22:00~06:00) → `diff + 24 * 60` 처리
- `BREAK_RULES` 역순 탐색 → 가장 높은 기준의 휴게시간만 체크

---

## Phase 2: API 계층 및 상태 관리

### 🔴 BUG-003: 데이터 모델 완전 단절 (Critical)
- **파일**: `src/hooks/useContracts.ts`, `src/hooks/useBusiness.ts`
- **원인**: Zod(CamelCase) ↔ API(snake_case) 변환 레이어 **전무**
- **영향**: UI 폼 데이터를 Zod 검증 후 그대로 API에 넘기면 DB에 null/undefined 저장

### 🟠 ISSUE-002: 인증 로직 타입 미스매치
- **파일**: `src/api/toss-auth.ts` vs `src/contexts/AuthContext.tsx`
- **현상**: `TossUserInfo.userKey` → `number`, `UserProfile.userKey` → `string`
- **Fix**: 타입 통일 (strict 모드에서 충돌)

### 🟡 ISSUE-003: 하드코딩된 딥링크 스킴
- **파일**: `src/api/smart-messenger.ts`
- **현상**: `intoss://bossimclockedin/contract/...` 리터럴 하드코딩
- **리스크**: 배포 시 앱 ID 변경 → 딥링크 작동 불가

### 📝 PRD 불일치
- PRD: AuthContext Mock 모드만 동작
- 실제: `tossLogin()` API 호출 로직 이미 작성됨 (작업 중단 흔적)

---

## Phase 3: 백엔드 (Supabase Edge Functions & DB)

### 🔴 BUG-004: 직렬화 실패 확정 (DB ↔ 프론트 불일치)
- **확인**: `001_initial_schema.sql` 모든 컬럼이 snake_case (`contract_type`, `wage_payment_method` 등)
- **결론**: Mapper 없이 프론트 Zod(CamelCase) 데이터를 Supabase insert/update → 100% 실패

### 🔴 BUG-005: contracts-complete Edge Function 누락
- **파일**: `supabase/functions/` (부재)
- **호출부**: `src/hooks/useContracts.ts` → `completeContract()`
- **영향**: 사장님 계약 확정 버튼 클릭 → 404/500 → completed 상태 진입 불가

### 📝 PRD 괴리
- PRD: contracts-send 미구현(🔴)
- 실제: DB 상태 업데이트 + 이력(contract_history, deliveries) 저장까진 구현, SMS/Push는 TODO 주석 + Mock

### ✅ 잘한 점
- **RLS 근로자 UPDATE 원천 차단**: `FOR UPDATE USING (false)` → 급여/근무조건 조작 방지
- **Security Definer**: `sign_contract` RPC 함수로만 서명 데이터/상태 업데이트 가능

---

## Phase 4: 공통 및 도메인 컴포넌트

### 🟠 BUG-006: 상태 배지 색상 불일치 (UX 혼선)
| 상태 | ContractCard.tsx | ContractStatusBadge.tsx |
|------|-----------------|------------------------|
| `signed` | yellow | green |
| `viewed` | blue | teal |
| `completed` | teal | green |

- **Fix**: 상태별 색상 상수 객체 하나로 통일 (SSOT)

### 🟡 ISSUE-004: PDF 사장님 서명 누락
- **파일**: `src/components/contract/pdf.ts`
- **현상**: 근로자 서명(`worker_signature_data`)만 이미지로 들어가고, 사장님 서명란은 `'(인)'` 텍스트만
- **근본 원인**: DB `contracts` 테이블에 `employer_signature_data` 컬럼 자체가 없음
- **영향**: 계약 확정해도 PDF는 반쪽짜리 전자계약서

### 📝 PRD 오류: Dead Code 오표기
- PRD: `SendContractSheet.tsx` → "어느 페이지도 import 안 함 💀"
- 실제: `ContractDetailPage.tsx`에서 `openSendContractSheet` 정상 import 사용 중

---

## Phase 5: 사장님 플로우

### 🟠 ISSUE-005: 프랑켄슈타인 매핑 (기술 부채)
- **파일**: `src/pages/employer/ContractFormPage.tsx` (Step 5)
- **현상**: Zod(CamelCase) ↔ snake_case 변환을 폼 컴포넌트 중앙에서 수동 하드코딩
  - `path.replace(/[A-Z]/g, m => '_' + m.toLowerCase())` 정규식으로 에러 필드명 역변환
- **리스크**: 스키마 필드 추가 시 매핑 객체 수동 수정 필요

### 🔴 BUG-007: 4대 보험 데이터 영구 유실
- **파일**: `src/pages/employer/ContractFormPage.tsx` (`handleSubmit`)
- **현상**: `pension`, `health_insurance`, `employment_insurance`, `accident_insurance` 4개 개별 스위치를 `social_insurance_clause` 단일 boolean으로 뭉뚱그려 전송
- **영향**: 사용자가 어떤 보험을 켜고 껐는지 DB 도달 전에 소멸

### 🟠 ISSUE-006: 7-Step Wizard UX 붕괴
- **파일**: `src/pages/employer/ContractFormPage.tsx`
- **현상**: Step 5(검증 결과)에 에러만 표시, 입력 폼 없음
- **사용자 경험**: 에러 확인 → '이전' 2~3번 연타 → 값 수정 → '다음' 연타 → 재검증
- **Fix**: 각 Step에서 인라인 검증 or Step 5에서 인라인 수정 가능하도록 변경

### 🟠 BUG-008: ContractListPage 내부 badgeFor() 함수
- **파일**: `src/pages/employer/ContractListPage.tsx`
- **현상**: `ContractStatusBadge.tsx` 공유 컴포넌트 있음에도 내부에 `badgeFor()` 자체 구현
- **영향**: Phase 4에서 발견한 배지 색상 불일치의 근본 원인

---

## Phase 6: 근로자 플로우 및 앱 진입점

### 🔴 BUG-009: 서명 페이지 무한 로딩 (Critical Blocker)
- **파일**: `src/pages/worker/ContractSignPage.tsx`
- **원인**:
  ```tsx
  const [contract, setContract] = useState<Contract | null>(null);
  // ...
  if (!contract) return <...>불러오는 중...</...>;

  useEffect(() => {
    // 데이터를 가져오는 코드가 없음!
  }, [done, id]);
  ```
- **영향**: 근로자 서명 페이지 진입 → `contract` 영원히 null → 무한 "불러오는 중..."

### 🔴 BUG-010: 딥링크 리디렉트 유실
- **파일**: `src/pages/auth/LoginPage.tsx` + `src/pages/shared/DeeplinkHandler.tsx`
- **현상**:
  1. DeeplinkHandler → `/login?redirect=/contract/${id}` 로 리디렉트
  2. LoginPage → `redirect` 파라미터 **완전히 무시**, 하드코딩 경로(`/worker/contracts`, `/employer/dashboard`)로만 이동
- **영향**: SMS/카톡으로 받은 계약서 링크 클릭 → 로그인 → 엉뚱한 빈 목록 화면

### 🟠 ISSUE-007: RLS 정책 ↔ UI 충돌 (근로자 측)
- **파일**: `src/pages/worker/ContractListPage.tsx`
- **현상**: 사장님의 `business_name` 표시 위해 `useBusiness()` 호출
- **충돌**: RLS → `businesses` 테이블은 owner만 조회 가능 → 근로자는 빈 배열 → `c.workplace` 폴백만 노출

---

## All Bugs Consolidated

| ID | Severity | Phase | File | Issue |
|----|----------|-------|------|-------|
| BUG-001 | 🔴 P0 | 1 | `validation.ts` | 월급/일급 최저임금 검증 우회 |
| BUG-002 | 🔴 P0 | 1 | `validation.ts` | 주52시간 최대 근로시간 미검증 |
| BUG-003 | 🔴 P0 | 2 | `useContracts.ts`, `useBusiness.ts` | Zod↔API 직렬화 레이어 부재 |
| BUG-004 | 🔴 P0 | 3 | `001_initial_schema.sql` | CamelCase↔snake_case 직렬화 100% 실패 |
| BUG-005 | 🔴 P0 | 3 | `supabase/functions/` | contracts-complete Edge Function 누락 |
| BUG-006 | 🟠 P1 | 4 | `ContractCard.tsx`, `ContractStatusBadge.tsx` | 상태 배지 색상 불일치 |
| BUG-007 | 🔴 P0 | 5 | `ContractFormPage.tsx` | 4대 보험 데이터 영구 유실 |
| BUG-008 | 🟠 P1 | 5 | `ContractListPage.tsx` | badgeFor() 중복 구현 |
| BUG-009 | 🔴 P0 | 6 | `ContractSignPage.tsx` | 근로자 서명 페이지 무한 로딩 |
| BUG-010 | 🔴 P0 | 6 | `LoginPage.tsx` | 딥링크 redirect 유실 |

---

## Action Items (우선순위 순)

### P0 — 즉시 수정 (배포 불가 블로커)

| # | 항목 | 파일 |
|---|------|------|
| 1 | ContractSignPage 무한 로딩: useEffect에 `getContract(id)` 호출 추가 | `ContractSignPage.tsx` |
| 2 | LoginPage 딥링크: `redirect` 파라미터 읽어서 로그인 후 해당 경로로 이동 | `LoginPage.tsx` |
| 3 | contracts-complete Edge Function 작성 | `supabase/functions/contracts-complete/index.ts` |
| 4 | CamelCase↔snake_case Mapper 유틸리티 분리 및 전역 적용 | 신규 `src/lib/mapper.ts` |
| 5 | 4대 보험 데이터: 개별 필드(`pension`, `health_insurance`, `employment_insurance`, `accident_insurance`)를 DB에 각각 저장하도록 수정 | `ContractFormPage.tsx` |

### P1 — 빠른 시일 내 수정

| # | 항목 | 파일 |
|---|------|------|
| 6 | 최저임금 검증: 월급/일급/주급도 시급 환산 후 `MINIMUM_HOURLY_WAGE_2026` 비교 | `validation.ts` |
| 7 | 주52시간/일8시간 검증 로직 추가 | `validation.ts` |
| 8 | 상태 배지 색상 SSOT 상수화, ContractListPage의 badgeFor() 제거 | `ContractStatusBadge.tsx`, `ContractListPage.tsx` |

### P2 — 기술 부채 해소

| # | 항목 | 파일 |
|---|------|------|
| 9 | `userKey` 타입 통일 (number vs string) | `toss-auth.ts`, `AuthContext.tsx` |
| 10 | PDF 사장님 서명: DB `employer_signature_data` 컬럼 + pdf.ts 템플릿 추가 | 마이그레이션, `pdf.ts` |
| 11 | 딥링크 스킴 상수화 | `smart-messenger.ts` |
| 12 | 7-Step Wizard UX 개선: 각 Step 인라인 검증 또는 Step 5 인라인 수정 | `ContractFormPage.tsx` |
| 13 | PRD.md 상태 및 구현 현황 최신화 | `PRD.md` |

---

## AI 입력 노하우

1. **초기화 컨텍스트 제공**: 첫 질문에 PRD를 먼저 던져주고, "6단계로 나눠서 줄 테니 읽고 '확인함'이라고만 해" 방식으로 지시 → 토큰 절약
2. **연관 파일 묶기**: 로직 위주(`.ts`, `.tsx`, `.sql`)로 묶고 CSS는 생략 (스타일링 이슈가 목적이 아니라면)
3. **의존성 순서**: Phase 1→6 순으로 진행해야 AI가 문맥을 잃지 않음
