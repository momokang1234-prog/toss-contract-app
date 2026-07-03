# toss-contract-app — Project Guidelines

## Stack
- Frontend: React + TypeScript + Vite (`src/`)
- Backend: Supabase Edge Functions (`supabase/functions/`)
- Mini-app: Apps-in-Toss (Granite framework, `granite.config.ts`)
- UI: `@toss/tds-mobile` v2.4.0 TDS components
- Dev server: `http://localhost:5173`

## Available Sub-Agents (`.claude/agents/`)

Use the Agent tool to delegate specialized work:

| Agent | When to use |
|-------|-------------|
| `toss-app-dev-supabase` | Supabase auth, RLS, Edge Functions, migrations |
| `toss-app-dev-toss-mini-app` | Granite config, TDS components, deeplinks, sandbox |
| `toss-app-dev-vite` | vite.config.ts, build errors, SSR, HMR |
| `toss-app-dev-review-board` | Architecture reviews, cross-domain decisions |
| `ux-auditor` | UX audit across all pages and flows |
| `functional-qa` | Feature testing, regression checks |
| `robustness-auditor` | Edge case bugs (back nav, refresh, rapid clicks) |
| `code-structure-analyzer` | Dependency graphs, complexity analysis, project health |
| `omp-helper` | omp CLI questions |
| `agy-helper` | Google Antigravity CLI (agy) questions |

## Available Commands (`.claude/commands/`)

| Command | When to use |
|---------|-------------|
| `/intent-analyzer` | Reframe requests, uncover real goals, propose alternatives |
| `/tds-design-to-dev-ux-test` | Generate 5 UI layout proposals using TDS components |
| `/ux-comment-analyzer` | Process Xray comments from UX Test Workspace |
| `/ux-test-guardrail` | Domain expert validation of proposed UI fixes |
| `/agent-authoring` | Write or iterate on `.claude/agents/*.md` definitions |
| `/skill-authoring` | Write or iterate on `.claude/commands/*.md` definitions |
| `/e2e-tester` | Run automated Puppeteer E2E tests to verify DOM/HTML states |
| `/desktop-rpa` | Python PyAutoGUI desktop screen automation for mouse/keyboard control |
| `/visual-e2e-test-generator` | Generate visual (non-headless) Puppeteer E2E tests for React/TDS |
| `/e2e-driven-tdd` | Execute 4-step E2E-driven TDD workflow (Planning → Automation → Execution → Stabilization) |
| `/solopreneur-mvp` | Meta-orchestrator for product idea to demo-able MVP (brainstorming → PRD → plan → execution) |
| `/solopreneur-second-opinion` | Get independent adversarial review of plans, specs, and design docs |

## Rules

### Intent Analysis First
사용자 요청을 처리하기 전에 항상 의도 분석을 선행하세요:
1. 요청의 진짜 목적(Why) 파악
2. 제안된 방법의 적절성 검토
3. 더 나은 대안 제시

필요한 경우 `/intent-analyzer` 커맨드를 명시적으로 호출하세요.

### Active Use of Skills and Agents
When performing any task, review the available list of commands and sub-agents above. Find the most appropriate tool for the given context, and actively invoke them. Do not attempt to perform tasks manually if a specialized agent or command is available.

### Verification Gate — Do not declare "done" without evidence

| Verification Type | Minimum Evidence | Counterexample (Insufficient) |
|------------------|------------------|-------------------------------|
| UI/Layout Change | Browser screenshot or vision check | "TSC 0 errors" |
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
