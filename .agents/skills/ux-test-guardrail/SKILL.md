---
name: ux-test-guardrail
description: 'UX 테스트 워크스페이스에서 감지된 이슈/수정안에 대해 도메인 전문가 에이전트를 소집하여 가드레일 검증을 수행하는 스킬.
  Supabase/Mini-app/Vite 전문가가 실제 코드를 읽고 도메인 규칙 위반 여부를 판단한다. 프롬프트 시뮬레이션이 아닌 진짜 에이전트
  기반 검증.

  '
tools:
- grep_search
- invoke_subagent
- irc
- list_dir
- multi_replace_file_content
- replace_file_content
- search_web
- view_file
- write_to_file
thinkingLevel: high
---
# UX Test Guardrail — 도메인 전문가 가드레일 검증

수정안이 도메인 규칙(Supabase RLS, TDS 컴포넌트 규약, Vite 빌드 제약)을 위반하지 않았는지
3명의 toss-app-dev 전문가 에이전트가 실제 코드를 읽고 판단한다.

## 입력

- `sessionId`: UX 테스트 세션 ID (server/ux-test-sessions/ 폴더에 저장됨)
- `fixFilePath`: 수정된 파일 경로
- `fixDiff`: 수정 내용 (unified diff)

## 절차

### 1단계: 세션 로드

```
view_file (AbsolutePath: "server/ux-test-sessions/{sessionId}.json")
```

세션의 마지막 상태 스냅샷에서 `route`, `auth`, `contracts` 등을 파악.

### 2단계: 수정 파일 읽기

```
view_file (AbsolutePath: "{fixFilePath}")
```

수정 전후 코드를 직접 확인.

### 3단계: 전문가 소집 (병렬)

`invoke_subagent`를 사용하여 3개 도메인 에이전트를 병렬 출발시킵니다:

```json
{
  "Subagents": [
    {
      "TypeName": "toss-app-dev:supabase",
      "Role": "SupabaseGuard",
      "Prompt": "다음 코드 변경이 Supabase 관련 규칙을 위반하는지 검증하라.\n\n파일: {fixFilePath}\n변경: {fixDiff}\n\n검증 항목:\n1. RLS 정책: 서비스_role 키를 클라이언트에 노출하지 않았는가\n2. Edge Function: 기존 시그니처와 호환되는가\n3. Auth: JWT 토큰 처리가 안전한가\n4. 쿼리: .single() 사용이 고유성을 보장하는가\n\n결과를 JSON으로 반환:\n{ \"domain\": \"Supabase\", \"passed\": boolean, \"violations\": [...], \"suggestions\": [...] }\n\n코드를 직접 읽고 검증할 것. 추측하지 말 것."
    },
    {
      "TypeName": "toss-app-dev:toss-mini-app",
      "Role": "MiniAppGuard",
      "Prompt": "다음 코드 변경이 Toss 미니앱 규칙을 위반하는지 검증하라.\n\n파일: {fixFilePath}\n변경: {fixDiff}\n\n검증 항목:\n1. TDS 컴포넌트: 필수 prop이 누락되지 않았는가\n2. Granite 설정: appName/brand/permissions이 유효한가\n3. 딥링크: intoss:// 스킴 처리가 올바른가\n4. 런타임: 브라우저 전용 API가 미니앱에서 안전한가\n\n결과를 JSON으로 반환:\n{ \"domain\": \"Mini-app\", \"passed\": boolean, \"violations\": [...], \"suggestions\": [...] }\n\n코드를 직접 읽고 검증할 것. 추측하지 말 것."
    },
    {
      "TypeName": "toss-app-dev:vite",
      "Role": "ViteGuard",
      "Prompt": "다음 코드 변경이 Vite/빌드 규칙을 위반하는지 검증하라.\n\n파일: {fixFilePath}\n변경: {fixDiff}\n\n검증 항목:\n1. 모듈 리졸루션: import 경로가 존재하는 모듈을 가리키는가\n2. 환경 변수: import.meta.env 사용이 VITE_ 규칙을 지키는가\n3. CSS/에셋: @emotion CSS-in-JS가 Vite 플러그인과 호환되는가\n4. 빌드: 번들 분할이 올바른가\n\n결과를 JSON으로 반환:\n{ \"domain\": \"Vite\", \"passed\": boolean, \"violations\": [...], \"suggestions\": [...] }\n\n코드를 직접 읽고 검증할 것. 추측하지 말 것."
    }
  ]
}
```

### 4단계: 결과 취합

3개 전문가 결과를 취합하여 `server/ux-test-sessions/{sessionId}.json`의 `analysis.guardrails` 필드에 저장.

모든 전문가가 `passed: true`이면 → 수정 승인.
하나라도 `passed: false`이면 → 위반 사항 UI에 표시, 사용자 판단에 맡김.

### 5단계 (선택): 크로스 리뷰

충돌 의견이 있으면 `irc`로 전문가 간 의견 교차 검증 유도.

## 출력

```json
{
  "guardrails": [
    { "domain": "Supabase", "passed": true, "violations": [], "suggestions": [] },
    { "domain": "Mini-app", "passed": false, "violations": ["TDS Button에 onClick 필수"], "suggestions": ["onClick 핸들러 추가"] },
    { "domain": "Vite", "passed": true, "violations": [], "suggestions": [] }
  ]
}
```