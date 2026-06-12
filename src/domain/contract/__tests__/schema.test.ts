import { describe, it, expect } from 'vitest';
import { LaborContractSchema } from '../schema';

describe('LaborContractSchema', () => {
  const validData = {
    worker: { name: '홍길동', phone: '01012345678' },
    employer: { businessNumber: '123-45-67890', businessName: '테스트', representative: '김사장', address: '서울' },
    contract: {
      contractType: 'fullTime', status: 'draft',
      startDate: '2026-06-15', workplace: '서울시', jobDescription: '업무',
      wageType: 'monthly', baseWage: 2500000, wagePaymentDate: '25', wagePaymentMethod: 'bankTransfer',
      workDays: ['mon','tue','wed','thu','fri'], startTime: '09:00', endTime: '18:00',
      breakStartTime: "12:00", breakEndTime: "13:00", weeklyHoliday: 'sun',
      paidLeaveClause: true, socialInsuranceClause: true, severanceClause: true,
    },
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };

  it('올바른 데이터는 파싱 성공', () => {
    const result = LaborContractSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('contractType이 유효하지 않은 enum이면 실패', () => {
    const data = { ...validData, contract: { ...validData.contract, contractType: 'invalid' } };
    const result = LaborContractSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('wageType이 유효하지 않으면 실패', () => {
    const data = { ...validData, contract: { ...validData.contract, wageType: 'project' } };
    const result = LaborContractSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('worker 이름이 없으면 실패', () => {
    const data = { ...validData, worker: { ...validData.worker, name: '' } };
    const result = LaborContractSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('baseWage가 0 이하면 실패', () => {
    const data = { ...validData, contract: { ...validData.contract, baseWage: 0 } };
    const result = LaborContractSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
