---
name: skill-authoring
description: Writing, structuring, or optimizing new on-demand skill playbooks (SKILL.md)
  and managing their reference files.
---
# Skill Authoring playbook

## When to use this skill
- Creating a new skill to teach the agent a specific workflow or project convention
- Writing effective frontmatter descriptions so the model triggers the skill accurately
- Organizing supplementary reference documents without bloating the system prompt

## Procedure
1. Create a skill directory in a valid path (e.g., `.omp/skills/<name>/` for project-level).
2. Create the `SKILL.md` file and add frontmatter with `name` and a specific `description` (use clear verbs, nouns, and scopes).
3. If the skill includes large reference documents, place them as sibling files next to `SKILL.md`.
4. Link references in the playbook using the `skill://<name>/path/to/file.md` format.
5. Verify the skill loads correctly by running `omp -p '/extensions'` or testing the `/skill:<name>` command.

## Reference
- `skill://skill-authoring/references/descriptions.md` — guide to writing descriptions that fire
- `skill://skill-authoring/references/scoping.md` — how to disable, ignore, or allowlist skills



