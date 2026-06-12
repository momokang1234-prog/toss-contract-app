import type { ValidationWarning } from '../../../domain/contract/validation';

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
  start_time: string;
  end_time: string;
  break_start: string;
  break_end: string;
  weekly_holiday: string;
  paid_leave_clause: boolean;
  pension: boolean;
  health_insurance: boolean;
  employment_insurance: boolean;
  accident_insurance: boolean;
  severance_clause: boolean;
}

export type ContractFormStep =
  | 'basicInfo'
  | 'workConditions'
  | 'workSchedule'
  | 'wageInsurance'
  | 'legalValidation'
  | 'preview';

export const STEP_LABELS: Record<ContractFormStep, string> = {
  basicInfo: '근로자 정보',
  workConditions: '계약 조건',
  workSchedule: '근무 시간',
  wageInsurance: '임금 및 보험',
  legalValidation: '법정 검증',
  preview: '최종 확인',
};

export const STEP_ORDER: ContractFormStep[] = [
  'basicInfo',
  'workConditions',
  'workSchedule',
  'wageInsurance',
  'legalValidation',
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
  start_time: '09:00',
  end_time: '18:00',
  break_start: '12:00',
  break_end: '13:00',
  weekly_holiday: 'sun',
  paid_leave_clause: false,
  pension: true,
  health_insurance: true,
  employment_insurance: true,
  accident_insurance: true,
  severance_clause: true,
};

export interface ValidationResultData {
  valid: boolean;
  errors: Array<{ field: string; message: string }>;
  warnings: ValidationWarning[];
}
