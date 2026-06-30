---
type: schema
updated_at: 2026-06-26
---

# seCall Wiki Schema

## 페이지 구조

모든 wiki 페이지는 YAML frontmatter를 포함해야 합니다:

```
---
title: "페이지 제목"
type: project | topic | decision
created: YYYY-MM-DD
updated: YYYY-MM-DD
sources: ["session-id-1", "session-id-2"]
tags: ["tag1", "tag2"]
---
```

## 디렉토리 규칙

- `wiki/projects/` — 프로젝트별 페이지 (예: secall.md, tunaflow.md)
- `wiki/topics/` — 주제별 페이지 (예: rust-unsafe-patterns.md, korean-nlp.md)
- `wiki/decisions/` — 의사결정 기록 (예: 2026-04-05-embedder-trait.md)
- `wiki/overview.md` — 전체 위키 요약 + 페이지 목록

## 링크 규칙

- 세션 참조: `[[raw/.sessions/YYYY-MM-DD_session-id]]`
- 위키 내부 링크: `[[wiki/topics/topic-name]]`
- sources 배열에 참조한 세션 ID를 반드시 포함

## 파일명 규칙

- kebab-case (예: rust-unsafe-patterns.md)
- decision은 날짜 prefix (예: 2026-04-05-embedder-trait.md)

## 수정 금지

- `raw/.sessions/` 파일은 절대 수정하지 마세요 (immutable)
