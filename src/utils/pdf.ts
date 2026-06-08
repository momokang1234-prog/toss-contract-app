import type { Contract } from '../hooks/useContracts';

/**
 * Generate a printable contract HTML string from contract data.
 * Used for both preview and PDF generation.
 */
export function generatePrintableHTML(contract: Contract): string {
  const wageLabel = contract.wage_type === 'hourly' ? '시급'
    : contract.wage_type === 'daily' ? '일급'
    : contract.wage_type === 'weekly' ? '주급'
    : '월급';

  const contractTypeLabel = contract.contract_type === 'partTime' ? '단시간'
    : contract.contract_type === 'fullTime' ? '정규직'
    : '기간제';

  const dayLabels: Record<string, string> = {
    mon: '월', tue: '화', wed: '수', thu: '목', fri: '금', sat: '토', sun: '일',
  };
  const workDaysStr = contract.work_days.map(d => dayLabels[d] ?? d).join(', ');

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>근로계약서 - ${contract.worker_name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Pretendard', -apple-system, sans-serif; max-width: 680px; margin: 0 auto; padding: 32px 24px; color: #191F28; line-height: 1.7; }
    h1 { text-align: center; font-size: 24px; border-bottom: 2px solid #191F28; padding-bottom: 16px; margin-bottom: 24px; }
    .section-title { font-size: 16px; font-weight: 700; margin: 24px 0 8px; color: #191F28; }
    table { width: 100%; border-collapse: collapse; margin: 8px 0 16px; }
    th, td { border: 1px solid #E5E8EB; padding: 10px 12px; font-size: 14px; }
    th { background: #F5F6F8; text-align: left; width: 35%; font-weight: 600; }
    .signatures { display: flex; justify-content: space-between; margin-top: 48px; }
    .sign-box { width: 45%; text-align: center; }
    .sign-line { border-bottom: 1px solid #191F28; height: 80px; margin: 12px 0; display: flex; align-items: center; justify-content: center; }
    .sign-img { max-height: 70px; max-width: 180px; }
    .note { font-size: 12px; color: #6B7684; margin-top: 32px; text-align: center; }
    .header-info { display: flex; justify-content: space-between; font-size: 13px; color: #6B7684; margin-bottom: 16px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>근로계약서</h1>

  <p class="section-title">1. 근로자</p>
  <table>
    <tr><th>성명</th><td>${contract.worker_name}</td></tr>
    <tr><th>연락처</th><td>${contract.worker_phone}</td></tr>
  </table>

  <p class="section-title">2. 근로조건</p>
  <table>
    <tr><th>계약 유형</th><td>${contractTypeLabel}</td></tr>
    <tr><th>근무 장소</th><td>${contract.workplace}</td></tr>
    <tr><th>직무 내용</th><td>${contract.job_description}</td></tr>
    <tr><th>시작일</th><td>${contract.start_date}</td></tr>
    ${contract.end_date ? `<tr><th>종료일</th><td>${contract.end_date}</td></tr>` : ''}
  </table>

  <p class="section-title">3. 임금</p>
  <table>
    <tr><th>급여 형태</th><td>${wageLabel}</td></tr>
    <tr><th>기본급</th><td>${contract.base_wage.toLocaleString()}원</td></tr>
    <tr><th>지급일</th><td>${contract.wage_payment_date}</td></tr>
  </table>

  <p class="section-title">4. 근무 시간</p>
  <table>
    <tr><th>근무일</th><td>${workDaysStr}</td></tr>
    <tr><th>근무 시간</th><td>${contract.start_time} ~ ${contract.end_time}</td></tr>
    <tr><th>휴게시간</th><td>${contract.break_minutes}분</td></tr>
    ${contract.weekly_holiday ? `<tr><th>주휴일</th><td>${dayLabels[contract.weekly_holiday] ?? contract.weekly_holiday}</td></tr>` : ''}
  </table>

  <p class="section-title">5. 기타 근로조건</p>
  <table>
    <tr><th>연차유급휴가</th><td>${contract.paid_leave_clause ? '근로기준법에 따름' : '미포함'}</td></tr>
    <tr><th>사회보험</th><td>${contract.social_insurance_clause ? '국민연금, 건강보험, 고용보험, 산재보험 적용' : '미적용'}</td></tr>
    <tr><th>퇴직금</th><td>${contract.severance_clause ? '근로자퇴직급여 보장법에 따름' : '해당 없음'}</td></tr>
  </table>

  <p style="text-align: center; margin-top: 40px; font-size: 15px;">위와 같이 근로계약을 체결합니다.</p>

  <div class="signatures">
    <div class="sign-box">
      <p style="font-weight: 600;">근로자: ${contract.worker_name}</p>
      <div class="sign-line">
        ${contract.worker_signature_data ? `<img src="${contract.worker_signature_data}" class="sign-img" alt="근로자 서명" />` : ''}
      </div>
      <p style="font-size: 13px;">서명 / 날인</p>
      ${contract.worker_signed_at ? `<p style="font-size: 12px; color: #6B7684;">${new Date(contract.worker_signed_at).toLocaleDateString('ko-KR')}</p>` : ''}
    </div>
    <div class="sign-box">
      <p style="font-weight: 600;">사용자</p>
      <div class="sign-line"></div>
      <p style="font-size: 13px;">서명 / 날인</p>
    </div>
  </div>

  <p class="note">
    본 계약서는 「근로기준법」 제17조에 따른 근로조건 명시 의무에 따라 작성되었습니다.<br>
    계약 ID: ${contract.id} | 생성일: ${new Date(contract.created_at).toLocaleDateString('ko-KR')}
  </p>
</body>
</html>`;
}

/**
 * Download contract as PDF using html2canvas + jsPDF.
 */
export async function downloadContractPDF(contract: Contract): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas-pro'),
    import('jspdf'),
  ]);

  // Create a temporary container
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '680px';
  container.innerHTML = generatePrintableHTML(contract);
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const pdf = new jsPDF('p', 'mm', 'a4');
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`근로계약서_${contract.worker_name}_${contract.id}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}
