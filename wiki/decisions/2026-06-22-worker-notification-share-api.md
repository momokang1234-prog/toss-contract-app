---
title: 근로자 알림 방식 — 스마트메시지 포기, 공유 시트(share API) 채택
type: decision
updated: 2026-06-26
sources:
  - df398adb-3d44-45d8-bf14-d5682d8d978c
  - 9d5fb614-0c8d-423d-9792-a3affc0c86b6
  - 6f153450-3fce-4e9a-a711-48185748d13b
tags:
  - decision
  - notification
  - smart-messenger
  - share-api
  - worker
---

# 결정: 근로자 알림 방식 — 스마트메시지 포기, 공유 시트(share API) 채택

## 날짜

2026-06-22

## 질문

> 사장님이 근로계약서를 작성 완료했을 때, **근로자(아직 토스 로그인 전, userKey 없음)** 에게 계약서 링크를 자동으로 전달할 수 있는가?

## 조사 결과

### 스마트메시지 — 불가

Apps-in-Toss 스마트메시지 API 3종 모두 수신자 식별이 `userKey`로만 가능:
- `send-test-message`: 헤더 `x-toss-user-key` 필수
- `send-message`: 헤더 `x-toss-user-key` 필수
- `send-bulk-message`: 본문 `contextList[].userKey` 필수

전화번호 필드 일절 없음. (문서: `ax get doc --id a1aee6c00cd7194c`)

### 닭과 알 문제 확인됨

- `userKey` 획득 경로: 미니앱 진입 → 토스 로그인(`appLogin`) → `userKey` 발급
- 근로자가 미니앱에 들어오려면 먼저 링크를 받아야 함
- 링크를 받으려면 `userKey`가 있어야 스마트메시지로 보낼 수 있음
- **결론**: 최초 1회는 반드시 토스 밖 채널이 필요

### `getAnonymousKey` 우회 불가

문서 원문: *"반환되는 유저 키는 토스 서버 API 호출용 키가 아니에요. 내부 사용자 식별, 데이터 관리 용도로만 사용해 주세요."*

(문서: `ax get doc --id 2cea5bfbdd1e1101`)

### Push/Inbox — 불가

login intro 원문: *"기능성 푸시와 알림, 프로모션, 토스페이를 사용하려면 토스 로그인을 반드시 연동해야 해요."*

(문서: `ax get doc --id 6b96a54d7cb23c6b`)

### `contactsViral` — 자동 발송 불가

유일하게 연락처 기반 푸시가 가능한 API이나 세 가지 치명적 제약:
1. 사장님의 **수동 공유 액션** 필수 (자동 발송 아님)
2. 근로자가 이미 토스에 가입해 **푸시 토큰** 보유해야 함
3. 리워드/바이럴 마케팅 용도 — 계약서 전달에는 부적합

(문서: `ax get doc --id 70ed61e61130e8be`)

## 결정

> **근로자에게 자동 도달: NO** → 토스 `share` API(공유 시트)로 사장님이 수동 공유

### 채택된 방식

```ts
// src/api/smart-messenger.ts
async function shareContract(contractId: string) {
  const shareLink = await getTossShareLink(`intoss://bossimclockedin-contract?contractId=${contractId}`);
  await share({ url: shareLink, text: '근로계약서 확인' });
}
```

- OS 공유 시트 → 사장님이 카카오톡/SMS 등으로 직접 전달
- 사용 문서: `share` (doc id `114b4df88419e24e`), `getTossShareLink` (doc id `ffcf28a2b1d62fcd`)

### 사장님 알림은 유지

- 사장님(`employer_user_key` 있음)에게는 mTLS 스마트메시지 정상 발송
- `supabase/functions/contracts-sign/index.ts` — 서명 완료 후 자동 발송

## 트레이드오프

| | 스마트메시지 | 공유 시트 |
|-|--------------|-----------|
| 자동화 | 가능 (사장님만) | 불가 (수동) |
| 근로자 도달 | 불가 | 가능 (수동) |
| 구현 복잡도 | 높음 (mTLS) | 낮음 |
| 토스 외 채널 | 불필요 | 필요 (사장님이 선택) |

## 기존 코드 검증

조사 결과 기존 코드가 공식 스펙과 일치함을 확인:
- `contracts-sign`: 사장님만 스마트메시지 (정확)
- `contracts-send`: share 방식으로 기록 (정확)
- `src/api/smart-messenger.ts`: `shareContract` 공유 시트 (정확)
- 단, 레거시 Bearer 코드가 `contracts-sign`에 남아있었음 → mTLS 스펙으로 교체 필요

## 관련 페이지

- [[smart-messenger]] — 구현 세부 사항
- [[supabase]] — Edge Functions
