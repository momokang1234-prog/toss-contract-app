---
title: TDS 컴포넌트 및 Granite 미니앱 설정
type: topic
updated: 2026-06-26
sources:
  - ccf85beb-9e5d-4510-b6b3-666f33a135db
  - 72fb0bfb-6933-481d-a1eb-af1320d58673
  - 6e6b9f4f-613c-4a56-b202-06b6e1bbb570
  - 3aceda07-6563-43a1-a1a0-5aaa7ca927e5
  - 4664c850-bc63-41da-9d98-b6b0a12db652
  - 6f153450-3fce-4e9a-a711-48185748d13b
  - 8453a833-4150-46f3-b0b3-cb05b94225dd
tags:
  - tds
  - toss-design-system
  - granite
  - mini-app
  - apps-in-toss
  - tossface
---

# TDS 컴포넌트 및 Granite 미니앱 설정

## TDS (Toss Design System)

- 패키지: `@toss/tds-mobile` **v2.4.0**
- 공식 에이전트: `toss-app-dev:toss-mini-app`

### 주요 컴포넌트 패턴

TDS 컴포넌트는 Apps-in-Toss 미니앱 런타임 제약이 있음:
- Native 컴포넌트 의존성 있는 일부 API는 브라우저에서 동작 안 할 수 있음
- 반드시 `toss-app-dev:toss-mini-app` 에이전트에게 TDS 관련 결정 위임

### Tossface 이모지 폰트 (2026-06-18 연동)

```css
/* src/styles/tossface.css */
@font-face {
  font-family: 'TossFace';
  src: url('/fonts/TossfaceFontMac.woff2') format('woff2');
}
```

```ts
// src/main.tsx
import './styles/tossface.css';
```

- 폰트 파일: `public/fonts/TossfaceFontMac.woff2` (~MB)
- 아이콘 카탈로그 dev 라우트: `/dev/icon-catalog` (개발 중 확인용)

## Granite 설정

`granite.config.ts`

```ts
// 핵심 설정 항목
export default {
  appName: '...',
  displayName: '...',
  brand: '...',
  permissions: ['apps-in-toss', ...],
}
```

## deeplink 구조

`intoss://bossimclockedin/contract` 형식 사용

URL 쿼리 파라미터 형태:
```
intoss://bossimclockedin-contract?contractId=xxx
```

`src/app.tsx`에서 scheme URI 파싱 처리

## 미니앱 인증 흐름

1. 사용자가 미니앱 진입
2. `appLogin` 호출 → 토스 로그인 화면
3. 인가코드 수신 → Supabase Edge Function에서 AccessToken 교환
4. 사용자 정보 → `employer_user_key` 획득
5. `AuthContext`에 저장

관련 파일:
- `src/contexts/AuthContext.tsx`
- `src/components/auth/RoleGuard.tsx` — employer/worker 역할 분기
- `src/pages/auth/LoginPage.tsx`

## UX 테스트 워크스페이스

`server/ux-test-sessions/` — UX 테스트 세션 파일

UX 테스트 관련 도구:
- **Xray 모드**: 컴포넌트에 댓글 달기
- **`ux-comment-analyzer`** 커맨드: Xray 댓글 → 구현 플랜
- **`ux-test-guardrail`** 커맨드: 도메인 전문가 가드레일 검증

`src/pages/dev/` — UX 테스트 변형 컴포넌트 (실제 폼과 별도)

dev 변형 파일 예시:
- `WorkerVariant*.tsx`
- `BusinessVariantC.tsx`
- `FormStepLabelVariantB.tsx`

**주의**: dev 변형 컴포넌트는 TSC 에러가 있을 수 있음 (ListRow/Badge prop 불일치)

## OG 이미지

`public/og-contract.png` — **현재 누락** (공유 미리보기 빈값 상태, 2026-06-18 기준)

## 관련 페이지

- [[toss-contract-app]] — 프로젝트 개요
- [[agent-setup]] — toss-app-dev:toss-mini-app 에이전트
