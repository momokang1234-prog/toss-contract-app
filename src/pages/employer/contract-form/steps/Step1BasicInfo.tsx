import { useState } from 'react';
import { TextField, Spacing } from '@toss/tds-mobile';
import type { ContractFormData } from '../types';
import { CommentBoundary } from '../../../dev/CommentBoundary';
import { FunnelQuestion } from '../../../../components/funnel/FunnelQuestion';

interface Step1BasicInfoProps {
  form: ContractFormData;
  errors: Record<string, string>;
  handleChange: (field: string, value: string | boolean | string[]) => void;
}

export default function Step1BasicInfo({ form, errors, handleChange }: Step1BasicInfoProps) {
  const [activeField, setActiveField] = useState<'name' | 'phone' | 'address'>('name');

  return (
    <div>
      <CommentBoundary name="기본정보-이름필드">
      <FunnelQuestion
        title={<>근로자의 이름을<br/>입력해주세요</>}
        subtitle="본명이 아니면 법적 효력이 없을 수 있어요"
        isActive={activeField === 'name'}
        onEnter={() => setActiveField('name')}
        summary={form.worker_name ? `이름: ${form.worker_name}` : undefined}
      >
        <div style={{ padding: '0 4px' }}>
          <TextField
            variant="line"
            labelOption="sustain"
            label="근로자 이름"
            placeholder="예: 홍길동"
            value={form.worker_name}
            onChange={e => handleChange('worker_name', e.target.value)}
            hasError={!!errors.worker_name}
            help={errors.worker_name}
            onKeyDown={e => {
              if (e.key === 'Enter' && form.worker_name.trim().length > 0) {
                setActiveField('phone');
              }
            }}
          />
        </div>
        <Spacing size={24} />
      </FunnelQuestion>
      </CommentBoundary>

      {/* Show phone field if name is filled or phone is already active */}
      {(form.worker_name.trim().length > 0 || activeField === 'phone' || activeField === 'address') && (
      <CommentBoundary name="기본정보-연락처필드">
      <FunnelQuestion
        title={<>{form.worker_name}님의 전화번호를<br/>알려주세요</>}
        subtitle="- 없이 숫자만 입력해주세요"
        isActive={activeField === 'phone'}
        onEnter={() => setActiveField('phone')}
        summary={form.worker_phone ? `전화번호: ${form.worker_phone}` : undefined}
      >
        <div style={{ padding: '0 4px' }}>
          <TextField
            variant="line"
            labelOption="sustain"
            label="전화번호"
            placeholder="01012345678"
            value={form.worker_phone}
            onChange={e => handleChange('worker_phone', e.target.value.replace(/\D/g, '').slice(0, 11))}
            hasError={!!errors.worker_phone}
            help={errors.worker_phone}
            onKeyDown={e => {
              if (e.key === 'Enter' && form.worker_phone.length >= 10) {
                setActiveField('address');
              }
            }}
          />
        </div>
        <Spacing size={24} />
      </FunnelQuestion>
      </CommentBoundary>
      )}

      {/* Show address field if phone is filled or address is already active */}
      {(form.worker_phone.length >= 10 || activeField === 'address') && (
      <CommentBoundary name="기본정보-주소필드">
      <FunnelQuestion
        title={<>{form.worker_name}님의 주소를<br/>알려주세요</>}
        subtitle="선택입력 사항입니다"
        isActive={activeField === 'address'}
        onEnter={() => setActiveField('address')}
        summary={form.worker_address ? `주소: ${form.worker_address}` : undefined}
      >
        <div style={{ padding: '0 4px' }}>
          <TextField
            variant="line"
            labelOption="sustain"
            label="주소"
            placeholder="예: 서울특별시 강남구 테헤란로 142"
            value={form.worker_address || ''}
            onChange={e => handleChange('worker_address', e.target.value)}
            hasError={!!errors.worker_address}
            help={errors.worker_address}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.currentTarget.blur();
              }
            }}
          />
        </div>
        <Spacing size={24} />
      </FunnelQuestion>
      </CommentBoundary>
      )}

    </div>
  );
}

