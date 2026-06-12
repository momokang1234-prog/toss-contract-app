import { describe, it, expect } from "vitest";
import {
  validateLaborContract,
  parseTimeToMinutes,
  calcDailyWorkMinutes,
  calcEffectiveWorkMinutes,
  createEmptyContractDraft,
} from "../validation";
import type { LaborContract } from "../schema";

// ────────────────────────────────────────────────────────────
// 테스트용 유효한 전체 계약 생성 헬퍼
// ────────────────────────────────────────────────────────────
function validContract(overrides?: any): LaborContract {
  const base = createEmptyContractDraft();
  const full: LaborContract = {
    ...base,
    ...overrides,
    worker: { ...base.worker, name: "김알바", phone: "01012345678", ...overrides?.worker },
    employer: {
      ...base.employer,
      businessNumber: "123-45-67890",
      businessName: "샐러둡카페",
      representative: "박대표",
      address: "서울특별시 강남구 테헤란로 123",
      ...overrides?.employer,
    },
    contract: {
      ...base.contract,
      startDate: "2026-07-01",
      workplace: "서울특별시 강남구 테헤란로 123",
      jobDescription: "카페 서빙 및 음료 제조",
      baseWage: 10_030,
      wagePaymentDate: "매월 10일",
      workDays: ["mon", "tue", "wed", "thu", "fri"],
      startTime: "09:00",
      endTime: "18:00",
      breakStartTime: "12:00", breakEndTime: "13:00",
      weeklyHoliday: "sun",
      ...overrides?.contract,
    },
  };
  return full;
}

// ────────────────────────────────────────────────────────────
// 검증 엔진 단위 테스트
// ────────────────────────────────────────────────────────────
describe("validateLaborContract", () => {
  // 1. 유효한 전체 계약 — 통과
  it("1) 유효한 전체 계약 — 통과", () => {
    const result = validateLaborContract(validContract());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.data).toBeDefined();
  });

  // 2. 필수 필드 누락 — worker.name
  it("2) 필수 필드 누락 — worker.name → 스키마 에러", () => {
    const contract = validContract({ worker: { name: "", phone: "01012345678" } });
    const result = validateLaborContract(contract);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some((e) => e.field.includes("worker.name") || e.code.startsWith("ZOD_"))).toBe(true);
  });

  // 3. 필수 필드 누락 — employer.businessNumber
  it("3) 필수 필드 누락 — employer.businessNumber → 스키마 에러", () => {
    const contract = validContract({
      employer: {
        businessNumber: "",
        businessName: "샐러둡카페",
        representative: "박대표",
        address: "서울특별시 강남구 테헤란로 123",
      },
    });
    const result = validateLaborContract(contract);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some((e) => e.code.startsWith("ZOD_"))).toBe(true);
  });

  // 4. 필수 필드 누락 — contract.startDate
  it("4) 필수 필드 누락 — contract.startDate → 스키마 에러", () => {
    const contract = validContract({ contract: { startDate: "" } });
    const result = validateLaborContract(contract);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some((e) => e.code.startsWith("ZOD_"))).toBe(true);
  });

  // 5. 필수 필드 누락 — contract.workplace
  it("5) 필수 필드 누락 — contract.workplace → 스키마 에러", () => {
    const contract = validContract({ contract: { workplace: "" } });
    const result = validateLaborContract(contract);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some((e) => e.code.startsWith("ZOD_"))).toBe(true);
  });

  // 6. 필수 필드 누락 — contract.baseWage
  it("6) 필수 필드 누락 — contract.baseWage → 스키마 에러", () => {
    const contract = validContract({ contract: { baseWage: 0 } });
    const result = validateLaborContract(contract);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some((e) => e.code.startsWith("ZOD_"))).toBe(true);
  });

  // 7. 필수 필드 누락 — contract.workDays 빈 배열
  it("7) 필수 필드 누락 — contract.workDays 빈 배열 → 스키마 에러", () => {
    const contract = validContract({ contract: { workDays: [] as any } });
    const result = validateLaborContract(contract);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some((e) => e.code.startsWith("ZOD_"))).toBe(true);
  });

  // 8. 사업자등록번호 형식 오류
  it("8) 사업자등록번호 형식 오류 → 정규식 검증 에러", () => {
    const contract = validContract({
      employer: {
        businessNumber: "1234567890",
        businessName: "샐러둡카페",
        representative: "박대표",
        address: "서울특별시 강남구 테헤란로 123",
      },
    });
    const result = validateLaborContract(contract);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code.startsWith("ZOD_"))).toBe(true);
  });

  // 9. 시급 최저임금 미만 — 에러
  it("9) 시급 최저임금 미만 — BELOW_MINIMUM_WAGE 에러", () => {
    const contract = validContract({ contract: { baseWage: 9_000 } });
    const result = validateLaborContract(contract);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === "BELOW_MINIMUM_WAGE")).toBe(true);
  });

  // 10. 시급 정확히 최저임금 — 통과
  it("10) 시급 정확히 최저임금 — 통과", () => {
    const contract = validContract({ contract: { baseWage: 10_030 } });
    const result = validateLaborContract(contract);
    // NEAR_MINIMUM_WAGE 경고가 있을 수 있지만 에러는 없어야 함
    expect(result.errors.filter((e) => e.code === "BELOW_MINIMUM_WAGE")).toHaveLength(0);
  });

  // 11. 시급 최저임금 근접 — 경고
  it("11) 시급 최저임금 근접 — NEAR_MINIMUM_WAGE 경고", () => {
    const contract = validContract({ contract: { baseWage: 10_500 } });
    const result = validateLaborContract(contract);
    expect(result.warnings.some((w) => w.code === "NEAR_MINIMUM_WAGE")).toBe(true);
  });

  // 12. 4시간 근무 + 휴게 0분 — 에러
  it("12) 4시간 근무 + 휴게 0분 — INSUFFICIENT_BREAK 에러", () => {
    const contract = validContract({
      contract: { startTime: "09:00", endTime: "13:00", breakStartTime: "12:00", breakEndTime: "12:00" } as any,
    });
    const result = validateLaborContract(contract);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === "INSUFFICIENT_BREAK")).toBe(true);
  });

  // 13. 4시간 근무 + 휴게 30분 — 통과
  it("13) 4시간 근무 + 휴게 30분 — 통과", () => {
    const contract = validContract({
      contract: { startTime: "09:00", endTime: "13:00", breakStartTime: "12:00", breakEndTime: "12:30" } as any,
    });
    const result = validateLaborContract(contract);
    expect(result.errors.filter((e) => e.code === "INSUFFICIENT_BREAK")).toHaveLength(0);
  });

  // 14. 8시간 근무 + 휴게 30분 — 에러
  it("14) 8시간 근무 + 휴게 30분 — INSUFFICIENT_BREAK 에러", () => {
    const contract = validContract({
      contract: { startTime: "09:00", endTime: "17:00", breakStartTime: "12:00", breakEndTime: "12:30" } as any,
    });
    const result = validateLaborContract(contract);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === "INSUFFICIENT_BREAK")).toBe(true);
  });

  // 15. 8시간 근무 + 휴게 60분 — 통과
  it("15) 8시간 근무 + 휴게 60분 — 통과", () => {
    const contract = validContract({
      contract: { startTime: "09:00", endTime: "17:00", breakStartTime: "12:00", breakEndTime: "13:00" } as any,
    });
    const result = validateLaborContract(contract);
    expect(result.errors.filter((e) => e.code === "INSUFFICIENT_BREAK")).toHaveLength(0);
  });

  // 16. 주 16시간 근무 + 주휴일 없음 — 에러
  it("16) 주 16시간 근무 + 주휴일 없음 — MISSING_WEEKLY_HOLIDAY 에러", () => {
    // 주 16시간 = 하루 4시간 × 4일 (9~13시, 휴게 0분 → 실근무 4시간)
    // 주휴 발생 기준: 주 15시간 이상
    const contract = validContract({
      contract: {
        workDays: ["mon", "tue", "wed", "thu"],
        startTime: "09:00",
        endTime: "13:00",
        breakStartTime: "12:00", breakEndTime: "12:00",
        weeklyHoliday: undefined,
      } as any,
    });
    const result = validateLaborContract(contract);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === "MISSING_WEEKLY_HOLIDAY")).toBe(true);
  });

  // 17. 주 14시간 미만 근무 + 주휴일 없음 — 통과
  it("17) 주 14시간 미만 근무 + 주휴일 없음 — 통과 (주휴 불필요)", () => {
    // 주 14시간 = 하루 3.5시간 × 4일 (9~12:30, 휴게 0분)
    const contract = validContract({
      contract: {
        workDays: ["mon", "tue", "wed", "thu"],
        startTime: "09:00",
        endTime: "12:30",
        breakStartTime: "12:00", breakEndTime: "12:00",
        weeklyHoliday: undefined,
      } as any,
    });
    const result = validateLaborContract(contract);
    expect(result.errors.filter((e) => e.code === "MISSING_WEEKLY_HOLIDAY")).toHaveLength(0);
  });

  // 18. 주휴일이 근무일과 겹침 — 에러
  it("18) 주휴일이 근무일과 겹침 — HOLIDAY_OVERLAP_WORKDAY 에러", () => {
    const contract = validContract({
      contract: {
        workDays: ["mon", "tue", "wed", "thu", "fri"],
        weeklyHoliday: "fri",
      } as any,
    });
    const result = validateLaborContract(contract);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === "HOLIDAY_OVERLAP_WORKDAY")).toBe(true);
  });

  // 19. 계약 종료일이 시작일보다 이전 — 에러
  it("19) 계약 종료일이 시작일보다 이전 — DATE_REVERSED 에러", () => {
    const contract = validContract({
      contract: { startDate: "2026-07-01", endDate: "2026-06-01" } as any,
    });
    const result = validateLaborContract(contract);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === "DATE_REVERSED")).toBe(true);
  });

  // 20. 종료일 없음 — 통과 (무기한 계약)
  it("20) 종료일 없음 — 통과 (무기한 계약)", () => {
    const contract = validContract({ contract: { endDate: undefined } } as any);
    const result = validateLaborContract(contract);
    expect(result.errors.filter((e) => e.code === "DATE_REVERSED")).toHaveLength(0);
  });

  // 21. 연차 조항 미포함 — 경고
  it("21) 연차 조항 미포함 — MISSING_PAID_LEAVE 경고", () => {
    const contract = validContract({ contract: { paidLeaveClause: false } as any });
    const result = validateLaborContract(contract);
    expect(result.warnings.some((w) => w.code === "MISSING_PAID_LEAVE")).toBe(true);
  });

  // 22. 4대보험 미포함 — 경고
  it("22) 4대보험 미포함 — MISSING_SOCIAL_INSURANCE 경고", () => {
    const contract = validContract({ contract: { socialInsuranceClause: false } as any });
    const result = validateLaborContract(contract);
    expect(result.warnings.some((w) => w.code === "MISSING_SOCIAL_INSURANCE")).toBe(true);
  });

  // 23. 퇴직금 미포함 — 경고
  it("23) 퇴직금 미포함 — MISSING_SEVERANCE 경고", () => {
    const contract = validContract({ contract: { severanceClause: false } as any });
    const result = validateLaborContract(contract);
    expect(result.warnings.some((w) => w.code === "MISSING_SEVERANCE")).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────
// 유틸리티 함수 테스트
// ────────────────────────────────────────────────────────────
describe("parseTimeToMinutes", () => {
  // 24. 시간 파싱 유틸
  it("24) HH:MM 문자열을 분 단위 정수로 변환", () => {
    expect(parseTimeToMinutes("00:00")).toBe(0);
    expect(parseTimeToMinutes("09:00")).toBe(540);
    expect(parseTimeToMinutes("09:30")).toBe(570);
    expect(parseTimeToMinutes("13:00")).toBe(780);
    expect(parseTimeToMinutes("23:59")).toBe(1439);
  });
});

describe("calcDailyWorkMinutes", () => {
  // 25. 일일 근무시간 계산
  it("25) 정상 근무시간 및 야간 근무(자정 넘김) 계산", () => {
    expect(calcDailyWorkMinutes("09:00", "18:00")).toBe(540); // 9시간
    expect(calcDailyWorkMinutes("09:00", "13:00")).toBe(240); // 4시간
    expect(calcDailyWorkMinutes("22:00", "06:00")).toBe(480); // 야간 8시간
  });
});

describe("calcEffectiveWorkMinutes", () => {
  // 26. 유효 근무시간 계산
  it("26) 총 근무시간에서 휴게시간을 뺀 실 근무시간", () => {
    expect(calcEffectiveWorkMinutes("09:00", "18:00", 60)).toBe(480); // 9h - 60min = 8h
    expect(calcEffectiveWorkMinutes("09:00", "13:00", 0)).toBe(240);  // 4h - 0 = 4h
    expect(calcEffectiveWorkMinutes("09:00", "13:00", 30)).toBe(210); // 4h - 30min = 3.5h
    // 휴게시간이 총 근무시간을 초과하면 0 반환
    expect(calcEffectiveWorkMinutes("09:00", "10:00", 120)).toBe(0);
  });
});

describe("createEmptyContractDraft", () => {
  // 27. 빈 draft 생성
  it("27) 빈 계약서 초안이 올바른 기본값으로 생성됨", () => {
    const draft = createEmptyContractDraft();
    expect(draft.worker.name).toBe("");
    expect(draft.worker.phone).toBe("");
    expect(draft.employer.businessNumber).toBe("");
    expect(draft.contract.contractType).toBe("fullTime");
    expect(draft.contract.status).toBe("draft");
    expect(draft.contract.baseWage).toBe(10_030);
    expect(draft.contract.workDays).toEqual(["mon", "tue", "wed", "thu", "fri"]);
    expect(draft.contract.startTime).toBe("09:00");
    expect(draft.contract.endTime).toBe("18:00");
    expect(draft.contract.breakStartTime).toBe("12:00");
    expect(draft.contract.breakEndTime).toBe("13:00");;
    expect(draft.contract.paidLeaveClause).toBe(false);
    expect(draft.contract.socialInsuranceClause).toBe(false);
    expect(draft.contract.severanceClause).toBe(false);
  });
});
