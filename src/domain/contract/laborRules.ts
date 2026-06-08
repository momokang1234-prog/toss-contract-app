/**
 * 2026년 기준 법정 근로 규칙
 * ⚠️ 매년 최저임금 등 업데이트 필요
 *
 * 참조:
 * - 근로기준법 제6조 (최저임금)
 * - 근로기준법 제54조 (휴게)
 * - 근로기준법 제55조 (휴일)
 * - 근로기준법 제17조 (근로조건 명시)
 * - 기간제 및 단시간 근로자 보호 등에 관한 법률
 */

/** 2026년 최저시급 (원) — 실제 배포 시 최저임금위원회 고시 확인 필수 */
export const MINIMUM_HOURLY_WAGE_2026 = 10_030;

/** 최저시급 적용 연도 */
export const WAGE_YEAR = 2026;

/** 하루 최대 근로시간 (시간) */
export const MAX_DAILY_WORK_HOURS = 8;

/** 주 최대 근로시간 (시간) */
export const MAX_WEEKLY_WORK_HOURS = 52; // 40 + 연장 12

/** 법정 주 근로시간 (시간) */
export const LEGAL_WEEKLY_HOURS = 40;

/** 주휴 발생 기준 — 주 15시간 이상 근무 */
export const WEEKLY_REST_THRESHOLD_HOURS = 15;

/** 휴게시간 규칙 */
export const BREAK_RULES = [
  { minWorkHours: 4, minBreakMinutes: 30 },
  { minWorkHours: 8, minBreakMinutes: 60 },
] as const;

/** 근로일 이름 매핑 */
export const DAY_OF_WEEK_LABELS: Record<string, string> = {
  mon: "월",
  tue: "화",
  wed: "수",
  thu: "목",
  fri: "금",
  sat: "토",
  sun: "일",
};

/** 계약 유형 이름 매핑 */
export const CONTRACT_TYPE_LABELS: Record<string, string> = {
  fullTime: "정규직",
  partTime: "단시간(아르바이트)",
  fixedTerm: "기간제",
};

/** 임금 유형 이름 매핑 */
export const WAGE_TYPE_LABELS: Record<string, string> = {
  hourly: "시급",
  daily: "일급",
  weekly: "주급",
  monthly: "월급",
};

/** 임금 지급 방법 이름 매핑 */
export const WAGE_PAYMENT_METHOD_LABELS: Record<string, string> = {
  bankTransfer: "통장이체",
  cash: "현금",
  mixed: "통장이체+현금",
};
