---
name: ux-test-guardrail
description: >
  UX 테스트 워크스페이스에서 감지된 이슈/수정안에 대해 도메인 전문가 에이전트를 소집하여
  가드레일 검증을 수행하는 스킬. Supabase/Mini-app/Vite 전문가가 실제 코드를 읽고
  도메인 규칙 위반 여부를 판단한다. 프롬프트 시뮬레이션이 아닌 진짜 에이전트 기반 검증.
tools:
  - read
  - search
  - find
  - write
  - task
  - irc
thinkingLevel: high
---

# UX Test Guardrail — Domain Expert Guardrail Verification

Three `toss-app-dev` domain expert agents read the actual code and determine whether
the proposed fix violates domain rules (Supabase RLS, TDS component conventions, Vite build constraints).

## Input

- `sessionId`: UX Test session ID (stored in `server/ux-test-sessions/` folder)
- `fixFilePath`: Path to the modified file
- `fixDiff`: Fix content (unified diff)

## Procedure

### Step 1: Load Session

```
read server/ux-test-sessions/{sessionId}.json
```

Determine `route`, `auth`, `contracts`, etc. from the last state snapshot in the session.

### Step 2: Read Modified File

```
read {fixFilePath}
```

Verify the code before and after the modification directly.

### Step 3: Assemble Experts (Parallel)

Launch 3 domain agents in parallel using a `task` batch:

```json
{
  "agent": "toss-app-dev:review-board",
  "context": "UX test guardrail verification. Three experts verify whether the proposed fix violates domain rules.",
  "tasks": [
    {
      "agent": "toss-app-dev:supabase",
      "id": "SupabaseGuard",
      "description": "Supabase guardrail verification",
      "assignment": "Verify whether the following code change violates Supabase-related rules.\n\nFile: {fixFilePath}\nChange: {fixDiff}\n\nVerification items:\n1. RLS policy: Is the service_role key exposed to the client?\n2. Edge Function: Is it compatible with the existing signature?\n3. Auth: Is JWT token handling safe?\n4. Query: Does .single() usage guarantee uniqueness?\n\nReturn result as JSON:\n{ \"domain\": \"Supabase\", \"passed\": boolean, \"violations\": [...], \"suggestions\": [...] }\n\nRead and verify the code directly. Do not guess."
    },
    {
      "agent": "toss-app-dev:toss-mini-app",
      "id": "MiniAppGuard",
      "description": "Mini-app guardrail verification",
      "assignment": "Verify whether the following code change violates Toss mini-app rules.\n\nFile: {fixFilePath}\nChange: {fixDiff}\n\nVerification items:\n1. TDS components: Are any required props missing?\n2. Granite config: Are appName/brand/permissions valid?\n3. Deep links: Is the intoss:// scheme handling correct?\n4. Runtime: Are browser-only APIs safe in mini-app?\n\nReturn result as JSON:\n{ \"domain\": \"Mini-app\", \"passed\": boolean, \"violations\": [...], \"suggestions\": [...] }\n\nRead and verify the code directly. Do not guess."
    },
    {
      "agent": "toss-app-dev:vite",
      "id": "ViteGuard",
      "description": "Vite guardrail verification",
      "assignment": "Verify whether the following code change violates Vite/build rules.\n\nFile: {fixFilePath}\nChange: {fixDiff}\n\nVerification items:\n1. Module resolution: Do import paths point to existing modules?\n2. Environment variables: Does import.meta.env usage follow the VITE_ convention?\n3. CSS/Assets: Is @emotion CSS-in-JS compatible with the Vite plugin?\n4. Build: Is chunk splitting correct?\n\nReturn result as JSON:\n{ \"domain\": \"Vite\", \"passed\": boolean, \"violations\": [...], \"suggestions\": [...] }\n\nRead and verify the code directly. Do not guess."
    }
  ]
}
```

### Step 4: Aggregate Results

Aggregate the 3 expert results and store them in the `analysis.guardrails` field of `server/ux-test-sessions/{sessionId}.json`.

If all experts report `passed: true` → approve the fix.
If any expert reports `passed: false` → display violations in the UI, leaving the decision to the user.

### Step 5 (Optional): Cross Review

If there are conflicting opinions, use `irc` to facilitate cross-verification among experts.

## Output

```json
{
  "guardrails": [
    { "domain": "Supabase", "passed": true, "violations": [], "suggestions": [] },
    { "domain": "Mini-app", "passed": false, "violations": ["TDS Button requires onClick"], "suggestions": ["Add onClick handler"] },
    { "domain": "Vite", "passed": true, "violations": [], "suggestions": [] }
  ]
}
```
