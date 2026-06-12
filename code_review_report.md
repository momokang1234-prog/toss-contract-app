# 🔍 Toss 전자 근로계약서 앱 — 소스코드 리뷰 & 출시 로드맵

> 분석일: 2026-06-12 | 분석 범위: 프론트엔드 27개 파일 + 서버 + Supabase 스키마 전수

---

## 📊 현재 완성도 요약

```
전체 기능 완성도:  ████████████░░░░░░░░ 60%
핵심 플로우 (MVP): ████████████████░░░░ 80%
프로덕션 배포 준비: ████████░░░░░░░░░░░░ 40%
```

| 구분 | 개수 | 비율 |
|------|------|------|
| ✅ 완전 구현 | 22개 기능 | 53% |
| 🟡 부분 구현 (Mock/미연동) | 7개 기능 | 17% |
| 🔴 미구현 | 10개 기능 | 24% |
| 💀 죽은 코드 (import 0회) | 7개 파일 + 1개 필드 | — |
| ❌ TypeScript 오류 | 6개 | — |

---

## 🔴 카테고리 1: 크리티컬 블로커 (출시 불가 사유)

출시 전 **반드시** 해결해야 하는 항목입니다.

### 1-1. Mock 모드 전환 불가 — 전체 백엔드가 Mock
- **파일**: [supabase.ts](file:///Users/ganghyeon-ug/Desktop/%F0%9F%92%BC%20%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8/AI_Agents/TOSS/toss-contract-app/src/api/supabase.ts)
- **문제**: `IS_MOCK` 플래그가 `true` (환경변수 미설정). Supabase 프로젝트 생성 및 실 연동 필요
- **영향**: 모든 데이터가 메모리(`mockContractStore`)에만 존재 → 새로고침 시 유실

### 1-2. 토스 인증 미연동
- **파일**: [AuthContext.tsx](file:///Users/ganghyeon-ug/Desktop/%F0%9F%92%BC%20%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8/AI_Agents/TOSS/toss-contract-app/src/contexts/AuthContext.tsx)
- **문제**: Mock 프로필(`테스트 사장님`, `김알바`)로만 동작. 실제 `tossLogin()` 호출 경로는 있으나 토스 앱 환경에서만 테스트 가능
- **파일**: [toss-auth.ts](file:///Users/ganghyeon-ug/Desktop/%F0%9F%92%BC%20%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8/AI_Agents/TOSS/toss-contract-app/src/api/toss-auth.ts) — API 서버 `bossimclockedin-api.fly.dev` 가용성 미검증

### 1-3. Supabase Edge Functions 미구현
- **위치**: [supabase/functions/](file:///Users/ganghyeon-ug/Desktop/%F0%9F%92%BC%20%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8/AI_Agents/TOSS/toss-contract-app/supabase/functions/) — 디렉토리만 존재, 함수 코드 없음
- **필요한 함수**:
  - `contracts-send` — 계약서 전송 + 상태 전이
  - `contracts-sign` — 근로자 서명 처리
  - `contracts-view` — 근로자 열람 처리
- **영향**: Real 모드 시 `supabase.functions.invoke()` 호출 전부 실패

### 1-4. TypeScript 컴파일 오류 6건

| 파일 | 오류 | 심각도 |
|------|------|--------|
| [ContractResult.tsx](file:///Users/ganghyeon-ug/Desktop/%F0%9F%92%BC%20%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8/AI_Agents/TOSS/toss-contract-app/src/components/ContractResult.tsx) | `spacing` prop이 `Flex`에 없음 | TDS API 변경 |
| [main.tsx](file:///Users/ganghyeon-ug/Desktop/%F0%9F%92%BC%20%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8/AI_Agents/TOSS/toss-contract-app/src/main.tsx) | 미사용 `React` import | 경미 |
| [BusinessFormPage.tsx](file:///Users/ganghyeon-ug/Desktop/%F0%9F%92%BC%20%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8/AI_Agents/TOSS/toss-contract-app/src/pages/employer/BusinessFormPage.tsx) | `Top` 컴포넌트에 `onBack` prop 없음 | TDS API 오류 (2곳) |
| [ContractListPage.tsx](file:///Users/ganghyeon-ug/Desktop/%F0%9F%92%BC%20%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8/AI_Agents/TOSS/toss-contract-app/src/pages/employer/ContractListPage.tsx) | `Badge` color 타입 불일치 | 타입 가드 필요 |
| [ContractListPage.tsx](file:///Users/ganghyeon-ug/Desktop/%F0%9F%92%BC%20%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8/AI_Agents/TOSS/toss-contract-app/src/pages/worker/ContractListPage.tsx) (Worker) | 동일 `Badge` color 타입 불일치 | 타입 가드 필요 |

### 1-5. PDF 다운로드 미연결
- **파일**: [ContractDetailPage.tsx#L191](file:///Users/ganghyeon-ug/Desktop/%F0%9F%92%BC%20%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8/AI_Agents/TOSS/toss-contract-app/src/pages/employer/ContractDetailPage.tsx#L191)
- **현상**: `completed` 상태에서 PDF 다운로드 버튼이 `alert('추후 제공')` → 실제 `downloadContractPDF()` 호출 안 함
- [pdf.ts](file:///Users/ganghyeon-ug/Desktop/%F0%9F%92%BC%20%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8/AI_Agents/TOSS/toss-contract-app/src/utils/pdf.ts)에 풀 구현 되어 있으나 import되지 않음

---

## 🟠 카테고리 2: 법적 리스크 (근로기준법 준수)

> [!CAUTION]
> 전자 근로계약서 앱은 근로기준법 제17조(근로조건 명시), 제54조(휴게), 제55조(휴일) 등을 반드시 준수해야 합니다. 아래 항목은 법적 분쟁 시 사용자에게 불이익을 줄 수 있는 미비사항입니다.

### 2-1. 검증 엔진 미연동 ⚠️
- **파일**: [ContractFormPage.tsx#L172-L209](file:///Users/ganghyeon-ug/Desktop/%F0%9F%92%BC%20%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8/AI_Agents/TOSS/toss-contract-app/src/pages/employer/ContractFormPage.tsx#L172)
- **현상**: Step 5 "법정 검증"에서 `validateLaborContract()` 호출은 구현됨 ✅ 
- **문제**: Step 5를 **건너뛰고** Step 6(최종 확인)에서 바로 저장 가능 — 검증 결과가 `valid === false`여도 저장을 차단하지 않음
- **필요 조치**: `handleSubmit()`에서 `validationResult?.valid === false`일 때 저장 차단

### 2-2. 최저임금 검증이 시급에만 적용
- **파일**: [validation.ts#L117](file:///Users/ganghyeon-ug/Desktop/%F0%9F%92%BC%20%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8/AI_Agents/TOSS/toss-contract-app/src/domain/contract/validation.ts#L117)
- **현상**: `wageType === 'hourly'`인 경우만 최저임금 검증 → 월급/일급/주급은 시급 환산 없이 통과
- **법적 리스크**: 월급 200만원(시급 환산 시 최저임금 미달) 계약서가 무검증 통과

### 2-3. 주휴일 미지정 시 경고만
- 주 15시간 이상 근무하면서 주휴일 미설정 시 `errors`에 추가되지만, Step 5를 건너뛰면 무의미

### 2-4. 4대보험 개별 항목 ↔ Schema 매핑 불일치
- **폼**: 국민연금/건강보험/고용보험/산재보험 개별 토글 4개
- **Schema**: `socialInsuranceClause` 단일 boolean
- **현재 변환**: `form.pension || form.health_insurance || ...` — 하나라도 `true`면 전체 `true`
- **문제**: 산재보험만 가입하고 나머지 미가입인 경우 "4대보험 적용"으로 PDF에 표시됨

---

## 🟡 카테고리 3: 기능 완성도 Gap

### 3-1. 알림 시스템 전무
- SMS, Push, 인박스 — 모든 알림 경로가 미구현
- [smart-messenger.ts](file:///Users/ganghyeon-ug/Desktop/%F0%9F%92%BC%20%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8/AI_Agents/TOSS/toss-contract-app/src/api/smart-messenger.ts)에 인터페이스만 존재
- **영향**: 근로자가 계약서를 받았다는 것을 알 방법이 없음 (링크 직접 전달해야 함)

### 3-2. 실시간 상태 동기화 없음
- WebSocket/SSE/폴링 없음 → 양측 모두 새로고침해야 상태 변경 확인
- 사장님이 계약서 전송해도 근로자 화면 자동 반영 안 됨

### 3-3. 계약 만료 자동화 미완성
- [useContracts.ts#L219-L227](file:///Users/ganghyeon-ug/Desktop/%F0%9F%92%BC%20%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8/AI_Agents/TOSS/toss-contract-app/src/hooks/useContracts.ts#L219) — Mock 모드의 `getContract()` 내부에서만 30일 만료 처리
- Real 모드: Supabase cron job 또는 DB trigger 필요

### 3-4. 근로자 명시적 거절 플로우 없음
- 근로자가 계약서를 거부할 UI/API가 없음 → `viewed` 상태에서 무한정 대기

### 3-5. 사용자 역할 전환 보안 부재
- [DashboardPage.tsx#L119](file:///Users/ganghyeon-ug/Desktop/%F0%9F%92%BC%20%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8/AI_Agents/TOSS/toss-contract-app/src/pages/employer/DashboardPage.tsx#L119) — 버튼 하나로 `사장님 ↔ 근로자` 역할 전환 가능
- 프로덕션에서는 인증 기반 역할 결정이 필요

---

## 🔵 카테고리 4: 코드 품질 & 아키텍처

### 4-1. 죽은 코드 정리 필요 (7개 파일)

| 파일 | 용도 | 상태 |
|------|------|------|
| ~~`api/types.ts`~~ | Contract 타입 정의 | 삭제됨 ✅ (이미 없음) |
| [api/toss-auth.ts](file:///Users/ganghyeon-ug/Desktop/%F0%9F%92%BC%20%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8/AI_Agents/TOSS/toss-contract-app/src/api/toss-auth.ts) | 토스 OAuth 풀 구현 | AuthContext에서 import하지만 Mock 모드만 사용 |
| [hooks/useDelivery.ts](file:///Users/ganghyeon-ug/Desktop/%F0%9F%92%BC%20%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8/AI_Agents/TOSS/toss-contract-app/src/hooks/useDelivery.ts) | SMS/Push/Share 로직 | 💀 import 0회 |
| [components/delivery/DeliveryStatus.tsx](file:///Users/ganghyeon-ug/Desktop/%F0%9F%92%BC%20%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8/AI_Agents/TOSS/toss-contract-app/src/components/delivery/DeliveryStatus.tsx) | 전송 단계 표시기 | 💀 import 0회 |
| [domain/contract/template.ts](file:///Users/ganghyeon-ug/Desktop/%F0%9F%92%BC%20%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8/AI_Agents/TOSS/toss-contract-app/src/domain/contract/template.ts) | HTML 계약서 템플릿 | 💀 `pdf.ts`와 중복 |
| `contract_html` 필드 | Contract 인터페이스 | 읽기/쓰기 0회 |

### 4-2. 타입 이중 정의
- **Zod 스키마** ([schema.ts](file:///Users/ganghyeon-ug/Desktop/%F0%9F%92%BC%20%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8/AI_Agents/TOSS/toss-contract-app/src/domain/contract/schema.ts)): `LaborContract` — `camelCase`
- **Hook 인터페이스** ([useContracts.ts#L5-L37](file:///Users/ganghyeon-ug/Desktop/%F0%9F%92%BC%20%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8/AI_Agents/TOSS/toss-contract-app/src/hooks/useContracts.ts#L5)): `Contract` — `snake_case` (DB 스키마 기준)
- 두 타입 간 변환 없이 각자 사용 → 동기화 깨질 위험

### 4-3. ContractFormPage 613줄 모놀리스
- [ContractFormPage.tsx](file:///Users/ganghyeon-ug/Desktop/%F0%9F%92%BC%20%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8/AI_Agents/TOSS/toss-contract-app/src/pages/employer/ContractFormPage.tsx) — 7단계 위저드가 단일 컴포넌트에 전부 포함
- 각 Step을 독립 컴포넌트로 분리 권장

### 4-4. Mock 데이터 하드코딩 문제
- [useContracts.ts#L40-L175](file:///Users/ganghyeon-ug/Desktop/%F0%9F%92%BC%20%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8/AI_Agents/TOSS/toss-contract-app/src/hooks/useContracts.ts#L40) — 5개 Mock 계약서에 `'아르바이트'`, `'프리랜서'` 같은 한글 값이 있지만, 실제 Schema enum은 `'fullTime' | 'partTime' | 'fixedTerm'` — Mock과 Schema 불일치

### 4-5. 에러 핸들링 부족
- `catch` 블록 대부분이 `alert()` 또는 빈 `catch {}` → 사용자에게 디버그 정보 없음
- [ContractSignPage.tsx#L22](file:///Users/ganghyeon-ug/Desktop/%F0%9F%92%BC%20%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8/AI_Agents/TOSS/toss-contract-app/src/pages/worker/ContractSignPage.tsx#L22) — 빈 `useEffect` (의미 없는 코드)

---

## 🟣 카테고리 5: 보안

> [!WARNING]
> 전자 근로계약서는 개인정보(성명, 전화번호, 서명 이미지)를 다루므로 보안이 매우 중요합니다.

### 5-1. 서명 이미지 평문 전송
- [ContractSignPage.tsx#L75](file:///Users/ganghyeon-ug/Desktop/%F0%9F%92%BC%20%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8/AI_Agents/TOSS/toss-contract-app/src/pages/worker/ContractSignPage.tsx#L75) — `canvas.toDataURL('image/png')` → base64 그대로 Supabase에 저장
- 서명 위변조 방지 없음 (해시/타임스탬프 미포함)

### 5-2. RLS 정책 우회 가능성
- [002_rls_policies.sql#L56](file:///Users/ganghyeon-ug/Desktop/%F0%9F%92%BC%20%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8/AI_Agents/TOSS/toss-contract-app/supabase/migrations/002_rls_policies.sql#L56) — 근로자의 계약서 UPDATE 정책이 `FOR UPDATE USING (false)` → `sign_contract()` 함수만 `SECURITY DEFINER`로 우회
- 하지만 프론트엔드는 `supabase.from('contracts').update()` 직접 호출 → RLS에 의해 실패할 수 있음

### 5-3. 전화번호 마스킹 미적용
- 계약서 상세 페이지에서 전화번호 전체가 노출 (`01012345678`)
- 부분 마스킹 처리 필요 (`010****5678`)

### 5-4. CI(Connecting Information) 미활용
- Schema에 `ci`, `ciHash` 필드가 있으나 사용 안 됨 → 본인 확인 없이 서명 가능

### 5-5. API Key 노출
- [toss-auth.ts#L3](file:///Users/ganghyeon-ug/Desktop/%F0%9F%92%BC%20%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8/AI_Agents/TOSS/toss-contract-app/src/api/toss-auth.ts#L3) — `API_BASE`가 하드코딩 (`bossimclockedin-api.fly.dev`). 환경변수로 분리 필요

---

## ⚪ 카테고리 6: UX 폴리시

### 6-1. 로딩 상태 처리 부족
- [ContractSignPage.tsx#L84](file:///Users/ganghyeon-ug/Desktop/%F0%9F%92%BC%20%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8/AI_Agents/TOSS/toss-contract-app/src/pages/worker/ContractSignPage.tsx#L84) — `contract === null`이면 로딩 표시하지만 실제 `getContract()` 호출이 없음 → 영원히 로딩
- ContractDetail, ContractSign 페이지에서 실 데이터 로딩이 일관적이지 않음

### 6-2. Suspense fallback이 `null`
- [App.tsx#L23](file:///Users/ganghyeon-ug/Desktop/%F0%9F%92%BC%20%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8/AI_Agents/TOSS/toss-contract-app/src/pages/employer/ContractFormPage.tsx) — `Lazy` 래퍼가 `fallback={null}` → 페이지 전환 시 빈 화면 깜빡임

### 6-3. Overlay Provider 누락
- [SendContractSheet.tsx](file:///Users/ganghyeon-ug/Desktop/%F0%9F%92%BC%20%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8/AI_Agents/TOSS/toss-contract-app/src/components/delivery/SendContractSheet.tsx) — `overlay-kit` 사용하지만 `main.tsx`에 `OverlayProvider` 래핑이 보이지 않음

### 6-4. 접근성 (a11y)
- Canvas 전자서명에 키보드/스크린리더 대안 없음
- 색상 대비비 미검증 (특히 경고 텍스트 `#8B6F00`)

---

## 🗺️ 출시까지 우선순위별 로드맵

### Phase 0: 빌드 안정화 (1~2일)
- [ ] TypeScript 컴파일 오류 6건 수정
- [ ] 죽은 코드 정리 또는 연결
- [ ] `OverlayProvider` 래핑 추가
- [ ] PDF 다운로드 버튼 → `downloadContractPDF()` 연결
- [ ] 빈 `useEffect` 제거 (ContractSignPage L22)

---

### Phase 1: 법적 안전장치 강화 (3~5일)
- [ ] 검증 엔진 결과가 `invalid`일 때 계약서 저장 차단
- [ ] 최저임금 검증을 모든 임금유형으로 확장 (시급 환산)
- [ ] 4대보험 개별 항목 → Schema 매핑 정확히
- [ ] Mock 데이터의 `contract_type` 값 → Schema enum 정합성 맞춤

---

### Phase 2: 백엔드 실연동 (1~2주)
- [ ] Supabase 프로젝트 생성 + 환경변수 설정
- [ ] DB 마이그레이션 실행 (001, 002)
- [ ] Edge Functions 3개 구현 (contracts-send/sign/view)
- [ ] `IS_MOCK` → `false` 전환 테스트
- [ ] 토스 인증 실 연동 검증 (토스 앱 WebView 환경)

---

### Phase 3: 핵심 기능 완성 (1~2주)
- [ ] 알림 시스템 (최소 토스 스마트 메시지 1가지)
- [ ] 계약 취소 UI + `cancelContract()` 상태 전이 검증
- [ ] 계약 만료 자동화 (Supabase cron or pg_cron)
- [ ] 근로자 명시적 거절 플로우
- [ ] 계약 이력 페이지 실 데이터 연결

---

### Phase 4: 보안 강화 (1주)
- [ ] 서명 이미지 해시 + 타임스탬프 첨부
- [ ] 전화번호 마스킹 처리
- [ ] API_BASE 환경변수 분리
- [ ] RLS 정책과 프론트엔드 호출 패턴 일치 검증
- [ ] XSS 방지 (PDF HTML 생성 시 사용자 입력 이스케이프)

---

### Phase 5: UX 폴리시 + QA (1주)
- [ ] 로딩/에러 상태 일관성 확보
- [ ] Suspense fallback 스켈레톤 UI 추가
- [ ] 접근성 감사 (색상 대비, 키보드 네비게이션)
- [ ] 에러 핸들링 체계화 (Sentry 등 모니터링)
- [ ] E2E 테스트 (MVP 플로우: 작성→전송→서명→확정→PDF)

---

## ✅ 잘 구현된 부분 (긍정적 평가)

| 항목 | 평가 |
|------|------|
| **도메인 모델 분리** | `domain/contract/` 순수 함수 기반 — 프레임워크 비의존, 테스트 용이 |
| **Zod 스키마** | 단일 진실 공급원으로 설계. 검증 규칙 7종 풀 구현 |
| **법정 규칙 상수화** | `laborRules.ts`에 최저임금, 휴게시간 규칙 등 중앙 관리 |
| **Mock/Real 듀얼 구조** | `IS_MOCK` 플래그로 백엔드 전환 가능한 구조 |
| **계약서 작성 위저드** | 7단계 스텝 폼 — 세션 복구, 이탈 경고, 법정 검증 통합 |
| **전자서명 Canvas** | 터치/마우스 모두 지원, 빈 서명 방지, 이탈 경고 |
| **PDF 생성** | A4 규격 2페이지, Pretendard 폰트, 다중 페이지 지원 |
| **DB 스키마** | RLS 정책, `sign_contract` SECURITY DEFINER 함수 — 보안 고려 |
| **상태 머신** | 7상태(draft→sent→viewed→signed→completed→cancelled→expired) 체계적 설계 |

---

## 📋 결론

> [!IMPORTANT]
> **현재 상태**: MVP 핵심 플로우(작성→전송→서명→확정)의 프론트엔드는 ~80% 완성되었으나, **백엔드 실연동이 전무**하고 **법적 검증 강제가 부족**하여 프로덕션 배포 불가 상태입니다.
>
> **예상 소요**: Phase 0~3까지 최소 **4~6주** 필요. Phase 4~5 포함 시 **7~8주**.
>
> **즉시 착수 권장**: Phase 0(빌드 안정화)를 먼저 진행하면 나머지 작업의 기반이 됩니다.

이 리뷰를 기반으로 우선순위를 결정하시면, 구체적인 구현 계획을 작성해드리겠습니다.

---

## 🔵 카테고리 7: 2026-06-12 업데이트 — 신규 도입 패턴

> 추가일: 2026-06-12 | 작업: Toss 공식 패키지 4종 도입 + QA 버그 수정

### 7-1. 도입된 Toss 오픈소스 패키지

| 패키지 | 버전 | 적용 위치 | 효과 |
|--------|------|----------|------|
| `overlay-kit` | latest | `main.tsx` OverlayProvider, `SendContractSheet.tsx` async overlay | 수동 `showSheet` state 80줄 제거, Promise 기반 시트 관리 |
| `es-hangul` | latest | `ContractFormPage.tsx` 검증 메시지 10곳, `ContractDetailPage.tsx` confirm 3곳 | `josa()`로 동적 한글 조사 자동화 (을/를, 이/가, 은/는) |
| `@suspensive/react` | latest | `ContractListPage.tsx` (employer + worker) | 200ms Delay + pulsing skeleton 로딩 |
| `@use-funnel/browser` | latest | 설치 완료, 위자드 리팩토링 예정 | 타입 안전 다단계 폼 상태 관리 |

### 7-2. 강건성 버그 수정 (6건)

| # | 버그 | 수정 파일 | 방법 |
|---|------|----------|------|
| 1 | 인증 새로고침 시 소멸 | `AuthContext.tsx` | `useState` 초기값을 `sessionStorage`에서 복구 |
| 2 | 위자드 폼 새로고침 시 데이터 소멸 | `ContractFormPage.tsx` | `wiz_form` + `wiz_step` `sessionStorage` 자동 저장·복구 |
| 3 | 위자드 데이터 있을 때 페이지 이탈 무방비 | `ContractFormPage.tsx` | `beforeunload` 이벤트 경고 |
| 4 | 서명 그린 상태에서 페이지 이탈 | `ContractSignPage.tsx` | `hasSignature`일 때 `beforeunload` 경고 |
| 5 | "전송" 버튼 더블클릭 → 모달 내 "링크 복사" 실행 | `ContractDetailPage.tsx` | `if (!showSheet)` 가드 추가 |
| 6 | 전송 바텀시트 수동 state 80줄 → overlay-kit 6줄 | `SendContractSheet.tsx`, `ContractDetailPage.tsx` | `overlay.openAsync<boolean>()` Promise API |

### 7-3. QA 발견 버그 수정 (3건)

| # | 시나리오 | 발견 | 수정 |
|---|---------|------|------|
| 1 | Step 3: 시작 시간 > 종료 시간 | 🔴 허용됨 (20:00 ~ 08:00 통과) | `start_time >= end_time` → "종료 시간은 시작 시간보다 늦어야 합니다" 오류 |
| 2 | Step 4: 산재보험 OFF | 🔴 법정 의무가입임에도 통과 | `!form.accident_insurance` → Step 4 통과 불가 |
| 3 | Step 4→5 fall-through | 🔴 `case 4`에 `break` 누락 → 검증 건너뜀 | `break` 추가 |

### 7-4. 신규 생성 파일

| 파일 | 용도 |
|------|------|
| `.claude/agents/ux-auditor.md` | UX·접근성·한글화 감사 에이전트 |
| `.claude/agents/robustness-auditor.md` | 중단·뒤로가기·버그 탐지 에이전트 |
| `.claude/agents/functional-qa.md` | 18개 시나리오 입력·클릭·결과 검증 QA 에이전트 |
| `src/components/delivery/SendContractSheet.tsx` | 계약서 전송 바텀시트 (스마트메시지·공유·링크복사) |
| `src/components/ErrorBoundary.tsx` | React 렌더링 오류 캐치 + 스택 트레이스 표시 |
| `public/showcase.html` | 전체 10개 페이지 스크린샷 + 상태 배지 쇼케이스 |
| `public/screenshots/` | 페이지별 390×844 스크린샷 10장 |
| `README.md` | 기술 스택·페이지 구조·상태 머신·연동 문서 |

### 7-5. WheelDatePicker 도입

- **파일**: `ContractFormPage.tsx`
- **변경**: `<TextField type="date">` → `<WheelDatePicker>` (TDS 공식 휠 캘린더)
- **대상**: 시작일, 종료일 (Step 1)
- **형식**: `date.toISOString().slice(0, 10)` → `yyyy-MM-dd` 문자열 변환

### 7-6. 역할 전환 개선

- **파일**: `DashboardPage.tsx` (employer), `ContractListPage.tsx` (worker)
- **변경**: 하단 "🔄 근로자로 전환" / "🔄 사장님으로 전환" 버튼 추가
- **동작**: `setRole()` → `sessionStorage` 저장 → 해당 대시보드로 `navigate`
- **효과**: `/login` 재방문 없이 한 화면에서 역할 전환 가능

### 7-7. 내비게이션 바 설정

- **파일**: `granite.config.ts`
- **설정**:
  - `withBackButton: true` — 뒤로가기 버튼
  - `withHomeButton: true` — 홈 버튼
  - `initialAccessoryButton` — 우측 상단 공유 버튼 (`icon-share-mono`)
- **이벤트**: `App.tsx`에서 `tdsEvent.addEventListener('navigationAccessoryEvent')`로 공유 처리
- **참고**: `tdsEvent`는 브라우저 dev 환경에서 `try/catch`로 보호 — 토스 앱 WebView에서만 활성화

### 7-8. 원격 접속 (Tailscale)

| 접속 방식 | URL |
|----------|-----|
| 로컬 (맥북) | `http://localhost:5173` |
| 로컬 WiFi (폰) | `http://192.168.0.3:5173` |
| Tailscale VPN (외부) | `http://100.109.112.102:5173` |

---

## 🔴 카테고리 8: 잔여 TypeScript 오류 (2026-06-12 기준)

| 파일 | 오류 | 상태 |
|------|------|------|
| `ContractResult.tsx` | `spacing` prop이 `Flex`에 없음 | 미해결 |
| `BusinessFormPage.tsx` | `Top` 컴포넌트 `onBack` prop 없음 (2곳) | 미해결 |
| `ContractListPage.tsx` | `Badge` color 타입 불일치 | 미해결 |
| `ContractListPage.tsx` (Worker) | 동일 `Badge` color 타입 불일치 | 미해결 |

---

## ✅ 2026-06-12 업데이트로 해결된 항목

| 기존 보고서 항목 | 해결 |
|------|------|
| **6-3**: Overlay Provider 누락 | `main.tsx`에 `OverlayProvider` 래핑 완료 |
| **6-1**: 로딩 상태 처리 부족 | `@suspensive/react` 스켈레톤 로딩 추가 (employer + worker 목록) |
| **2-1**: 검증 통과 없이 Step 6 저장 가능 | `validateStep(5)`에서 `valid === false` 시 `return false` → Step 7 진입 불가 |
| **4-1**: 죽은 코드 | `api/types.ts`, `hooks/useDelivery.ts`, `DeliveryStatus.tsx`, `template.ts` 삭제 완료 |
| **3-5**: 역할 전환 버튼 | 대시보드에 명시적 전환 버튼 추가 (보안은 Phase 4에서 처리) |
| **품질**: 빈 `useEffect` (ContractSignPage L22) | 삭제 완료 |
| **품질**: 미사용 import (useEffect, josa, getContract) | 3건 정리 완료 |
| **품질**: `api/smart-messenger.ts` 누락된 `catch` | 추가 완료 |
