---
name: solopreneur-second-opinion
description: |
  Get an independent adversarial review of plans, specs, and design docs using Antigravity's subagent system.
  The subagent reads the document and related files fresh — no conversation context — then challenges it across 5 dimensions:
  Completeness, Consistency, Clarity, Scope, Feasibility. Use when the user says "second opinion", "challenge this plan", or "adversarial review".
---

# Second Opinion (agy version)

Use an independent reviewer to challenge plans, specs, and design docs. The reviewer reads the files fresh with no conversation context, providing an unbiased critique.

**Method:** Dispatch an Antigravity subagent (`invoke_subagent`) to perform the review with a clean context window.

## Step 1: Identify the target

Ask the user which file to review if not obvious from context. Typical targets:
- `todos/doing/*.md` (active plans)
- `docs/spec/*.md` (specs)
- Design docs, refactor plans, architecture proposals

## Step 2: Identify related files

Scan the plan for file references (paths to source files, configs, scripts, etc.).
These give the reviewer context to cross-validate claims in the plan.

Collect up to 10 most relevant paths. Don't include every reference — focus on files the plan makes specific claims about.

## Step 3: Subagent Review Dispatch

Dispatch a subagent using the `invoke_subagent` tool.
- **TypeName**: `toss-app-dev:review-board` (for frontend/architecture) or generic `self` / `research`.
- **Role**: `Adversarial Reviewer`
- **Workspace**: `inherit` or `share`

**Subagent Prompt Template:**

```text
You are an independent adversarial reviewer. You have NO context from the parent conversation — review the files from scratch.

Read this plan file: {plan_path}
Also read these related files to cross-validate: {related_files_list}

Challenge the plan across 5 dimensions:
1. Completeness — missing edge cases, unmentioned affected files, unconsidered scenarios
2. Consistency — internal contradictions, mismatches with actual code/docs
3. Clarity — vague descriptions, ambiguity that would block an implementer
4. Scope — over-engineering, scope creep, simpler alternatives
5. Feasibility — unverified assumptions, missing dependencies, technical blockers

For each finding, cite the specific file and line. Tag severity:
- 🔴 Critical (blocks implementation)
- 🟡 Important (should fix)
- 🟢 Suggestion (optional improvement)

End with a verdict: Ready / Needs revision / Needs rethink.
Do NOT modify any files. Analysis only.
```

## Step 4: Present findings

Reviewer findings are **informational until the user explicitly approves each one**.
Present findings grouped by severity:
1. Critical findings first
2. Important findings
3. Suggestions

For each finding, ask the user: adopt, skip, or discuss?

## Step 5: Update the plan

After the user decides on each finding, update the plan file to incorporate accepted changes.
