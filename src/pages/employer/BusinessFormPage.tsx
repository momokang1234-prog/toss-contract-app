import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusiness } from '../../hooks/useBusiness';
import { useSessionStorage } from '../../hooks/useSessionStorage';
import { Top, Paragraph, Spacing, Button, TextField } from '@toss/tds-mobile';
import styles from './BusinessFormPage.module.css';

const formatNumber = (v: string) => {
  const digits = v.replace(/\D/g, '').slice(0, 10);
  if (digits.length > 5) return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
  if (digits.length > 3) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return digits;
};

const KEYPAD = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', '⌫'],
];

export default function BusinessFormPage() {
  const navigate = useNavigate();
  const { createBusiness } = useBusiness();
  const [step, setStep, clearStep] = useSessionStorage<'number' | 'info'>('biz_form_step', 'number');
  const [businessNumber, setBusinessNumber, clearBusinessNumber] = useSessionStorage('biz_form_num', '');
  const [form, setForm, clearForm] = useSessionStorage('biz_form_data', { business_name: '', representative: '', address: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleKeypad = (key: string) => {
    setValidationError(null); // Clear error on typing
    if (key === '⌫') setBusinessNumber(p => formatNumber(p.replace(/\D/g, '').slice(0, -1)));
    else setBusinessNumber(p => formatNumber(p.replace(/\D/g, '') + key));
  };

  const canNext = /^\d{3}-\d{2}-\d{5}$/.test(businessNumber);

  const handleVerifyBusinessNumber = async () => {
    setIsValidating(true);
    setValidationError(null);
    try {
      const { validateBusinessNumber } = await import('../../api/businessValidator');
      const res = await validateBusinessNumber(businessNumber);
      if (res.success) {
        if (res.companyName) {
          setForm(p => ({ ...p, business_name: res.companyName! }));
        }
        setStep('info');
      } else {
        setValidationError(res.message || '인증에 실패했습니다.');
      }
    } catch (err) {
      setValidationError('서버 에러가 발생했습니다.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await createBusiness({
        business_number: businessNumber,
        business_name: form.business_name,
        representative: form.representative,
        address: form.address,
        phone: form.phone,
      });
      clearStep();
      clearBusinessNumber();
      clearForm();
      navigate('/employer/dashboard', { replace: true });
    } catch (err: any) {
      alert('등록 실패: ' + (err.message || JSON.stringify(err)));
      // Analytics tracking for business registration errors
      if (typeof window !== 'undefined' && (window as any).analytics) {
        (window as any).analytics.track('business_registration_error', {
          error_message: err.message || 'Unknown error',
          error_type: err.name || 'Error'
        });
      }
    }
    finally { setSubmitting(false); }
  };

  if (step === 'info') {
    return (
      <div className={styles.page}>
        <Top title="" />
        <div className={styles.content}>
          <Spacing size={40} />
          <Paragraph typography="t3" fontWeight="bold">사업장 정보를</Paragraph>
          <Spacing size={4} />
          <Paragraph typography="t3" fontWeight="bold">입력해주세요</Paragraph>
          <Spacing size={32} />
          <TextField variant="line" labelOption="sustain" label="상호" placeholder="사업장 이름"
            value={form.business_name} onChange={e => setForm(p => ({ ...p, business_name: e.target.value }))} />
          <Spacing size={24} />
          <TextField variant="line" labelOption="sustain" label="대표자" placeholder="대표자 이름"
            value={form.representative} onChange={e => setForm(p => ({ ...p, representative: e.target.value }))} />
          <Spacing size={24} />
          <TextField variant="line" labelOption="sustain" label="사업장 소재지" placeholder="주소"
            value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
          <Spacing size={24} />
          <TextField variant="line" labelOption="sustain" label="전화번호 (선택)" placeholder="02-1234-5678"
            value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
          <Spacing size={40} />
          <Button color="primary" variant="fill" display="block" size="xlarge"
            onClick={handleSubmit} disabled={submitting}>
            {submitting ? '등록 중...' : '등록하기'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Top title="" />
      <div className={styles.content}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Paragraph typography="t3" fontWeight="bold">사업자등록번호를</Paragraph>
          <button 
            onClick={() => { sessionStorage.removeItem('toss_token'); window.location.href='/'; }}
            style={{ fontSize: '12px', color: '#888', background: 'none', border: 'none', textDecoration: 'underline' }}>
            로그아웃(초기화)
          </button>
        </div>
        <Spacing size={4} />
        <Paragraph typography="t3" fontWeight="bold">입력해주세요</Paragraph>
        <Spacing size={32} />
        <TextField variant="line" labelOption="sustain" label="사업자등록번호"
          placeholder="000-00-00000" value={businessNumber} readOnly hasError={!!validationError} help={validationError || '테스트: 000-00-00000 (위반), 123-45-67890 (폐업)'} />
        <Spacing size={40} />
        <div className={styles.keypad}>
          {KEYPAD.map((row, i) => (
            <div key={i} className={styles.keypadRow}>
              {row.map((key) => (
                <button key={key || `empty-${i}`}
                  className={`${styles.keypadBtn} ${!key ? styles.keypadEmpty : ''}`}
                  type="button" onClick={() => key && handleKeypad(key)} disabled={!key || isValidating}>
                  {key}
                </button>
              ))}
            </div>
          ))}
        </div>
        <Spacing size={32} />
        <Button color="primary" variant="fill" display="block" size="xlarge"
          onClick={handleVerifyBusinessNumber} disabled={!canNext || isValidating}>
          {isValidating ? '확인 중...' : '확인'}
        </Button>
      </div>
    </div>
  );
}
