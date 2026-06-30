---
title: Claude 에이전트 및 커맨드 설정
type: topic
updated: 2026-06-26
sources:
  - a0dcf08d-841c-4d20-b8fb-9916e9e47024
  - 72fb0bfb-6933-481d-a1eb-af1320d58673
  - 6e6b9f4f-613c-4a56-b202-06b6e1bbb570
  - 3aceda07-6563-43a1-a1a0-5aaa7ca927e5
  - 63415052-cfe3-485f-afc2-9593c57d34e7
  - 232a782f-4f04-49d8-814c-ec9ab1d5a3cf
  - 219ddb3e-f941-430b-897c-e544920f6a48
tags:
  - claude-agents
  - commands
  - omp-migration
  - configuration
---

# Claude 에이전트 및 커맨드 설정

## 마이그레이션 이력

2026-06-17~18에 `.omp/` → `.claude/`로 전환.
자세한 내용: [[2026-06-17-migrate-omp-to-claude]]

## 디렉토리 구조

```
.claude/
  agents/          # 서브 에이전트 정의 (.md)
  commands/        # 커맨드/스킬 정의 (.md)
CLAUDE.md          # 프로젝트 지침 (스택, 에이전트 표, 검증 게이트)
```

## 에이전트 목록

`.claude/agents/` 디렉토리:

| 파일명 | frontmatter name | color | 역할 |
|--------|-----------------|-------|------|
| `toss-app-dev-supabase.md` | `toss-app-dev:supabase` | green | Supabase auth, RLS, Edge Functions, migrations |
| `toss-app-dev-toss-mini-app.md` | `toss-app-dev:toss-mini-app` | teal | Granite config, TDS components, deeplinks, sandbox |
| `toss-app-dev-vite.md` | `toss-app-dev:vite` | yellow | vite.config.ts, build errors, SSR, HMR |
| `toss-app-dev-review-board.md` | `toss-app-dev:review-board` | red | Architecture reviews, cross-domain decisions |
| `ux-auditor.md` | `ux-auditor` | pink | UX audit across all pages and flows |
| `functional-qa.md` | `functional-qa` | green | Feature testing, regression checks |
| `robustness-auditor.md` | `robustness-auditor` | orange | Edge case bugs (back nav, refresh, rapid clicks) |
| `code-structure-analyzer.md` | `code-structure-analyzer` | purple | Dependency graphs, complexity analysis |
| `omp-helper.md` | `omp-helper` | blue | omp CLI questions |
| `agy-helper.md` | `agy-helper` | blue | Google Antigravity CLI (agy) questions |

## 커맨드 목록

`.claude/commands/` 디렉토리:

| 파일명 | 트리거 | 용도 |
|--------|--------|------|
| `intent-analyzer.md` | `/intent-analyzer` | 요청 재프레이밍, 진짜 목표 발견, 대안 제시 |
| `tds-design-to-dev-ux-test.md` | `/tds-design-to-dev-ux-test` | TDS 컴포넌트로 5가지 레이아웃 제안 |
| `ux-comment-analyzer.md` | `/ux-comment-analyzer` | Xray 댓글 → 구현 플랜 |
| `ux-test-guardrail.md` | `/ux-test-guardrail` | 도메인 전문가 가드레일 검증 |
| `agent-authoring.md` | `/agent-authoring` | `.claude/agents/*.md` 작성/반복 |
| `skill-authoring.md` | `/skill-authoring` | `.claude/commands/*.md` 작성/반복 |

## OMP → Claude 프론트매터 변환 규칙

Claude Code 에이전트 `.md` 필수 frontmatter:

```yaml
---
name: agent-name
description: When to use this agent
color: green  # optional
---
```

OMP에서 **삭제된** 필드:
- `tools` — Claude Code에서 불필요 (모든 도구 자동 사용)
- `thinkingLevel` — 없음
- `spawns` — 없음
- `read-summarize` — 없음
- `skills` / `autoloadSkills` — `.claude/commands/`로 이동

OMP `skill://` URL 참조 → 프로젝트 상대 경로로 변환:
- 예: `skill://ux-test-guardrail` → `./.omp/skills/ux-test-guardrail/skill.md`

## CLAUDE.md 검증 게이트

```
UI/Layout Change → 브라우저 스크린샷 또는 비전 체크
Text/Spacing/Font → 실제 렌더 확인 (--force 재시작 후)
CSS/Style Change → 브라우저에서 요소 inspect
Logic Change → 관련 테스트 통과
Server/Environment → curl로 HTTP 응답 확인

"TSC OK는 UI 검증이 아님"
```

## 관련 페이지

- [[toss-contract-app]] — 프로젝트 개요
- [[2026-06-17-migrate-omp-to-claude]] — 마이그레이션 결정 상세
