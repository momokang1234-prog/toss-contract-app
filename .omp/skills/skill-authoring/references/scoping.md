# Scoping and disabling skills

## Command-line flags

| Flag | Effect |
|------|--------|
| `--skills <p1,p2,…>` | Comma-separated glob patterns; only matching skills are kept. |
| `--no-skills` | Disable skill discovery entirely for this run. |

## Config file settings

| Setting | Effect |
|---------|--------|
| `skills.enabled: false` | Disable skill discovery entirely, persisted in `~/.omp/agent/config.yml`. |
| `skills.ignoredSkills: [pattern, …]` | Block skills by name (glob patterns). |
| `skills.includeSkills: [pattern, …]` | Allowlist (glob patterns) — only these load. |
| `skills.enableSkillCommands: false` | Disable `/skill:<name>` invocations while leaving discovery on. |

## Verification

Run `omp -p '/extensions'` to see which skills loaded for the current session and from where.

## Pairing with other features

- Pair with **Prompt templates** when you want a fixed prompt to invoke a skill.
- Pair with **Context files** for project notes that should be in the system prompt unconditionally.
