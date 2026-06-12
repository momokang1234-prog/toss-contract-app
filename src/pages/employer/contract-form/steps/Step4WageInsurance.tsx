import { Spacing, TextField, SegmentedControl, Paragraph, Switch } from '@toss/tds-mobile';
import type { ContractFormData } from '../types';
import { FieldLabel } from './FieldLabel';

interface Step4WageInsuranceProps {
  form: ContractFormData;
  errors: Record<string, string>;
  handleChange: (field: string, value: string | boolean | string[]) => void;
}

function SwitchRow({ label, description, checked, onChange }: {
  label: string; description?: string; checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 0', gap: 12 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Paragraph typography="st6" fontWeight="bold">{label}</Paragraph>
        {description && (
          <Paragraph typography="st7" color="grey-500" style={{ marginTop: 4, lineHeight: '1.6', wordBreak: 'keep-all' }}>
            {description}
          </Paragraph>
        )}
      </div>
      <Switch checked={checked} onChange={(e) => onChange((e.target as HTMLInputElement).checked)} aria-label={label} />
    </div>
  );
}

export default function Step4WageInsurance({ form, errors, handleChange }: Step4WageInsuranceProps) {
  return (
    <div>
      <Paragraph typography="st3" fontWeight="bold" style={{ marginBottom: 12 }}>임금 및 보험</Paragraph>
      <Spacing size={4} />
      <Paragraph typography="st4" fontWeight="bold" color="grey800" style={{ marginBottom: 8 }}>임금</Paragraph>
      <FieldLabel>급여 형태</FieldLabel>
      <SegmentedControl value={form.wage_type} onChange={v => handleChange('wage_type', v)}>
        <SegmentedControl.Item value="hourly">시급</SegmentedControl.Item>
        <SegmentedControl.Item value="daily">일급</SegmentedControl.Item>
        <SegmentedControl.Item value="weekly">주급</SegmentedControl.Item>
        <SegmentedControl.Item value="monthly">월급</SegmentedControl.Item>
      </SegmentedControl>
      <Spacing size={12} />
      <FieldLabel>금액 (원)</FieldLabel>
      <TextField variant="box" type="number" placeholder="예: 3000000" value={form.base_wage}
        onChange={e => handleChange('base_wage', e.target.value)}
        hasError={!!errors.base_wage} help={errors.base_wage} aria-label="금액" />
      <Spacing size={16} />
      <FieldLabel>지급 방법</FieldLabel>
      <SegmentedControl value={form.wage_payment_method} onChange={v => handleChange('wage_payment_method', v)}>
        <SegmentedControl.Item value="bankTransfer">계좌이체</SegmentedControl.Item>
        <SegmentedControl.Item value="cash">현금</SegmentedControl.Item>
        <SegmentedControl.Item value="mixed">혼합</SegmentedControl.Item>
      </SegmentedControl>
      <Spacing size={16} />
      <FieldLabel>지급일</FieldLabel>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 15, color: '#333D4B', whiteSpace: 'nowrap' }}>매월</span>
        <select
          value={form.wage_payment_day}
          onChange={e => handleChange('wage_payment_day', e.target.value)}
          style={{
            flex: 1, padding: '14px 16px', fontSize: 15, borderRadius: 12,
            border: '1px solid #D9DCE0', backgroundColor: '#F9FAFB',
            color: '#333D4B', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22%3E%3Cpath d=%22M3 5l3 3 3-3%22 stroke=%22%238B95A1%22 stroke-width=%221.5%22 fill=%22none%22/%3E%3C/svg%3E")',
            backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
          }}
        >
          {Array.from({ length: 28 }, (_, i) => i + 1).map(d =>
            <option key={d} value={String(d)}>{d}일</option>
          )}
          <option value="last">말일</option>
        </select>
      </div>
      <Spacing size={24} />
      <Paragraph typography="st4" fontWeight="bold" color="grey800" style={{ marginBottom: 8 }}>근로조건</Paragraph>
      <SwitchRow
        label="연차 유급휴가"
        description="5인 이상 사업장 의무. 5인 미만은 권고사항 (근로기준법 제60조)"
        checked={form.paid_leave_clause}
        onChange={v => handleChange('paid_leave_clause', v)}
      />
      <Spacing size={16} />
      <Paragraph typography="st5" fontWeight="bold" color="grey800" style={{ marginBottom: 12 }}>4대 보험</Paragraph>
      <div style={{ paddingLeft: 16, borderLeft: '2px solid #E5E8EB', marginBottom: 16 }}>
        <SwitchRow
          label="국민연금"
          description="만 18세 이상 60세 미만 사업장가입자. 월 8일 이상·월 60시간 이상 근무 시 의무가입"
          checked={form.pension}
          onChange={v => handleChange('pension', v)}
        />
        <SwitchRow
          label="건강보험"
          description="사업장가입자. 월 8일 이상·월 60시간 이상 근무 시 의무가입"
          checked={form.health_insurance}
          onChange={v => handleChange('health_insurance', v)}
        />
        <SwitchRow
          label="고용보험"
          description="전 근로자 의무가입 (단, 65세 이후 고용된 자 제외)"
          checked={form.employment_insurance}
          onChange={v => handleChange('employment_insurance', v)}
        />
        <SwitchRow
          label="산재보험"
          description="전 사업장 의무가입. 근로복지공단 관장"
          checked={form.accident_insurance}
          onChange={v => handleChange('accident_insurance', v)}
        />
      </div>
      <div style={{ backgroundColor: '#F0F6FF', borderRadius: 8, padding: 12, marginBottom: 12, border: '1px solid #D1E3FF' }}>
        <Paragraph typography="st6" fontWeight="bold" color="grey800" style={{ marginBottom: 6 }}>퇴직금</Paragraph>
        <Paragraph typography="st7" color="grey-600" style={{ lineHeight: '1.6', wordBreak: 'keep-all' }}>
          근로자퇴직급여보장법에 따라 1년 이상 근무 시 의무 지급. 4주 평균 15시간 이상 근무 시 적용.
        </Paragraph>
      </div>
    </div>
  );
}
