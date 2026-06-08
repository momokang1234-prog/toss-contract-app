import type { Contract } from '../../hooks/useContracts';

interface ContractPreviewProps {
  contract: Contract;
}

export function ContractPreview({ contract }: ContractPreviewProps) {
  const html = `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>
body{font-family:Pretendard,sans-serif;max-width:680px;margin:0 auto;padding:24px;color:#191F28;line-height:1.7}
h1{text-align:center;font-size:22px;border-bottom:2px solid #191F28;padding-bottom:12px}
table{width:100%;border-collapse:collapse;margin:16px 0}
th,td{border:1px solid #E5E8EB;padding:10px 12px;font-size:14px}
th{background:#F5F6F8;text-align:left;width:35%}
.section{font-size:16px;font-weight:700;margin:24px 0 8px}
</style></head><body>
<h1>근로계약서</h1>
<p class="section">1. 근로자</p>
<table>
<tr><th>성명</th><td>${contract.worker_name}</td></tr>
<tr><th>연락처</th><td>${contract.worker_phone}</td></tr>
</table>
<p class="section">2. 근로조건</p>
<table>
<tr><th>계약 유형</th><td>${contract.contract_type === 'partTime' ? '단시간' : contract.contract_type === 'fullTime' ? '정규직' : '기간제'}</td></tr>
<tr><th>근무 장소</th><td>${contract.workplace}</td></tr>
<tr><th>직무</th><td>${contract.job_description}</td></tr>
<tr><th>시작일</th><td>${contract.start_date}</td></tr>
${contract.end_date ? `<tr><th>종료일</th><td>${contract.end_date}</td></tr>` : ''}
</table>
<p class="section">3. 임금</p>
<table>
<tr><th>급여 형태</th><td>${contract.wage_type === 'hourly' ? '시급' : contract.wage_type === 'daily' ? '일급' : contract.wage_type === 'weekly' ? '주급' : '월급'}</td></tr>
<tr><th>기본급</th><td>${contract.base_wage.toLocaleString()}원</td></tr>
<tr><th>지급일</th><td>${contract.wage_payment_date}</td></tr>
</table>
<p class="section">4. 근무 시간</p>
<table>
<tr><th>근무일</th><td>${contract.work_days.join(', ')}</td></tr>
<tr><th>시간</th><td>${contract.start_time} ~ ${contract.end_time}</td></tr>
<tr><th>휴게</th><td>${contract.break_minutes}분</td></tr>
${contract.weekly_holiday ? `<tr><th>주휴일</th><td>${contract.weekly_holiday}</td></tr>` : ''}
</table>
</body></html>`;

  return (
    <iframe
      srcDoc={html}
      style={{ width: '100%', height: 600, border: '1px solid #E5E8EB', borderRadius: 8 }}
      title="근로계약서 미리보기"
    />
  );
}
