import { useState } from 'react';
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
        <label className="funnel-label">근로자 이름</label>
        <input
          className="funnel-huge-input"
          placeholder="예: 홍길동"
          value={form.worker_name}
          onChange={e => handleChange('worker_name', e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && form.worker_name.trim().length > 0) {
              setActiveField('phone');
            }
          }}
        />
        {errors.worker_name && (
          <div style={{ color: '#f04452', fontSize: '13px', marginTop: '8px' }}>
            {errors.worker_name}
          </div>
        )}
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
        <label className="funnel-label">전화번호</label>
        <input
          className="funnel-huge-input"
          type="tel"
          placeholder="01012345678"
          value={form.worker_phone}
          onChange={e => handleChange('worker_phone', e.target.value.replace(/\D/g, '').slice(0, 11))}
          onKeyDown={e => {
            if (e.key === 'Enter' && form.worker_phone.length >= 10) {
              setActiveField('address');
            }
          }}
        />
        {errors.worker_phone && (
          <div style={{ color: '#f04452', fontSize: '13px', marginTop: '8px' }}>
            {errors.worker_phone}
          </div>
        )}
      </FunnelQuestion>
      </CommentBoundary>
      )}

      {/* Show address field if phone is filled or address is active */}
      {(form.worker_phone.length >= 10 || activeField === 'address') && (
      <CommentBoundary name="기본정보-주소필드">
      <FunnelQuestion
        title={<>{form.worker_name}님의 주소를<br/>입력해주세요</>}
        subtitle="선택사항이며 나중에 적어도 돼요"
        isActive={activeField === 'address'}
        onEnter={() => setActiveField('address')}
        summary={form.worker_address ? `주소: ${form.worker_address}` : undefined}
      >
        <label className="funnel-label">근로자 주소 (선택)</label>
        <input
          className="funnel-huge-input"
          placeholder="서울특별시 강남구..."
          value={form.worker_address}
          onChange={e => handleChange('worker_address', e.target.value)}
        />
      </FunnelQuestion>
      </CommentBoundary>
      )}
    </div>
  );
}
