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
  - 6c3d999e-1205-4324-b022-4eacfe4183a2
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

7단계 퍼널 (`ContractFormStep` 기반, `STEP_ORDER`):

| Step | key | 레이블 | 내용 |
|------|-----|--------|------|
| 1 | `basicInfo` | 근로자 정보 | 근로자 이름·연락처 (주소는 제외 — 근로자 직접 입력) |
| 2 | `workConditions` | 계약 조건 | 계약종류·사업장·직무 |
| 3 | `workSchedule` | 근무 시간 | 요일·모드·시간 + 주휴요일 선택(BottomSheet) |
| 4 | `wageInsurance` | 임금 및 보험 | 임금·보험 + 임금지급방법(BottomSheet) |
| 5 | `otherConditions` | 기타 조건 | 기타 특약 |
| 6 | `finalChecklist` | 체크리스트 | `checklist_agreed` 동의 게이트 |
| 7 | `preview` | 최종 확인 | 계약서 미리보기 → 제출 |

```ts
// types.ts — STEP_ORDER
export const STEP_ORDER: ContractFormStep[] = [
  'basicInfo', 'workConditions', 'workSchedule',
  'wageInsurance', 'otherConditions', 'finalChecklist', 'preview',
];
export const TOTAL_STEPS = 7;
```

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

## UX 개선 이력 (2026-06-26, agy-cli)

### 근로자 주소 입력 제거

- `Step1BasicInfo.tsx`에서 `worker_address` 입력 필드 제거
- 이유: 근로자 주소는 근로자가 서명 단계에서 직접 입력하는 흐름으로 설계됨 (사장님 측 폼에서 불필요)
- `ContractFormData` 타입에는 `worker_address: string` 유지 (서명 흐름에서 채워짐)

### FunnelQuestion 활성/완료 시각 구분

**파일**: `src/components/funnel/FunnelQuestion.tsx`, `FunnelQuestion.module.css`

**문제**: 입력 중인(active) 질문 위에 완료 요약 헤더가 중복 노출 → 매끄럽지 않음

**해결**: CSS 클래스 `.active` / `.completed` 분기 적용

```css
/* FunnelQuestion.module.css */
.active {
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  border-radius: 12px;
  /* 카드 형태로 강조 — 현재 입력 영역 집중 */
}

.completed {
  opacity: 0.6;
  /* 배경과 자연스럽게 어울리도록 — 완료 상태 표현 */
}
```

```tsx
// FunnelQuestion.tsx — active 상태에서는 요약 헤더 숨김
{!isActive && <CompletedHeader label={completedLabel} />}
<div className={isActive ? styles.active : styles.completed}>
  {children}
</div>
```

### BottomSheet 패턴 — 선택 UI 교체

인라인 버튼 / SegmentedControl → **TDS `BottomSheet`** 으로 교체.
`LanguagePicker.tsx`, `FinalChecklistStep.tsx`를 레퍼런스로 활용.

#### 임금지급방법 (`Step4WageInsurance.tsx`)

```tsx
// 이전: SegmentedControl
// 이후: BottomSheet
const PAYMENT_METHODS = [
  { value: 'bankTransfer', label: '계좌이체' },
  { value: 'cash',         label: '현금' },
  { value: 'mixed',        label: '혼합' },
];

<Button onClick={() => setPaymentMethodOpen(true)}>
  {selectedLabel || '선택해주세요'}
</Button>
<BottomSheet open={paymentMethodOpen} onClose={...}>
  {PAYMENT_METHODS.map(m => (
    <ListRow key={m.value} onClick={() => { onChange(m.value); setPaymentMethodOpen(false); }}>
      {m.label}
    </ListRow>
  ))}
</BottomSheet>
```

#### 주휴요일 선택 (`Step3WorkSchedule.tsx`)

```tsx
// 이전: 인라인 Pill 버튼 (7개 요일 나열)
// 이후: BottomSheet
const DAY_OPTIONS = [
  { value: 'sun', label: '일요일' },
  { value: 'mon', label: '월요일' },
  // ...
];

<Button onClick={() => setHolidayOpen(true)}>
  {DAY_LABELS[form.weekly_holiday] || '선택해주세요'}
</Button>
<BottomSheet open={holidayOpen} onClose={...}>
  {DAY_OPTIONS.map(d => (
    <ListRow key={d.value} onClick={() => { onChange(d.value); setHolidayOpen(false); }}>
      {d.label}
    </ListRow>
  ))}
</BottomSheet>
```

### 빌드 검증

`npm run build` → 성공 (15.11s)

| 번들 | 크기 | gzip |
|------|------|------|
| `ContractFormPage-ByK22Gd2.js` | 98.23 kB | 25.16 kB |
| `ContractSignPage-C3RhIAdx.js` | 348.07 kB | 91.29 kB |
| `index-CokV_oDv.js` | 1,530.73 kB | 481.96 kB |

> ⚠️ `index-CokV_oDv.js` 500 kB 초과 경고 존재 → 코드 스플리팅 고려 대상

---

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
