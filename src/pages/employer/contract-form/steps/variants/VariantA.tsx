/**
 * VARIANT A — full-page (all-at-once)
 * 3개 필드를 한 화면에 동시 노출. 자유 순서 입력 가능.
 */
import { Paragraph, TextField, Spacing, Button } from '@toss/tds-mobile';
import type { ContractFormData } from '../../types';

interface Props {
  form: ContractFormData;
  errors: Record<string, string>;
  handleChange: (field: string, value: string) => void;
}

export default function VariantA({ form, errors, handleChange }: Props) {
  return (
    <div>
      <Paragraph typography="st3" fontWeight="bold" color="grey-900">
        근로자 기본 정보
      </Paragraph>
      <Paragraph typography="st6" color="grey-500">
        계약서에 들어갈 근로자 정보를 입력해주세요
      </Paragraph>
      <Spacing size={32} />

      <TextField
        label="근로자 이름"
        value={form.worker_name}
        onChange={(e) => handleChange('worker_name', e.target.value)}
        placeholder="예: 홍길동"
        required
        error={errors.worker_name}
      />
      <Spacing size={20} />

      <TextField
        label="전화번호"
        value={form.worker_phone}
        onChange={(e) =>
          handleChange('worker_phone', e.target.value.replace(/\D/g, '').slice(0, 11))
        }
        placeholder="01012345678"
        required
        error={errors.worker_phone}
      />
      <Spacing size={20} />

      <TextField
        label="근로자 주소 (선택)"
        value={form.worker_address}
        onChange={(e) => handleChange('worker_address', e.target.value)}
        placeholder="서울특별시 강남구..."
      />
      <Spacing size={40} />

      <Button
        color="primary"
        variant="fill"
        display="block"
        size="xlarge"
        disabled={!form.worker_name.trim() || form.worker_phone.length < 10}
      >
        다음
      </Button>
    </div>
  );
}
