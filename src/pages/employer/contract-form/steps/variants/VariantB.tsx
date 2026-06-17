/**
 * VARIANT B — funnel (enhanced progressive disclosure)
 * 현재 패턴 유지 + 커스텀 input → TDS TextField 교체.
 */
import { useState } from 'react';
import { TextField, Spacing } from '@toss/tds-mobile';
import { FunnelQuestion } from '../../../../../components/funnel/FunnelQuestion';
import type { ContractFormData } from '../../types';

interface Props {
  form: ContractFormData;
  errors: Record<string, string>;
  handleChange: (field: string, value: string) => void;
}

export default function VariantB({ form, errors, handleChange }: Props) {
  const [activeField, setActiveField] = useState<'name' | 'phone' | 'address'>('name');

  return (
    <div>
      <FunnelQuestion
        title={<>근로자의 이름을<br />입력해주세요</>}
        subtitle="본명이 아니면 법적 효력이 없을 수 있어요"
        isActive={activeField === 'name'}
        onEnter={() => setActiveField('name')}
        summary={form.worker_name ? `이름: ${form.worker_name}` : undefined}
      >
        <TextField
          label="근로자 이름"
          value={form.worker_name}
          onChange={(e) => handleChange('worker_name', e.target.value)}
          placeholder="예: 홍길동"
          required
          error={errors.worker_name}
        />
        <Spacing size={16} />
      </FunnelQuestion>

      {(form.worker_name.trim().length > 0 || activeField !== 'name') && (
        <FunnelQuestion
          title={<>{form.worker_name || '근로자'}님의<br />전화번호를 알려주세요</>}
          subtitle="- 없이 숫자만 입력해주세요"
          isActive={activeField === 'phone'}
          onEnter={() => setActiveField('phone')}
          summary={form.worker_phone ? `전화번호: ${form.worker_phone}` : undefined}
        >
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
          <Spacing size={16} />
        </FunnelQuestion>
      )}

      {(form.worker_phone.length >= 10 || activeField === 'address') && (
        <FunnelQuestion
          title={<>{form.worker_name || '근로자'}님의<br />주소를 입력해주세요</>}
          subtitle="선택사항이며 나중에 적어도 돼요"
          isActive={activeField === 'address'}
          onEnter={() => setActiveField('address')}
          summary={form.worker_address ? `주소: ${form.worker_address}` : undefined}
        >
          <TextField
            label="근로자 주소 (선택)"
            value={form.worker_address}
            onChange={(e) => handleChange('worker_address', e.target.value)}
            placeholder="서울특별시 강남구..."
          />
          <Spacing size={16} />
        </FunnelQuestion>
      )}
    </div>
  );
}
