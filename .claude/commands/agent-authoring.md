---
description: Writing, iterating on, or optimizing sub-agent definition files (.claude/agents/*.md) and their frontmatter, tools, and playbook body for Claude Code.
---

# Agent Authoring Playbook (Claude Code)

## When to use this skill
- Creating a new sub-agent definition for a specialized role
- Iterating on an existing agent's description or playbook body
- Fixing an agent that doesn't trigger correctly or produces low-quality output

## Claude Code Agent Discovery

Agent definitions are discovered from `.claude/agents/*.md` in the project directory.

## Frontmatter Reference

Agent definitions live in `.claude/agents/<name>.md`:

| Field | Required | Effect |
|-------|----------|--------|
| `name` | yes | Display name. Used to identify the agent in the UI. |
| `description` | yes | Dispatch signal — Claude reads this to decide when to spawn the agent. Use verbs, nouns, and scope. |
| `color` | no | UI color: red, orange, yellow, green, teal, blue, purple, pink, gray |

## Body

Everything after the closing `---` becomes the agent's **system prompt**. Include context, focus constraints, step-by-step procedure, and an output template.

## Definition File Shape

```yaml
---
name: api-review
description: Reviewing changes to packages/api/* for breaking changes, missing tests, and OpenAPI drift.
color: blue
---

# API Review — Breaking-change & test-coverage auditor

You review pull requests touching the public API surface.

## Focus on
- Breaking changes to exported types or HTTP routes
- Missing or thin test coverage on changed branches

## Procedure
1. Read the changed files.
2. For each exported type change, classify as Breaking or Additive.
3. Search for test files covering the changed modules.
4. Write the review as a structured report.

## Output

```markdown
## API Review — {pr-or-branch}

### Breaking changes
| File | Change | Impact |

### Thin coverage
| File | Branch | Existing tests | Gap |
```
```

## Iterating on a Definition

| Symptom | Fix |
|---------|-----|
| Agent triggers on unrelated turns | Narrow the description: add domain, file patterns, or trigger phrases |
| Agent ignores relevant turns | Broaden description with synonyms or looser scope |
| Output is shallow or off-topic | Add a "Focus on" section with explicit constraints |
| Output format inconsistent | Add a fenced code-block template in the playbook body |

## Related
- `/skill-authoring` — for writing Claude Code command definitions (.claude/commands/*.md)
- See `.omp/skills/agent-authoring/references/` for legacy reference (migrated from OpenCode)
