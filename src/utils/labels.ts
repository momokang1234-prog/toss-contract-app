// ============================================================
// 한글 표시용 라벨 맵 (Korean display label maps)
// ============================================================

/** 계약 유형 */
export const CONTRACT_TYPE_LABEL: Record<string, string> = {
  fullTime: '정규직', partTime: '아르바이트', fixedTerm: '계약직',
};

/** 임금 유형 */
export const WAGE_TYPE_LABEL: Record<string, string> = {
  hourly: '시급', daily: '일급', weekly: '주급', monthly: '월급',
};

/** 근무 요일 */
export const WORK_DAY_LABEL: Record<string, string> = {
  mon: '월', tue: '화', wed: '수', thu: '목', fri: '금', sat: '토', sun: '일',
};

/** 임금 지급 방식 */
export const WAGE_PAYMENT_METHOD_LABEL: Record<string, string> = {
  bankTransfer: '계좌이체', cash: '현금', mixed: '혼합',
};
