---
title: .omp에서 .claude로 에이전트 마이그레이션
type: decision
updated: 2026-06-26
sources:
  - a0dcf08d-841c-4d20-b8fb-9916e9e47024
  - 72fb0bfb-6933-481d-a1eb-af1320d58673
  - 6e6b9f4f-613c-4a56-b202-06b6e1bbb570
  - 3aceda07-6563-43a1-a1a0-5aaa7ca927e5
  - 63415052-cfe3-485f-afc2-9593c57d34e7
tags:
  - decision
  - omp
  - claude-code
  - migration
  - agents
---

# 결정: .omp에서 .claude로 에이전트 마이그레이션

## 날짜

2026-06-17 ~ 2026-06-18

## 배경

toss-contract-app은 원래 `.omp/` (Oh My Prompt) 형식으로 에이전트와 스킬을 관리하고 있었다. Claude Code가 발전하면서 네이티브 서브에이전트(`.claude/agents/`) 및 커맨드(`.claude/commands/`) 시스템이 안정화되었고, OMP 의존성을 제거하고 Claude Code 네이티브 방식으로 전환하기로 결정.

## 결정

`.omp/agents/*.md` → `.claude/agents/*.md`
`.omp/skills/**/skill.md` → `.claude/commands/*.md`
`.omp/rules/` → `CLAUDE.md` 통합

## 변환 규칙

### frontmatter 변환

OMP 형식 → Claude Code 형식:

```yaml
# OMP (삭제/무시)
tools: [Bash, Read, ...]
thinkingLevel: high
spawns: [other-agent]
read-summarize: true
skills: [skill-name]
autoloadSkills: true

# Claude Code (필수)
name: agent-display-name
description: "When to use this agent"
color: green  # 선택
```

### skill:// URL 참조 변환

```
skill://ux-test-guardrail
→ ./.omp/skills/ux-test-guardrail/skill.md (상대 경로로)
```

참조 파일은 원래 위치(`.omp/skills/*/references/`)에 그대로 두고, 커맨드에서 상대 경로로 링크.

### AGY CLI 호환성

agy-cli (Antigravity SDK)는 OMP 형식과 직접 호환되지 않음:
- OMP 에이전트 파일 형식과 AGY 규격은 다름
- AGY 규격으로 수동 변환 필요
- 결론: AGY 에이전트는 별도로 관리, Claude Code 에이전트와 중복 운영

## 최종 구조

```
.claude/
  agents/
    toss-app-dev-supabase.md
    toss-app-dev-toss-mini-app.md
    toss-app-dev-vite.md
    toss-app-dev-review-board.md
    ux-auditor.md
    functional-qa.md
    robustness-auditor.md
    code-structure-analyzer.md
    omp-helper.md
    agy-helper.md
  commands/
    intent-analyzer.md
    tds-design-to-dev-ux-test.md
    ux-comment-analyzer.md
    ux-test-guardrail.md
    agent-authoring.md
    skill-authoring.md
CLAUDE.md
```

## 결과

- Claude Code `Agent` 도구로 서브에이전트 직접 호출 가능
- `CLAUDE.md`에 에이전트/커맨드 표 + 검증 게이트 규칙 통합
- OMP 의존성 제거 완료

## 관련 페이지

- [[agent-setup]] — 현재 에이전트 설정 상세
