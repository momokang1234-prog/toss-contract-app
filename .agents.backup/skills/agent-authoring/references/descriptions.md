# Writing descriptions that fire

The model picks agents the same way it picks tools: it matches the current task against the description text. Vague descriptions get skipped; specific ones get pulled in.

## Rules

1. **Name verbs, nouns, and scope.** Say what the agent does and where it operates.
2. **Avoid generic nouns.** "Reviews code" → "Reviews changes to packages/api/* for breaking changes, missing tests, and OpenAPI drift."
3. **Include trigger phrases.** Words the user might actually say: "breaking change", "API review", "OpenAPI drift".
4. **Exclude irrelevant scope.** If the agent doesn't touch the frontend, say so implicitly by naming only backend paths.

## Examples

### Good

```yaml
description: >
  Reviewing changes to packages/api/* for breaking changes, missing tests,
  and OpenAPI drift. Use when: PR review on API surface, schema migration review,
  route contract verification.
```

```yaml
description: >
  비정상 시나리오에서 버그를 탐지하는 강건성 감사 에이전트.
  Use when: 안정성 테스트, 배포 전 엣지케이스 점검, 중단/복귀 시나리오 검증.
```

### Bad

```yaml
description: Helps with API stuff.
```

```yaml
description: Reviews code for quality.
```

## Bilingual descriptions

If the agent serves Korean-language workflows, include Korean trigger phrases alongside English ones. The model matches on both.

## Description length

Keep it under 3 lines. Long descriptions dilute the signal — move detail into the playbook body or a "Focus on" section instead.