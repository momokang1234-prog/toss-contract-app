---
title: IS_MOCK 모드 및 Un-mocking 로드맵
type: topic
created: 2026-06-26
updated: 2026-06-26
sources:
  - 6ce267c1-60fe-4833-b7b1-194969b9f2d6
tags:
  - is-mock
  - mock
  - tech-debt
  - production-readiness
  - supabase
  - auth
---

# IS_MOCK 모드 및 Un-mocking 로드맵

## IS_MOCK 플래그 정의

`src/api/supabase.ts` (6번 줄):

```ts
export const IS_MOCK =
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl.includes('your-project') ||
  supabaseUrl.includes('placeholder') ||
  (typeof window !== 'undefined' && sessionStorage.getItem('force_mock') === 'true');
```

- 환경변수 미설정 or placeholder값이면 자동으로 Mock 모드
- `sessionStorage.setItem('force_mock', 'true')`로 강제 활성화 가능
- 테스트에서는 `vi.mock('../api/supabase', () => ({ supabase: {}, IS_MOCK: true }))` 형태로 모킹

## IS_MOCK 사용 위치 (전체 스캔 결과 — 2026-06-26 기준)

| 파일 | 줄 | 용도 |
|------|----|------|
| `src/api/__tests__/smart-messenger.test.ts` | 10 | 테스트 모킹 |
| `src/api/businessValidator.ts` | 1, 60 | 사업자번호 검증 분기 |
| `src/api/supabase.ts` | 6, 8 | 플래그 정의 및 경고 |
| `src/contexts/AuthContext.tsx` | 52, 56, 61, 68, 75, 86, 145, 151 | 인증 전체 분기 |
| `src/hooks/useBusiness.ts` | 2, 93, 118, 143 | 사업장 CRUD 분기 |
| `src/hooks/useContracts.ts` | 2, 18, 42 | 계약서 CRUD 분기 |
| `src/pages/auth/LoginPage.tsx` | 4, 91 | 버튼 레이블 "(Mock)" 표시 |
| `src/pages/employer/ContractDetailPage.tsx` | 3, 91 | 실시간 구독 비활성화 |
| `src/pages/employer/contract-form/__tests__/buildContractData.test.ts` | 5 | 테스트 모킹 |
| `src/pages/worker/ContractDetailPage.tsx` | 3, 130 | 실시간 구독 비활성화 |

## 현재 Mock으로 동작 중인 기능 4가지

### 1. 로그인 및 인증 — `src/contexts/AuthContext.tsx`

- **현재 동작**: 로그인 버튼 클릭 시 `sessionStorage`에 가짜 세션 생성 (`mock_role: 'employer' | 'worker'`)
- **실제 구현 시 필요**: Supabase Auth (이메일/소셜 로그인) + JWT 토큰 세션 관리

```ts
// AuthContext.tsx:52 (Mock 분기 예시)
if (IS_MOCK) return !!sessionStorage.getItem('mock_role');
```

### 2. 계약서 저장/불러오기 — `src/hooks/useContracts.ts`

- **현재 동작**: `MockContractService` (브라우저 메모리 배열) 사용. 새로고침 시 데이터 소실 가능
- **실제 구현 시 필요**: `SupabaseContractService` 활성화 + `contracts` 테이블 RLS 정책

```ts
// useContracts.ts:18
const contractService = IS_MOCK
  ? new MockContractService()
  : new SupabaseContractService();
```

### 3. 사업장 관리 — `src/hooks/useBusiness.ts`

- **현재 동작**: 사업장 정보(이름, 주소, 사업자번호)를 로컬 배열에 임시 저장
- **실제 구현 시 필요**: `businesses` 테이블 CRUD + RLS

### 4. 카카오톡 초대장/서명 요청 전송 — `src/api/smart-messenger.ts`

- **현재 동작**: `alert('[Mock 카카오톡 공유] 초대장 딥링크: ...')` 브라우저 팝업
- **실제 구현 시 필요**: 카카오 JavaScript SDK `Kakao.Share.sendDefault` 또는 알림톡 API 연동

### (참고) Supabase Realtime

- `IS_MOCK` 상태에서 `ContractDetailPage.tsx` (employer/worker 양쪽 모두) WebSocket 구독이 비활성화됨
- 실시간 계약서 상태 갱신을 위해 Supabase Realtime 연동 필요

## Un-mocking 우선순위 권장 순서

1. **인증(Auth)** — 다른 모든 기능의 전제 조건 (RLS가 userId 기반)
2. **계약서 DB** — 핵심 비즈니스 로직
3. **사업장 DB** — 계약서 연동 전 사업장 정보 필요
4. **카카오 공유/알림** — 마지막 단계 (알림은 인증 + DB 완성 후)

## 관련 페이지

- [[supabase]] — Supabase Auth/DB/Edge Functions 세부
- [[smart-messenger]] — 알림 구현 (mTLS + share API)
- [[toss-contract-app]] — 프로젝트 전체 개요
