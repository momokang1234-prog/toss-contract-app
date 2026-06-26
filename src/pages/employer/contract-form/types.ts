import type { ValidationWarning } from '../../../domain/contract/validation';

/** 요일별 근무 스케줄 (시작/종료/휴게) — 범용 per-day 모델 */
export interface DaySchedule {
  start: string;
  end: string;
  break_start: string;
  break_end: string;
}

/** 'same' = 모든 요일 동일, 'perDay' = 요일별 입력 */
export type ScheduleMode = 'same' | 'perDay';

export const DEFAULT_DAY_SCHEDULE: DaySchedule = {
  start: '09:00',
  end: '18:00',
  break_start: '12:00',
  break_end: '13:00',
};

/** 주어진 요일들에 대한 기본 스케줄 맵 생성 */
export function buildDefaultWorkSchedule(
  days: readonly string[] = ['mon', 'tue', 'wed', 'thu', 'fri'],
): Record<string, DaySchedule> {
  const schedule: Record<string, DaySchedule> = {};
  for (const d of days) schedule[d] = { ...DEFAULT_DAY_SCHEDULE };
  return schedule;
}

export interface ContractFormData {
  worker_name: string;
  worker_phone: string;
  worker_address: string;
  contract_type: 'fullTime' | 'partTime' | 'fixedTerm';
  workplace: string;
  job_description: string;
  start_date: string;
  end_date: string;
  wage_type: 'hourly' | 'daily' | 'weekly' | 'monthly';
  base_wage: string;
  wage_payment_day: string;
  wage_payment_method: 'bankTransfer' | 'cash' | 'mixed';
  work_days: string[];
  work_schedule: Record<string, DaySchedule>;
  schedule_mode: ScheduleMode;
  weekly_holiday: string;
  paid_leave_clause: boolean;
  pension: boolean;
  health_insurance: boolean;
  employment_insurance: boolean;
  accident_insurance: boolean;
  severance_clause: boolean;
  checklist_agreed: boolean;
  other_conditions: string;
  employer_signature_data?: string;
  worker_birth_date?: string;
  parent_consent_data?: string;
}

export type ContractFormStep =
  | 'basicInfo'
  | 'workConditions'
  | 'workSchedule'
  | 'wageInsurance'
  | 'otherConditions'
  | 'finalChecklist'
  | 'preview';

export const STEP_LABELS: Record<ContractFormStep, string> = {
  basicInfo: '근로자 정보',
  workConditions: '계약 조건',
  workSchedule: '근무 시간',
  wageInsurance: '임금 및 보험',
  otherConditions: '기타 조건',
  finalChecklist: '체크리스트',
  preview: '최종 확인',
};

export const STEP_ORDER: ContractFormStep[] = [
  'basicInfo',
  'workConditions',
  'workSchedule',
  'wageInsurance',
  'otherConditions',
  'finalChecklist',
  'preview',
];

export const TOTAL_STEPS = STEP_ORDER.length;

export const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
export const DAY_LABELS: Record<string, string> = {
  mon: '월', tue: '화', wed: '수', thu: '목', fri: '금', sat: '토', sun: '일',
};

export const DEFAULT_FORM: ContractFormData = {
  worker_name: '',
  worker_phone: '',
  worker_address: '',
  contract_type: 'partTime',
  workplace: '',
  job_description: '',
  start_date: new Date().toISOString().slice(0, 10),
  end_date: '',
  wage_type: 'hourly',
  base_wage: '',
  wage_payment_day: '25',
  wage_payment_method: 'bankTransfer',
  work_days: ['mon', 'tue', 'wed', 'thu', 'fri'],
  work_schedule: buildDefaultWorkSchedule(),
  schedule_mode: 'same',
  weekly_holiday: 'sun',
  paid_leave_clause: false,
  pension: true,
  health_insurance: true,
  employment_insurance: true,
  accident_insurance: true,
  severance_clause: true,
  checklist_agreed: false,
  other_conditions: '',
};

export interface ValidationResultData {
  valid: boolean;
  errors: Array<{ field: string; message: string }>;
  warnings: ValidationWarning[];
}
