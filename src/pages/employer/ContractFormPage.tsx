import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContracts } from '../../hooks/useContracts';
import { useBusiness } from '../../hooks/useBusiness';
import { Spacing, TextField, SegmentedControl, Paragraph, Switch, Button } from '@toss/tds-mobile';
import { validateLaborContract, type ValidationWarning } from '../../domain/contract/validation';

const DAYS = ['mon','tue','wed','thu','fri','sat','sun'] as const;
const DAY_LABELS: Record<string, string> = { mon:'월', tue:'화', wed:'수', thu:'목', fri:'금', sat:'토', sun:'일' };

const STEPS = ['근로자 정보', '계약 조건', '임금', '근무 시간', '근로조건', '법정 검증', '최종 확인'];
const TOTAL_STEPS = STEPS.length;

function computeBreakMinutes(start: string, end: string): number {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  return Math.max(0, mins);
}

function wagePaymentDayLabel(day: string): string {
  return day === 'last' ? '말일' : `${day}일`;
}

function formatWagePaymentDate(day: string): string {
  return `매월 ${wagePaymentDayLabel(day)}`;
}

function mapFieldPath(path: string): string {
  const parts = path.split('.');
  const last = parts[parts.length - 1];
  return last.replace(/[A-Z]/g, m => '_' + m.toLowerCase());
}

// ── Reusable label above input fields ──
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 13, fontWeight: 600, color: '#4E5968', marginBottom: 8 }}>{children}</div>;
}

// ── Switch row with optional description ──
function SwitchRow({ label, description, checked, onChange }: {
  label: string; description?: string; checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
      <div style={{ flex: 1, marginRight: 12 }}>
        <Paragraph typography="st6">{label}</Paragraph>
        {description && <Paragraph typography="st8" color="grey-500">{description}</Paragraph>}
      </div>
      <Switch checked={checked} onChange={(e) => onChange((e.target as HTMLInputElement).checked)} />
    </div>
  );
}

// ── Info box ──
function DetailBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: '#F0F6FF', borderRadius: 8, padding: 12, marginBottom: 12, border: '1px solid #D1E3FF' }}>
      <Paragraph typography="st6" fontWeight="bold" color="grey800">{title}</Paragraph>
      <Paragraph typography="st8" color="grey-600">{children}</Paragraph>
    </div>
  );
}

export default function ContractFormPage() {
  const navigate = useNavigate();
  const { createContract } = useContracts();
  const { businesses } = useBusiness();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    worker_name: '', worker_phone: '', worker_address: '',
    contract_type: 'partTime',
    workplace: '', job_description: '',
    start_date: '', end_date: '',
    wage_type: 'hourly', base_wage: '',
    wage_payment_day: '25', wage_payment_method: 'bankTransfer',
    work_days: ['mon','tue','wed','thu','fri'] as string[],
    start_time: '09:00', end_time: '18:00', break_start: '12:00', break_end: '13:00',
    weekly_holiday: 'sun',
    paid_leave_clause: true,
    pension: true, health_insurance: true, employment_insurance: true, accident_insurance: true,
    severance_clause: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<ValidationWarning[]>([]);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors: Array<{ field: string; message: string }>;
    warnings: ValidationWarning[];
  } | null>(null);

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
    setForm(prev => ({ ...prev, weekly_holiday: prev.weekly_holiday === day ? '' : day }));
  };

  const validateStep = (s: number): boolean => {
    const e: Record<string, string> = {};
    switch (s) {
      case 0:
        if (!form.worker_name.trim()) e.worker_name = '이름을 입력해주세요';
        if (!form.worker_phone.replace(/\D/g, '')) e.worker_phone = '전화번호를 입력해주세요';
        else if (form.worker_phone.replace(/\D/g, '').length < 10) e.worker_phone = '올바른 전화번호를 입력해주세요';
        break;
      case 1:
        if (!form.workplace.trim()) e.workplace = '근무 장소를 입력해주세요';
        if (!form.job_description.trim()) e.job_description = '직무 내용을 입력해주세요';
        if (!form.start_date) e.start_date = '시작일을 선택해주세요';
        break;
      case 2:
        if (!form.base_wage || Number(form.base_wage) <= 0) e.base_wage = '금액을 입력해주세요';
        break;
      case 3:
        if (form.work_days.length === 0) e.work_days = '근무 요일을 선택해주세요';
        if (!form.start_time) e.start_time = '시작 시간을 입력해주세요';
        if (!form.end_time) e.end_time = '종료 시간을 입력해주세요';
        break;
      case 5: {
        if (businesses.length === 0) { alert('먼저 사업장을 등록해주세요.'); return false; }
        const business = businesses[0];
        const laborContract = {
          worker: { name: form.worker_name, phone: form.worker_phone, address: form.worker_address || undefined },
          employer: { businessNumber: business.business_number, businessName: business.business_name, representative: business.representative, address: business.address },
          contract: {
            contractType: form.contract_type, templateVersion: '1.0.0', status: 'draft' as const,
            startDate: form.start_date, endDate: form.end_date || undefined,
            workplace: form.workplace, jobDescription: form.job_description,
            wageType: form.wage_type, baseWage: Number(form.base_wage) || 0,
            wagePaymentDate: formatWagePaymentDate(form.wage_payment_day), wagePaymentMethod: form.wage_payment_method,
            workDays: form.work_days, startTime: form.start_time, endTime: form.end_time,
            breakMinutes: computeBreakMinutes(form.break_start, form.break_end),
            weeklyHoliday: form.weekly_holiday || undefined,
            paidLeaveClause: form.paid_leave_clause,
            socialInsuranceClause: form.pension || form.health_insurance || form.employment_insurance || form.accident_insurance,
            severanceClause: form.severance_clause,
          },
        };
        const result = validateLaborContract(laborContract);
        setValidationResult(result);
        setWarnings(result.warnings);
        if (!result.valid) {
          const fieldErrors: Record<string, string> = {};
          for (const err of result.errors) {
            const field = mapFieldPath(err.field);
            if (!fieldErrors[field]) fieldErrors[field] = err.message;
          }
          setErrors(fieldErrors);
          return false;
        }
        return true;
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    if (step < TOTAL_STEPS - 1) setStep(step + 1);
  };

  const goPrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (businesses.length === 0) { alert('먼저 사업장을 등록해주세요.'); return; }
    setSubmitting(true);
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
        wage_payment_date: formatWagePaymentDate(form.wage_payment_day),
        wage_payment_method: form.wage_payment_method,
        work_days: form.work_days,
        start_time: form.start_time,
        end_time: form.end_time,
        break_minutes: computeBreakMinutes(form.break_start, form.break_end),
        weekly_holiday: form.weekly_holiday || undefined,
        paid_leave_clause: form.paid_leave_clause,
        social_insurance_clause: form.pension || form.health_insurance || form.employment_insurance || form.accident_insurance,
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

  const progressPct = ((step + 1) / TOTAL_STEPS) * 100;

  return (
    <div style={{ padding: 24, maxWidth: 480, margin: '0 auto', paddingBottom: 120 }}>
      <Paragraph typography="st3" fontWeight="bold">근로계약서 작성</Paragraph>
      <Spacing size={8} />
      <Paragraph typography="st7" color="grey-500">{STEPS[step]} ({step + 1}/{TOTAL_STEPS})</Paragraph>
      <Spacing size={12} />
      <div style={{ height: 4, borderRadius: 2, backgroundColor: '#E5E8EB', overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ height: '100%', width: `${progressPct}%`, borderRadius: 2, backgroundColor: '#3182F6', transition: 'width 0.3s ease' }} />
      </div>

      {/* Step 0: 근로자 정보 */}
      {step === 0 && (
        <div>
          <Paragraph typography="st3" fontWeight="bold" style={{ marginBottom: 12 }}>근로자 정보</Paragraph>
          <FieldLabel>근로자 이름</FieldLabel>
          <TextField variant="box" placeholder="예: 홍길동" value={form.worker_name}
            onChange={e => handleChange('worker_name', e.target.value)}
            hasError={!!errors.worker_name} help={errors.worker_name} />
          <Spacing size={16} />
          <FieldLabel>전화번호</FieldLabel>
          <TextField variant="box" placeholder="01012345678" value={form.worker_phone}
            onChange={e => handleChange('worker_phone', e.target.value.replace(/\D/g, '').slice(0, 11))}
            hasError={!!errors.worker_phone} help={errors.worker_phone} />
          <Spacing size={16} />
          <FieldLabel>근로자 주소 (선택)</FieldLabel>
          <TextField variant="box" placeholder="서울특별시 강남구..." value={form.worker_address}
            onChange={e => handleChange('worker_address', e.target.value)} />
        </div>
      )}

      {/* Step 1: 계약 조건 */}
      {step === 1 && (
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
            hasError={!!errors.workplace} help={errors.workplace} />
          <Spacing size={16} />
          <FieldLabel>직무 내용</FieldLabel>
          <TextField variant="box" placeholder="예: 매장 관리 및 고객 응대" value={form.job_description}
            onChange={e => handleChange('job_description', e.target.value)}
            hasError={!!errors.job_description} help={errors.job_description} />
          <Spacing size={16} />
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <FieldLabel>시작일</FieldLabel>
              <TextField variant="box" type="date" value={form.start_date}
                onChange={e => handleChange('start_date', e.target.value)}
                hasError={!!errors.start_date} help={errors.start_date} />
            </div>
            <div style={{ flex: 1 }}>
              <FieldLabel>종료일 (선택)</FieldLabel>
              <TextField variant="box" type="date" value={form.end_date}
                onChange={e => handleChange('end_date', e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: 임금 */}
      {step === 2 && (
        <div>
          <Paragraph typography="st3" fontWeight="bold" style={{ marginBottom: 12 }}>임금</Paragraph>
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
            hasError={!!errors.base_wage} help={errors.base_wage} />
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
              {Array.from({ length: 30 }, (_, i) => (
                <option key={i + 1} value={String(i + 1)}>{i + 1}일</option>
              ))}
              <option value="last">말일</option>
            </select>
          </div>
        </div>
      )}

      {/* Step 3: 근무 시간 */}
      {step === 3 && (
        <div>
          <Paragraph typography="st3" fontWeight="bold" style={{ marginBottom: 12 }}>근무 시간</Paragraph>
          <FieldLabel>근무 요일</FieldLabel>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            {DAYS.map(day => (
              <button key={day} onClick={() => toggleDay(day)} style={pillStyle(form.work_days.includes(day))}>
                {DAY_LABELS[day]}
              </button>
            ))}
            {errors.work_days && <span style={{ color: '#FF5252', fontSize: 12, width: '100%' }}>{errors.work_days}</span>}
          </div>
          <FieldLabel>주휴일</FieldLabel>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            {DAYS.map(day => (
              <button key={day} onClick={() => selectWeeklyHoliday(day)} style={pillStyle(form.weekly_holiday === day)}>
                {DAY_LABELS[day]}
              </button>
            ))}
            {!form.weekly_holiday && <span style={{ fontSize: 13, color: '#8B95A1', marginLeft: 4 }}>선택 안 함</span>}
          </div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <FieldLabel>시작</FieldLabel>
              <TextField variant="box" type="time" value={form.start_time}
                onChange={e => handleChange('start_time', e.target.value)}
                hasError={!!errors.start_time} help={errors.start_time} />
            </div>
            <div style={{ flex: 1 }}>
              <FieldLabel>종료</FieldLabel>
              <TextField variant="box" type="time" value={form.end_time}
                onChange={e => handleChange('end_time', e.target.value)}
                hasError={!!errors.end_time} help={errors.end_time} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <FieldLabel>휴게 시작</FieldLabel>
              <TextField variant="box" type="time" value={form.break_start}
                onChange={e => handleChange('break_start', e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <FieldLabel>휴게 종료</FieldLabel>
              <TextField variant="box" type="time" value={form.break_end}
                onChange={e => handleChange('break_end', e.target.value)} />
            </div>
          </div>
        </div>
      )}


      {step === 4 && (
        <div>
          <Paragraph typography="st3" fontWeight="bold" style={{ marginBottom: 12 }}>근로조건</Paragraph>
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
              description="모든 사업장 근로자. 월 8일 이상·월 60시간 이상 근무 시 직장가입자 적용"
              checked={form.health_insurance}
              onChange={v => handleChange('health_insurance', v)}
            />
            <SwitchRow
              label="고용보험"
              description="1인 이상 사업장 전원. 월 60시간 미만 단시간 근로자도 3개월 이상 근무 시 적용"
              checked={form.employment_insurance}
              onChange={v => handleChange('employment_insurance', v)}
            />
            <SwitchRow
              label="산재보험"
              description="근로자 1인 이상 모든 사업장 의무가입. 전액 사업주 부담. 근로형태·시간 무관"
              checked={form.accident_insurance}
              onChange={v => handleChange('accident_insurance', v)}
            />
          </div>
          <DetailBox title="퇴직금">
            근로자퇴직급여보장법에 따라 1년 이상 근무 시 의무 지급. 4주 평균 15시간 이상 근무 시 적용.
          </DetailBox>
        </div>
      )}

      {/* Step 5: 법정 검증 */}
      {step === 5 && (
        <div>
          <Paragraph typography="st3" fontWeight="bold" style={{ marginBottom: 12 }}>법정 검증 결과</Paragraph>
          {!validationResult && (
            <Paragraph typography="st6" color="grey-500">검증을 실행하려면 '검증 실행'을 눌러주세요.</Paragraph>
          )}
          {validationResult && validationResult.valid && validationResult.warnings.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center' }}>
              <Paragraph typography="st4" fontWeight="bold" color="grey-800">✅ 모든 검증을 통과했습니다</Paragraph>
              <Spacing size={8} />
              <Paragraph typography="st6" color="grey-500">법정 요건을 충족하는 계약서입니다.</Paragraph>
            </div>
          )}
          {validationResult && validationResult.valid && validationResult.warnings.length > 0 && (
            <>
              <Paragraph typography="st4" fontWeight="bold" color="grey-800" style={{ marginBottom: 8 }}>✅ 형식 검증 통과</Paragraph>
              <div style={{ backgroundColor: '#FFF9DB', borderRadius: 8, padding: 16, border: '1px solid #F2E49B', marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#8B6F00', marginBottom: 8 }}>⚠ 검토 필요 사항</div>
                {warnings.map((w, i) => (
                  <div key={i} style={{ fontSize: 12, color: '#8B6F00', marginBottom: 4, lineHeight: 1.5 }}>• {w.message}</div>
                ))}
              </div>
            </>
          )}
          {validationResult && !validationResult.valid && (
            <>
              <div style={{ backgroundColor: '#FFF0F0', borderRadius: 8, padding: 16, marginBottom: 16, border: '1px solid #FFD4D4' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#D12E2E', marginBottom: 8 }}>❌ 수정이 필요한 항목</div>
                {validationResult.errors.map((err, i) => (
                  <div key={i} style={{ fontSize: 12, color: '#D12E2E', marginBottom: 4, lineHeight: 1.5 }}>• {err.message}</div>
                ))}
              </div>
              {warnings.length > 0 && (
                <div style={{ backgroundColor: '#FFF9DB', borderRadius: 8, padding: 16, marginBottom: 16, border: '1px solid #F2E49B' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#8B6F00', marginBottom: 8 }}>⚠ 검토 필요 사항</div>
                  {warnings.map((w, i) => (
                    <div key={i} style={{ fontSize: 12, color: '#8B6F00', marginBottom: 4, lineHeight: 1.5 }}>• {w.message}</div>
                  ))}
                </div>
              )}
              <Paragraph typography="st6" color="grey-600" style={{ textAlign: 'center' }}>오류를 수정한 후 다시 검증을 실행해주세요.</Paragraph>
            </>
          )}
        </div>
      )}

      {/* Step 6: 최종 확인 */}
      {step === 6 && (
        <div>
          <Paragraph typography="st3" fontWeight="bold" style={{ marginBottom: 12 }}>최종 확인</Paragraph>
          <Paragraph typography="st6" color="grey-500" style={{ marginBottom: 16 }}>아래 내용을 확인한 후 계약서를 저장합니다.</Paragraph>
          <div style={{ backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16 }}>
            <SummaryRow label="근로자" value={`${form.worker_name} (${form.worker_phone})`} />
            {form.worker_address && <SummaryRow label="주소" value={form.worker_address} />}
            <Spacing size={12} />
            <SummaryRow label="계약 유형" value={form.contract_type === 'fullTime' ? '정규직' : form.contract_type === 'partTime' ? '단시간' : '기간제'} />
            <SummaryRow label="근무 장소" value={form.workplace} />
            <SummaryRow label="직무" value={form.job_description} />
            <SummaryRow label="계약 기간" value={`${form.start_date}${form.end_date ? ` ~ ${form.end_date}` : ' (기간 정함 없음)'}`} />
            <Spacing size={12} />
            <SummaryRow label="임금" value={`${form.wage_type === 'hourly' ? '시급' : form.wage_type === 'daily' ? '일급' : form.wage_type === 'weekly' ? '주급' : '월급'} ${Number(form.base_wage).toLocaleString()}원`} />
            <SummaryRow label="지급 방식" value={form.wage_payment_method === 'bankTransfer' ? '계좌이체' : form.wage_payment_method === 'cash' ? '현금' : '혼합'} />
            <SummaryRow label="지급일" value={formatWagePaymentDate(form.wage_payment_day)} />
            <Spacing size={12} />
            <SummaryRow label="근무 요일" value={form.work_days.map(d => DAY_LABELS[d]).join(', ')} />
            <SummaryRow label="근무 시간" value={`${form.start_time} ~ ${form.end_time} (휴게 ${computeBreakMinutes(form.break_start, form.break_end)}분)`} />
            <SummaryRow label="주휴일" value={form.weekly_holiday ? DAY_LABELS[form.weekly_holiday] : '없음'} />
            <Spacing size={12} />
            <SummaryRow label="연차 유급휴가" value={form.paid_leave_clause ? '포함' : '미포함'} />
            <SummaryRow label="국민연금" value={form.pension ? '가입' : '미가입'} />
            <SummaryRow label="건강보험" value={form.health_insurance ? '가입' : '미가입'} />
            <SummaryRow label="고용보험" value={form.employment_insurance ? '가입' : '미가입'} />
            <SummaryRow label="산재보험" value={form.accident_insurance ? '가입' : '미가입'} />
            <SummaryRow label="퇴직금" value="법정 의무 적용" />
          </div>
          {warnings.length > 0 && (
            <div style={{ backgroundColor: '#FFF9DB', borderRadius: 8, padding: 16, marginTop: 16, border: '1px solid #F2E49B' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#8B6F00', marginBottom: 8 }}>⚠ 검토 필요 사항</div>
              {warnings.map((w, i) => (
                <div key={i} style={{ fontSize: 12, color: '#8B6F00', marginBottom: 4, lineHeight: 1.5 }}>• {w.message}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <Spacing size={48} />
      <div style={{ display: 'flex', gap: 12 }}>
        {step > 0 && (
          <div style={{ flex: 1 }}>
            <Button color="light" variant="weak" display="block" size="xlarge" onClick={goPrev}>이전</Button>
          </div>
        )}
        {step < TOTAL_STEPS - 1 ? (
          <div style={{ flex: step > 0 ? 2 : 1 }}>
            <Button color="primary" variant="fill" display="block" size="xlarge" onClick={goNext}>
              {step === 5 ? '검증 실행' : '다음'}
            </Button>
          </div>
        ) : (
          <div style={{ flex: step > 0 ? 2 : 1 }}>
            <Button color="primary" variant="fill" display="block" size="xlarge" loading={submitting} onClick={handleSubmit}>
              {submitting ? '저장 중...' : '계약서 저장'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
      <Paragraph typography="st7" color="grey-500">{label}</Paragraph>
      <Paragraph typography="st6" color="grey-800" style={{ textAlign: 'right', maxWidth: '60%' }}>{value}</Paragraph>
    </div>
  );
}
