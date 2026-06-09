import type { Contract } from '../hooks/useContracts';

// ── A4 상수 (mm) ──────────────────────────────────────────────
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const A4_MARGIN_MM = 20;            // 좌우 여백
// html2canvas 2배 스케일 → 실제 px 해상도는 무시됨 (mm→px 변환은 브라우저가 처리)

// ── 라벨 유틸 ─────────────────────────────────────────────────
const DAY_LABELS: Record<string, string> = {
  mon: '월', tue: '화', wed: '수', thu: '목', fri: '금', sat: '토', sun: '일',
};

function wageLabel(c: Contract): string {
  const map: Record<string, string> = { hourly: '시급', daily: '일급', weekly: '주급', monthly: '월급' };
  return map[c.wage_type] ?? c.wage_type;
}

function contractTypeLabel(c: Contract): string {
  const map: Record<string, string> = { fullTime: '정규직', partTime: '단시간(아르바이트)', fixedTerm: '기간제' };
  return map[c.contract_type] ?? c.contract_type;
}

function paymentMethodLabel(c: Contract): string {
  const map: Record<string, string> = { bankTransfer: '통장이체', cash: '현금', mixed: '통장이체+현금' };
  return map[c.wage_payment_method] ?? c.wage_payment_method;
}

// ── 공통 CSS (Pretendard CDN + Print 스타일) ──────────────────
function baseCSS(): string {
  return `
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Pretendard Variable', Pretendard, -apple-system, sans-serif;
    font-size: 10.5pt;
    line-height: 1.75;
    color: #191F28;
    background: #fff;
  }
  .page {
    width: ${A4_WIDTH_MM}mm;
    min-height: ${A4_HEIGHT_MM}mm;
    padding: 20mm ${A4_MARGIN_MM}mm 20mm ${A4_MARGIN_MM}mm;
    background: #fff;
    position: relative;
  }
  .page:not(:last-child) {
    page-break-after: always;
  }
  h1 {
    text-align: center;
    font-size: 18pt;
    font-weight: 800;
    border-bottom: 2px solid #191F28;
    padding-bottom: 5mm;
    margin-bottom: 8mm;
  }
  .section-title {
    font-size: 12pt;
    font-weight: 700;
    margin: 6mm 0 3mm 0;
    color: #191F28;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 2mm 0 5mm 0;
    table-layout: fixed;
  }
  th, td {
    border: 0.5mm solid #B0B8C1;
    padding: 2.5mm 3mm;
    font-size: 10pt;
    vertical-align: top;
  }
  th {
    background: #F5F6F8;
    text-align: left;
    width: 40mm;
    font-weight: 600;
    color: #4E5968;
  }
  td {
    word-break: keep-all;
  }
  .signatures {
    display: flex;
    justify-content: space-between;
    margin-top: 10mm;
    gap: 10mm;
  }
  .sign-box {
    flex: 1;
    text-align: center;
  }
  .sign-line {
    border-bottom: 0.5mm solid #191F28;
    height: 20mm;
    margin: 4mm 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .sign-img {
    max-height: 18mm;
    max-width: 60mm;
  }
  .note {
    font-size: 8pt;
    color: #6B7684;
    margin-top: 8mm;
    text-align: center;
    line-height: 1.5;
  }
  .footer-rule {
    border-top: 0.5mm solid #E5E8EB;
    margin-top: 6mm;
    padding-top: 4mm;
  }
  .contract-id {
    font-size: 7pt;
    color: #B0B8C1;
    text-align: right;
    margin-top: 2mm;
  }
  @media print {
    body { margin: 0; }
    .page { box-shadow: none; }
  }
  `;
}

// ── HTML 생성 ─────────────────────────────────────────────────
export function generatePrintableHTML(contract: Contract): string {
  const workDaysStr = contract.work_days.map(d => DAY_LABELS[d] ?? d).join(', ');
  const holidayStr = contract.weekly_holiday
    ? DAY_LABELS[contract.weekly_holiday] ?? contract.weekly_holiday
    : '없음';

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>근로계약서 - ${contract.worker_name}</title>
  <style>${baseCSS()}</style>
</head>
<body>

  <!-- ============================================================ -->
  <!-- PAGE 1: 표지 + 근로자/사용자 정보 + 근로조건                      -->
  <!-- ============================================================ -->
  <div class="page">
    <h1>근 로 계 약 서</h1>

    <p class="section-title">1. 근로자</p>
    <table>
      <tr><th>성명</th><td>${contract.worker_name}</td></tr>
      <tr><th>연락처</th><td>${contract.worker_phone}</td></tr>
    </table>

    <p class="section-title">2. 근로조건</p>
    <table>
      <tr><th>계약 유형</th><td>${contractTypeLabel(contract)}</td></tr>
      <tr><th>근무 장소</th><td>${contract.workplace}</td></tr>
      <tr><th>직무 내용</th><td>${contract.job_description}</td></tr>
      <tr><th>계약 기간</th><td>${contract.start_date}${contract.end_date ? ` ~ ${contract.end_date}` : ' ~ (무기한)'}</td></tr>
    </table>

    <p class="section-title">3. 임금</p>
    <table>
      <tr><th>임금 형태</th><td>${wageLabel(contract)}</td></tr>
      <tr><th>기본 임금</th><td>${contract.base_wage.toLocaleString()}원</td></tr>
      <tr><th>임금 지급일</th><td>${contract.wage_payment_date}</td></tr>
      <tr><th>지급 방법</th><td>${paymentMethodLabel(contract)}</td></tr>
    </table>
  </div>

  <!-- ============================================================ -->
  <!-- PAGE 2: 근무시간 + 기타 근로조건 + 서명                          -->
  <!-- ============================================================ -->
  <div class="page">
    <p class="section-title">4. 근무 시간</p>
    <table>
      <tr><th>근무일</th><td>${workDaysStr}</td></tr>
      <tr><th>근무 시간</th><td>${contract.start_time} ~ ${contract.end_time}</td></tr>
      <tr><th>휴게시간</th><td>${contract.break_minutes}분</td></tr>
      <tr><th>주휴일</th><td>${holidayStr}</td></tr>
    </table>

    <p class="section-title">5. 기타 근로조건</p>
    <table>
      <tr><th>연차유급휴가</th><td>${contract.paid_leave_clause ? '근로기준법 제60조에 따름' : '미포함'}</td></tr>
      <tr><th>사회보험</th><td>${contract.social_insurance_clause ? '국민연금, 건강보험, 고용보험, 산재보험 적용' : '미적용'}</td></tr>
      <tr><th>퇴직금</th><td>${contract.severance_clause ? '근로자퇴직급여 보장법에 따름' : '해당 없음'}</td></tr>
    </table>

    <p style="text-align: center; margin-top: 10mm; font-size: 11pt;">
      위와 같이 근로계약을 체결하고, 각자 서명·날인합니다.
    </p>

    <div class="signatures">
      <div class="sign-box">
        <p style="font-weight: 600;">근로자</p>
        <p style="font-size: 10pt;">${contract.worker_name}</p>
        <div class="sign-line">
          ${contract.worker_signature_data
            ? `<img src="${contract.worker_signature_data}" class="sign-img" alt="근로자 서명" />`
            : ''}
        </div>
        <p style="font-size: 8pt; color: #6B7684;">서명 / 날인</p>
        ${contract.worker_signed_at
          ? `<p style="font-size: 8pt; color: #6B7684;">${new Date(contract.worker_signed_at).toLocaleDateString('ko-KR')}</p>`
          : ''}
      </div>
      <div class="sign-box">
        <p style="font-weight: 600;">사용자</p>
        <p style="font-size: 10pt;">(인)</p>
        <div class="sign-line"></div>
        <p style="font-size: 8pt; color: #6B7684;">서명 / 날인</p>
      </div>
    </div>

    <div class="footer-rule"></div>

    <p class="note">
      본 계약서는 「근로기준법」 제17조(근로조건의 명시)에 따라 작성되었습니다.<br>
      사용자는 근로계약 체결 시 근로자에게 근로조건을 명시한 서면을 교부할 의무가 있습니다.
    </p>

    <p class="contract-id">
      ${contract.id} · ${new Date(contract.created_at).toLocaleDateString('ko-KR')}
    </p>
  </div>

</body>
</html>`;
}

// ── 페이지별 HTML 청크 추출 ───────────────────────────────────
function splitPages(html: string): string[] {
  // .page 클래스 div 단위로 분할
  const pageRegex = /<div class="page">([\s\S]*?)<\/div>\s*(?=<div class="page">|$)/g;
  const pages: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = pageRegex.exec(html)) !== null) {
    pages.push(match[0]);
  }

  return pages.length > 0 ? pages : [html];
}

function wrapPageHTML(pageHTML: string): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <style>${baseCSS()}</style>
</head>
<body style="margin:0; padding:0;">
  ${pageHTML}
</body>
</html>`;
}

// ── PDF 다운로드 ──────────────────────────────────────────────
export async function downloadContractPDF(contract: Contract): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas-pro'),
    import('jspdf'),
  ]);

  const fullHTML = generatePrintableHTML(contract);
  const pageChunks = splitPages(fullHTML);

  const pdf = new jsPDF('p', 'mm', 'a4');
  let isFirstPage = true;

  for (let i = 0; i < pageChunks.length; i++) {
    // 각 페이지 독립 렌더링 → 정확한 A4 사이즈로 캡처
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = `${A4_WIDTH_MM}mm`;
    container.innerHTML = wrapPageHTML(pageChunks[i]);
    document.body.appendChild(container);

    try {
      // 페이지 렌더 대기 (Pretendard 웹폰트 로딩)
      await new Promise(r => setTimeout(r, 200));

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: container.scrollWidth,
        height: container.scrollHeight,
        windowWidth: container.scrollWidth,
        windowHeight: container.scrollHeight,
      });

      if (!isFirstPage) {
        pdf.addPage();
      }
      isFirstPage = false;

      // A4 정확한 mm 치수로 삽입
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0, 0,
        A4_WIDTH_MM, A4_HEIGHT_MM,
        undefined, 'FAST',
      );
    } finally {
      document.body.removeChild(container);
    }
  }

  pdf.save(`근로계약서_${contract.worker_name}_${new Date().toISOString().slice(0,10)}.pdf`);
}
