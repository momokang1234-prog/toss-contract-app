import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContracts } from '../../hooks/useContracts';
import { useBusiness } from '../../hooks/useBusiness';

const DAYS = ['mon','tue','wed','thu','fri','sat','sun'] as const;
const DAY_LABELS: Record<string, string> = { mon:'월', tue:'화', wed:'수', thu:'목', fri:'금', sat:'토', sun:'일' };

export default function ContractFormPage() {
  const navigate = useNavigate();
  // const { id } = useParams(); // TODO: 향후 수정 모드에서 사용
  const { createContract } = useContracts();
  const { businesses } = useBusiness();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    worker_name: '', worker_phone: '',
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

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.worker_name.trim()) e.worker_name = '근로자 이름 필수';
    if (!/^\d{10,11}$/.test(form.worker_phone)) e.worker_phone = '전화번호 10~11자리';
    if (!form.workplace.trim()) e.workplace = '근무 장소 필수';
    if (!form.job_description.trim()) e.job_description = '직무 내용 필수';
    if (!form.start_date) e.start_date = '시작일 필수';
    if (!form.base_wage || Number(form.base_wage) <= 0) e.base_wage = '급여 입력';
    if (form.work_days.length === 0) e.work_days = '근무일 1일 이상';
    if (!form.start_time || !form.end_time) e.time = '근무 시간 필수';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
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
        base_wage: Number(form.base_wage),
        wage_payment_date: form.wage_payment_date,
        wage_payment_method: form.wage_payment_method,
        work_days: form.work_days,
        start_time: form.start_time,
        end_time: form.end_time,
        break_minutes: Number(form.break_minutes),
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

  const inputStyle = (field: string) => ({
    width: '100%', padding: '12px 16px', fontSize: 15,
    border: `1px solid ${errors[field] ? '#FF5252' : '#E5E8EB'}`, borderRadius: 8,
  });

  return (
    <div style={{ padding: 24, maxWidth: 480, margin: '0 auto', paddingBottom: 80 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>근로계약서 작성</h2>

      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>근로자 정보</h3>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 14, display: 'block', marginBottom: 6 }}>근로자 이름</label>
        <input style={inputStyle('worker_name')} value={form.worker_name} onChange={e => handleChange('worker_name', e.target.value)} />
        {errors.worker_name && <span style={{ color: '#FF5252', fontSize: 12 }}>{errors.worker_name}</span>}
      </div>
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontSize: 14, display: 'block', marginBottom: 6 }}>전화번호</label>
        <input style={inputStyle('worker_phone')} placeholder="01012345678" value={form.worker_phone} onChange={e => handleChange('worker_phone', e.target.value.replace(/\D/g, '').slice(0, 11))} />
        {errors.worker_phone && <span style={{ color: '#FF5252', fontSize: 12 }}>{errors.worker_phone}</span>}
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>계약 조건</h3>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 14, display: 'block', marginBottom: 6 }}>근무 장소</label>
        <input style={inputStyle('workplace')} value={form.workplace} onChange={e => handleChange('workplace', e.target.value)} />
        {errors.workplace && <span style={{ color: '#FF5252', fontSize: 12 }}>{errors.workplace}</span>}
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 14, display: 'block', marginBottom: 6 }}>직무 내용</label>
        <input style={inputStyle('job_description')} value={form.job_description} onChange={e => handleChange('job_description', e.target.value)} />
        {errors.job_description && <span style={{ color: '#FF5252', fontSize: 12 }}>{errors.job_description}</span>}
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 14, display: 'block', marginBottom: 6 }}>시작일</label>
          <input type="date" style={inputStyle('start_date')} value={form.start_date} onChange={e => handleChange('start_date', e.target.value)} />
          {errors.start_date && <span style={{ color: '#FF5252', fontSize: 12 }}>{errors.start_date}</span>}
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 14, display: 'block', marginBottom: 6 }}>종료일 (선택)</label>
          <input type="date" style={inputStyle('end_date')} value={form.end_date} onChange={e => handleChange('end_date', e.target.value)} />
        </div>
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>임금</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {[{ v: 'hourly', l: '시급' }, { v: 'daily', l: '일급' }, { v: 'weekly', l: '주급' }, { v: 'monthly', l: '월급' }].map(opt => (
          <button key={opt.v} onClick={() => handleChange('wage_type', opt.v)} style={{
            flex: 1, padding: '10px 0', fontSize: 14, fontWeight: form.wage_type === opt.v ? 600 : 400,
            color: form.wage_type === opt.v ? '#fff' : '#333D4B',
            backgroundColor: form.wage_type === opt.v ? '#3182F6' : '#F5F6F8',
            border: form.wage_type === opt.v ? 'none' : '1px solid #E5E8EB', borderRadius: 10, cursor: 'pointer',
          }}>{opt.l}</button>
        ))}
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 14, display: 'block', marginBottom: 6 }}>금액 (원)</label>
        <input type="number" style={inputStyle('base_wage')} value={form.base_wage} onChange={e => handleChange('base_wage', e.target.value)} />
        {errors.base_wage && <span style={{ color: '#FF5252', fontSize: 12 }}>{errors.base_wage}</span>}
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>근무 시간</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {DAYS.map(day => (
          <button key={day} onClick={() => toggleDay(day)} style={{
            width: 44, height: 44, borderRadius: 22, fontSize: 13, fontWeight: 600,
            color: form.work_days.includes(day) ? '#fff' : '#333D4B',
            backgroundColor: form.work_days.includes(day) ? '#3182F6' : '#F5F6F8',
            border: 'none', cursor: 'pointer',
          }}>{DAY_LABELS[day]}</button>
        ))}
        {errors.work_days && <span style={{ color: '#FF5252', fontSize: 12, width: '100%' }}>{errors.work_days}</span>}
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 14, display: 'block', marginBottom: 6 }}>시작</label>
          <input type="time" style={inputStyle('start_time')} value={form.start_time} onChange={e => handleChange('start_time', e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 14, display: 'block', marginBottom: 6 }}>종료</label>
          <input type="time" style={inputStyle('end_time')} value={form.end_time} onChange={e => handleChange('end_time', e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 14, display: 'block', marginBottom: 6 }}>휴게(분)</label>
          <input type="number" style={inputStyle('break_minutes')} value={form.break_minutes} onChange={e => handleChange('break_minutes', e.target.value)} />
        </div>
      </div>

      <button onClick={handleSubmit} disabled={submitting} style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px',
        backgroundColor: '#3182F6', color: '#fff', border: 'none', fontSize: 16, fontWeight: 600,
        cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1,
      }}>{submitting ? '저장 중...' : '계약서 저장'}</button>
    </div>
  );
}
