import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusiness } from '../../hooks/useBusiness';

const formatNumber = (v: string) => {
  const digits = v.replace(/\D/g, '').slice(0, 10);
  if (digits.length > 5) return `${digits.slice(0,3)}-${digits.slice(3,5)}-${digits.slice(5)}`;
  if (digits.length > 3) return `${digits.slice(0,3)}-${digits.slice(3)}`;
  return digits;
};

export default function BusinessFormPage() {
  const navigate = useNavigate();
  const { createBusiness } = useBusiness();
  const [form, setForm] = useState({
    business_number: '', business_name: '', representative: '', address: '', phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => {
    if (field === 'business_number') value = formatNumber(value);
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!/^\d{3}-\d{2}-\d{5}$/.test(form.business_number)) e.business_number = '사업자등록번호 형식: 000-00-00000';
    if (!form.business_name.trim()) e.business_name = '상호를 입력하세요';
    if (!form.representative.trim()) e.representative = '대표자명을 입력하세요';
    if (!form.address.trim()) e.address = '사업장 소재지를 입력하세요';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await createBusiness(form);
      navigate('/employer/dashboard', { replace: true });
    } catch (err) {
      console.error(err);
      alert('사업장 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = (field: string) => ({
    width: '100%', padding: '12px 16px', fontSize: 15, border: `1px solid ${errors[field] ? '#FF5252' : '#E5E8EB'}`, borderRadius: 8,
  });

  return (
    <div style={{ padding: 24, maxWidth: 480, margin: '0 auto' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>사업장 등록</h2>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 14, fontWeight: 500, marginBottom: 6, display: 'block' }}>사업자등록번호</label>
        <input style={inputStyle('business_number')} placeholder="000-00-00000" value={form.business_number} onChange={e => handleChange('business_number', e.target.value)} />
        {errors.business_number && <span style={{ color: '#FF5252', fontSize: 12 }}>{errors.business_number}</span>}
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 14, fontWeight: 500, marginBottom: 6, display: 'block' }}>상호</label>
        <input style={inputStyle('business_name')} placeholder="사업장 이름" value={form.business_name} onChange={e => handleChange('business_name', e.target.value)} />
        {errors.business_name && <span style={{ color: '#FF5252', fontSize: 12 }}>{errors.business_name}</span>}
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 14, fontWeight: 500, marginBottom: 6, display: 'block' }}>대표자</label>
        <input style={inputStyle('representative')} placeholder="대표자 이름" value={form.representative} onChange={e => handleChange('representative', e.target.value)} />
        {errors.representative && <span style={{ color: '#FF5252', fontSize: 12 }}>{errors.representative}</span>}
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 14, fontWeight: 500, marginBottom: 6, display: 'block' }}>사업장 소재지</label>
        <input style={inputStyle('address')} placeholder="주소" value={form.address} onChange={e => handleChange('address', e.target.value)} />
        {errors.address && <span style={{ color: '#FF5252', fontSize: 12 }}>{errors.address}</span>}
      </div>
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontSize: 14, fontWeight: 500, marginBottom: 6, display: 'block' }}>전화 (선택)</label>
        <input style={inputStyle('phone')} placeholder="02-1234-5678" value={form.phone} onChange={e => handleChange('phone', e.target.value)} />
      </div>
      <button
        onClick={handleSubmit}
        disabled={submitting}
        style={{ width: '100%', padding: '16px', backgroundColor: '#3182F6', color: '#fff', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1 }}
      >
        {submitting ? '등록 중...' : '사업장 등록'}
      </button>
    </div>
  );
}
