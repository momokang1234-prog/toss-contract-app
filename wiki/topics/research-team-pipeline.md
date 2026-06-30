---
title: research-team 피라미드 A2A 리서치 파이프라인
type: topic
updated: 2026-07-01
sources:
  - 9b988031-11a0-4515-b783-eda40dc57456
  - 2cb2bc2e-14e2-4e79-beaf-9a4a3a959e94
tags:
  - research-team
  - agy-cli
  - a2a
  - multi-agent
---

# research-team 피라미드 A2A 리서치 파이프라인

`/root/research-team/` 에 위치한 agy-cli 기반 다중 에이전트 자율 리서치 시스템.

## 아키텍처 개요

3계층 피라미드 구조로 리서치를 자율 분산 처리한다.

```
사용자 요청
    ↓
[오케스트레이터] — research-plugin/skills/research-orchestrator/SKILL.md
    ↓  (도메인 분할, invoke_subagent)
[도메인 매니저 ×N] — research-plugin/agents/domain-manager/agent.json
    ↓  (세부 주제별 spawn, invoke_subagent)
[리서처(Leaf) ×M] — research-plugin/agents/deep_researcher/agent.json
    ↓
[비주얼 아키텍트] — visual-plugin/agents/visual-architect/agent.json
    ↓
최종 리포트 (_workspace/ 저장)
```

### 계층별 역할

| 계층 | 파일 위치 | 결정 권한 |
|------|-----------|-----------|
| 오케스트레이터 | `research-plugin/skills/research-orchestrator/SKILL.md` | 주제를 2~4개 주요 도메인으로 분할 (넓이 결정) |
| 도메인 매니저 | `research-plugin/agents/domain-manager/agent.json` | VoI 기반으로 서브에이전트 파견 여부 결정 (깊이 결정) |
| 리서처 (Leaf) | `research-plugin/agents/deep_researcher/agent.json` | 세부 주제 하나를 search_web으로 집요하게 파고듦 |
| 비주얼 아키텍트 | `visual-plugin/agents/visual-architect/agent.json` | 결과를 HTML 대시보드로 시각화 |

## VoI 기반 동적 위임 (2026-06-30 업그레이드)

도메인 매니저 시스템 프롬프트에 적용된 **VoI-BASED DYNAMIC DELEGATION** 로직.

- **기존 (Rule-based)**: 하위 주제 N개 → 무조건 N명 리서처 파견
- **변경 (AI-judged)**: 발견된 데이터의 중요도(Criticality)와 영향력(Impact)을 AI가 자율 평가

```
High VoI (핵심 데이터) → 서브에이전트 파견하여 끝까지 파고들 것
Low VoI (주변부 데이터) → 해당 브랜치 리서치 즉각 중단, 컴퓨팅 자원 절약
```

VoI 판단 기준: "이 정보가 결론 도출에 결정적인가? 아직 출처 교차 검증이 부족한가?"

## A2A 통신 (Agent-to-Agent Collaboration)

타이밍: **완전한 이벤트 기반 (Event-driven)**. 고정된 시간이나 순서 없음.

- 에이전트가 "내 도메인이 아닌 다른 도메인의 핵심 단서를 발견했을 때" → `send_message` 즉시 발송
- 에이전트가 "다른 도메인 데이터가 필수적이라고 판단한 순간(Dead-end)" → 해당 도메인 매니저에게 `send_message`
- 로직 위치: `domain-manager/agent.json` 내 `A2A COLLABORATION` 지시문

## seCall 연동

오케스트레이터와 도메인 매니저 모두 웹 검색 전 seCall 내부 지식베이스를 먼저 조회한다.

- `secall/recall` 또는 `secall/wiki_search`로 중복 리서치 방지
- 리포트 최종 납품 후 `Phase 5: Delivery & Archiving` 단계에서 `secall sync` 자동 실행
- **seCall 바이너리 절대경로** (2026-06-30 픽스): `/root/seCall/target/release/secall`
  - 이전에 `secall`(상대경로)로 설정되어 MCP 서버 실행 및 sync 오류 발생
  - 수정된 파일:
    - `/root/.gemini/config/plugins/secall-plugin/plugin.json` — MCP command 절대경로로 변경
    - `research-plugin/skills/research-orchestrator/SKILL.md` — Phase 5 sync 명령어 절대경로로 변경

## 비주얼 아키텍트 — 시각화 규칙 (2026-06-30 업그레이드)

### 언어 고정
- 모든 출력(제목, 본문, 분석)은 **반드시 한국어(Korean)로만** 작성
- 수정 파일: `visual-plugin/agents/visual-architect/agent.json` 시스템 프롬프트, `visual-plugin/skills/neuro-visual-architect/SKILL.md`

### 타이포그래피 우선 (Typography & Text First)

**가독성과 정보 전달이 최우선 목표. 디자인 컴포넌트 억지 사용 금지.**

```
원칙: 텍스트로 풀어내는 것이 정보 전달에 유리할 경우,
      CSS 컴포넌트 없이 <p>, <strong>, <h1>~<h3>로만 작성.
      충분한 줄바꿈과 문단 여백으로 가독성 확보.
```

### 상황별 컴포넌트 사용 규칙

| 상황 | 사용 CSS 클래스 |
|------|----------------|
| A vs B 대조 | `.comparison-container` 또는 `.split-container` |
| 사분면/매트릭스 평가 | `.decision-matrix` 또는 `.matrix-grid` |
| 연대기/흐름 | `.timeline` 또는 `.roadmap-wrapper` |
| 단계별 프로세스 | `.process-container`, `.kanban-board`, `.funnel-wrapper` |
| 데이터 비율 | `.donut-wrapper`, `.bar-chart-wrapper`, `.radar-wrapper` |
| 핵심 인사이트 | `.insight-box` 또는 `.verdict-box` |
| 계층 구조 | `.pyramid-container` |

## 주요 파일 경로

```
/root/research-team/
  .agents/
    plugins/
      research-plugin/
        agents/
          domain-manager/agent.json      # VoI 판단 로직
          deep_researcher/agent.json     # Leaf 리서처
        skills/
          research-orchestrator/SKILL.md # 전체 리서치 흐름, Phase 1~5
      visual-plugin/
        agents/
          visual-architect/agent.json    # 한국어 고정, 시각화
        skills/
          neuro-visual-architect/SKILL.md # 타이포그래피 우선 로직
  _workspace/                           # 중간 결과물 저장
  gemini_domain2_sources.md            # Gemini 학습 데이터 소스 리포트 (2026-06-30)
```

## 2025~2026 MAS 평가 트렌드 (리서치 산출물 요약)

세션 9b988031 에서 `search_web`으로 조사한 MAS 테스트/평가 동향.

- **AgentOps 전환**: LLMOps(모델 성능 최적화) → AgentOps(자율 협업·오케스트레이션·프로토콜 관리)
- **A2A 프로토콜**: AI 에이전트 간 "HTTP" 역할. MCP(도구 통합)와 함께 기업 환경 표준화
- **시스템 단위 평가 (MASEval)**: 개별 LLM 성능이 아닌 전체 시스템을 평가 단위로
- **주요 벤치마크**: GAIA, WebArena, OSWorld, SWE-Bench Verified, Tau²-Bench
- **보안 평가**: A2ASecBench (공급망 조작, 프로토콜 취약점 탐지)

### 향후 업그레이드 후보 아이디어 (미적용)

1. **Red Team 에이전트** — 최종 리포트 전 LLM-as-a-Judge 비판적 검증. 통과 실패 시 도메인 매니저에게 반려(Reject) → 재조사 강제하는 Self-reflective Loop
2. **OpenTelemetry(OTel) 옵저버빌리티** — A2A 통신을 터미널 로그 대신 DAG 시각 그래프로 추적
