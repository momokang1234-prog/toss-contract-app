---
title: toss-contract-app Wiki 전체 현황
type: overview
updated: 2026-07-01
sources:
  - 9d5fb614-0c8d-423d-9792-a3affc0c86b6
  - 6f153450-3fce-4e9a-a711-48185748d13b
  - a0dcf08d-841c-4d20-b8fb-9916e9e47024
  - df398adb-3d44-45d8-bf14-d5682d8d978c
  - 02446945-940e-402b-bd6d-a82d522737af
  - 0d0f0381-8747-4062-9900-cd924d17622f
  - 9b988031-11a0-4515-b783-eda40dc57456
  - 2cb2bc2e-14e2-4e79-beaf-9a4a3a959e94
  - 33aaaa89-6581-4baa-a5b8-ac27a63cb5d6
  - eac871be-3429-4958-916d-0dddabf8fa2a
  - 0688defe-ad02-49c2-8f85-e1985c081066
  - 4e1e67ff-18b4-49b3-b437-df0ef921595c
  - 0b7ddfd9-e32e-4434-877a-6db20499b91c
tags:
  - overview
---

# toss-contract-app Wiki

## 프로젝트

사장님(employer)과 근로자(worker)가 **Apps-in-Toss 미니앱** 안에서 근로계약서를 작성·서명·보관하는 서비스.

- **스택**: React + TypeScript + Vite / Supabase Edge Functions / Granite 미니앱 / `@toss/tds-mobile` v2.4.0
- **개발 서버**: `http://localhost:5173`

## 세션 현황 (2026-07-01 기준)

- 총 세션: **345개** / 총 턴: (갱신 필요)
- 주요 에이전트: `claude-code`, `agy-cli` (antigravity-agent)
- 활성 프로젝트: `toss-contract-app` (claude-code 세션), 다수의 UUID 프로젝트 (agy-cli 세션)

## 주요 작업 타임라인

| 날짜 | 작업 | 세션 |
|------|------|------|
| 2026-06-15 | 에이전트 초기 설정 (OMP 형식), Supabase 인증 구성 | `72fb0bfb`, `ee7e92f5`, `b98760cb` |
| 2026-06-16 | Granite/TDS 미니앱 에이전트 정의, UX 테스트 워크스페이스 | `ccf85beb`, `85289e7f`, `d47a0604` |
| 2026-06-17 | **OMP→Claude 마이그레이션**, per-day 근무시간 구현, 테스트 64/64 | `a0dcf08d`, `9d5fb614`, `66e5c929` |
| 2026-06-18 | mTLS/알림 구현 이어서, Tossface 폰트 연동, CLAUDE.md 생성 | `6f153450` |
| 2026-06-22 | 근로자 알림 방식 조사 → share API 확정 | `df398adb` |
| 2026-06-24~25 | 계약서 폼 UX 개선, 퍼널 스텝, 계약서 Document/Preview | `dd07e058`, `3c64e530`, `d2a15b64`, `352c6aa2` |
| 2026-06-26 | Desktop RPA WSL-Windows 인터롭 테스트 (`rpa_test.sh` 실행) | `02446945` |
| 2026-06-26 | 2-Step WebP 캡처 Zero-Dependency 아키텍처 의도 문서화 (`wsl-interop-examples.md`) | `0d0f0381` |
| 2026-06-30 | research-team A2A 파이프라인 개선: seCall 절대경로 픽스, visual-architect 한국어 고정, VoI 기반 도메인 매니저 업그레이드, MAS 평가 트렌드 리서치 | `9b988031`, `2cb2bc2e` |
| 2026-06-30 | research-team 업그레이드 최종 리포트 합성: 3개 도메인 리포트 → `upgrade_final_report.md` (DAG 아키텍처·MCP·Guardrails 3단계 로드맵) | `33aaaa89` |
| 2026-06-30 | research-team **워크스페이스 구조** 분석 및 4단계 마이그레이션 플랜 합성: 기술 부채(빌드 스크립트 충돌·데드 코드·절대경로) 식별 → `_workspace/reports/final_upgrade_report.md` 생성 | `eac871be`, `0688defe` |
| 2026-06-30 | Gemini 인프라 도메인 리서치 (Domain 3): Colossus 분산 스토리지·TPU 아키텍처·벡터 임베딩 DB → `gemini_domain3_infrastructure.md` 생성 | `4e1e67ff` |
| 2026-06-30 | research-team 디렉토리 구조 분석: `plan.md`(초기 3에이전트 설계), `skill_authoring_plan.md`(11개 데이터 스킬 상세 계획), 샘플 출력물(AU/NZ 상업용 기기 컴플라이언스) 확인 → `a102cb5c`에 보고 | `0b7ddfd9` |

## 위키 구조

```
wiki/
  SCHEMA.md                     # 컨벤션 정의
  overview.md                   # 이 파일
  projects/
    toss-contract-app.md        # 프로젝트 전체 개요
  topics/
    supabase.md                 # DB/Auth/Edge Functions
    smart-messenger.md          # 알림 구현 (mTLS + share)
    contract-form.md            # 계약서 폼 퍼널, per-day 근무시간
    tds-mini-app.md             # TDS 컴포넌트, Granite 설정
    agent-setup.md              # .claude/ 에이전트/커맨드 설정
    desktop-rpa.md             # WSL-Windows 인터롭, PowerShell RPA
    research-team-pipeline.md  # agy-cli 피라미드 A2A 리서치 파이프라인
  decisions/
    2026-06-17-migrate-omp-to-claude.md       # OMP → Claude 마이그레이션
    2026-06-22-worker-notification-share-api.md  # 근로자 알림 방식
```

## 현재 알려진 미완료 사항

| 항목 | 파일 | 상태 |
|------|------|------|
| Supabase 마이그레이션 008 DB 적용 | `supabase/migrations/008_work_schedule.sql` | 파일 있음, DB 미적용 |
| mTLS 스마트메시지 Bearer 코드 교체 | `supabase/functions/contracts-sign/index.ts` | 구버전 코드 잔존 |
| OG 이미지 | `public/og-contract.png` | 파일 없음 |
| dev 변형 TSC 에러 | `src/pages/dev/WorkerVariant*.tsx` | ListRow/Badge prop 불일치 |
| per-day UI 실제 렌더 확인 | 개발 서버 | 시각 검증 미완료 |

## 빠른 참조

### 키 파일 경로

| 목적 | 경로 |
|------|------|
| Supabase 클라이언트 | `src/api/supabase.ts` |
| 근로자 공유 | `src/api/smart-messenger.ts` |
| 계약서 훅 | `src/hooks/useContracts.ts` |
| 계약서 도메인 | `src/domain/contract/schema.ts` |
| Granite 설정 | `granite.config.ts` |
| Vite 설정 | `vite.config.ts` |
| UX 테스트 세션 | `server/ux-test-sessions/` |

### 에이전트 선택 가이드

| 상황 | 에이전트 |
|------|----------|
| Supabase/RLS/Edge Functions | `toss-app-dev:supabase` |
| TDS 컴포넌트/Granite/미니앱 | `toss-app-dev:toss-mini-app` |
| Vite 빌드 오류 | `toss-app-dev:vite` |
| 아키텍처 리뷰 | `toss-app-dev:review-board` |
| UX 감사 | `ux-auditor` |
| 기능 테스트 | `functional-qa` |
| 엣지케이스 | `robustness-auditor` |
