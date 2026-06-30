---
title: toss-contract-app 프로젝트
type: project
updated: 2026-06-26
sources:
  - 9d5fb614-0c8d-423d-9792-a3affc0c86b6
  - 6f153450-3fce-4e9a-a711-48185748d13b
  - a0dcf08d-841c-4d20-b8fb-9916e9e47024
  - df398adb-3d44-45d8-bf14-d5682d8d978c
  - 6ce267c1-60fe-4833-b7b1-194969b9f2d6
tags:
  - toss-contract-app
  - overview
  - react
  - supabase
  - granite
---

# toss-contract-app 프로젝트

## 개요

사장님(employer)이 근로자(worker)와 근로계약서를 작성·서명하는 **Apps-in-Toss 미니앱**.

## 스택

| 레이어 | 기술 |
|--------|------|
| 프론트엔드 | React + TypeScript + Vite (`src/`) |
| 백엔드 | Supabase Edge Functions (`supabase/functions/`) |
| 미니앱 | Apps-in-Toss / Granite 프레임워크 (`granite.config.ts`) |
| UI | `@toss/tds-mobile` v2.4.0 |
| 개발 서버 | `http://localhost:5173` (점유 시 5174) |

## 디렉토리 구조 (주요)

```
src/
  api/
    supabase.ts          # Supabase 클라이언트 + 인증
    smart-messenger.ts   # shareContract (공유 시트)
  domain/
    contract/
      schema.ts          # Zod 스키마, Contract 타입
      template.ts        # 계약서 HTML 템플릿
      validation.ts      # calcWeeklyHoursFromSchedule 등
  hooks/
    useContracts.ts      # 계약서 CRUD 훅
  pages/
    employer/
      contract-form/     # 퍼널 폼 (Step 1~5)
        ContractFormProgress.tsx  # 슬라이딩 Badge Stepper
        formatSchedule.ts         # 근무시간 포맷 헬퍼
      ContractDetailPage.tsx
    worker/
      WorkerContractPage.tsx
    auth/
      LoginPage.tsx
supabase/
  functions/
    contracts-sign/      # 사장님용 mTLS 스마트메시지
    contracts-send/      # 계약서 전송 (share 방식)
    contracts-cancel/    # 계약서 취소
  migrations/
    008_work_schedule.sql  # per-day 근무시간 JSONB 마이그레이션
granite.config.ts          # 미니앱 설정
```

## 주요 기능 및 구현 상태

### 계약서 폼 (퍼널)

- **5단계 퍼널**: 기본 정보 → 급여 → 근무시간 → 체크리스트 → 서명
- `ContractFormProgress.tsx`: 슬라이딩 Badge Stepper (dev `FormStepLabelVariantB`와 동일 컴포넌트)
- **per-day 근무시간** (2026-06-17 구현): `schedule_mode: 'same' | 'perDay'` + `work_schedule: Record<day, {start, end, break_start, break_end}>`
- 체크리스트 단계: `checklist_agreed` 동의 게이트

### 알림 구조 (2단계)

1. **최초 도달 (근로자)**: 토스 `share` API → OS 공유 시트 → 사장님이 수동 공유
2. **서명 완료 알림 (사장님)**: mTLS 스마트메시지 `bossimclockedin-contract_sign_complete`

### 테스트

- Vitest 단위 테스트 64/64 통과 (2026-06-17 기준)
- `src/api/tests/smart-messenger.test.ts`
- `src/domain/contract/tests/schema.test.ts`

## Claude 에이전트/커맨드 설정

`.omp/` → `.claude/` 마이그레이션 완료 (2026-06-17~18)

| 에이전트 | 역할 |
|----------|------|
| `toss-app-dev:supabase` | Supabase 전문 |
| `toss-app-dev:toss-mini-app` | Granite/TDS 전문 |
| `toss-app-dev:vite` | Vite 빌드 |
| `toss-app-dev:review-board` | 아키텍처 리뷰 |
| `ux-auditor` | UX 감사 |
| `functional-qa` | 기능 테스트 |
| `robustness-auditor` | 엣지케이스 |
| `code-structure-analyzer` | 코드 구조 분석 |

## 관련 페이지

- [[supabase]] — DB/Auth/Edge Functions 세부
- [[smart-messenger]] — 알림 구현 세부
- [[contract-form]] — 퍼널 폼 세부
- [[tds-mini-app]] — Granite/TDS 세부
- [[agent-setup]] — .claude/ 에이전트 설정
- [[2026-06-17-migrate-omp-to-claude]] — OMP→Claude 결정
- [[2026-06-22-worker-notification-share-api]] — 근로자 알림 결정
