import type { Contract } from '../../hooks/useContracts';
import { escapeHtml } from '../../utils/sanitize';
import { formatWorkScheduleForDisplay } from '../../pages/employer/contract-form/formatSchedule';
import i18n, { type SupportedLang, LANG_META } from '../../i18n';

// ── A4 상수 (mm) ──────────────────────────────────────────────
export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;
export const A4_MARGIN_MM = 20;

// ── 번역 헬퍼 ─────────────────────────────────────────────────
const t = (key: string, opt?: Record<string, unknown>) => i18n.t(key, opt);
const lang = (): SupportedLang => (i18n.language?.split('-')[0] ?? 'ko') as SupportedLang;
const isBilingual = () => lang() !== 'ko';

/** 이중언어 셀 HTML: 번역(굵게) + 한국어 원문(회색). 한국어 모드면 번역만 */
export function biCell(ko: string, transKey: string): string {
  const translated = t(transKey);
  if (!isBilingual() || translated === ko || translated === transKey) {
    return escapeHtml(ko);
  }
  return `<span class="bi"><span class="bi-trans">${escapeHtml(translated)}</span><span class="bi-ko">${escapeHtml(ko)}</span></span>`;
}

function workDaysStr(c: Contract): string {
  return c.work_days.map(d => escapeHtml(t(`labels.workDayShort.${d}`))).join(', ');
}

function holidayStr(c: Contract): string {
  if (!c.weekly_holiday) return isBilingual() ? '—' : '없음';
  return escapeHtml(t(`labels.workDay.${c.weekly_holiday}`, { defaultValue: c.weekly_holiday }));
}

function parseConsent(json?: string): { signer?: string; relation?: string; signature?: string; signedAt?: string } {
  if (!json) return {};
  try { return JSON.parse(json); } catch { return {}; }
}

// ── 공통 CSS (Pretendard + 다국어 Noto Sans) ───────────────────
export function baseCSS(): string {
  return `
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css');
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;600&family=Noto+Sans+Khmer:wght@400&family=Noto+Sans+Devanagari:wght@400&family=Noto+Sans+SC:wght@400;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Pretendard Variable', Pretendard, 'Noto Sans Thai', 'Noto Sans Khmer', 'Noto Sans Devanagari', 'Noto Sans SC', -apple-system, sans-serif;
    font-size: 10.5pt;
    line-height: 1.75;
    color: #191F28;
    background: #fff;
  }
  .page {
    width: 100%;
    max-width: 210mm;
    margin: 0 auto;
    padding: 24px 16px;
    background: #fff;
    position: relative;
  }
  h1 {
    text-align: center;
    font-size: 18pt;
    font-weight: 800;
    border-bottom: 2px solid #191F28;
    padding-bottom: 5mm;
    margin-bottom: 8mm;
    letter-spacing: 0.1em;
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
    width: 30%;
    max-width: 42mm;
    font-weight: 600;
    color: #4E5968;
  }
  td { word-break: keep-all; }
  .bi { display: inline-flex; flex-direction: column; gap: 1px; line-height: 1.25; }
  .bi-trans { font-size: 10pt; font-weight: 600; color: #191F28; }
  .bi-ko { font-size: 8pt; font-weight: 400; color: #8b95a1; }
  .parent-consent-box {
    margin-top: 6mm;
    padding: 4mm;
    background: #FFF9E6;
    border: 0.5mm solid #FFE082;
    border-radius: 4mm;
  }
  .signatures {
    display: flex;
    justify-content: space-between;
    margin-top: 10mm;
    gap: 10mm;
  }
  .sign-box { flex: 1; text-align: center; }
  .sign-line {
    border-bottom: 0.5mm solid #191F28;
    height: 20mm;
    margin: 4mm 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .sign-img { max-height: 18mm; max-width: 60mm; }
  .note {
    font-size: 8pt;
    color: #6B7684;
    margin-top: 8mm;
    text-align: center;
    line-height: 1.5;
  }
  .footer-rule { border-top: 0.5mm solid #E5E8EB; margin-top: 6mm; padding-top: 4mm; }
  .contract-id { font-size: 7pt; color: #B0B8C1; text-align: right; margin-top: 2mm; }
  @media print { body { margin: 0; } .page { box-shadow: none; } }
  `;
}

// ── HTML 생성 (i18n 연동, 단일 연속 페이지) ────────────────────
export function generatePrintableHTML(contract: Contract): string {
  const scheduleEntries = formatWorkScheduleForDisplay(contract);
  const scheduleRowsHtml = scheduleEntries.length <= 1
    ? (() => {
        const e = scheduleEntries[0] ?? {
          workTime: `${escapeHtml(contract.start_time)} ~ ${escapeHtml(contract.end_time)}`,
          breakTime: contract.break_start_time && contract.break_end_time
            ? `${escapeHtml(contract.break_start_time)} ~ ${escapeHtml(contract.break_end_time)}`
            : '',
        };
        const workRow = `<tr><th>${biCell('근무 시간', 'contract.fields.workTime')}</th><td>${e.workTime}</td></tr>`;
        const breakRow = e.breakTime ? `<tr><th>${biCell('휴게시간', 'contract.fields.breakTime')}</th><td>${e.breakTime}</td></tr>` : '';
        return workRow + breakRow;
      })()
    : scheduleEntries.map(e => `<tr><th>${escapeHtml(e.label)}</th><td>${e.breakTime ? `${e.workTime} (${biCell('휴게', 'contract.fields.breakTime')} ${e.breakTime})` : e.workTime}</td></tr>`).join('');

  const period = `${escapeHtml(contract.start_date)} ~${contract.end_date ? ` ${escapeHtml(contract.end_date)}` : ''}`;
  const localeDate = LANG_META[lang()]?.bcp47 ?? 'ko-KR';
  const contractDate = contract.created_at
    ? new Date(contract.created_at).toLocaleDateString(localeDate, { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  // 친권자 동의 HTML 렌더
  let parentConsentHtml = '';
  if (contract.is_minor && contract.parent_consent_data) {
    const consent = parseConsent(contract.parent_consent_data);
    parentConsentHtml = `
    <div class="parent-consent-box">
      <p class="section-title">${biCell('친권자 동의', 'contract.section.parentConsent')}</p>
      <table>
        <tr><th>${biCell('친권자 성명', 'contract.fields.parentName')}</th><td>${escapeHtml(consent.signer ?? '—')}</td></tr>
        <tr><th>${biCell('근로자와의 관계', 'contract.fields.parentRelation')}</th><td>${escapeHtml(consent.relation ?? '—')}</td></tr>
        <tr>
          <th>${biCell('동의 서명', 'contract.fields.parentSignature')}</th>
          <td>
            ${consent.signature ? `<img src="${consent.signature}" class="sign-img" style="max-height: 12mm; display: block;" alt="" />` : '—'}
          </td>
        </tr>
      </table>
    </div>`;
  }

  return `<!DOCTYPE html>
<html lang="${lang()}">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(t('contract.title'))} - ${escapeHtml(contract.worker_name)}</title>
  <style>${baseCSS()}</style>
</head>
<body>
  <div class="page">
    <h1>${escapeHtml(t('contract.title'))}</h1>
    <p style="text-align:right; color:#6B7684; font-size:10pt; margin-bottom:6mm;">${contractDate}</p>

    <p class="section-title">1. ${biCell('근로자', 'contract.section.worker')}</p>
    <table>
      <tr><th>${biCell('성명', 'contract.fields.name')}</th><td>${escapeHtml(contract.worker_name)}</td></tr>
      <tr><th>${biCell('연락처', 'contract.fields.phone')}</th><td>${escapeHtml(contract.worker_phone)}</td></tr>
    </table>

    <p class="section-title">2. ${biCell('근로조건', 'contract.section.conditions')}</p>
    <table>
      <tr><th>${biCell('계약 유형', 'contract.fields.contractType')}</th><td>${escapeHtml(t(`labels.contractType.${contract.contract_type}`, { defaultValue: contract.contract_type }))}</td></tr>
      <tr><th>${biCell('근무 장소', 'contract.fields.workplace')}</th><td>${escapeHtml(contract.workplace)}</td></tr>
      <tr><th>${biCell('직무 내용', 'contract.fields.jobDescription')}</th><td>${escapeHtml(contract.job_description)}</td></tr>
      <tr><th>${biCell('계약 기간', 'contract.fields.period')}</th><td>${period}</td></tr>
    </table>

    <p class="section-title">3. ${biCell('임금', 'contract.section.wage')}</p>
    <table>
      <tr><th>${biCell('임금 형태', 'contract.fields.wageType')}</th><td>${escapeHtml(t(`labels.wageType.${contract.wage_type}`, { defaultValue: contract.wage_type }))}</td></tr>
      <tr><th>${biCell('기본 임금', 'contract.fields.baseWage')}</th><td>${contract.base_wage.toLocaleString()}${isBilingual() ? ' KRW (원)' : '원'}</td></tr>
      <tr><th>${biCell('지급 방법', 'contract.fields.paymentMethod')}</th><td>${escapeHtml(t(`labels.paymentMethod.${contract.wage_payment_method}`, { defaultValue: contract.wage_payment_method }))}</td></tr>
      <tr><th>${biCell('임금 지급일', 'contract.fields.payDate')}</th><td>${escapeHtml(contract.wage_payment_date)}</td></tr>
    </table>

    <p class="section-title">4. ${biCell('근무시간', 'contract.section.schedule')}</p>
    <table>
      <tr><th>${biCell('근무일', 'contract.fields.workDays')}</th><td>${workDaysStr(contract)}</td></tr>
      ${scheduleRowsHtml}
      <tr><th>${biCell('주휴일', 'contract.fields.weeklyHoliday')}</th><td>${holidayStr(contract)}<br><span style="font-size:8pt;color:#6B7684;">${escapeHtml(t('contract.fields.weeklyHolidayNote'))}</span></td></tr>
    </table>

    <p class="section-title">5. ${biCell('기타 근로조건', 'contract.section.etc')}</p>
    <table>
      <tr><th>${biCell('연차유급휴가', 'contract.fields.paidLeave')}</th><td>${contract.paid_leave_clause ? escapeHtml(t('contract.values.paidLeaveApplied')) : escapeHtml(t('contract.values.paidLeaveNone'))}</td></tr>
      <tr><th>${biCell('국민연금', 'contract.fields.pension')}</th><td>${escapeHtml(t(`labels.insurance.${contract.pension ? 'enrolled' : 'notEnrolled'}`))}<br><span style="font-size:8pt;color:#6B7684;">${escapeHtml(t('contract.notes.socialInsurance'))}</span></td></tr>
      <tr><th>${biCell('건강보험', 'contract.fields.healthInsurance')}</th><td>${escapeHtml(t(`labels.insurance.${contract.health_insurance ? 'enrolled' : 'notEnrolled'}`))}</td></tr>
      <tr><th>${biCell('고용보험', 'contract.fields.employmentInsurance')}</th><td>${escapeHtml(t(`labels.insurance.${contract.employment_insurance ? 'enrolled' : 'notEnrolled'}`))}</td></tr>
      <tr><th>${biCell('산재보험', 'contract.fields.accidentInsurance')}</th><td>${escapeHtml(t(`labels.insurance.${contract.accident_insurance ? 'enrolled' : 'notEnrolled'}`))}</td></tr>
      <tr><th>${biCell('퇴직금', 'contract.fields.severance')}</th><td>${contract.severance_clause ? escapeHtml(t('contract.values.severanceApplied')) : escapeHtml(t('contract.values.severanceNone'))}${contract.severance_clause ? `<br><span style="font-size:8pt;color:#6B7684;">${escapeHtml(t('contract.notes.severance'))}</span>` : ''}</td></tr>
    </table>

    ${parentConsentHtml}

    <p style="text-align: center; margin-top: 10mm; font-size: 11pt;">
      ${escapeHtml(t('contract.statement'))}
    </p>

    <div class="signatures">
      <div class="sign-box">
        <p style="font-weight: 600;">${biCell('사용자', 'contract.fields.signerEmployer')}</p>
        <div class="sign-line">
          ${contract.employer_signature_data ? `<img src="${contract.employer_signature_data}" class="sign-img" alt="" />` : ''}
        </div>
        <p style="font-size: 8pt; color: #6B7684;">${escapeHtml(t('contract.signatureNote'))}</p>
        ${contract.employer_signed_at ? `<p style="font-size: 8pt; color: #6B7684;">${new Date(contract.employer_signed_at).toLocaleDateString(localeDate)}</p>` : ''}
      </div>
      <div class="sign-box">
        <p style="font-weight: 600;">${biCell('근로자', 'contract.fields.signerWorker')}</p>
        <p style="font-size: 10pt;">${escapeHtml(contract.worker_name)}</p>
        <div class="sign-line">
          ${contract.worker_signature_data ? `<img src="${contract.worker_signature_data}" class="sign-img" alt="" />` : ''}
        </div>
        <p style="font-size: 8pt; color: #6B7684;">${escapeHtml(t('contract.signatureNote'))}</p>
        ${contract.worker_signed_at ? `<p style="font-size: 8pt; color: #6B7684;">${new Date(contract.worker_signed_at).toLocaleDateString(localeDate)}</p>` : ''}
      </div>
    </div>

    <div class="footer-rule"></div>
    <p class="note">${escapeHtml(t('contract.disclaimer'))}</p>
    <p class="contract-id">${escapeHtml(contract.id)}</p>
  </div>
</body>
</html>`;
}
