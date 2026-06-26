import { ContractFormData } from '../../pages/employer/contract-form/types';

export function buildContractData(form: ContractFormData) {
  const DAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  let repSchedule = Object.values(form.work_schedule)[0] ?? { start: '09:00', end: '18:00', break_start: '00:00', break_end: '00:00' };
  
  for (const d of DAY_ORDER) {
    if (form.work_days.includes(d) && form.work_schedule[d]) {
      repSchedule = form.work_schedule[d];
      break;
    }
  }

  return {
    worker: {
      name: form.worker_name || '이름',
      phone: form.worker_phone || '01000000000',
    },
    employer: {
      businessNumber: '123-45-67890',
      businessName: '상호명',
      representative: '대표자',
      address: '주소',
    },
    contract: {
      contractType: form.contract_type || 'fullTime',
      templateVersion: '1.0.0',
      status: 'draft',
      startDate: form.start_date || '2026-01-01',
      endDate: form.end_date || undefined,
      workplace: form.workplace || '근무장소',
      jobDescription: form.job_description || '직무내용',
      wageType: form.wage_type || 'hourly',
      baseWage: Number(form.base_wage) || 0,
      wagePaymentDate: form.wage_payment_day || '15',
      wagePaymentMethod: form.wage_payment_method || 'bankTransfer',
      workDays: form.work_days.length > 0 ? form.work_days : ['mon'],
      startTime: repSchedule.start || '09:00',
      endTime: repSchedule.end || '18:00',
      breakStartTime: repSchedule.break_start || '00:00',
      breakEndTime: repSchedule.break_end || '00:00',
      weeklyHoliday: form.weekly_holiday || undefined,
      paidLeaveClause: form.paid_leave_clause,
      socialInsuranceClause: form.pension || form.health_insurance || form.employment_insurance || form.accident_insurance,
      severanceClause: form.severance_clause,
    }
  };
}
