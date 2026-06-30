---
title: Google Antigravity CLI (agy) 설정 및 사용법
type: topic
updated: 2026-06-30
sources:
  - 552d1bb7-2c55-4d49-8a2d-ad725746eb0a
tags:
  - agy
  - antigravity
  - hooks
  - cli-config
---

# Google Antigravity CLI (agy)

## 개요

`agy`는 Google Antigravity 플랫폼의 터미널 기반 경량 에이전트 인터페이스 (`antigravity-agent` 모델 사용).
이 프로젝트에서는 리서치 파이프라인 및 서브에이전트 조율에 활용한다.

## 설정 파일 경로

### 글로벌(전역) 설정 — 모든 프로젝트 공통

| 파일 | 경로 | 설명 |
|------|------|------|
| 훅 설정 | `~/.gemini/config/hooks.json` | 라이프사이클 훅 전역 정의 |
| MCP 설정 | `~/.gemini/config/mcp_config.json` | MCP 서버 연결 설정 |
| 임포트 매니페스트 | `~/.gemini/config/import_manifest.json` | 임포트 경로 매핑 |

`~/.gemini/config/` 디렉토리 구조 (2026-06-24 기준):
```
~/.gemini/config/
  .migrated
  hooks.json         # 510 bytes
  import_manifest.json
  mcp_config.json
  plugins/
  projects/
```

### 워크스페이스(로컬) 설정 — 프로젝트별

| 파일 | 경로 | 설명 |
|------|------|------|
| 훅 설정 | `/root/toss-contract-app/.agents/hooks.json` | 이 프로젝트 전용 훅 |
| MCP 설정 | `/root/toss-contract-app/.agents/mcp.json` | 이 프로젝트 전용 MCP |

로컬 `.agents/` 디렉토리 구조:
```
.agents/
  hooks.json        # 188 bytes
  mcp.json
  agents/           # 서브에이전트 정의
  skills/           # 스킬 정의
```

## Hook 확인 방법

1. **CLI 내부 명령어**: `agy` 실행 후 `/hooks` 입력 → 현재 등록된 훅 목록 UI 표시
2. **파일 직접 열람**: `~/.gemini/config/hooks.json` 또는 `.agents/hooks.json` 읽기

## 주요 CLI 플래그

```
agy [flags] [subcommand]

-c / --continue             가장 최근 대화 계속
-i / --prompt-interactive   초기 프롬프트 실행 후 대화 계속
-p / --print                단일 프롬프트 비대화식 실행 (응답 출력 후 종료)
--print-timeout             print 모드 대기 타임아웃 (기본 5m)
--model                     이번 세션 모델 지정
--project                   이번 세션 프로젝트 ID
--add-dir                   워크스페이스 디렉토리 추가 (반복 가능)
--sandbox                   터미널 제한 샌드박스 모드
--dangerously-skip-permissions  모든 툴 권한 요청 자동 승인
--new-project               이번 세션에 새 프로젝트 생성
```

### 하위 명령어

| 명령어 | 설명 |
|--------|------|
| `agy changelog` | 변경 로그 및 릴리스 노트 |
| `agy models` | 사용 가능한 모델 목록 |
| `agy plugin install/uninstall/list/enable/disable` | 플러그인 관리 |
| `agy update` | CLI 업데이트 |
| `agy install` | 환경 경로 및 셸 설정 |

## 주요 설정 키 (`/settings` 또는 설정 파일)

| 키 | 타입 | 기본값 | 설명 |
|----|------|--------|------|
| `model` | string | `gemini-3.5-flash` | 메인 에이전트 모델 |
| `toolPermission` | string | `request-review` | 툴 확인 모드 (`always-proceed` / `request-review` / `strict` / `proceed-in-sandbox`) |
| `verbosity` | string | `high` | 에이전트 추적 상세 수준 (`high` / `low`) |
| `runningLightSpeed` | string | `medium` | 타이핑 딜레이 (`off` / `fast` / `medium` / `slow`) |
| `autoContext` | bool | — | 자동 컨텍스트 포함 여부 |
| `notifications` | bool | `false` | 태스크 완료 시 시스템 알림 |
| `maxConversationTurns` | int | `2000` | 최대 대화 턴 수 (`-1`은 무제한) |
| `useG1Credits` | bool | `false` | Google One AI 프리미엄 할당량 사용 |

## TUI 키보드 단축키

| 키 | 동작 |
|----|------|
| `ESC` | 활성 메뉴(`/skills`, `/settings` 등) 닫기 |
| `Ctrl+D Ctrl+D` | CLI 종료 (`/exit` 또는 `/quit`와 동일) |
| `Up/Down` | 명령어 히스토리 탐색 |

## TUI 전용 인터랙티브 명령어

| 명령어 | 설명 |
|--------|------|
| `/add-dir` | 현재 세션 워크스페이스에 디렉토리 추가 |
| `/agents` | 활성 서브에이전트 및 커스텀 에이전트 목록 |
| `/artifact` | TUI 아티팩트 뷰어 열기 |
| `/btw` | 전체 에이전트 실행 없이 빠른 사이드 질문 |
| `/hooks` | 현재 등록된 라이프사이클 훅 목록 확인 |
| `/skills` | 등록된 스킬 목록 |
| `/settings` | 설정 편집 |

## 관련 페이지

- [[research-team-pipeline]] — agy-cli 피라미드 A2A 리서치 파이프라인
- [[agent-setup]] — Claude Code 에이전트 설정 (agy-helper 에이전트 포함)
- [[secall]] — seCall 세션 검색엔진 (agy ingest 보류 이유 포함)
