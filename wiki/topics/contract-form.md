---
title: 계약서 폼 (퍼널 구현)
type: topic
updated: 2026-06-26
sources:
  - 9d5fb614-0c8d-423d-9792-a3affc0c86b6
  - 6f153450-3fce-4e9a-a711-48185748d13b
  - d2a15b64-35b1-438f-b0aa-ffe4814d7633
  - 352c6aa2-f105-4165-a05f-3f0272fd032b
  - f70f91cc-4c83-465d-8279-ea75d9bf99f7
  - 8695737f-10d1-47ca-b6e0-da0e20cbd0ea
  - 4de3beb8-812e-4e45-a756-64bd42a73fb4
  - 8608b9b2-782b-4c54-8eff-d9da526690a0
tags:
  - contract-form
  - funnel
  - work-schedule
  - per-day
  - stepper
---

# 계약서 폼 (퍼널 구현)

## 퍼널 구조

`src/pages/employer/contract-form/`

5단계 퍼널 (`useFunnel` 기반):

| Step | 레이블 | 내용 |
|------|--------|------|
| 1 | 기본 정보 | 사업장, 근로자 정보 |
| 2 | 급여 | 시급/월급, 보험 자동 동기화 |
| 3 | 근무시간 | 요일 선택 + 모드 선택 + 시간 입력 |
| 4 | 체크리스트 | `checklist_agreed` 동의 게이트 |
| 5 | 서명 | 사장님 서명 → 계약서 생성 |

## Progress Stepper

`src/pages/employer/contract-form/ContractFormProgress.tsx`

- **슬라이딩 Badge** 방식
- dev `FormStepLabelVariantB`와 실제 폼이 동일 컴포넌트 사용
- 클릭 가능한 과거 단계 네비게이션 지원 (2026-06-25 추가)

## 요일별 근무시간 (per-day) — 2026-06-17 구현

### 데이터 모델

```ts
// types.ts
type ScheduleMode = 'same' | 'perDay';

type DaySchedule = {
  start: string;        // "09:00"
  end: string;          // "18:00"
  break_start: string;  // "12:00"
  break_end: string;    // "13:00"
};

type WorkSchedule = Record<DayOfWeek, DaySchedule>;
```

### DB 컬럼

`supabase/migrations/008_work_schedule.sql`:

```sql
ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS work_schedule JSONB,
  ADD COLUMN IF NOT EXISTS schedule_mode TEXT DEFAULT 'same';
```

**주의**: 파일은 존재하나 DB 미적용 상태 (2026-06-17 기준) → 수동 적용 필요

### 레거시 호환

구버전(단일 시간) 데이터와 호환을 위해 대표요일 파생 저장:
- `schedule_mode = 'same'`이면 기존 `start_time`, `end_time` 컬럼에도 값 저장
- `perDay`이면 대표 요일(월요일 등)에서 파생해서 레거시 컬럼 채움

### Step3 UI 흐름

1. 요일 선택 (다중 선택)
2. 모드 선택: **"모든 요일 같게"** / **"요일마다 다르게"**
3. `same`: 1세트 시간 입력 (전 요일 동시 적용)
4. `perDay`: 요일별 행으로 개별 입력

### 계산/검증

`src/domain/contract/validation.ts`

```ts
// 요일별 합산 (야간 지원)
function calcWeeklyHoursFromSchedule(
  schedule: WorkSchedule,
  mode: ScheduleMode
): number;
```

- 보험 자동 동기화: 주간 총 시간 기반으로 재계산
- 체크리스트 검증(주휴수당/최저임금/휴게)을 일별 순회로 변경

### 표시 헬퍼

`src/pages/employer/contract-form/formatSchedule.ts`

```ts
// same → "월~금 09:00~18:00 (휴게 12:00~13:00)"
// perDay → 요일별 표시
// 구 데이터(폴백) → 단일 행 표시
formatSchedule(contract: Contract): string
```

적용 범위:
- `ContractPreview` (미리보기)
- 근로자 화면 (`WorkerContractPage`)
- PDF 출력

## 계약서 Document/Preview

`src/components/contract/ContractDocument.tsx`
`src/components/contract/ContractPreview.tsx`

날짜 포맷:
```ts
new Date(contract.created_at).toLocaleDateString('ko-KR', {
  year: 'numeric', month: 'long', day: 'numeric'
});
```

## 관련 페이지

- [[toss-contract-app]] — 프로젝트 개요
- [[supabase]] — 마이그레이션 008 적용
- [[tds-mini-app]] — TDS 컴포넌트 사용
