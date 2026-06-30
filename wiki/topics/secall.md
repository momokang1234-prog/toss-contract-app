---
title: seCall — 세션 검색엔진 시스템
type: topic
updated: 2026-06-30
sources:
  - 5ee60f73-b3b7-4142-83f0-9eedb49c95fa
tags:
  - secall
  - session-search
  - ingest
  - wiki-generation
  - llm-backend
---

# seCall — 세션 검색엔진 시스템

## 개요

`secall`은 Claude Code, Gemini CLI, Codex 등 AI 에이전트의 대화 세션 로그를 수집·색인·검색·위키화하는 로컬 검색 엔진.
vault 경로에 세션 raw 데이터를 저장하고, wiki/ 디렉토리에 정리된 지식 문서를 생성한다.

- **vault 경로**: `/root/toss-contract-app` (= 이 레포)
- **설정 파일**: `~/.config/secall/config.toml`
- **wiki 백엔드**: `claude` (`claude-3-7-sonnet-20250219`, max_tokens 4000)

## 설정 파일 (`~/.config/secall/config.toml`)

```toml
[vault]
path = "/root/toss-contract-app"
branch = "main"

[wiki]
default_backend = "claude"
generation_timeout_secs = 3600

[wiki.backends.claude]
model = "claude-3-7-sonnet-20250219"
max_tokens = 4000
```

## 지원 CLI 및 로그 위치

`secall ingest` 실행 시 아래 경로를 자동 스캔 (하드코딩된 경로 순회):

| CLI | 로그 경로 | 비고 |
|-----|-----------|------|
| **Claude Code** | `~/.claude/projects/` | JSON 세션 파일 |
| **Gemini CLI** | `~/.gemini/tmp/` 또는 `~/.gemini/sessions/` | JSON |
| **Codex** | `~/.codex/` | JSON |
| **ChatGPT / Claude.ai** | 사용자가 내보낸 ZIP 파일 직접 입력 | 웹 내보내기 |
| **Antigravity CLI (agy)** | `~/.gemini/antigravity-cli/conversations/` | **보류** (아래 참조) |

## Antigravity CLI (agy) ingest 보류 이유

근거 문서: `~/.cargo/git/checkouts/secall-.../docs/reference/antigravityIngestFeasibility.md`

### 데이터 형식

```
~/.gemini/antigravity-cli/conversations/   (2026-06 기준 대화 12개)
  ├── *.pb   (protobuf 바이너리, 11개, 212KB~27MB)   ← 구형식
  └── *.db   (SQLite + WAL, 1개)                     ← 신형식 (마이그레이션 중, 1/12만 전환)

~/.gemini/antigravity-cli/history.jsonl    (140줄, user 프롬프트 인덱스만)
~/.gemini/antigravity-cli/cache/*.json     (last_conversations / projects 메타데이터)
```

### SQLite `.db` 구조

`.db`도 내부는 **protobuf blob 컨테이너**:

- `trajectory_meta(trajectory_id, cascade_id, trajectory_type, source)`
- `steps(idx, step_type, status, has_subtrajectory, metadata BLOB, step_payload BLOB, step_format)`
- `gen_metadata` / `executor_metadata` / `battle_mode_infos` — 전부 `data BLOB`

대화 본문은 `steps.step_payload`(BLOB)에 protobuf로 인코딩. `step_format = 'binaryProto'`.

### 파싱 불가 이유 3가지

1. **스키마 비공개**: `.proto` 정의 미공개 → wire-format 역공학 필요 (fragile)
2. **마이그레이션 진행 중**: `.pb` → `.db` 전환이 1/12만 완료됨, 스키마 unstable
3. **데이터 모델 불일치**: `trajectory + steps` 계층 구조 vs. seCall의 `user/assistant turn` 단순 모델 — `step_type→role` 해석 + sub-trajectory 평탄화 추가 작업 필요

### `history.jsonl` (우회 경로) — 불충분

- 키: `conversationId / display / timestamp / workspace`
- `display` = user 프롬프트만. assistant 응답·tool·turn 구조 없음
- recall/wiki/graph 품질에 거의 무가치 → 채택 불가

### 판정표

| 경로 | 가능성 | 가치 | 평가 |
|------|--------|------|------|
| `.pb`/`.db` protobuf 정식 파싱 | proto 없어 역공학 필요 | 높음 (풀 대화) | 지금은 fragile |
| `history.jsonl` ingest | 즉시 가능 (안정 JSON) | 낮음 (프롬프트만) | 품질 미달 |
| 보류 (proto/schema 공개 대기) | — | — | **권장** |

### 재개 트리거 (구체적 조건)

다음 중 하나 충족 시 정식 파서 작성 재검토:

1. Antigravity가 `.proto` 정의 또는 protobuf descriptor를 공개 / SDK에 포함
2. `.db` 형식으로 전 대화 마이그레이션 완료 + 스키마 안정 (step_type enum 문서화)
3. 공식 export 명령 (`agy export` 등) 제공 → 안정 포맷으로 우회

재현 방법: `.db`는 read-only 복사 후 `sqlite3 <copy> ".schema"` + `step_payload`를 `strings`.
원본 절대 수정 금지 (실행 중 앱이 WAL 점유).

## ingest 파이프라인 — LLM 개입 단계

### 1단계: `secall ingest` — LLM 미사용

- 로그 폴더 스캔 → 새 세션 파일 감지
- **첫 번째 user turn 텍스트를 잘라서** 임시 summary/제목으로 사용 (LLM 없음)
- 정규식(Regex) 기반 키워드 매칭으로 기초 태그 부여
- 이유: 수백~수천 파일 처리 시 API 비용·시간 절약 → 기계적 처리로 0.1초 내 완료

### 2단계: `secall wiki update` — LLM 개입

- vault의 raw 세션 전체를 LLM에 전달
- LLM이 전체 문맥 파악 → 완성된 마크다운 위키 문서 생성
- 백엔드 기본값: `claude-3-7-sonnet-20250219`

### 3단계: `secall graph rebuild` — LLM 개입

- LLM이 세션 읽고 심층 의미 분석
- "이 세션은 `auth.ts` 파일을 수정했군(`modifies_file`)" 등 관계 추출
- 세션·파일·이슈 간 지식망(Knowledge Graph) 구축

비유: `ingest`는 택배 상자를 창고에 빠르게 쌓으며 송장 첫 줄만 보고 임시 라벨 붙이는 단순 작업.
위키 변환은 창고에서 내용물을 꺼내 정성스럽게 보고서 작성하는 지적 작업.

## 지원 LLM 백엔드

멀티 백엔드 구조 — 사용자가 상황에 맞춰 선택:

### 클라우드 (비용 발생)

| 백엔드 | 모델 예시 |
|--------|-----------|
| Claude API | `claude-3-7-sonnet-20250219` |
| Gemini API | `gemini-2.5-flash` |
| OpenAI / Codex | GPT-4o 등 |

### 로컬 (무료, 프라이버시)

| 백엔드 | 설명 |
|--------|------|
| Ollama | GPU 로컬 LLM — 소스코드 외부 전송 불가 환경에 유용 |
| LM Studio | OpenAI 호환 로컬 서버 |

**실무 조합 예시**: 일상 세션 태그 추출은 Ollama/Gemini Flash, 복잡한 아키텍처 세션 wiki 작성은 Claude Sonnet으로 혼용.

## 빌드 오류 (2026-06-30 기준)

현재 환경에서 소스 빌드 시 `numkong` 모듈 컴파일 에러:

```
error: attribute 'avx512fp16' argument 'target' is unknown
```

**원인**: 시스템 GCC 버전과 `numkong` 모듈의 AVX512 명령어셋 간 호환성 문제.
**영향**: `secall ingest` 자동화 불가, 수동 로그 분석만 가능.
**해결**: GCC 업그레이드 필요 (사용자 권한/정책에 따라 별도 결정).

## 관련 페이지

- [[agy-cli]] — Antigravity CLI 설정, hooks, 플래그
- [[research-team-pipeline]] — agy-cli A2A 파이프라인
