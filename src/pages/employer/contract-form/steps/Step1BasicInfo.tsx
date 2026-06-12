import { Spacing, TextField, Paragraph } from '@toss/tds-mobile';
import type { ContractFormData } from '../types';
import { FieldLabel } from './FieldLabel';

interface Step1BasicInfoProps {
  form: ContractFormData;
  errors: Record<string, string>;
  handleChange: (field: string, value: string | boolean | string[]) => void;
}

export default function Step1BasicInfo({ form, errors, handleChange }: Step1BasicInfoProps) {
  return (
    <div>
      <Paragraph typography="st3" fontWeight="bold" style={{ marginBottom: 12 }}>근로자 정보</Paragraph>
      <FieldLabel>근로자 이름</FieldLabel>
      <TextField variant="box" placeholder="예: 홍길동" value={form.worker_name}
        onChange={e => handleChange('worker_name', e.target.value)}
        hasError={!!errors.worker_name} help={errors.worker_name} aria-label="근로자 이름" />
      <Spacing size={16} />
      <FieldLabel>전화번호</FieldLabel>
      <TextField variant="box" placeholder="01012345678" value={form.worker_phone}
        onChange={e => handleChange('worker_phone', e.target.value.replace(/\D/g, '').slice(0, 11))}
        hasError={!!errors.worker_phone} help={errors.worker_phone} aria-label="전화번호" />
      <Spacing size={16} />
      <FieldLabel>근로자 주소 (선택)</FieldLabel>
      <TextField variant="box" placeholder="서울특별시 강남구..." value={form.worker_address}
        onChange={e => handleChange('worker_address', e.target.value)} aria-label="근로자 주소" />
    </div>
  );
}
