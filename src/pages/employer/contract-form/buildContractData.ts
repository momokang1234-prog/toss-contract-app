/**
 * 근로계약서 폼 데이터 → Supabase contracts 저장 페이로드 변환 (순수 함수)
 * useContractForm.handleSubmit 에서 사용. 분리한 이유: 필드 매핑 무결성을
 * hook/supabase 의존 없이 단위 테스트로 검증하기 위함(E2E 데이터 무결성).
 */
import type { ContractFormData, DaySchedule } from './types';
import { needsParentConsent, isYoungWorker } from '../../../hooks/useContracts';

/** 요일 정규 순서 (대표 요일 선정용) */
const DAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

/**
 * 대표 요일(첫 근무요일)의 스케줄 반환 — 레거시 단일 시간 컬럼(NOT NULL) 파생 저장용.
 * work_schedule이 비어있으면 기본값.
 */
function representativeSchedule(form: ContractFormData): DaySchedule {
  for (const d of DAY_ORDER) {
    if (form.work_days.includes(d) && form.work_schedule[d]) return form.work_schedule[d];
  }
  return Object.values(form.work_schedule)[0] ?? { start: '09:00', end: '18:00', break_start: '00:00', break_end: '00:00' };
}

/** 지급일 라벨: 'last' → '말일', 그 외 'N일' */
export function wagePaymentDayLabel(day: string): string {
  return day === 'last' ? '말일' : `${day}일`;
}

/** 지급일 전체 문자열: '매월 N일' */
export function formatWagePaymentDate(day: string): string {
  return `매월 ${wagePaymentDayLabel(day)}`;
}

export interface ContractPayload {
  business_id: string;
  worker_name: string;
  worker_phone: string;
  contract_type: string;
  workplace: string;
  job_description: string;
  start_date: string;
  end_date?: string;
  wage_type: string;
  base_wage: number;
  wage_payment_date: string;
  wage_payment_method: string;
  work_days: string[];
  work_schedule: Record<string, DaySchedule>;
  schedule_mode: 'same' | 'perDay';
  start_time: string;
  end_time: string;
  break_start_time: string;
  break_end_time: string;
  weekly_holiday?: string;
  paid_leave_clause: boolean;
  pension: boolean;
  health_insurance: boolean;
  employment_insurance: boolean;
  accident_insurance: boolean;
  social_insurance_clause: boolean;
  severance_clause: boolean;
  other_conditions?: string;
  employer_signature_data?: string;
  worker_birth_date?: string;
  is_minor?: boolean;
  is_young_worker?: boolean;
  parent_consent_data?: string;
  doc_parent_consent_status?: 'not_required' | 'required' | 'received';
  doc_family_cert_status?: 'not_required' | 'required' | 'received';
  doc_employment_permit_status?: 'not_required' | 'required' | 'received';
}

/**
 * 폼 데이터를 contracts 저장 페이로드로 변환.
 * status는 여기서 지정하지 않음 — createContract 가 'draft'로 생성하고,
 * 실제 'sent' 전환은 사장님이 공유 시트로 전송(contracts-send)할 때 발생.
 */
export function buildContractData(form: ContractFormData, businessId: string): ContractPayload {
  return {
    business_id: businessId,
    worker_name: form.worker_name,
    worker_phone: form.worker_phone,
    contract_type: form.contract_type,
    workplace: form.workplace,
    job_description: form.job_description,
    start_date: form.start_date,
    end_date: form.end_date || undefined,
    wage_type: form.wage_type,
    base_wage: Number(form.base_wage) || 0,
    wage_payment_date: formatWagePaymentDate(form.wage_payment_day),
    wage_payment_method: form.wage_payment_method,
    work_days: form.work_days,
    work_schedule: form.work_schedule,
    schedule_mode: form.schedule_mode,
    start_time: representativeSchedule(form).start || '09:00',
    end_time: representativeSchedule(form).end || '18:00',
    break_start_time: representativeSchedule(form).break_start || '00:00',
    break_end_time: representativeSchedule(form).break_end || '00:00',
    weekly_holiday: form.weekly_holiday || undefined,
    paid_leave_clause: form.paid_leave_clause,
    pension: form.pension,
    health_insurance: form.health_insurance,
    employment_insurance: form.employment_insurance,
    accident_insurance: form.accident_insurance,
    social_insurance_clause:
      form.pension || form.health_insurance || form.employment_insurance || form.accident_insurance,
    severance_clause: form.severance_clause,
    other_conditions: form.other_conditions || undefined,
    employer_signature_data: form.employer_signature_data,
    // 미성년자(만 19세 미만) 감지 — 친권자 동의 트리거 + 서류 추적 상태
    worker_birth_date: form.worker_birth_date || undefined,
    is_minor: needsParentConsent(form.worker_birth_date),
    is_young_worker: isYoungWorker(form.worker_birth_date),
    parent_consent_data: form.parent_consent_data,
    doc_parent_consent_status: needsParentConsent(form.worker_birth_date) ? 'required' : 'not_required',
    doc_family_cert_status: needsParentConsent(form.worker_birth_date) ? 'required' : 'not_required',
    doc_employment_permit_status: (() => {
      const age = form.worker_birth_date ? new Date().getFullYear() - new Date(form.worker_birth_date).getFullYear() : 99;
      return age < 15 ? 'required' : 'not_required';
    })(),
  };
}
