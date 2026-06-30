---
title: research-team 피라미드 A2A 리서치 파이프라인
type: topic
updated: 2026-07-01
sources:
  - 9b988031-11a0-4515-b783-eda40dc57456
  - 2cb2bc2e-14e2-4e79-beaf-9a4a3a959e94
  - 33aaaa89-6581-4baa-a5b8-ac27a63cb5d6
  - eac871be-3429-4958-916d-0dddabf8fa2a
  - 0688defe-ad02-49c2-8f85-e1985c081066
  - 4e1e67ff-18b4-49b3-b437-df0ef921595c
  - 0b7ddfd9-e32e-4434-877a-6db20499b91c
  - 541c1dc6-480a-45b4-906d-7ca80467d5d0
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
  gemini_domain3_infrastructure.md     # Gemini DB/인프라 리포트 (2026-06-30, 세션 4e1e67ff)
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

## A2A 파이프라인 업그레이드 최종 로드맵 (2026-06-30 확정)

세션 `33aaaa89` 에서 agy-cli 서브에이전트가 3개 도메인 리포트를 종합해
`/root/research-team/upgrade_final_report.md` 를 생성했다. (완료 후 부모 에이전트 `9b988031`에게 `send_message`로 납품)

위의 "업그레이드 후보 아이디어"가 아래 3단계 로드맵으로 구체화되었다.

### Phase 1 — Architectural Foundation & Decentralization

- **목표**: 모놀리식 오케스트레이터 구조 → **동적 DAG (Directed Acyclic Graph)** 기반 아키텍처로 전환
- 각 도메인 매니저가 런타임에 서브트리를 독립적으로 확장/축소할 수 있는 구조 지향
- OTel 기반 DAG 시각 추적 포함 (업그레이드 후보 아이디어 2번 구체화)

### Phase 2 — Integration Standardization & Agentic RAG

- **목표**: 도구 접근 표준화 및 자기 반성 루프 도입
- **MCP(Model Context Protocol)** 를 에이전트 도구 레이어 표준으로 채택 (seCall MCP 연동과 연속성)
- **Critique Node (비평 노드)** 삽입: 각 도메인 리포트 납품 전 LLM-as-a-Judge 자기 반성 단계
- Self-reflective Loop: 비평 통과 실패 → 해당 도메인 매니저에게 반려 → 재조사 강제 (업그레이드 후보 아이디어 1번 구체화)

### Phase 3 — Assured Autonomy & Security Guardrails

- **목표**: 자율성 보장 + 보안 가드레일
- **Proactive Guardrails**: 잘못된 방향의 리서치를 사전에 차단하는 가드레일 에이전트
- **Zero-trust Auditing**: A2A 통신 메시지에 대한 신뢰 검증 레이어
- **Automated Hallucination Checks**: A2A 파이프라인 내부에서 자동 환각 탐지 및 교차 검증

### 관련 파일

```
/root/research-team/
  upgrade_final_report.md   # 3단계 업그레이드 로드맵 최종 리포트 (세션 33aaaa89 산출물)
```

## Gemini DB/인프라 도메인 리서치 산출물 (2026-06-30)

세션 `4e1e67ff` — agy-cli 도메인 매니저 역할로 `search_web` 4회 조사 후
`/root/research-team/gemini_domain3_infrastructure.md` 생성. 부모 세션 `9b988031`에 `send_message`로 납품.

### 조사 항목 및 핵심 내용

#### 1. Gemini 모델 아키텍처 및 훈련 인프라
- 기반: **Transformer 아키텍처** (멀티모달 네이티브 — 텍스트·이미지·오디오·비디오·코드 동시 처리)
- 훈련 하드웨어: **TPU v4/v5e** 클러스터, 프레임워크 **JAX + Pathways**
- 모델 패밀리: Nano(온디바이스) / Flash(처리량 최적화) / Pro·Ultra(복잡 추론)

#### 2. Gemini 임베딩 & 벡터 데이터베이스
- 모델: **Gemini Embedding 2** — 멀티모달 통합 벡터 공간(텍스트·이미지·비디오 → 단일 공간)
- **MRL (Matryoshka Representation Learning)**: 출력 차원 수 조절 가능 (크기 vs 정밀도 트레이드오프)
- Gemini는 임베딩 생성만, 저장·검색은 별도 벡터 DB 필요
- 호환 벡터 DB: Pinecone, Qdrant, **pgvector**(PostgreSQL), Cloud SQL for MySQL
- Google Cloud 내: **Vertex AI Vector Search** (ANN/KNN 인덱싱, 엔터프라이즈 스케일)

#### 3. Colossus 분산 스토리지
- Google 내부 분산 파일시스템 (GFS 후속), YouTube·Gmail·Google Cloud Storage 등 전사 공통
- AI 워크로드용: **Rapid Bucket (Rapid Storage)** — Colossus 위에서 동작하는 고성능 AI 훈련 스토리지
- 성능: 양방향 gRPC 기반, **15+ TiB/s 대역폭**, 서브 밀리초 레이턴시, 수백만 RPS
- GPU/TPU "메모리 벽" 해소 목적: 칩에 데이터를 충분히 빠르게 공급

#### 4. TPU 인프라 상세
- 배포 단위: **TPU Pod** (수천 개 칩을 단일 고성능 시스템으로)
- 연결: **ICI (Inter-Chip Interconnect)** + **OCS (Optical Circuit Switching)** (저레이턴시 동적 재구성)
- 최신 세대 (2026):
  - **TPU 8t** — 훈련 최적화
  - **TPU 8i** — 추론/에이전틱 워크로드 최적화
- 핵심 기능: **SparseCore** (임베딩 가속), 확장된 온칩 SRAM (대규모 KV 캐시 처리)
- 소프트웨어: **AI Hypercomputer** 아키텍처, JAX/PyTorch/TensorFlow 지원

---

## research-team 워크스페이스 구조 업그레이드 분석 (2026-06-30)

세션 `eac871be` (오케스트레이터)가 `/research-plugin:research-orchestrator` 스킬로
`/root/research-team` 디렉토리 구조 자체의 개선 방안을 리서치했다.
서브에이전트 `0688defe`가 3개 도메인 리포트를 종합해
`/root/research-team/_workspace/reports/final_upgrade_report.md`를 생성한 후,
부모 오케스트레이터에게 `send_message`로 납품.

> ⚠️ 이 리포트는 A2A 파이프라인 아키텍처 업그레이드(`upgrade_final_report.md`)와 별개.
> 코드/디렉토리 조직 구조 개선이 주제.

### 식별된 기술 부채 (Current Technical Debt)

| 문제 | 설명 |
|------|------|
| **빌드 스크립트 충돌** | `build_agents.py`와 `build_pyramid.py`가 서로의 출력을 덮어씀 → 예측 불가한 시스템 상태 |
| **숨은 의존성** | `build_pyramid.py`가 암묵적으로 생성된 `analyst` 에이전트에 의존 |
| **데드 코드** | `generate_skills.py`가 한국어 스킬을 생성하지만 `update_skills.py`가 즉시 덮어씀 |
| **아키텍처 불일치** | 11개 핵심 데이터 스킬이 `.agents/skills/` (전역)에 위치 → 의도된 플러그인 캡슐화(`.agents/plugins/research-plugin/skills/`)를 위반 |
| **하드코딩된 절대경로** | 빌드 스크립트에 절대경로 사용 → 이식성 저하 |
| **루트 디렉토리 오염** | 실행 출력물, 프로젝트 문서, `.obsidian/` 에디터 아티팩트가 루트에 혼재 |

### 목표 아키텍처 — 4단계 마이그레이션 플랜

참고 프레임워크: CrewAI, AutoGen, LangGraph 디렉토리 관행.

#### Phase 1 — Repository Cleanup & Clutter Reduction
- 리서치 출력물·기획 문서 → `_workspace/docs/`, `_workspace/reports/`로 이동
- `.gitignore` 도입 (`.obsidian/` 제외)
- 표준 디렉토리 스캐폴딩: `config/`, `src/`, `scripts/`, `tests/`

#### Phase 2 — Build Script 통합 & 리팩토링
- `generate_skills.py` 데드 코드 제거
- `update_skills.py` → `scripts/deploy_skills.py`로 이름 변경·이동
- `build_agents.py` + `build_pyramid.py` → `scripts/build_research_system.py`로 통합 (숨은 의존성 해소)
- 반복 파일 연산 추상화 → `scripts/utils.py`
- 하드코딩된 절대경로 → 상대경로로 교체

#### Phase 3 — 아키텍처 정렬 (Architectural Alignment)
- 11개 핵심 데이터 스킬: `.agents/skills/` → `.agents/plugins/research-plugin/skills/`로 마이그레이션
- 에이전트 프롬프트·정체성: `config/agents.yaml`로 추출 (선언적 설정 분리)
- 워크플로우 라우팅: `src/orchestrator/`로 중앙화

#### Phase 4 — Shared Workspace & State Management
- 모든 에이전트 I/O → `_workspace/` 디렉토리로 표준화
- 엄격한 글로벌 상태 스키마 구현: `src/state.py` (에이전트 핸드오프 시 컨텍스트 환각 방지)

### 산출 파일

```
/root/research-team/
  _workspace/
    reports/
      current_structure_analysis.md  # 도메인1: 현재 구조 분석 (세션 eac871be 서브에이전트)
      best_practices.md               # 도메인2: CrewAI/AutoGen/LangGraph 모범 사례
      migration_plan.md               # 도메인3: 마이그레이션 플랜
      final_upgrade_report.md         # 최종 종합 리포트 (세션 0688defe 산출물)
```

---

## 초기 하네스 구축 계획 — plan.md (세션 0b7ddfd9 분석)

세션 `0b7ddfd9` (2026-06-30)에서 agy-cli가 `/root/research-team/plan.md`를 분석했다.
현재 4계층 피라미드 아키텍처의 **원형(原型)** 이 되는 초기 3에이전트 설계안.

### 초기 3에이전트 구조

```
.agents/plugins/research-plugin/
├── plugin.json
├── agents/
│   ├── researcher/
│   │   └── agent.json        # 현재 deep_researcher와 대응
│   └── analyst/
│       └── agent.json        # 현재 도메인 매니저와 대응
└── skills/
    ├── research-orchestrator/
    │   └── SKILL.md
    ├── web-researcher/
    │   └── SKILL.md
    └── report-writer/
        └── SKILL.md
```

| 에이전트 | 역할 | 적용 방법론 |
|----------|------|-------------|
| **Orchestrator** | 전체 파이프라인 조율 (계획→수집→분석→보고), Data Freshness 기반 캐시 판단 | Data Freshness 관리 |
| **Researcher** (web-researcher 스킬) | 인터넷·문서에서 Raw 데이터 수집 및 1차 검증 | 크롤링/스크레이핑, 출처 다양화, 메타데이터 확인, 교차 검증 |
| **Analyst** (report-writer 스킬) | 통계적 오류 교정 및 최종 분석 보고서 작성 | 데이터 마이닝, 데이터 정제, 이상치 제거, 표본 설계·통계적 유의성, A/B 테스트 |

> 📌 초기 계획(3에이전트)은 이후 세션들을 거쳐 4계층 피라미드(오케스트레이터→도메인 매니저→리서처 Leaf→비주얼 아키텍트)로 확장됨.

---

## 11개 핵심 데이터 스킬 상세 계획 (skill_authoring_plan.md)

`/root/research-team/skill_authoring_plan.md`에 정의된 각 SKILL.md `## 지침 (Instructions)` 섹션 작성 가이드라인.

| # | 스킬 ID | 핵심 지침 요약 |
|---|---------|----------------|
| 1 | `data-mining` | EDA vs 예측 모델링 구분; Association Rules/Clustering/Classification 선택 기준; pandas·scikit-learn 기본 도구; 결과는 반드시 비즈니스 인사이트로 번역 |
| 2 | `sampling-design` | SRS 외 층화(Stratified)·군집(Cluster) 추출 기준; 생존자/선택 편향 체크리스트; Confidence Level·Margin of Error 기반 샘플 사이즈 산정 |
| 3 | `crawling-scraping` | robots.txt·법적 제약 선행 확인; 정적(requests+BeautifulSoup) vs 동적(Selenium/Playwright) 도구 선택 기준; Rate Limiting·User-Agent 윤리 수집 준수 |
| 4 | `data-cleaning` | 결측치(MCAR/MAR/MNAR 분류)·중복·형식 불일치 처리 순서; 정제 전/후 레코드 수·결측률 로그 의무화 |
| 5 | `statistical-significance` | 귀무가설·대립가설 명시; 표본 크기 충족 후 p-value 계산; p<0.05 이상 결론 도출 금지; 효과 크기(Cohen's d/r) 병기 |
| 6 | `cross-validation` | 출처 2개 이상 독립적으로 수집; 이견 발생 시 제3 출처 추가; 수렴 출처 수 및 이견 내용 보고에 명시 |
| 7 | `data-triangulation` | 정부 공공 데이터·학술지·민간 API 3종 최소화; 복수 방법론(설문+웹스크레이핑+공개 DB) 병행; Key값(국가코드·연도) 일치화 후 Join |
| 8 | `outlier-detection` | IQR×1.5 또는 Z-Score≥3 통계 기준 + Isolation Forest ML 탐지 병행; 입력 오류는 제거/대체, 자연 발생 극단값(블랙스완)은 분리 분석 |
| 9 | `metadata-analysis` | 수집 파일 생성일·작성자·수정 내역·라이선스 권한 파악; 사전 정의 데이터 스키마(Data Dictionary)와 타입·구조 일치 검증 |
| 10 | `data-freshness` | 정적 데이터(연 단위) vs 동적 데이터(일/분 단위) TTL 구분; 마지막 갱신일 이후만 수집하는 증분(Delta Load) 처리 |
| 11 | `ab-testing` | "A를 하면 B가 O% 상승" 형식의 귀무·대립가설 수립; 대조군/실험군 무작위 배정 후 A/A 테스트 1차 검증; MDE(최소 탐지 효과) 기반 필요 트래픽 계산 |

---

## research-team 디렉토리 파일 목록 확인 (세션 0b7ddfd9)

2026-06-30 기준 `list_dir` 도구로 확인된 `/root/research-team/` 루트 파일 목록:

```
/root/research-team/
  .agents/              # 서브디렉토리: hooks/, plugins/, skills/
  .obsidian/            # Obsidian 에디터 아티팩트 (기술 부채)
  build_agents.py       (4,788 bytes)
  build_pyramid.py      (5,034 bytes)
  build_visualizer.py   (4,362 bytes)
  compliance_checklist.md  (5,192 bytes)  # 리서치 출력 샘플: AU/NZ 시장 진출 컴플라이언스
  fact_check_raw.md     (4,750 bytes)     # 리서치 출력 샘플: 유럽 vs AU/NZ 규정 팩트체크
  generate_skills.py    (5,302 bytes)     # 데드 코드 (update_skills.py가 즉시 덮어씀)
  interactive_agent.py  (625 bytes)
  plan.md               (3,805 bytes)     # 초기 3에이전트 하네스 구축 계획
  reports/              # 서브디렉토리
  skill_authoring_plan.md  (5,887 bytes) # 11개 핵심 데이터 스킬 상세 계획
  update_skills.py      (11,201 bytes)
```

### 리서치 출력 샘플 파일 (compliance_checklist.md, fact_check_raw.md)

상업용 식기세척기 AU/NZ 수출 컴플라이언스를 주제로 한 파이프라인 실제 리서치 출력물.

**주요 내용 요약 (fact_check_raw.md 팩트체크 결과):**

| 항목 | 결론 |
|------|------|
| 전기 안전: CB 스킴 + Delta 테스팅 | **TRUE** — 기존 IECEE CB Report 제출 가능, 국가 편차(Deviations)에 대해서만 Delta Testing 추가 |
| 전원 플러그: AS/NZS 3112 (Type I) | **TRUE (실무)** — 상업용 환경 어댑터 사용 불가; WHS 법상 Testing & Tagging 검사 실패 |
| EMC: RCM 마크 (ACMA) | **TRUE** — EU CE/UKCA 인증 데이터 직접 유용 불가, ISO 17025 인증 랩의 별도 테스팅 필수 |
| 물·에너지 효율: WELS/MEPS | **TRUE** — EU 기준과 AU 기준(AS/NZS 2007.1:2021) 상이, 별도 인증 랩 테스팅 필수 |
| 스마트 기기 보안 | **부분 TRUE** — ACMA가 아닌 호주 내무부(Home Affairs) 소관, 2026-03-04 발효; 3대 요건: ①기본 비밀번호 금지 ②취약점 보고 ③보안 업데이트 투명성 |
| 현지 법적 대리인 | **TRUE** — EESS 외국 제조사 직접 등록 불가; ABN/NZ IRD 보유 현지 법인 또는 수입업자 지정 필수 |
