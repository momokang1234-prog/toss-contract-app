import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContracts } from '../../hooks/useContracts';
import { useBusiness } from '../../hooks/useBusiness';
import { Spacing, TextField, SegmentedControl, FixedBottomCTA, Paragraph, Switch } from '@toss/tds-mobile';
import { validateLaborContract, type ValidationWarning } from '../../domain/contract/validation';

const DAYS = ['mon','tue','wed','thu','fri','sat','sun'] as const;
const DAY_LABELS: Record<string, string> = { mon:'월', tue:'화', wed:'수', thu:'목', fri:'금', sat:'토', sun:'일' };

/** camelCase.field.path → snake_case */
function mapFieldPath(path: string): string {
  const parts = path.split('.');
  const last = parts[parts.length - 1];
  return last.replace(/[A-Z]/g, m => '_' + m.toLowerCase());
}

export default function ContractFormPage() {
  const navigate = useNavigate();
  const { createContract } = useContracts();
  const { businesses } = useBusiness();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    worker_name: '', worker_phone: '', worker_address: '',
    contract_type: 'partTime',
    workplace: '', job_description: '',
    start_date: '', end_date: '',
    wage_type: 'hourly', base_wage: '',
    wage_payment_date: '매월 10일', wage_payment_method: 'bankTransfer',
    work_days: ['mon','tue','wed','thu','fri'] as string[],
    start_time: '09:00', end_time: '18:00', break_minutes: '60',
    weekly_holiday: 'sun',
    paid_leave_clause: true, social_insurance_clause: true, severance_clause: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<ValidationWarning[]>([]);

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const toggleDay = (day: string) => {
    setForm(prev => ({
      ...prev,
      work_days: prev.work_days.includes(day)
        ? prev.work_days.filter(d => d !== day)
        : [...prev.work_days, day],
    }));
  };

  const selectWeeklyHoliday = (day: string) => {
    setForm(prev => ({
      ...prev,
      weekly_holiday: prev.weekly_holiday === day ? '' : day,
    }));
  };

  const handleSubmit = async () => {
    if (businesses.length === 0) { alert('먼저 사업장을 등록해주세요.'); return; }
    setSubmitting(true);
    setErrors({});
    setWarnings([]);

    const business = businesses[0];

    // ── Build LaborContract from form state ──
    const laborContract = {
      worker: {
        name: form.worker_name,
        phone: form.worker_phone,
        address: form.worker_address || undefined,
      },
      employer: {
        businessNumber: business.business_number,
        businessName: business.business_name,
        representative: business.representative,
        address: business.address,
      },
      contract: {
        contractType: form.contract_type,
        templateVersion: '1.0.0',
        status: 'draft' as const,
        startDate: form.start_date,
        endDate: form.end_date || undefined,
        workplace: form.workplace,
        jobDescription: form.job_description,
        wageType: form.wage_type,
        baseWage: Number(form.base_wage) || 0,
        wagePaymentDate: form.wage_payment_date,
        wagePaymentMethod: form.wage_payment_method,
        workDays: form.work_days,
        startTime: form.start_time,
        endTime: form.end_time,
        breakMinutes: Number(form.break_minutes) || 0,
        weeklyHoliday: form.weekly_holiday || undefined,
        paidLeaveClause: form.paid_leave_clause,
        socialInsuranceClause: form.social_insurance_clause,
        severanceClause: form.severance_clause,
      },
    };

    // ── Run validation engine ──
    const result = validateLaborContract(laborContract);

    if (!result.valid) {
      const fieldErrors: Record<string, string> = {};
      for (const err of result.errors) {
        const field = mapFieldPath(err.field);
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      }
      setErrors(fieldErrors);
      setWarnings(result.warnings);
      setSubmitting(false);
      return;
    }

    // Show warnings but allow submission
    if (result.warnings.length > 0) {
      setWarnings(result.warnings);
    }

    try {
      await createContract({
        business_id: businesses[0].id,
        worker_name: form.worker_name,
        worker_phone: form.worker_phone,
        contract_type: form.contract_type,
        workplace: form.workplace,
        job_description: form.job_description,
        start_date: form.start_date,
        end_date: form.end_date || undefined,
        wage_type: form.wage_type,
        base_wage: Number(form.base_wage) || 0,
        wage_payment_date: form.wage_payment_date,
        wage_payment_method: form.wage_payment_method,
        work_days: form.work_days,
        start_time: form.start_time,
        end_time: form.end_time,
        break_minutes: Number(form.break_minutes) || 0,
        weekly_holiday: form.weekly_holiday || undefined,
        paid_leave_clause: form.paid_leave_clause,
        social_insurance_clause: form.social_insurance_clause,
        severance_clause: form.severance_clause,
      });
      navigate('/employer/contracts', { replace: true });
    } catch (err) {
      console.error(err);
      alert('계약서 저장에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const pillStyle = (active: boolean): React.CSSProperties => ({
    width: 44, height: 44, borderRadius: 22, fontSize: 13, fontWeight: 600,
    color: active ? '#fff' : '#333D4B',
    backgroundColor: active ? '#3182F6' : '#F5F6F8',
    border: 'none', cursor: 'pointer',
  });

  return (
    <div style={{ padding: 24, maxWidth: 480, margin: '0 auto', paddingBottom: 80 }}>
      <Paragraph typography="st3" fontWeight="bold">근로계약서 작성</Paragraph>
      <Spacing size={24} />

      {/* ── 근로자 정보 ── */}
      <Paragraph typography="st3" fontWeight="bold" style={{ marginBottom: 12 }}>근로자 정보</Paragraph>
      <TextField
        variant="box"
        label="근로자 이름"
        value={form.worker_name}
        onChange={e => handleChange('worker_name', e.target.value)}
        hasError={!!errors.worker_name}
        help={errors.worker_name}
      />
      <Spacing size={16} />
      <TextField
        variant="box"
        label="전화번호"
        placeholder="01012345678"
        value={form.worker_phone}
        onChange={e => handleChange('worker_phone', e.target.value.replace(/\D/g, '').slice(0, 11))}
        hasError={!!errors.worker_phone}
        help={errors.worker_phone}
      />
      <Spacing size={16} />
      <TextField
        variant="box"
        label="근로자 주소 (선택)"
        placeholder="서울특별시 강남구..."
        value={form.worker_address}
        onChange={e => handleChange('worker_address', e.target.value)}
        hasError={!!errors.worker_address}
        help={errors.worker_address}
      />
      <Spacing size={24} />

      {/* ── 계약 조건 ── */}
      <Paragraph typography="st3" fontWeight="bold" style={{ marginBottom: 12 }}>계약 조건</Paragraph>
      <TextField
        variant="box"
        label="근무 장소"
        value={form.workplace}
        onChange={e => handleChange('workplace', e.target.value)}
        hasError={!!errors.workplace}
        help={errors.workplace}
      />
      <Spacing size={16} />
      <TextField
        variant="box"
        label="직무 내용"
        value={form.job_description}
        onChange={e => handleChange('job_description', e.target.value)}
        hasError={!!errors.job_description}
        help={errors.job_description}
      />
      <Spacing size={16} />
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <TextField
            variant="box"
            label="시작일"
            type="date"
            value={form.start_date}
            onChange={e => handleChange('start_date', e.target.value)}
            hasError={!!errors.start_date}
            help={errors.start_date}
          />
        </div>
        <div style={{ flex: 1 }}>
          <TextField
            variant="box"
            label="종료일 (선택)"
            type="date"
            value={form.end_date}
            onChange={e => handleChange('end_date', e.target.value)}
            hasError={!!errors.end_date}
            help={errors.end_date}
          />
        </div>
      </div>
      <Spacing size={24} />

      {/* ── 임금 ── */}
      <Paragraph typography="st3" fontWeight="bold" style={{ marginBottom: 12 }}>임금</Paragraph>
      <SegmentedControl
        value={form.wage_type}
        onChange={(value) => handleChange('wage_type', value)}
      >
        <SegmentedControl.Item value="hourly">시급</SegmentedControl.Item>
        <SegmentedControl.Item value="daily">일급</SegmentedControl.Item>
        <SegmentedControl.Item value="weekly">주급</SegmentedControl.Item>
        <SegmentedControl.Item value="monthly">월급</SegmentedControl.Item>
      </SegmentedControl>
      <Spacing size={12} />
      <TextField
        variant="box"
        label="금액 (원)"
        type="number"
        value={form.base_wage}
        onChange={e => handleChange('base_wage', e.target.value)}
        hasError={!!errors.base_wage}
        help={errors.base_wage}
      />
      <Spacing size={16} />
      <div style={{ fontSize: 13, fontWeight: 600, color: '#4E5968', marginBottom: 8 }}>임금 지급 방법</div>
      <SegmentedControl
        value={form.wage_payment_method}
        onChange={(value) => handleChange('wage_payment_method', value)}
      >
        <SegmentedControl.Item value="bankTransfer">계좌이체</SegmentedControl.Item>
        <SegmentedControl.Item value="cash">현금</SegmentedControl.Item>
        <SegmentedControl.Item value="mixed">혼합</SegmentedControl.Item>
      </SegmentedControl>
      <Spacing size={24} />

      {/* ── 근무 시간 ── */}
      <Paragraph typography="st3" fontWeight="bold" style={{ marginBottom: 12 }}>근무 시간</Paragraph>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {DAYS.map(day => (
          <button key={day} onClick={() => toggleDay(day)} style={pillStyle(form.work_days.includes(day))}>
            {DAY_LABELS[day]}
          </button>
        ))}
        {errors.work_days && <span style={{ color: '#FF5252', fontSize: 12, width: '100%' }}>{errors.work_days}</span>}
      </div>

      {/* 주휴일 */}
      <div style={{ fontSize: 13, fontWeight: 600, color: '#4E5968', marginBottom: 8 }}>주휴일</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        {DAYS.map(day => (
          <button key={day} onClick={() => selectWeeklyHoliday(day)} style={pillStyle(form.weekly_holiday === day)}>
            {DAY_LABELS[day]}
          </button>
        ))}
        {!form.weekly_holiday && (
          <span style={{ fontSize: 13, color: '#8B95A1', marginLeft: 4 }}>선택 안 함</span>
        )}
        {errors.weekly_holiday && <span style={{ color: '#FF5252', fontSize: 12, width: '100%' }}>{errors.weekly_holiday}</span>}
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <TextField
            variant="box"
            label="시작"
            type="time"
            value={form.start_time}
            onChange={e => handleChange('start_time', e.target.value)}
            hasError={!!errors.start_time}
            help={errors.start_time}
          />
        </div>
        <div style={{ flex: 1 }}>
          <TextField
            variant="box"
            label="종료"
            type="time"
            value={form.end_time}
            onChange={e => handleChange('end_time', e.target.value)}
            hasError={!!errors.end_time}
            help={errors.end_time}
          />
        </div>
        <div style={{ flex: 1 }}>
          <TextField
            variant="box"
            label="휴게(분)"
            type="number"
            value={form.break_minutes}
            onChange={e => handleChange('break_minutes', e.target.value)}
            hasError={!!errors.break_minutes}
            help={errors.break_minutes}
          />
        </div>
      </div>
      <Spacing size={24} />

      {/* ── 근로조건 ── */}
      <Paragraph typography="st3" fontWeight="bold" style={{ marginBottom: 12 }}>근로조건</Paragraph>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <Paragraph as="span" typography="st5" color="grey600">연차 유급휴가</Paragraph>
        <Switch checked={form.paid_leave_clause} onChange={(e) => handleChange('paid_leave_clause', (e.target as HTMLInputElement).checked)} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <Paragraph as="span" typography="st5" color="grey600">4대 보험</Paragraph>
        <Switch checked={form.social_insurance_clause} onChange={(e) => handleChange('social_insurance_clause', (e.target as HTMLInputElement).checked)} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <Paragraph as="span" typography="st5" color="grey600">퇴직금</Paragraph>
        <Switch checked={form.severance_clause} onChange={(e) => handleChange('severance_clause', (e.target as HTMLInputElement).checked)} />
      </div>

      {/* ── 경고 요약 ── */}
      {warnings.length > 0 && Object.keys(errors).length === 0 && (
        <div style={{
          backgroundColor: '#FFF9DB', borderRadius: 8, padding: 16, marginBottom: 16,
          border: '1px solid #F2E49B',
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#8B6F00', marginBottom: 8 }}>⚠ 검토 필요</div>
          {warnings.map((w, i) => (
            <div key={i} style={{ fontSize: 12, color: '#8B6F00', marginBottom: 4, lineHeight: 1.5 }}>
              • {w.message}
            </div>
          ))}
        </div>
      )}

      <Spacing size={100} />

      <FixedBottomCTA>
        <FixedBottomCTA.Button
          loading={submitting}
          onClick={handleSubmit}
        >
          {submitting ? '저장 중...' : '계약서 저장'}
        </FixedBottomCTA.Button>
      </FixedBottomCTA>
    </div>
  );
}
