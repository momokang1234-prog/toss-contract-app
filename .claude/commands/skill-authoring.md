---
description: Writing, structuring, or optimizing new command/skill playbooks (.claude/commands/*.md) and managing their reference files for Claude Code.
---

# Skill Authoring Playbook (Claude Code)

## When to use this skill
- Creating a new command to teach Claude a specific workflow or project convention
- Writing effective frontmatter descriptions so Claude invokes the command accurately
- Organizing supplementary reference documents

## Procedure
1. Create a command file in `.claude/commands/<name>.md`.
2. Add frontmatter with `description` (use clear verbs, nouns, and scopes).
3. If the command includes large reference documents, reference them using relative paths from the project root.
4. Test the command by invoking it with `/<name>`.

## Frontmatter Reference

| Field | Required | Effect |
|-------|----------|--------|
| `description` | recommended | Claude reads this to decide when to auto-invoke the command |
| `allowed-tools` | no | Comma/space separated list of tools allowed during this command |
| `disallowed-tools` | no | Tools to block during this command |

## File Shape

```yaml
---
description: What this command does and when to invoke it.
allowed-tools: Read, Grep, Bash
---

# Command Title

## When to use
...

## Procedure
1. Step one
2. Step two

## Output
...
```

## Notes
- Command name = filename without `.md` extension (e.g., `deploy.md` → `/deploy`)
- The body becomes the instruction set for the command
- Reference supporting docs with relative paths: `See ./docs/auth_docs/supabase.md`

## Related
- `/agent-authoring` — for writing Claude Code sub-agent definitions (.claude/agents/*.md)
- See `.omp/skills/skill-authoring/references/` for legacy reference (migrated from OpenCode)
