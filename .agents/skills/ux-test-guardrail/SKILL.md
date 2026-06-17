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
# UX Test Guardrail — 도메인 전문가 가드레일 검증 (Agy CLI 전용)

수정안이 프로젝트 도메인 규칙(Supabase RLS/보안, TDS 컴포넌트 규약, Vite 빌드 제약)을 위반하지 않았는지 3명의 `toss-app-dev` 전문가 에이전트가 실제 코드를 읽고 엄격하게 판단합니다.

## 입력

- `sessionId`: UX 테스트 세션 ID (UUID v4 형식, `server/ux-test-sessions/` 디렉토리에 json 파일로 저장됨)
- `fixFilePath`: 수정 대상 파일 경로
- `fixDiff`: 수정 내용 (unified diff)

## 절차

### 1단계: 세션 데이터 로드

```typescript
view_file (AbsolutePath: "server/ux-test-sessions/{sessionId}.json")
```

세션 파일의 마지막 상태 스냅샷을 로드하여 `route`, `auth`, `contracts` 등의 정보를 파악하고, 현재 사용자가 어떤 화면/흐름을 시뮬레이션 중인지 분석합니다.

### 2단계: 수정 파일 확인

```typescript
view_file (AbsolutePath: "{fixFilePath}")
```

제안된 수정안(`fixDiff`)이 반영될 대상 소스 파일의 전후 맥락을 직접 확인하여 분석합니다.

### 3단계: 전문가 소집 및 병렬 검증

`invoke_subagent` 도구를 사용해 3명의 도메인 에이전트를 병렬 소집하고, 수정안의 안전성 검증을 지시합니다. 에이전트가 소집되면 다음 가이드라인을 담은 상세 프롬프트를 배정합니다:

```json
{
  "Subagents": [
    {
      "TypeName": "toss-app-dev:supabase",
      "Role": "SupabaseGuard",
      "Prompt": "다음 코드 변경이 Supabase 관련 보안 규칙, 세션 관리 및 RLS 정책을 위반하는지 검증하라.\n\n파일: {fixFilePath}\n변경: {fixDiff}\n\n[검증 항목]\n1. RLS 정책: 서비스_role 키가 클라이언트 코드에 직접 노출되었거나 탈취당할 위험이 있는가?\n2. Edge Function: 기존 시그니처와 호환되며 CORS 및 권한 검증이 올바른가?\n3. Auth & JWT: 토큰 처리가 안전하며, 세션 오염을 일으킬 소지가 있는가?\n4. 쿼리 안정성: .single() 호출이 데이터의 고유성을 보장하여 런타임 에러를 막는가?\n\n결과를 반드시 JSON으로 반환:\n{ \"domain\": \"Supabase\", \"passed\": boolean, \"violations\": [...], \"suggestions\": [...] }\n\n추측하지 말고 코드를 직접 분석하여 검증할 것."
    },
    {
      "TypeName": "toss-app-dev:toss-mini-app",
      "Role": "MiniAppGuard",
      "Prompt": "다음 코드 변경이 Toss 미니앱 스키마 처리 및 TDS 디자인 규약을 위반하는지 검증하라.\n\n파일: {fixFilePath}\n변경: {fixDiff}\n\n[검증 항목]\n1. TDS 컴포넌트: 필수 props가 누락되지 않았으며, 디자인 규약과 컴포넌트 일관성을 지켰는가?\n2. Granite 설정: appName, brand, permissions 가 유효하며 프로젝트 설정과 호환되는가?\n3. 딥링크: intoss:// 스킴 및 특수 스키마 처리가 플랫폼 규칙에 어긋나지 않는가?\n4. 런타임: 브라우저 전용 API(window, local/sessionStorage 등)가 미니앱 웹뷰 환경에서 오작동을 유발하지 않는가?\n\n결과를 반드시 JSON으로 반환:\n{ \"domain\": \"Mini-app\", \"passed\": boolean, \"violations\": [...], \"suggestions\": [...] }\n\n추측하지 말고 코드를 직접 분석하여 검증할 것."
    },
    {
      "TypeName": "toss-app-dev:vite",
      "Role": "ViteGuard",
      "Prompt": "다음 코드 변경이 Vite 빌드 모듈 리졸루션 및 에셋 스타일 번들링 규칙을 위반하는지 검증하라.\n\n파일: {fixFilePath}\n변경: {fixDiff}\n\n[검증 항목]\n1. 모듈 리졸루션: import 경로가 존재하는 유효한 파일이나 모듈을 가리키는가?\n2. 환경 변수: import.meta.env 사용 시 VITE_ 프리픽스 규칙을 준수하는가?\n3. CSS & 에셋: @emotion CSS-in-JS 스타일이 Vite 플러그인 컴파일 및 번들 최적화와 호환되는가?\n4. 빌드 최적화: chunking 붕괴나 무작위 모듈 주입으로 번들 크기가 비정상적으로 늘어날 소지가 있는가?\n\n결과를 반드시 JSON으로 반환:\n{ \"domain\": \"Vite\", \"passed\": boolean, \"violations\": [...], \"suggestions\": [...] }\n\n추측하지 말고 코드를 직접 분석하여 검증할 것."
    }
  ]
}
```

### 4단계: 결과 취합 및 세션 업데이트

3명의 에이전트 응답을 취합하여 `server/ux-test-sessions/{sessionId}.json` 파일의 `analysis.guardrails` 필드에 통합 저장합니다.
- 모든 전문가가 `passed: true`이면 ➡️ **수정안 승인**
- 하나라도 `passed: false`이면 ➡️ **수정안 보류 및 위반 사항을 UI 대시보드에 표기**하여 사용자가 승인 여부를 선택할 수 있도록 위임

### 5단계: 충돌 의견 조율 (선택 사항)

도메인 전문가 간 의견이 엇갈리거나(예: Supabase 통과, Mini-app 실패이나 연동에 쟁점이 있음) 검증 논리가 상충하는 경우, `irc` 도구를 활용하여 실시간 교차 검증 및 의견 조율 과정을 수행합니다.

## Output

```json
{
  "guardrails": [
    { "domain": "Supabase", "passed": true, "violations": [], "suggestions": [] },
    { "domain": "Mini-app", "passed": false, "violations": ["TDS Button에 onClick 필수"], "suggestions": ["onClick 핸들러 추가"] },
    { "domain": "Vite", "passed": true, "violations": [], "suggestions": [] }
  ]
}
```