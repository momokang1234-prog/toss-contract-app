import { describe, it, expect } from 'vitest';
import { buildContractData, formatWagePaymentDate, wagePaymentDayLabel } from '../buildContractData';
import { DEFAULT_FORM, type ContractFormData, type DaySchedule } from '../types';
import { calcWeeklyHoursFromSchedule } from '../../../../domain/contract/validation';

const monTue: Record<string, DaySchedule> = {
  mon: { start: '09:00', end: '15:00', break_start: '12:00', break_end: '13:00' },
  tue: { start: '10:00', end: '14:00', break_start: '12:00', break_end: '12:30' },
};

const fullForm: ContractFormData = {
  ...DEFAULT_FORM,
  worker_name: '홍길동',
  worker_phone: '01012345678',
  worker_address: '서울특별시 강남구',
  contract_type: 'partTime',
  workplace: '강남점',
  job_description: '매장 관리',
  start_date: '2026-07-01',
  end_date: '2026-12-31',
  wage_type: 'hourly',
  base_wage: '12000',
  wage_payment_day: '25',
  wage_payment_method: 'bankTransfer',
  work_days: ['mon', 'tue'],
  work_schedule: monTue,
  schedule_mode: 'perDay',
  weekly_holiday: 'sun',
  paid_leave_clause: true,
  pension: false,
  health_insurance: false,
  employment_insurance: false,
  accident_insurance: true,
  severance_clause: true,
  checklist_agreed: true,
  other_conditions: '수습 3개월',
  employer_signature_data: 'data:image/png;base64,xxx',
};

describe('buildContractData — 폼→저장 페이로드 매핑 (E2E 데이터 무결성)', () => {
  it('필수 저장 필드가 누락 없이 모두 포함된다', () => {
    const p = buildContractData(fullForm, 'biz-1');
    const required = [
      'business_id', 'worker_name', 'worker_phone', 'contract_type', 'workplace',
      'job_description', 'start_date', 'wage_type', 'base_wage', 'wage_payment_date',
      'wage_payment_method', 'work_days', 'work_schedule', 'schedule_mode',
      'start_time', 'end_time', 'break_start_time', 'break_end_time',
      'paid_leave_clause', 'pension', 'health_insurance', 'employment_insurance',
      'accident_insurance', 'social_insurance_clause', 'severance_clause', 'employer_signature_data',
    ];
    for (const k of required) {
      expect(p).toHaveProperty(k);
    }
  });

  it('필드 값이 그대로 매핑된다', () => {
    const p = buildContractData(fullForm, 'biz-1');
    expect(p.business_id).toBe('biz-1');
    expect(p.worker_name).toBe('홍길동');
    expect(p.work_days).toEqual(['mon', 'tue']);
    expect(p.schedule_mode).toBe('perDay');
    expect(p.severance_clause).toBe(true);
    expect(p.other_conditions).toBe('수습 3개월');
    expect(p.employer_signature_data).toBe('data:image/png;base64,xxx');
  });

  it('work_schedule이 그대로 저장된다', () => {
    const p = buildContractData(fullForm, 'biz-1');
    expect(p.work_schedule).toEqual(monTue);
  });

  it('레거시 단일 시간 컬럼은 대표요일(첫 근무요일)에서 파생', () => {
    const p = buildContractData(fullForm, 'biz-1');
    expect(p.start_time).toBe('09:00'); // mon
    expect(p.end_time).toBe('15:00');
    expect(p.break_start_time).toBe('12:00');
    expect(p.break_end_time).toBe('13:00');
  });

  it('휴게가 비어있으면 파생 break_* = 00:00', () => {
    const form: ContractFormData = {
      ...fullForm,
      work_schedule: { mon: { start: '09:00', end: '15:00', break_start: '', break_end: '' } },
      work_days: ['mon'],
    };
    const p = buildContractData(form, 'biz-1');
    expect(p.break_start_time).toBe('00:00');
    expect(p.break_end_time).toBe('00:00');
  });

  it('base_wage 는 숫자로 변환된다', () => {
    expect(buildContractData(fullForm, 'biz-1').base_wage).toBe(12000);
  });

  it('wage_payment_day → wage_payment_date 포맷팅', () => {
    expect(buildContractData(fullForm, 'biz-1').wage_payment_date).toBe('매월 25일');
    expect(buildContractData({ ...fullForm, wage_payment_day: 'last' }, 'biz-1').wage_payment_date).toBe('매월 말일');
  });

  it('4대보험 중 하나라도 true면 social_insurance_clause=true', () => {
    const p = buildContractData(
      { ...fullForm, pension: false, health_insurance: false, employment_insurance: false, accident_insurance: true },
      'biz-1',
    );
    expect(p.social_insurance_clause).toBe(true);
  });

  it('4대보험 모두 false면 social_insurance_clause=false', () => {
    const p = buildContractData(
      { ...fullForm, pension: false, health_insurance: false, employment_insurance: false, accident_insurance: false },
      'biz-1',
    );
    expect(p.social_insurance_clause).toBe(false);
  });

  it('other_conditions 빈 문자열 → undefined', () => {
    expect(buildContractData({ ...fullForm, other_conditions: '' }, 'biz-1').other_conditions).toBeUndefined();
  });

  it('end_date / weekly_holiday 비어있으면 undefined', () => {
    const p = buildContractData({ ...fullForm, end_date: '', weekly_holiday: '' }, 'biz-1');
    expect(p.end_date).toBeUndefined();
    expect(p.weekly_holiday).toBeUndefined();
  });

  it('status는 페이로드에 없다 (createContract가 draft로 생성, 전송은 별도)', () => {
    expect(buildContractData(fullForm, 'biz-1') as unknown as Record<string, unknown>).not.toHaveProperty('status');
  });

  it('wagePaymentDayLabel / formatWagePaymentDate 헬퍼', () => {
    expect(wagePaymentDayLabel('25')).toBe('25일');
    expect(wagePaymentDayLabel('last')).toBe('말일');
    expect(formatWagePaymentDate('25')).toBe('매월 25일');
    expect(formatWagePaymentDate('last')).toBe('매월 말일');
  });
});

describe('calcWeeklyHoursFromSchedule — 요일별 주 근무시간 합산', () => {
  it('각 요일 (근무−휴게) 합산', () => {
    // mon: 09~15(360m) − 60 = 300; tue: 10~14(240m) − 30 = 210 → 510m = 8.5h
    expect(calcWeeklyHoursFromSchedule(monTue)).toBeCloseTo(8.5, 5);
  });

  it('야간(자정 넘김) 근무 처리', () => {
    const s = { mon: { start: '22:00', end: '06:00', break_start: '00:00', break_end: '00:00' } };
    // 22~06 = 480m, break 0 → 8h
    expect(calcWeeklyHoursFromSchedule(s)).toBeCloseTo(8, 5);
  });

  it('빈 스케줄은 0', () => {
    expect(calcWeeklyHoursFromSchedule({})).toBe(0);
  });
});
