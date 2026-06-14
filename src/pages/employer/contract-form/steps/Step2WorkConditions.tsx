import { useState } from 'react';
import { SegmentedControl, WheelDatePicker } from '@toss/tds-mobile';
import type { ContractFormData } from '../types';
import { FunnelQuestion } from '../../../../components/funnel/FunnelQuestion';

interface Step2WorkConditionsProps {
  form: ContractFormData;
  errors: Record<string, string>;
  handleChange: (field: string, value: string | boolean | string[]) => void;
}

export default function Step2WorkConditions({ form, errors, handleChange }: Step2WorkConditionsProps) {
  const [activeField, setActiveField] = useState<'type' | 'workplace' | 'job' | 'startDate' | 'endDate'>('type');

  return (
    <div>
      <FunnelQuestion
        title={<>어떤 형태의<br/>계약인가요?</>}
        subtitle="근로 형태를 선택해주세요"
        isActive={activeField === 'type'}
        onEnter={() => setActiveField('type')}
        summary={form.contract_type ? `계약 유형: ${form.contract_type === 'fullTime' ? '정규직' : form.contract_type === 'partTime' ? '단시간' : '기간제'}` : undefined}
      >
        <SegmentedControl 
          value={form.contract_type} 
          onChange={v => {
            handleChange('contract_type', v);
            setActiveField('workplace');
          }}
          size="large"
        >
          <SegmentedControl.Item value="fullTime">정규직</SegmentedControl.Item>
          <SegmentedControl.Item value="partTime">단시간</SegmentedControl.Item>
          <SegmentedControl.Item value="fixedTerm">기간제</SegmentedControl.Item>
        </SegmentedControl>
      </FunnelQuestion>

      {/* Show workplace if type is set */}
      {(form.contract_type || activeField === 'workplace' || activeField === 'job' || activeField === 'startDate' || activeField === 'endDate') && (
        <FunnelQuestion
          title={<>어디서<br/>일하시나요?</>}
          subtitle="실제 근무할 장소를 알려주세요"
          isActive={activeField === 'workplace'}
          onEnter={() => setActiveField('workplace')}
          summary={form.workplace ? `근무지: ${form.workplace}` : undefined}
        >
          <label className="funnel-label">근무 장소</label>
          <input
            className="funnel-huge-input"
            placeholder="예: 토스카페 강남점"
            value={form.workplace}
            onChange={e => handleChange('workplace', e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && form.workplace.trim().length > 0) {
                setActiveField('job');
              }
            }}
          />
          {errors.workplace && (
            <div style={{ color: '#f04452', fontSize: '13px', marginTop: '8px' }}>
              {errors.workplace}
            </div>
          )}
        </FunnelQuestion>
      )}

      {/* Show job description if workplace is filled */}
      {(form.workplace.trim().length > 0 || activeField === 'job' || activeField === 'startDate' || activeField === 'endDate') && (
        <FunnelQuestion
          title={<>어떤 업무를<br/>담당하시나요?</>}
          subtitle="담당할 업무 내용을 입력해주세요"
          isActive={activeField === 'job'}
          onEnter={() => setActiveField('job')}
          summary={form.job_description ? `업무: ${form.job_description}` : undefined}
        >
          <label className="funnel-label">업무 내용</label>
          <input
            className="funnel-huge-input"
            placeholder="예: 매장 관리 및 고객 응대"
            value={form.job_description}
            onChange={e => handleChange('job_description', e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && form.job_description.trim().length > 0) {
                setActiveField('startDate');
              }
            }}
          />
          {errors.job_description && (
            <div style={{ color: '#f04452', fontSize: '13px', marginTop: '8px' }}>
              {errors.job_description}
            </div>
          )}
        </FunnelQuestion>
      )}

      {/* Show dates if job description is filled */}
      {(form.job_description.trim().length > 0 || activeField === 'startDate' || activeField === 'endDate') && (
        <FunnelQuestion
          title={<>언제부터<br/>일하시나요?</>}
          subtitle="근무를 시작하는 날짜를 선택해주세요"
          isActive={activeField === 'startDate' || activeField === 'endDate'}
          onEnter={() => setActiveField('startDate')}
          summary={form.start_date ? `기간: ${form.start_date} ~ ${form.end_date || '계속'}` : undefined}
        >
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label className="funnel-label">시작일</label>
              <WheelDatePicker
                value={form.start_date ? new Date(form.start_date) : undefined}
                onChange={(date) => {
                  handleChange('start_date', date ? date.toISOString().slice(0, 10) : '');
                  setActiveField('endDate');
                }}
                title="시작일"
                triggerLabel={form.start_date || '날짜 선택'}
                buttonText="확인"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="funnel-label">종료일 (선택)</label>
              <WheelDatePicker
                value={form.end_date ? new Date(form.end_date) : undefined}
                onChange={(date) => handleChange('end_date', date ? date.toISOString().slice(0, 10) : '')}
                title="종료일"
                triggerLabel={form.end_date || '종료일 없음'}
                buttonText="확인"
              />
            </div>
          </div>
        </FunnelQuestion>
      )}
    </div>
  );
}
