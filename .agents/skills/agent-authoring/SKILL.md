---
name: agent-authoring
description: Writing, iterating on, or optimizing on-demand agent definition files
  (.omp/agents/*.md) and their frontmatter, tools, and playbook body.
---
# Agent Authoring playbook

## When to use this skill
- Creating a new agent definition for a specialized role
- Iterating on an existing agent's description, tools, or playbook body
- Fixing an agent that doesn't trigger correctly or produces low-quality output

## Discovery

Agent definitions are discovered at startup from these sources, in priority order (first match wins by `name`):

1. **Project** `.omp/agents/` — `<cwd>/.omp/agents/*.md`
2. **User** `~/.omp/agent/agents/` — global agents
3. **Plugin** `agents/` dirs (project-scope first, then user-scope)
4. **Bundled** — `explore`, `plan`, `designer`, `reviewer`, `librarian`, `oracle`, `task`, `quick_task`

Cross-harness roots (`.claude/agents`, `.codex/agents`, `.gemini/agents`) are **skipped** — their frontmatter schema is not the OMP task-agent contract.

Within one directory, files are read in **lexicographic filename order**. Dedup is **first-wins** by exact `name` (case-sensitive). A project agent overrides a bundled agent with the same name. One bad file does not abort discovery of others — it's skipped with a warning.

## Frontmatter reference

Agent definitions live in `.omp/agents/<name>.md`. The YAML frontmatter supports these fields:

| Field | YAML key | Required | Effect |
|-------|----------|----------|--------|
| `name` | `name` | **yes** | Identifier matched against the `agent` field of a `task` call. Appears in the task tool's inventory for dispatch. Case-sensitive. |
| `description` | `description` | **yes** | The dispatch signal. The parent agent reads only this to decide whether to spawn. Use verbs, nouns, and scope. |
| `tools` | `tools` | no | YAML list or CSV string. Restricts the child to this subset; `yield` is always auto-added. Omit to inherit the session's full tool set. Fewer tools = tighter behavior. |
| `model` | `model` | no | Model pattern or CSV list of fallbacks. Omit to inherit the session's model. |
| `spawns` | `spawns` | no | Scalar or list of agent names this child may itself spawn. Accepts `*` (all), CSV, or YAML list. Defaults to none. **Backward-compat**: if `spawns` is missing but `tools` includes `task`, `spawns` becomes `*`. Restrict to limit blast radius. |
| `thinkingLevel` | `thinkingLevel` | no | One of: `minimal`, `low`, `medium`, `high`, `xhigh`. Omit to inherit the session's default level. |
| `output` | `output` | no | Opaque schema data passed through to structured-output guardrails. Conflicts with prose output instructions — pick one, not both. Precedence: agent `output` > parent session `outputSchema`. |
| `blocking` | `blocking` | no | Whether the task call blocks the parent. Defaults to true for synchronous spawning behavior. |
| `autoloadSkills` | `autoloadSkills` | no | Skill names preloaded into the child session. The child can invoke these without the parent explicitly loading them. |
| `read-summarize` | `read-summarize` | no | Set `false` to make the child's `read` return verbatim content instead of structural summaries. Parsed as `readSummarize` internally. Default is `true` (summaries enabled). `explore` and `librarian` ship with this disabled. |

All optional fields inherit the session's defaults at execution time when omitted.

Missing `name` or `description` makes the definition **invalid** — the file is skipped with a warning, and no agent is registered.

## Body

Everything after the closing `---` becomes the child's **system prompt verbatim** (`systemPrompt` in the normalized `AgentDefinition`). Include context, focus constraints, step-by-step procedure, and an output template. Every line is an instruction to the spawned agent.

The parent blocks until the child yields its result. Design the playbook accordingly: the child should do one focused job and return, not loop or wait for external input.

## Dispatch

To spawn a custom agent, pass its `name` to the `agent` field of a `task` call:

```json
{ "agent": "api-review", "description": "Review PR 417", "assignment": "..." }
```

The `agent` value must exactly match the definition's `name` field. The `description` in the task call is a short label; the definition's `description` is what the parent reads to decide whether to spawn in the first place.

### Error behavior

- If the name doesn't resolve, the call returns `Unknown agent "<name>". Available: …` without spawning anything.
- If the parent's `spawns` policy disallows the name, you get `Cannot spawn '<name>'. Allowed: …`.
- If the name is in `task.disabledAgents`, execution returns an immediate error listing enabled alternatives when available.
- Recursion depth caps further spawns from inside a child once `task.maxRecursionDepth` is hit. At max depth, the `task` tool is removed from the child's tool list and `spawns` is set to empty.

### Plan mode

When the parent is in plan mode, the child's effective agent is overridden:
- A plan-mode system prompt is prepended.
- Tools are restricted to `read`, `search`, `find`, `lsp`, `web_search`, plus `ast_grep`/`report_finding` if the agent's own tool list declares them.
- Child `spawns` is cleared.

### Debugging

- Run `omp` to see every agent the current session resolved, where each was loaded from, and which won a name collision.
- `N` starts the new-agent flow; `R` regenerates a draft; `Ctrl+R` reloads from disk — useful when you've just edited a file in another window.
- For a faster loop, dispatch the agent directly with a one-line assignment and inspect the returned `agent://<id>` transcript.

## Definition file shape

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
spawns:
  - explore
  - librarian
autoloadSkills:
  - dashboard-builder
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

## Iterating on a definition

| Symptom | Fix |
|---------|-----|
| Agent triggers on unrelated turns | Narrow the description: add domain, file patterns, or trigger phrases |
| Agent ignores relevant turns | Broaden description with synonyms or looser scope |
| Output is shallow or off-topic | Add a "Focus on" section with explicit constraints |
| Wrong tool used | Remove the tool from `tools:`; agents default to the session's full set when tools is omitted |
| Output format inconsistent | Add a fenced code-block template in the playbook body |
| Child reads too little / too much | Set `read-summarize: false` for verbatim reads, or omit to keep structural summaries |
| Child spawns too broadly | Restrict `spawns:` to specific agent names instead of `*` |

## Related
- `skill://skill-authoring` — skill definitions follow the same frontmatter conventions (name, description, hide) and `skill://` URL scheme for references
- The bundled agents (`explore`, `oracle`, `reviewer`, `designer`, `task`, `quick_task`) are always available at runtime; custom agents in `.omp/agents/` are discovered alongside them

## Reference
- `skill://agent-authoring/references/descriptions.md` — writing descriptions that fire
- `skill://agent-authoring/references/examples.md` — annotated real agent definitions from this project
- `omp://task-agent-discovery.md` — official: agent discovery, merge rules, spawn policy, recursion gating
- `omp://skills.md` — official: skill discovery, `skill://` URL resolution, frontmatter schema
- `omp://settings.md` — official: `task.*` config, `disabledAgents`, `skills.*`, model/thinking overrides