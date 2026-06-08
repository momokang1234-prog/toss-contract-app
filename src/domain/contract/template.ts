import type { LaborContract } from "./schema";
import {
  DAY_OF_WEEK_LABELS,
  CONTRACT_TYPE_LABELS,
  WAGE_TYPE_LABELS,
  WAGE_PAYMENT_METHOD_LABELS,
} from "./laborRules";

export function generateContractHTML(contract: LaborContract): string {
  const { worker, employer, contract: c } = contract;
  const workDaysStr = c.workDays.map((d) => DAY_OF_WEEK_LABELS[d]).join(", ");
  const holidayStr = c.weeklyHoliday
    ? DAY_OF_WEEK_LABELS[c.weeklyHoliday]
    : "없음";

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>근로계약서</title>
  <style>
    body { font-family: 'Pretendard', sans-serif; max-width: 680px; margin: 0 auto; padding: 24px; color: #191F28; line-height: 1.7; }
    h1 { text-align: center; font-size: 22px; border-bottom: 2px solid #191F28; padding-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { border: 1px solid #E5E8EB; padding: 10px 12px; font-size: 14px; }
    th { background: #F5F6F8; text-align: left; width: 35%; }
    .section-title { font-size: 16px; font-weight: 700; margin: 24px 0 8px; }
    .signatures { display: flex; justify-content: space-between; margin-top: 40px; }
    .sign-box { width: 45%; text-align: center; }
    .sign-line { border-bottom: 1px solid #191F28; height: 60px; margin: 12px 0; }
    .note { font-size: 12px; color: #6B7684; margin-top: 32px; }
  </style>
</head>
<body>
  <h1>근로계약서</h1>
  <p class="section-title">1. 근로자</p>
  <table>
    <tr><th>성명</th><td>${worker.name}</td></tr>
    <tr><th>연락처</th><td>${worker.phone}</td></tr>
    ${
      worker.address
        ? `<tr><th>주소</th><td>${worker.address}</td></tr>`
        : ""
    }
  </table>
  <p class="section-title">2. 사용자</p>
  <table>
    <tr><th>사업자등록번호</th><td>${employer.businessNumber}</td></tr>
    <tr><th>사업장명</th><td>${employer.businessName}</td></tr>
    <tr><th>대표자</th><td>${employer.representative}</td></tr>
    <tr><th>사업장 소재지</th><td>${employer.address}</td></tr>
  </table>
  <p class="section-title">3. 근로조건</p>
  <table>
    <tr><th>계약 유형</th><td>${CONTRACT_TYPE_LABELS[c.contractType]}</td></tr>
    <tr><th>계약 기간</th><td>${c.startDate}${c.endDate ? ` ~ ${c.endDate}` : " ~ (무기한)"}</td></tr>
    <tr><th>근무 장소</th><td>${c.workplace}</td></tr>
    <tr><th>직무 내용</th><td>${c.jobDescription}</td></tr>
  </table>
  <p class="section-title">4. 임금</p>
  <table>
    <tr><th>임금 형태</th><td>${WAGE_TYPE_LABELS[c.wageType]}</td></tr>
    <tr><th>기본 임금</th><td>${c.baseWage.toLocaleString()}원</td></tr>
    <tr><th>임금 지급일</th><td>${c.wagePaymentDate}</td></tr>
    <tr><th>지급 방법</th><td>${WAGE_PAYMENT_METHOD_LABELS[c.wagePaymentMethod]}</td></tr>
  </table>
  <p class="section-title">5. 근무 시간</p>
  <table>
    <tr><th>근무일</th><td>${workDaysStr}</td></tr>
    <tr><th>근무 시간</th><td>${c.startTime} ~ ${c.endTime}</td></tr>
    <tr><th>휴게시간</th><td>${c.breakMinutes}분</td></tr>
    <tr><th>주휴일</th><td>${holidayStr}</td></tr>
  </table>
  <p class="section-title">6. 기타 근로조건</p>
  <table>
    <tr><th>연차유급휴가</th><td>${c.paidLeaveClause ? "근로기준법에 따름" : "미포함"}</td></tr>
    <tr><th>사회보험</th><td>${c.socialInsuranceClause ? "국민연금, 건강보험, 고용보험, 산재보험 적용" : "미적용"}</td></tr>
    <tr><th>퇴직금</th><td>${c.severanceClause ? "근로자퇴직급여 보장법에 따름" : "해당 없음"}</td></tr>
  </table>
  <p style="text-align: center; margin-top: 40px;">위와 같이 근로계약을 체결합니다.</p>
  <div class="signatures">
    <div class="sign-box">
      <p>근로자: ${worker.name}</p>
      <div class="sign-line"></div>
      <p>서명 / 날인</p>
    </div>
    <div class="sign-box">
      <p>사용자: ${employer.representative}</p>
      <div class="sign-line"></div>
      <p>서명 / 날인</p>
    </div>
  </div>
  <p class="note">
    templateVersion: ${c.templateVersion}<br>
    본 계약서는 「근로기준법」 제17조에 따른 근로조건 명시 의무에 따라 작성되었습니다.
  </p>
</body>
</html>`;
}
