import { Spacing, Paragraph } from '@toss/tds-mobile';
import type { ValidationWarning } from '../../../../domain/contract/validation';
import type { ContractFormData } from '../types';
import { DAY_LABELS } from '../types';

interface Step6PreviewProps {
  form: ContractFormData;
  warnings: ValidationWarning[];
  computeBreakMinutes: (start: string, end: string) => number;
  formatWagePaymentDate: (day: string) => string;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
      <Paragraph typography="st7" color="grey-500">{label}</Paragraph>
      <Paragraph typography="st6" color="grey-800" style={{ textAlign: 'right', maxWidth: '60%' }}>{value}</Paragraph>
    </div>
  );
}

export default function Step6Preview({ form, warnings, computeBreakMinutes, formatWagePaymentDate }: Step6PreviewProps) {
  return (
    <>
      <Paragraph typography="st3" fontWeight="bold" style={{ marginBottom: 12 }}>최종 확인</Paragraph>
      <Spacing size={4} />
      <Paragraph typography="st6" color="grey-500" style={{ marginBottom: 16 }}>아래 내용을 확인한 후 계약서를 저장합니다.</Paragraph>
        <SummaryRow label="근로자" value={`${form.worker_name} (${form.worker_phone})`} />
        {form.worker_address && <SummaryRow label="주소" value={form.worker_address} />}
        <Spacing size={12} />
        <SummaryRow label="계약 유형" value={form.contract_type === 'fullTime' ? '정규직' : form.contract_type === 'partTime' ? '단시간' : '기간제'} />
        <SummaryRow label="근무 장소" value={form.workplace} />
        <SummaryRow label="직무" value={form.job_description} />
        <SummaryRow label="계약 기간" value={`${form.start_date}${form.end_date ? ` ~ ${form.end_date}` : ' (기간 정함 없음)'}`} />
        <Spacing size={12} />
        <SummaryRow label="임금" value={`${form.wage_type === 'hourly' ? '시급' : form.wage_type === 'daily' ? '일급' : form.wage_type === 'weekly' ? '주급' : '월급'} ${Number(form.base_wage).toLocaleString()}원`} />
        <SummaryRow label="지급 방식" value={form.wage_payment_method === 'bankTransfer' ? '계좌이체' : form.wage_payment_method === 'cash' ? '현금' : '혼합'} />
        <SummaryRow label="지급일" value={formatWagePaymentDate(form.wage_payment_day)} />
        <Spacing size={12} />
        <SummaryRow label="근무 요일" value={form.work_days.map(d => DAY_LABELS[d]).join(', ')} />
        <SummaryRow label="근무 시간" value={`${form.start_time} ~ ${form.end_time} (휴게 ${computeBreakMinutes(form.break_start, form.break_end)}분)`} />
        <SummaryRow label="주휴일" value={form.weekly_holiday ? DAY_LABELS[form.weekly_holiday] : '없음'} />
        <Spacing size={12} />
        <SummaryRow label="연차 유급휴가" value={form.paid_leave_clause ? '포함' : '미포함'} />
        <SummaryRow label="국민연금" value={form.pension ? '가입' : '미가입'} />
        <SummaryRow label="건강보험" value={form.health_insurance ? '가입' : '미가입'} />
        <SummaryRow label="고용보험" value={form.employment_insurance ? '가입' : '미가입'} />
        <SummaryRow label="산재보험" value={form.accident_insurance ? '가입' : '미가입'} />
        <SummaryRow label="퇴직금" value="법정 의무 적용" />
      {warnings.length > 0 && (
        <div style={{ backgroundColor: '#FFF9DB', borderRadius: 8, padding: 16, marginTop: 16, border: '1px solid #F2E49B' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#8B6F00', marginBottom: 8 }}>⚠ 검토 필요 사항</div>
          {warnings.map((w, i) => (
            <div key={i} style={{ fontSize: 12, color: '#8B6F00', marginBottom: 4, lineHeight: 1.5 }}>• {w.message}</div>
          ))}
        </div>
      )}
    </>
  );
}
