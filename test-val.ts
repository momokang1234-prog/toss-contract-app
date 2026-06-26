import { validateLaborContract } from './src/domain/contract/validation';
import { buildContractData } from './src/domain/contract/buildContractData';

const form: any = {
  worker_name: '테스터',
  worker_phone: '01012345678',
  contract_type: 'fullTime',
  workplace: '테스트 근무지',
  job_description: '개발자',
  start_date: '2026-01-01',
  wage_type: 'hourly',
  base_wage: '9000', // 시급 미달
  wage_payment_day: '15',
  wage_payment_method: 'bankTransfer',
  work_days: ['mon', 'tue'],
  work_schedule: {
    mon: { start: '09:00', end: '18:00', break_start: '12:00', break_end: '12:15' }, // 휴게시간 15분 (부족)
    tue: { start: '09:00', end: '18:00', break_start: '12:00', break_end: '12:15' }
  },
  schedule_mode: 'same',
  weekly_holiday: '', // 주휴일 없음
  paid_leave_clause: false, // 연차 없음
  health_insurance: false,
  pension: false,
  employment_insurance: false,
  accident_insurance: false,
  severance_clause: false
};

const input = buildContractData(form);
console.log('--- input ---');
console.dir(input, { depth: null });

const result = validateLaborContract(input);
console.log('--- result ---');
console.dir(result, { depth: null });
