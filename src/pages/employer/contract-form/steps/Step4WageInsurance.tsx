import { useState, useEffect } from 'react';
import { Spacing, SegmentedControl, Paragraph, Switch, BottomSheet } from '@toss/tds-mobile';
import type { ContractFormData } from '../types';
import { CommentBoundary } from '../../../dev/CommentBoundary';
import { FunnelQuestion } from '../../../../components/funnel/FunnelQuestion';

interface Step4WageInsuranceProps {
  form: ContractFormData;
  errors: Record<string, string>;
  handleChange: (field: string, value: string | boolean | string[]) => void;
}

const WAGE_PAYMENT_DAYS = [
  { value: '1', label: '1일' }, { value: '5', label: '5일' },
  { value: '10', label: '10일' }, { value: '15', label: '15일' },
  { value: '20', label: '20일' }, { value: '25', label: '25일' },
  { value: 'last', label: '말일' },
];

export default function Step4WageInsurance({ form, errors, handleChange }: Step4WageInsuranceProps) {
  const [activeField, setActiveField] = useState<'wageType' | 'paymentMethod' | 'paymentDay' | 'paidLeave' | 'insurance'>('wageType');
  const [paymentMethodOpen, setPaymentMethodOpen] = useState(false);

  // "다음" 검증 실패 시 첫 미입력 필드를 자동으로 펼쳐 에러가 보이게 해요.
  useEffect(() => {
    if (errors.base_wage) setActiveField('wageType');
    else if (errors.wage_payment_day) setActiveField('paymentDay');
    else if (errors.accident_insurance) setActiveField('insurance');
  }, [errors.base_wage, errors.wage_payment_day, errors.accident_insurance]);

  const wageTypeLabel = form.wage_type === 'hourly' ? '시급' : form.wage_type === 'daily' ? '일급' : form.wage_type === 'weekly' ? '주급' : '월급';
  const wageUnit = form.wage_type === 'hourly' ? '원/시간' : form.wage_type === 'daily' ? '원/일' : form.wage_type === 'weekly' ? '원/주' : '원/월';

  return (
    <div>
      {/* 1. Wage type + amount */}
      <CommentBoundary name="임금-형태금액">
      <FunnelQuestion
        title={<>임금 형태와<br/>금액을 입력해주세요</>}
        subtitle="근로기준법에 따른 최저임금 이상이어야 해요"
        isActive={activeField === 'wageType'}
        onEnter={() => setActiveField('wageType')}
        summary={form.wage_type && form.base_wage ? `${wageTypeLabel} ${Number(form.base_wage).toLocaleString()}원` : undefined}
      >
        <SegmentedControl
          value={form.wage_type}
          onChange={v => { handleChange('wage_type', v); }}
          size="large"
        >
          <SegmentedControl.Item value="hourly">시급</SegmentedControl.Item>
          <SegmentedControl.Item value="daily">일급</SegmentedControl.Item>
          <SegmentedControl.Item value="weekly">주급</SegmentedControl.Item>
          <SegmentedControl.Item value="monthly">월급</SegmentedControl.Item>
        </SegmentedControl>
        {form.wage_type && (
          <>
            <Spacing size={24} />
            <label className="funnel-label">{wageTypeLabel} 금액</label>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <input
                className="funnel-huge-input"
                style={{ flex: 1 }}
                placeholder="예: 10000"
                value={form.base_wage}
                onChange={e => handleChange('base_wage', e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && form.base_wage && Number(form.base_wage) > 0) {
                    setActiveField('paymentMethod');
                  }
                }}
              />
              <Paragraph typography="st6" color="grey-500" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>{wageUnit}</Paragraph>
            </div>
            {errors.base_wage && (
              <div style={{ color: '#f04452', fontSize: '13px', marginTop: '8px' }}>
                {errors.base_wage}
              </div>
            )}
          </>
        )}
      </FunnelQuestion>
      </CommentBoundary>

      {/* Show payment fields after wage is set */}
      {(form.wage_type && form.base_wage) && (
        <>
          {/* 2. Payment method */}
          <CommentBoundary name="임금-지급방법">
          <FunnelQuestion
            title={<>임금 지급 방법을<br/>선택해주세요</>}
            subtitle="계좌이체, 현금 중 선택할 수 있어요"
            isActive={activeField === 'paymentMethod'}
            onEnter={() => setActiveField('paymentMethod')}
            summary={form.wage_payment_method ? (form.wage_payment_method === 'bankTransfer' ? '계좌이체' : form.wage_payment_method === 'cash' ? '현금' : '혼합') : undefined}
          >
            <button
              className="funnel-huge-input"
              style={{ textAlign: 'left', cursor: 'pointer', paddingBottom: '8px', color: form.wage_payment_method ? '#333D4B' : '#d1d6db' }}
              onClick={() => setPaymentMethodOpen(true)}
            >
              {form.wage_payment_method ? (form.wage_payment_method === 'bankTransfer' ? '계좌이체' : form.wage_payment_method === 'cash' ? '현금' : '혼합') : '선택해주세요'}
            </button>
            <BottomSheet
              open={paymentMethodOpen}
              onClose={() => setPaymentMethodOpen(false)}
              header={<BottomSheet.Header>임금 지급 방법</BottomSheet.Header>}
            >
              <div style={{ display: 'flex', flexDirection: 'column', padding: '0 24px 24px', gap: '8px' }}>
                <button
                  style={{ padding: '16px', background: form.wage_payment_method === 'bankTransfer' ? '#F2F4F6' : 'transparent', border: 'none', borderRadius: '12px', textAlign: 'left', fontSize: '16px', fontWeight: 600, color: form.wage_payment_method === 'bankTransfer' ? '#3182F6' : '#333D4B' }}
                  onClick={() => { handleChange('wage_payment_method', 'bankTransfer'); setPaymentMethodOpen(false); }}
                >계좌이체</button>
                <button
                  style={{ padding: '16px', background: form.wage_payment_method === 'cash' ? '#F2F4F6' : 'transparent', border: 'none', borderRadius: '12px', textAlign: 'left', fontSize: '16px', fontWeight: 600, color: form.wage_payment_method === 'cash' ? '#3182F6' : '#333D4B' }}
                  onClick={() => { handleChange('wage_payment_method', 'cash'); setPaymentMethodOpen(false); }}
                >현금</button>
                <button
                  style={{ padding: '16px', background: form.wage_payment_method === 'mixed' ? '#F2F4F6' : 'transparent', border: 'none', borderRadius: '12px', textAlign: 'left', fontSize: '16px', fontWeight: 600, color: form.wage_payment_method === 'mixed' ? '#3182F6' : '#333D4B' }}
                  onClick={() => { handleChange('wage_payment_method', 'mixed'); setPaymentMethodOpen(false); }}
                >혼합 (계좌이체 + 현금)</button>
              </div>
            </BottomSheet>
          </FunnelQuestion>
          </CommentBoundary>

          {/* 3. Payment day */}
          {(form.wage_payment_method || activeField === 'paymentDay') && (
            <CommentBoundary name="임금-지급일">
            <FunnelQuestion
              title={<>임금 지급일을<br/>선택해주세요</>}
              subtitle="매월 정해진 날짜에 지급돼요"
              isActive={activeField === 'paymentDay'}
              onEnter={() => setActiveField('paymentDay')}
              summary={form.wage_payment_day ? `매월 ${form.wage_payment_day === 'last' ? '말일' : `${form.wage_payment_day}일`}` : undefined}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {WAGE_PAYMENT_DAYS.map(d => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => handleChange('wage_payment_day', d.value)}
                    style={{
                      padding: '12px 20px',
                      borderRadius: 24,
                      fontSize: 16,
                      fontWeight: 600,
                      color: form.wage_payment_day === d.value ? '#fff' : '#333D4B',
                      backgroundColor: form.wage_payment_day === d.value ? '#3182F6' : '#F2F4F6',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </FunnelQuestion>
            </CommentBoundary>
          )}
        </>
      )}

      {/* Show leave + insurance after payment day is set */}
      {(form.wage_payment_day || activeField === 'paidLeave' || activeField === 'insurance') && (
        <>
          {/* 4. Paid leave */}
          <CommentBoundary name="임금-유급휴가">
          <FunnelQuestion
            title={<>유급휴가 조항을<br/>포함할까요?</>}
            subtitle="근로기준법에 따라 연차 유급휴가를 보장합니다"
            isActive={activeField === 'paidLeave'}
            onEnter={() => setActiveField('paidLeave')}
            summary={form.paid_leave_clause !== undefined ? (form.paid_leave_clause ? '포함' : '미포함') : undefined}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px 0', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Paragraph typography="st6" fontWeight="bold">연차 유급휴가 포함</Paragraph>
                <Paragraph typography="st7" color="grey-500" style={{ marginTop: 4, lineHeight: '1.6', wordBreak: 'keep-all' }}>
                  근로기준법 제60조에 따라 1년간 80% 이상 출근 시 15일의 유급휴가가 발생합니다
                </Paragraph>
              </div>
              <Switch checked={form.paid_leave_clause} onChange={(e) => handleChange('paid_leave_clause', (e.target as HTMLInputElement).checked)} aria-label="연차 유급휴가 포함" />
            </div>
          </FunnelQuestion>
          </CommentBoundary>

          {/* 5. Insurance group */}
          <CommentBoundary name="임금-보험">
          <FunnelQuestion
            title={<>4대 보험 가입<br/>여부를 선택해주세요</>}
            subtitle="상시 근로자 수와 근로시간에 따라 의무 가입 여부가 달라져요"
            isActive={activeField === 'insurance'}
            onEnter={() => setActiveField('insurance')}
            summary={
              [form.pension, form.health_insurance, form.employment_insurance, form.accident_insurance].some(v => v !== undefined)
                ? `${[form.pension, form.health_insurance, form.employment_insurance, form.accident_insurance].filter(Boolean).length}/4 가입`
                : undefined
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f2f4f6' }}>
                <Paragraph typography="st6" fontWeight="bold">국민연금</Paragraph>
                <Switch checked={form.pension} onChange={(e) => handleChange('pension', (e.target as HTMLInputElement).checked)} aria-label="국민연금" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f2f4f6' }}>
                <Paragraph typography="st6" fontWeight="bold">건강보험</Paragraph>
                <Switch checked={form.health_insurance} onChange={(e) => handleChange('health_insurance', (e.target as HTMLInputElement).checked)} aria-label="건강보험" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f2f4f6' }}>
                <Paragraph typography="st6" fontWeight="bold">고용보험</Paragraph>
                <Switch checked={form.employment_insurance} onChange={(e) => handleChange('employment_insurance', (e.target as HTMLInputElement).checked)} aria-label="고용보험" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                <Paragraph typography="st6" fontWeight="bold">산재보험</Paragraph>
                <Switch checked={form.accident_insurance} onChange={(e) => handleChange('accident_insurance', (e.target as HTMLInputElement).checked)} aria-label="산재보험" />
              </div>
            </div>
            <Spacing size={24} />
            <div style={{ padding: 16, background: '#f8f9fa', borderRadius: 8 }}>
              <Paragraph typography="st7" color="grey-500">
                퇴직금은 1년 이상 근무 시 법정 의무 사항으로 자동 적용됩니다.
              </Paragraph>
            </div>
          </FunnelQuestion>
          </CommentBoundary>
        </>
      )}
    </div>
  );
}
