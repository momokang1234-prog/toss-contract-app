import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusiness } from '../../hooks/useBusiness';
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
  const [step, setStep] = useState<'number' | 'info'>('number');
  const [businessNumber, setBusinessNumber] = useState('');
  const [form, setForm] = useState({ business_name: '', representative: '', address: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleKeypad = (key: string) => {
    if (key === '⌫') setBusinessNumber(p => formatNumber(p.replace(/\D/g, '').slice(0, -1)));
    else setBusinessNumber(p => formatNumber(p.replace(/\D/g, '') + key));
  };

  const canNext = /^\d{3}-\d{2}-\d{5}$/.test(businessNumber);

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
      navigate('/employer/dashboard', { replace: true });
    } catch { alert('등록에 실패했어요.'); }
    finally { setSubmitting(false); }
  };

  if (step === 'info') {
    return (
      <div className={styles.page}>
        <Top title="사업장 등록" onBack={() => setStep('number')} />
        <div className={styles.content}>
          <Spacing size={40} />
          <Paragraph typography="st2" fontWeight="bold">사업장 정보를</Paragraph>
          <Paragraph typography="st2" fontWeight="bold">입력해주세요</Paragraph>
          <Spacing size={32} />
          <TextField variant="box" labelOption="sustain" label="상호" placeholder="사업장 이름"
            value={form.business_name} onChange={e => setForm(p => ({ ...p, business_name: e.target.value }))} />
          <Spacing size={16} />
          <TextField variant="box" labelOption="sustain" label="대표자" placeholder="대표자 이름"
            value={form.representative} onChange={e => setForm(p => ({ ...p, representative: e.target.value }))} />
          <Spacing size={16} />
          <TextField variant="box" labelOption="sustain" label="사업장 소재지" placeholder="주소"
            value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
          <Spacing size={16} />
          <TextField variant="box" labelOption="sustain" label="전화번호 (선택)" placeholder="02-1234-5678"
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
      <Top title="사업장 등록" onBack={() => navigate(-1)} />
      <div className={styles.content}>
        <Spacing size={48} />
        <Paragraph typography="st1" fontWeight="bold">사업자등록번호를</Paragraph>
        <Paragraph typography="st1" fontWeight="bold">입력해주세요</Paragraph>
        <Spacing size={32} />
        <TextField variant="line" labelOption="sustain" label="사업자등록번호"
          placeholder="000-00-00000" value={businessNumber} readOnly />
        <Spacing size={40} />
        <div className={styles.keypad}>
          {KEYPAD.map((row, i) => (
            <div key={i} className={styles.keypadRow}>
              {row.map((key) => (
                <button key={key || `empty-${i}`}
                  className={`${styles.keypadBtn} ${!key ? styles.keypadEmpty : ''}`}
                  type="button" onClick={() => key && handleKeypad(key)} disabled={!key}>
                  {key}
                </button>
              ))}
            </div>
          ))}
        </div>
        <Spacing size={32} />
        <Button color="primary" variant="fill" display="block" size="xlarge"
          onClick={() => setStep('info')} disabled={!canNext}>
          확인
        </Button>
      </div>
    </div>
  );
}
