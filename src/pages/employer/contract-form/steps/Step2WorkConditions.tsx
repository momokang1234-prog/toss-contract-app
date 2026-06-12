import { Spacing, TextField, Paragraph, SegmentedControl } from '@toss/tds-mobile';
import type { ContractFormData } from '../types';
import { FieldLabel } from './FieldLabel';
import { WheelDatePicker } from '@toss/tds-mobile';

interface Step2WorkConditionsProps {
  form: ContractFormData;
  errors: Record<string, string>;
  handleChange: (field: string, value: string | boolean | string[]) => void;
}

export default function Step2WorkConditions({ form, errors, handleChange }: Step2WorkConditionsProps) {
  return (
    <div>
      <Paragraph typography="st3" fontWeight="bold" style={{ marginBottom: 12 }}>계약 조건</Paragraph>
      <FieldLabel>계약 유형</FieldLabel>
      <SegmentedControl value={form.contract_type} onChange={v => handleChange('contract_type', v)}>
        <SegmentedControl.Item value="fullTime">정규직</SegmentedControl.Item>
        <SegmentedControl.Item value="partTime">단시간</SegmentedControl.Item>
        <SegmentedControl.Item value="fixedTerm">기간제</SegmentedControl.Item>
      </SegmentedControl>
      <Spacing size={16} />
      <FieldLabel>근무 장소</FieldLabel>
      <TextField variant="box" placeholder="예: 서울시 강남구" value={form.workplace}
        onChange={e => handleChange('workplace', e.target.value)}
        hasError={!!errors.workplace} help={errors.workplace} aria-label="근무 장소" />
      <Spacing size={16} />
      <FieldLabel>직무 내용</FieldLabel>
      <TextField variant="box" placeholder="예: 매장 관리 및 고객 응대" value={form.job_description}
        onChange={e => handleChange('job_description', e.target.value)}
        hasError={!!errors.job_description} help={errors.job_description} aria-label="직무 내용" />
      <Spacing size={16} />
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <FieldLabel>시작일</FieldLabel>
          <WheelDatePicker
            value={form.start_date ? new Date(form.start_date) : undefined}
            onChange={(date) => handleChange('start_date', date ? date.toISOString().slice(0, 10) : '')}
            title="시작일"
            triggerLabel={form.start_date || '날짜 선택'}
            buttonText="확인"
          />
        </div>
        <div style={{ flex: 1 }}>
          <FieldLabel>종료일 (선택)</FieldLabel>
          <WheelDatePicker
            value={form.end_date ? new Date(form.end_date) : undefined}
            onChange={(date) => handleChange('end_date', date ? date.toISOString().slice(0, 10) : '')}
            title="종료일"
            triggerLabel={form.end_date || '날짜 선택'}
            buttonText="확인"
          />
        </div>
      </div>
    </div>
  );
}
