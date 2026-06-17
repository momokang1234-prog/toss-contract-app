---
description: UX 테스트 워크스페이스에서 감지된 이슈/수정안에 대해 도메인 전문가 에이전트를 소집하여 가드레일 검증을 수행하는 스킬. Supabase/Mini-app/Vite 전문가가 실제 코드를 읽고 도메인 규칙 위반 여부를 판단한다.
allowed-tools: Read, Grep, Glob, Write, Agent
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

Launch 3 domain agents in parallel using the Agent tool:

**Supabase Guard:**
Verify whether the code change violates Supabase-related rules:
1. RLS policy: Is the service_role key exposed to the client?
2. Edge Function: Is it compatible with the existing signature?
3. Auth: Is JWT token handling safe?
4. Query: Does .single() usage guarantee uniqueness?

**Mini-app Guard:**
Verify whether the code change violates Toss mini-app rules:
1. TDS components: Are any required props missing?
2. Granite config: Are appName/brand/permissions valid?
3. Deep links: Is the intoss:// scheme handling correct?
4. Runtime: Are browser-only APIs safe in mini-app?

**Vite Guard:**
Verify whether the code change violates Vite/build rules:
1. Module resolution: Do import paths point to existing modules?
2. Environment variables: Does import.meta.env usage follow the VITE_ convention?
3. CSS/Assets: Is @emotion CSS-in-JS compatible with the Vite plugin?
4. Build: Is chunk splitting correct?

### Step 4: Aggregate Results

Aggregate the 3 expert results and store them in the `analysis.guardrails` field of `server/ux-test-sessions/{sessionId}.json`.

If all experts report `passed: true` → approve the fix.
If any expert reports `passed: false` → display violations, leaving the decision to the user.

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
