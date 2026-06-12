// ============================================================
// Contract (hook) ↔ LaborContract (Zod) 타입 변환
// ============================================================
import type { LaborContract } from './schema';
import type { Contract } from '../../hooks/useContracts';

/** UI Contract → Domain LaborContract */
export function toLabor(c: Contract): LaborContract {
  return {
    worker: { name: c.worker_name, phone: c.worker_phone, address: c.worker_address },
    employer: {
      businessNumber: c.business_id,
      businessName: '',
      representative: '',
      address: '',
    },
    contract: {
      contractType: c.contract_type as LaborContract['contract']['contractType'],
      status: c.status as LaborContract['contract']['status'],
      startDate: c.start_date,
      endDate: c.end_date,
      workplace: c.workplace,
      jobDescription: c.job_description,
      wageType: c.wage_type as LaborContract['contract']['wageType'],
      baseWage: c.base_wage,
      wagePaymentDate: c.wage_payment_date,
      wagePaymentMethod: c.wage_payment_method as LaborContract['contract']['wagePaymentMethod'],
      workDays: c.work_days as LaborContract['contract']['workDays'],
      startTime: c.start_time,
      endTime: c.end_time,
      breakStartTime: c.break_start_time,
      breakEndTime: c.break_end_time,
      weeklyHoliday: c.weekly_holiday as LaborContract['contract']['weeklyHoliday'],
      paidLeaveClause: c.paid_leave_clause,
      socialInsuranceClause: c.social_insurance_clause,
      severanceClause: c.severance_clause,
    },
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  } as LaborContract;
}

/** Domain LaborContract → UI Contract */
export function toContract(l: LaborContract): Partial<Contract> {
  return {
    worker_name: l.worker.name,
    worker_phone: l.worker.phone,
    worker_address: l.worker.address,
    business_id: l.employer.businessNumber,
    contract_type: l.contract.contractType,
    status: l.contract.status,
    start_date: l.contract.startDate,
    end_date: l.contract.endDate || undefined,
    workplace: l.contract.workplace,
    job_description: l.contract.jobDescription,
    wage_type: l.contract.wageType,
    base_wage: l.contract.baseWage,
    wage_payment_date: l.contract.wagePaymentDate,
    wage_payment_method: l.contract.wagePaymentMethod,
    work_days: l.contract.workDays,
    start_time: l.contract.startTime,
    end_time: l.contract.endTime,
    break_start_time: l.contract.breakStartTime,
    break_end_time: l.contract.breakEndTime,
    weekly_holiday: l.contract.weeklyHoliday,
    paid_leave_clause: l.contract.paidLeaveClause,
    social_insurance_clause: l.contract.socialInsuranceClause,
    severance_clause: l.contract.severanceClause,
  };
}
