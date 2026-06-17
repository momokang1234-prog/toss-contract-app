# Annotated example: api-review

A complete agent definition annotated with design decisions.

```yaml
---
name: api-review
description: Reviewing changes to packages/api/* for breaking changes, missing tests, and OpenAPI drift.
tools:
  - read
  - search
  - find
  - bash
model: sonnet
thinkingLevel: low
autoloadSkills:
  - dashboard-builder
spawns:
  - explore
  - librarian
read-summarize: false
blocking: true
---

# API Review — Breaking-change & test-coverage auditor

You review pull requests touching the public API surface.

## Focus on

- Breaking changes to exported types or HTTP routes
- Missing or thin test coverage on changed branches
- OpenAPI spec drift vs the runtime handlers

## Procedure

1. `read` the changed files under `packages/api/*`.
2. For each exported type change, classify as:
   - **Breaking** — removed field, renamed export, changed required/optional, widened/narrowed type
   - **Additive** — new optional field, new endpoint, new export (non-breaking)
3. For each route handler change, diff the OpenAPI spec entry against the actual request/response shape.
4. Search for test files covering the changed modules. Flag any changed branch with **zero** or **only-happy-path** coverage.
5. Write the review as a structured report.

## Output

​```markdown
## API Review — {pr-or-branch}

### 🔴 Breaking changes
| File | Change | Impact |
|------|--------|--------|

### 🟡 OpenAPI drift
| Endpoint | Spec | Runtime | Delta |
|----------|------|---------|-------|

### ⚠️ Thin coverage
| File | Branch | Existing tests | Gap |
|------|--------|---------------|-----|
​```
```

## Design decisions

| Decision | Rationale |
|----------|-----------|
| `name: api-review` | Short, imperative — this is the string you pass to the `agent` field of a `task` call |
| `description` names verbs (Reviewing), nouns (breaking changes, tests, OpenAPI drift), scope (`packages/api/*`) | The parent agent reads only this to decide whether to spawn — it's the dispatch signal |
| Only `read, search, find, bash` | Agent doesn't write code — no `edit`, `write`, `lsp` |
| `model: sonnet` | Structured review task; sonnet balances cost and quality |
| `thinkingLevel: low` | Classification task doesn't need deep reasoning |
| `spawns: [explore, librarian]` | Limits child to only spawning explore and librarian agents — not `*` (all). Restricts blast radius |
| `blocking: true` | Parent blocks until child yields; explicit for clarity since this is the default |
| `autoloadSkills: [dashboard-builder]` | Preloads the dashboard-builder skill for structured report rendering |
| `read-summarize: false` | Needs exact type signatures and route definitions — structural summaries would lose detail |
| "Focus on" section | Prevents the agent from rambling about style, naming, or frontend concerns |
| Classification taxonomy (Breaking / Additive) | Forces the agent to be precise instead of vague |
| Structured output template | Makes reviews machine-parseable and scannable |