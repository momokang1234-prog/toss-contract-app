---
description: |
  Meta-orchestrator for going from a product idea to a demo-able MVP fast using Antigravity.
  Drives the full flow: brainstorming → PRD confirmation → MVP-flavored plan → execution.
  Optimized for **time-to-first-demo**, not production quality — no TDD, no per-task review loops.
  Triggers: "/mvp", "start a new app", "build an MVP".
---

# MVP Orchestrator (agy version)

Drives the full new-app / new-product flow with one explicit charter: **get to first demo fast.**
Tests, edge cases, accessibility, i18n, and refactor passes are deferred.
This skill guides the Antigravity agent to orchestrate the MVP process step-by-step.

## Flow

1. **Brainstorming** (clarify needs + identify core demo action)
2. **PRD Confirmation** (user-gated confirmation of UI/UX and data flow)
3. **Plan Writing** (MVP-flavored plan, demo-velocity)
4. **Execute the Plan** (rapid commit per step, edge cases as TODOs)

## MVP Charter (Core Rules)

**Execution Rules:**
- **No TDD.** Don't write tests. Assume happy path works for the initial MVP.
- **Edge cases → `TODO` comments**: `// TODO: handle X` in code.
- **Loading/empty/error states → stub or skip.** Simplest possible fallback.
- **No refactor passes.** Ship the first working version of each slice.
- **Ambiguity → simplest path forward.** Don't pause to ask unless genuinely BLOCKED.

**Commit policy:**
- One commit per step: `feat(mvp): <step name>: <one-line outcome>`.

---

## Step 1: Brainstorming

Interact with the user to capture:
- One-paragraph product description
- The **core demo action** — the single thing the user wants to show someone at the end.
- Key features and constraints (separated from "nice-to-haves")

**Confirm explicitly with the user before continuing:**
"This is MVP mode — demo-only, no tests, no hardening. Edge cases get TODO markers. Shall we proceed?"

## Step 2: PRD Confirmation

Output a concise Markdown PRD containing:
- **UI/UX**: Wireframe / mockup of the core screens (can use markdown tables or Mermaid).
- **Data structure**: Conceptual entity relationships (Mermaid diagram).
- **Business logic**: Skimmable rules.

Wait for user approval. Iterate until the user is satisfied.

## Step 3: Writing the plan (MVP-flavored)

Draft an actionable plan in Markdown.
- Each task = a visible slice the user can see in the app.
- Skip test tasks, error-handling tasks, loading states, accessibility tasks.
- Acceptance criteria: **"user can demo the core action end-to-end"**.

## Step 4: Execute the plan (MVP mode)

You can either execute this directly or dispatch a subagent (`toss-app-dev-vite` or `toss-app-dev-supabase`) to implement the slices.
- Pass the **MVP Charter** rules to the subagent if you dispatch one.
- Execute rapidly without pausing for trivial decisions.
- Stop when the **core demo action** is achievable.

## Stopping condition

The user can run the app / server and demo the **core demo action**. Stop there. No polishing, no hardening.
