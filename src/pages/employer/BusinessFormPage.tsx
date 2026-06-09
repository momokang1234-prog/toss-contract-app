import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusiness } from '../../hooks/useBusiness';
import { TextField, Button, Spacing, Paragraph } from '@toss/tds-mobile';

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

  return (
    <div style={{ padding: 24, maxWidth: 480, margin: '0 auto' }}>
      <Paragraph typography="st3" fontWeight="bold">사업장 등록</Paragraph>
      <Spacing size={24} />

      <TextField
        variant="box"
        label="사업자등록번호"
        placeholder="000-00-00000"
        value={form.business_number}
        onChange={e => handleChange('business_number', e.target.value)}
        hasError={!!errors.business_number}
        help={errors.business_number}
      />
      <Spacing size={16} />

      <TextField
        variant="box"
        label="상호"
        placeholder="사업장 이름"
        value={form.business_name}
        onChange={e => handleChange('business_name', e.target.value)}
        hasError={!!errors.business_name}
        help={errors.business_name}
      />
      <Spacing size={16} />

      <TextField
        variant="box"
        label="대표자"
        placeholder="대표자 이름"
        value={form.representative}
        onChange={e => handleChange('representative', e.target.value)}
        hasError={!!errors.representative}
        help={errors.representative}
      />
      <Spacing size={16} />

      <TextField
        variant="box"
        label="사업장 소재지"
        placeholder="주소"
        value={form.address}
        onChange={e => handleChange('address', e.target.value)}
        hasError={!!errors.address}
        help={errors.address}
      />
      <Spacing size={16} />

      <TextField
        variant="box"
        label="전화 (선택)"
        placeholder="02-1234-5678"
        value={form.phone}
        onChange={e => handleChange('phone', e.target.value)}
      />
      <Spacing size={24} />

      <Button
        color="primary"
        variant="fill"
        display="block"
        size="large"
        onClick={handleSubmit}
        disabled={submitting}
      >
        {submitting ? '등록 중...' : '사업장 등록'}
      </Button>
    </div>
  );
}
