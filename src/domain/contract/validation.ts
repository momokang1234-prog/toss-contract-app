/**
 * 계약 검증 엔진
 * 순수 함수 기반: Zod 스키마 파싱 + 법정 규칙 커스텀 검증
 */
import type { LaborContract } from "./schema";
import { josa } from 'es-hangul';
import { LaborContractSchema } from "./schema";
import {
  MINIMUM_HOURLY_WAGE_2026,
  BREAK_RULES,
  WEEKLY_REST_THRESHOLD_HOURS,
  DAY_OF_WEEK_LABELS,
} from "./laborRules";

// ============================================================
// Types
// ============================================================

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  data?: LaborContract;
}

// ============================================================
// Time Utilities
// ============================================================

/** "HH:MM" → 자정 기준 분 단위 정수 (예: "09:30" → 570) */
export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/**
 * 일 근무시간(분) — 야간 근무(자정 넘김) 지원
 * 예: 22:00~06:00 → 480분(8시간)
 */
export function calcDailyWorkMinutes(
  startTime: string,
  endTime: string,
): number {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  const diff = end - start;
  return diff > 0 ? diff : diff + 24 * 60;
}

/** 실 근무시간(분) = 총 근무시간 − 휴게시간, 최소 0 */
export function calcEffectiveWorkMinutes(
  startTime: string,
  endTime: string,
  breakMinutes: number,
): number {
  return Math.max(0, calcDailyWorkMinutes(startTime, endTime) - breakMinutes);
}

/** 주 근무시간(시간, 소수) = 1일 실 근무시간(분) × 근무일수 ÷ 60 */
export function calcWeeklyWorkHours(
  effectiveDailyMinutes: number,
  workDaysCount: number,
): number {
  return (effectiveDailyMinutes * workDaysCount) / 60;
}

// ============================================================
// Main Validator
// ============================================================

export function validateLaborContract(input: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // ── 1단계: Zod 스키마 파싱 ──────────────────────────────────
  const parsed = LaborContractSchema.safeParse(input);

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      errors.push({
        field: issue.path.join("."),
        message: issue.message,
        code: `ZOD_${issue.code.toUpperCase()}`,
      });
    }
    return { valid: false, errors, warnings };
  }

  const data = parsed.data;
  const { contract } = data;

  // ── 2단계: 법정 규칙 검증 ────────────────────────────────────

  // 2-1. 날짜 역전 방지
  if (contract.endDate) {
    if (contract.endDate <= contract.startDate) {
      errors.push({
        field: "contract.endDate",
        message: "종료일은 시작일보다 이후여야 합니다.",
        code: "DATE_REVERSED",
      });
    }
  }

  // 2-2. 최저임금 검증 (시급인 경우에만)
  if (contract.wageType === "hourly") {
    if (contract.baseWage < MINIMUM_HOURLY_WAGE_2026) {
      errors.push({
        field: "contract.baseWage",
        message: `시급 ${contract.baseWage.toLocaleString()}원은 2026년 최저시급 ${MINIMUM_HOURLY_WAGE_2026.toLocaleString()}원 미만입니다.`,
        code: "BELOW_MINIMUM_WAGE",
      });
    } else if (
      contract.baseWage >= MINIMUM_HOURLY_WAGE_2026 &&
      contract.baseWage < MINIMUM_HOURLY_WAGE_2026 * 1.1
    ) {
      warnings.push({
        field: "contract.baseWage",
        message: `시급이 최저시급 대비 ${((contract.baseWage / MINIMUM_HOURLY_WAGE_2026) * 100).toFixed(1)}% 수준입니다. 최저임금 위반 가능성을 검토하세요.`,
        code: "NEAR_MINIMUM_WAGE",
      });
    }
  }

  // 2-3. 휴게시간 검증 (가장 높은 기준만 체크)
  const dailyMinutes = calcDailyWorkMinutes(
    contract.startTime,
    contract.endTime,
  );
  const dailyHours = dailyMinutes / 60;

  // BREAK_RULES는 오름차순이므로 역순 탐색 → 가장 높은 기준 매칭
  for (let i = BREAK_RULES.length - 1; i >= 0; i--) {
    const rule = BREAK_RULES[i];
    if (dailyHours >= rule.minWorkHours) {
      if (contract.breakMinutes < rule.minBreakMinutes) {
        errors.push({
          field: "contract.breakMinutes",
          message: `일 ${rule.minWorkHours}시간 이상 근무 시 휴게시간 ${rule.minBreakMinutes}분 이상 필요 (현재: ${contract.breakMinutes}분).`,
          code: "INSUFFICIENT_BREAK",
        });
      }
      break; // 가장 높은 기준 하나만 체크
    }
  }

  // 2-4. 주휴일 검증
  const effectiveMinutes = calcEffectiveWorkMinutes(
    contract.startTime,
    contract.endTime,
    contract.breakMinutes,
  );
  const weeklyHours = calcWeeklyWorkHours(
    effectiveMinutes,
    contract.workDays.length,
  );

  if (weeklyHours >= WEEKLY_REST_THRESHOLD_HOURS && !contract.weeklyHoliday) {
    errors.push({
      field: "contract.weeklyHoliday",
      message: `주 ${WEEKLY_REST_THRESHOLD_HOURS}시간 이상 근무 시 주휴일을 부여해야 합니다.`,
      code: "MISSING_WEEKLY_HOLIDAY",
    });
  }

  // 2-5. 주휴일-근무일 겹침 검증
  if (
    contract.weeklyHoliday &&
    contract.workDays.includes(contract.weeklyHoliday)
  ) {
    const dayLabel =
      DAY_OF_WEEK_LABELS[contract.weeklyHoliday] ?? contract.weeklyHoliday;
    errors.push({
      field: "contract.weeklyHoliday",
      message: `주휴일(${dayLabel})이 근무일에 포함되어 있습니다.`,
      code: "HOLIDAY_OVERLAP_WORKDAY",
    });
  }

  // 2-6. 단시간 근로자 경고
  if (weeklyHours < 15) {
    warnings.push({
      field: "contract.contractType",
      message:
        "주 15시간 미만 근로자는 주휴수당 대상에서 제외될 수 있습니다.",
      code: "SHORT_TIME_WORKER",
    });
  }

  // 2-7. 연차/4대보험/퇴직금 조항 미포함 경고
  if (!contract.paidLeaveClause) {
    warnings.push({
      field: "contract.paidLeaveClause",
      message:
        "연차 유급휴가 조항이 포함되지 않았습니다. 근로기준법 제60조에 따라 1년간 80% 이상 출근 시 15일 이상 유급휴가를 부여해야 합니다.",
      code: "MISSING_PAID_LEAVE",
    });
  }

  if (!contract.socialInsuranceClause) {
    warnings.push({
      field: "contract.socialInsuranceClause",
      message:
        "4대 보험(국민건강보험, 국민연금, 고용보험, 산재보험) 조항이 포함되지 않았습니다.",
      code: "MISSING_SOCIAL_INSURANCE",
    });
  }

  if (!contract.severanceClause) {
    warnings.push({
      field: "contract.severanceClause",
      message:
        "퇴직금 조항이 포함되지 않았습니다. 1년 이상 계속 근로자에게는 퇴직금(퇴직급여)을 지급해야 합니다.",
      code: "MISSING_SEVERANCE",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    data: errors.length === 0 ? data : undefined,
  };
}

// ============================================================
// Helper: 빈 계약서 초안 생성
// ============================================================

export function createEmptyContractDraft(): LaborContract {
  return {
    worker: {
      name: "",
      phone: "",
    },
    employer: {
      businessNumber: "",
      businessName: "",
      representative: "",
      address: "",
    },
    contract: {
      contractType: "fullTime",
      templateVersion: "1.0.0",
      status: "draft",
      startDate: "",
      workplace: "",
      jobDescription: "",
      wageType: "hourly",
      baseWage: MINIMUM_HOURLY_WAGE_2026,
      wagePaymentDate: "",
      wagePaymentMethod: "bankTransfer",
      workDays: ["mon", "tue", "wed", "thu", "fri"],
      startTime: "09:00",
      endTime: "18:00",
      breakMinutes: 60,
      paidLeaveClause: false,
      socialInsuranceClause: false,
      severanceClause: false,
    },
  };
}
