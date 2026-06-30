---
title: Supabase 설정 및 Edge Functions
type: topic
updated: 2026-06-26
sources:
  - 9d5fb614-0c8d-423d-9792-a3affc0c86b6
  - 66e5c929-b80d-451e-8023-fb65435a9871
  - 6f153450-3fce-4e9a-a711-48185748d13b
  - b98760cb-fa20-4e81-8c37-edad7cfe08a4
  - ee7e92f5-09fb-45e7-831a-ec3af0e7359c
  - 4d3867db-345a-4983-bf84-67a4db0ac82a
tags:
  - supabase
  - database
  - edge-functions
  - migration
---

# Supabase 설정 및 Edge Functions

## 클라이언트 초기화

`src/api/supabase.ts`

```ts
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);
```

- Supabase 클라이언트 임포트 시 `createClient`가 실시간 WebSocket을 초기화하므로 **Node 환경(테스트)에서 모킹 필요**
- Vitest에서 `smart-messenger.ts`가 `supabase.ts`를 임포트할 때 WebSocket 에러 발생 → `vi.mock('../api/supabase')` 처리

## 마이그레이션 목록

| 파일 | 내용 | 적용 상태 |
|------|------|-----------|
| `001` ~ `007` | 초기 스키마, contracts 테이블 | 적용됨 |
| `008_work_schedule.sql` | `work_schedule JSONB` + `schedule_mode TEXT` 컬럼 추가 | **파일만 존재, DB 미적용** (2026-06-17 기준) |

### 008_work_schedule.sql 내용

```sql
ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS work_schedule JSONB,
  ADD COLUMN IF NOT EXISTS schedule_mode TEXT DEFAULT 'same';
```

### 마이그레이션 적용 방법

Supabase CLI를 로컬에서 실행할 수 없는 경우 대시보드 직접 실행:
1. https://supabase.com/dashboard → 프로젝트 선택
2. 좌측 메뉴 **SQL Editor** 클릭
3. 위 SQL 붙여넣고 **Run** 실행

## Edge Functions

### `contracts-sign`

- **경로**: `supabase/functions/contracts-sign/index.ts`
- **역할**: 계약서 서명 완료 후 사장님에게 스마트메시지 발송
- **인증 방식**: mTLS (인증서 파일 사용)
- **주의**: 구버전 Bearer 스마트메시지 코드 제거됨, mTLS 스펙으로 교체 필요

```ts
// 올바른 mTLS 스펙 (2026-06-18 기준)
// BaseURL: https://apps-in-toss-api.toss.im
// POST /api-partner/v1/apps-in-toss/messenger/send-message
// 헤더: x-toss-user-key: {employer_user_key}
// 본문: { templateSetCode: "bossimclockedin-contract_sign_complete", context: {...} }
```

mTLS 인증서 위치: `/mnt/c/Users/집/Downloads/mTLS_인증서_20260618/` (복호화된 PEM)
- `smart_public.crt`
- `smart_private.key`

Deno mTLS 방식:
```ts
const client = Deno.createHttpClient({ certChain, privateKey });
// fetch 시 client 옵션으로 전달
```

### `contracts-send`

- **경로**: `supabase/functions/contracts-send/index.ts`
- **역할**: 계약서 전송 상태 기록, 전달 방식은 `method: 'share'`
- 근로자는 `userKey`가 없어 스마트메시지 불가 → 프론트에서 `share` API로 처리

### `contracts-cancel`

- **경로**: `supabase/functions/contracts-cancel/index.ts`
- **역할**: 계약서 취소 처리
- `SUPABASE_SERVICE_ROLE_KEY` 사용 (서비스 역할 키)

## 테스트 주의사항

Supabase 클라이언트가 포함된 모듈 테스트 시:

```ts
// vitest 설정에서 모킹 필요
vi.mock('../api/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: { /* ... */ }
  }
}));
```

이유: `createClient` 호출 시 Realtime WebSocket을 초기화하는데, Node.js에는 네이티브 WebSocket이 없어 `smart-messenger.ts`를 임포트하는 테스트 파일이 에러 발생.

## 관련 페이지

- [[toss-contract-app]] — 프로젝트 전체 개요
- [[smart-messenger]] — mTLS 스마트메시지 구현
