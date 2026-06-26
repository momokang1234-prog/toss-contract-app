# Antigravity CLI (agy) Agents & Skills Configuration

## Instructions

When performing a task, you MUST unconditionally search for and select the most appropriate skill or agent from the available list. Once an appropriate one is found, you MUST use it and perform the necessary tool calls/invocations.

---

## Stack
- Frontend: React + TypeScript + Vite (`src/`)
- Backend: Supabase Edge Functions (`supabase/functions/`)
- Mini-app: Apps-in-Toss (Granite framework, `granite.config.ts`)
- UI: `@toss/tds-mobile` v2.4.0 TDS components
- Dev server: `http://localhost:5173`

## Available Sub-Agents (`.omp/agents/`)

Use the `invoke_subagent` tool to delegate specialized work:

| Agent | Description / When to use |
|-------|-------------|
| `toss-app-dev:supabase` | Supabase auth, RLS, Edge Functions, migrations |
| `toss-app-dev:toss-mini-app` | Granite config, TDS components, deeplinks, sandbox |
| `toss-app-dev:vite` | vite.config.ts, build errors, SSR, HMR |
| `toss-app-dev:review-board` | Architecture reviews, cross-domain decisions |
| `ux-auditor` | UX audit across all pages and flows |
| `functional-qa` | Feature testing, regression checks |
| `robustness-auditor` | Edge case bugs (back nav, refresh, rapid clicks) |
| `code-structure-analyzer` | Dependency graphs, complexity analysis, project health |
| `omp-helper` | OMP CLI questions & configurations |
| `agy-helper` | Google Antigravity CLI (agy) questions & configurations |

## Available Skills (`.agents/skills/`)

Skills are playbooks used by the agent to follow specific workflows:

| Skill | Description / When to use |
|---------|-------------|
| `intent-analyzer` | Reframe requests, uncover real goals, propose alternatives |
| `tds-design-to-dev-ux-test` | Generate UI layout proposals using TDS components |
| `ux-comment-analyzer` | Process Xray comments from UX Test Workspace |
| `ux-test-guardrail` | Domain expert validation of proposed UI fixes |
| `agent-authoring` | Write or iterate on `.omp/agents/*.md` definitions |
| `skill-authoring` | Write or iterate on `.agents/skills/<name>/SKILL.md` definitions |
| `e2e-tester` | Run automated Puppeteer E2E tests to verify DOM/HTML states after UI changes |

## Verification Gate — Do not declare "done" without evidence

| Verification Type | Minimum Evidence | Counterexample (Insufficient) |
|------------------|------------------|-------------------------------|
| UI/Layout Change | `e2e-tester` skill (Puppeteer HTML/DOM verification) | "TSC 0 errors", "Browser screenshot" |
| Text/Spacing/Font | Actual rendered check (after dev server `--force` restart) | "Added the code" |
| CSS/Style Change | Inspect the element in browser | "Build passed" |
| Logic Change | Relevant test case passes | "Code review done" |
| Server/Environment Change | Verify HTTP response with `curl` | "Process checked" |

Required checklist for UI changes:
1. Is the dev server serving the latest code? (restart with `--force` or check HMR)
2. Did you actually open the changed page in a browser?
3. Does the changed element render as intended?
4. Are there any other pages broken by the change?

**"TSC OK" is not UI verification.** TypeScript compiler does not verify CSS, layout, or spacing. TSC pass != UI is correct.

## Key File Paths
- Auth: `src/api/supabase.ts`
- Contracts API: `src/hooks/useContracts.ts`
- Edge Functions: `supabase/functions/`
- Migrations: `supabase/migrations/`
- Granite config: `granite.config.ts`
- Vite config: `vite.config.ts`
- UX Test sessions: `server/ux-test-sessions/`

## Agent Behavior Rules
- UI/UX 테스트나 화면 확인 요청 시, 단순 코드 확인에 그치지 않고 브라우저 스크린샷 등 실제 렌더링된 이미지를 직접 캡처하여 확인한 뒤 대답할 것.
- **Task Continuity & Context Switching (작업 연속성 유지):** 사용자가 기존 작업을 진행하던 중 갑자기 다른 관련 작업이나 사전 작업 등 새로운 지시를 내리더라도, 명시적으로 기존 작업을 취소하지 않는 한 기존 작업을 포기한 것이 아닙니다. 새 요청을 먼저 처리하거나 적절히 반영한 뒤, AI가 스스로 알아서 이전 작업의 맥락을 팔로우업(Follow-up)하여 원래 진행 중이던 작업을 끝까지 완수해야 합니다.
