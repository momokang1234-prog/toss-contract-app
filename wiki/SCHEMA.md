# Wiki Schema — toss-contract-app

## 디렉토리 구조

```
wiki/
  SCHEMA.md           # 이 파일 — 컨벤션 정의
  overview.md         # 전체 프로젝트 현황 요약
  projects/           # 프로젝트별 페이지
  topics/             # 기술 주제별 페이지
  decisions/          # 아키텍처/기술 결정 기록
```

## Frontmatter 규칙

모든 wiki 페이지는 다음 frontmatter를 포함해야 합니다:

```yaml
---
title: 페이지 제목
type: overview | project | topic | decision
updated: YYYY-MM-DD
sources:
  - <session-id-1>
  - <session-id-2>
tags:
  - tag1
  - tag2
---
```

### type 값 설명
- `overview` — 전체 현황 요약 (`wiki/overview.md`)
- `project` — 특정 프로젝트/기능 단위 (`wiki/projects/*.md`)
- `topic` — 기술 주제 (Supabase, TDS, 인증 등) (`wiki/topics/*.md`)
- `decision` — 아키텍처/기술 결정 (`wiki/decisions/*.md`)

## 파일 명명 규칙

- 소문자 + 하이픈 구분: `contract-form.md`, `supabase-auth.md`
- decision 파일: `YYYY-MM-DD-{이름}.md` (예: `2026-06-18-migrate-omp-to-claude.md`)

## 작성 규칙

1. **한국어**로 작성 (코드/경로/명령어/에러 메시지는 원문 유지)
2. `sources` 배열에 참조한 세션 ID를 반드시 포함
3. Obsidian 링크 `[[페이지명]]` 으로 관련 페이지 연결
4. 나중에 세션을 다시 열지 않아도 될 정도로 상세하게 작성
5. 페이지가 길어지면 하위 주제로 분리

## 상세도 기준

| 항목 | 포함 내용 |
|------|-----------|
| 기술 결정 | 왜 A를 선택하고 B를 버렸는지, 근거와 트레이드오프 |
| 코드/설정 | 논의된 코드 스니펫, 설정값, 명령어 원문 |
| 에러 해결 | 에러 메시지 → 원인 분석 → 해결 방법 |
| 수치 | 성능 수치, 파일 수, 테스트 결과 등 구체적 숫자 |
| 타임라인 | 결정이 내려진 순서와 맥락 |
