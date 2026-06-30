---
title: 스마트메시지 및 알림 구현
type: topic
updated: 2026-06-26
sources:
  - df398adb-3d44-45d8-bf14-d5682d8d978c
  - 9d5fb614-0c8d-423d-9792-a3affc0c86b6
  - 6f153450-3fce-4e9a-a711-48185748d13b
tags:
  - smart-messenger
  - mTLS
  - notification
  - share-api
  - apps-in-toss
---

# 스마트메시지 및 알림 구현

## 결론 먼저: 2단계 알림 구조

| 대상 | 방식 | 이유 |
|------|------|------|
| 근로자 (최초 도달) | 토스 `share` API (공유 시트) | `userKey` 없어 스마트메시지 불가 |
| 사장님 (서명 완료 알림) | mTLS 스마트메시지 | `employer_user_key` 있음 |

## Apps-in-Toss 스마트메시지 스펙

공식 문서: `ax get doc --id a1aee6c00cd7194c`
URL: https://developers-apps-in-toss.toss.im/smart-message/develop.md

### API 엔드포인트

```
BaseURL: https://apps-in-toss-api.toss.im
POST /api-partner/v1/apps-in-toss/messenger/send-message
```

### 인증 방식: mTLS

- **레포의 Bearer 코드는 잘못됨** — 실제 스펙은 mTLS
- 인증서: `smart_public.crt` + `smart_private.key` (PEM 형식)
- 로컬 경로: `/mnt/c/Users/집/Downloads/mTLS_인증서_20260618/`

```ts
// Deno Edge Function에서 mTLS 사용
const client = Deno.createHttpClient({
  certChain: Deno.readTextFileSync('./smart_public.crt'),
  privateKey: Deno.readTextFileSync('./smart_private.key'),
});
const response = await fetch(url, { client, method: 'POST', ... });
```

### 요청 형식

```ts
// 헤더
'x-toss-user-key': employer_user_key  // 수신자 식별 (필수)

// 본문
{
  templateSetCode: "bossimclockedin-contract_sign_complete",
  context: {
    // 템플릿 변수
  }
}
```

### 수신자 식별 방식

모든 API가 `userKey`로만 수신자를 식별함:

| API | 수신자 식별 | 전화번호 필드 |
|-----|-------------|---------------|
| `send-test-message` | 헤더 `x-toss-user-key` | **없음** |
| `send-message` | 헤더 `x-toss-user-key` | **없음** |
| `send-bulk-message` | 본문 `contextList[].userKey` | **없음** |

## 왜 근로자에게 스마트메시지를 못 보내는가

### 닭과 알 문제

1. `userKey`는 토스 로그인(`appLogin` → 인가코드 → AccessToken → 사용자정보받기)을 통해서만 획득
2. 토스 로그인은 사용자가 미니앱에 들어와야 발생
3. 미니앱에 들어오려면 먼저 계약서 링크를 받아야 함
4. **결론**: 최초 1회는 반드시 토스 밖 채널로 도달해야 함

### 비로그인 우회 불가 확인

- **`getAnonymousKey`**: 문서에 *"반환되는 유저 키는 토스 서버 API 호출용 키가 아니에요. 내부 사용자 식별, 데이터 관리 용도로만 사용해 주세요"* → 스마트메시지 불가
- **Push/Inbox**: login intro 문서 *"기능성 푸시와 알림, 프로모션, 토스페이를 사용하려면 토스 로그인을 반드시 연동해야 해요"* → 비로그인 불가
- **`contactsViral`**: 유일한 연락처 기반 푸시이지만 (a) 사용자 수동 공유 액션 필수, (b) 근로자가 이미 토스 가입 + 푸시 토큰 필요 → 자동 발송 불가

## 근로자 도달: 공유 시트 (share API)

`src/api/smart-messenger.ts` → `shareContract` 함수

```ts
// getTossShareLink + share 조합
const shareLink = await getTossShareLink('intoss://...');
await share({ url: shareLink, text: '계약서 확인 링크' });
```

- OS 공유 시트를 띄워 사장님이 직접 메신저/SMS 선택해서 전달
- **자동 발송이 아닌 수동 공유**임을 명확히 이해해야 함

관련 문서:
- `share`: `ax get doc --id 114b4df88419e24e`
- `getTossShareLink`: `ax get doc --id ffcf28a2b1d62fcd`

## 사장님 알림: `contracts-sign` Edge Function

`supabase/functions/contracts-sign/index.ts` (97-164행)

- 서명 완료 시 `employer_user_key`로 mTLS 스마트메시지 발송
- `templateSetCode: "bossimclockedin-contract_sign_complete"`
- 105행 주석: *"근로자는 userKey 없어 스마트메시지 불가 → 별도 share API로 처리됨"*

## 테스트

`src/api/tests/smart-messenger.test.ts`

```ts
// supabase mock 필수 — createClient가 WebSocket 초기화하기 때문
vi.mock('../supabase');
```

Vitest 64/64 통과 확인됨 (2026-06-17)

## 관련 페이지

- [[toss-contract-app]] — 프로젝트 개요
- [[supabase]] — Edge Functions 설정
- [[2026-06-22-worker-notification-share-api]] — 근로자 알림 방식 결정 기록
