# Writing descriptions that fire

Skills are on-demand playbooks the agent loads when a turn looks relevant. Keep large reference docs one read away without bloating the system prompt.

## What a skill is

A skill is a Markdown playbook under a named directory. Only its frontmatter description stays in the system prompt. The body loads when the model matches the current task against that description, or when you invoke it with `/skill:<name>`. Long playbooks cost nothing until they’re needed.

## Layout

```
~/.omp/agent/skills/<name>/SKILL.md     # global
.omp/skills/<name>/SKILL.md             # project
~/.claude/skills/, .claude/skills/      # also discovered
~/.codex/skills/,  .codex/skills/       # also discovered
```

Discovery is non-recursive — one skill per directory, directly under `skills/`. Sibling files inside the skill directory are addressable from the model as `skill://<name>/path/to/file.md`.

## Frontmatter

| Field | Required | Effect |
|-------|----------|--------|
| `name` | no | Skill identifier; defaults to the directory name. Used for `/skill:<name>` and the `skill://<name>` URL. |
| `description` | **yes** | The only part the model sees until the skill loads. Specific verbs + nouns + scope. |
| `hide` | no | Keep the skill loadable via `skill://<name>` and `/skill:<name>` but leave it out of the system prompt listing. |

## A complete SKILL.md

```yaml
---
name: postgres
description: Writing, reviewing, or optimizing Postgres queries, schemas, or configs.
---

# Postgres playbook

## When to use this skill
- Reviewing a migration before it lands
- Diagnosing slow queries with EXPLAIN
- Picking an index type

## Procedure
1. Capture the current plan: `EXPLAIN (ANALYZE, BUFFERS) <query>`.
2. Check stats freshness: `SELECT last_analyze FROM pg_stat_user_tables`.
3. Inspect indexes: `\d+ <table>` in psql, or `pg_indexes`.

## Reference
- `skill://postgres/references/indexes.md` — index decision matrix
- `skill://postgres/references/explain.md` — reading EXPLAIN output
```

## Writing a description that fires

The model picks skills the same way it picks tools: it matches the task against the description text. Vague descriptions get skipped; specific ones get pulled in. Name the **verbs** (writing, reviewing, debugging), the **nouns** (Postgres queries, Lambda errors, snapshot tests), and where useful the **scope** (`src/parser/`, `*.test.ts`).

| Bad | Good |
|-----|------|
| "Helps with database stuff." | "Writing, reviewing, or optimizing Postgres queries, schemas, or configs." |
| "Tests." | "Adding or extending Vitest tests for the importer module; covers fixtures, snapshot tests, and integration setup." |

For skills that should always load (project conventions, mandatory checks), keep the description specific anyway, then invoke explicitly with `/skill:<name>` in your first prompt rather than gambling on the match.
