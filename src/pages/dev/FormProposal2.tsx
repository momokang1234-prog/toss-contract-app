/**
 * [시안 2] TDS TextField 통일형
 * - Top 컴포넌트 + 뒤로가기
 * - funnel-huge-input → TDS TextField variant="line" 교체
 * - 세 필드를 한 화면에 모두 표시 (progressive reveal 제거)
 * - 에러 메시지를 TextField errorMessage prop으로 처리
 * - BusinessManagePage와 동일한 TDS 어휘 사용
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Top, Paragraph, Spacing, TextField, Button } from '@toss/tds-mobile';
import { CommentBoundary } from './CommentBoundary';

export default function FormProposal2() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [touched, setTouched] = useState({ name: false, phone: false });

  const nameError = touched.name && !name.trim() ? '이름을 입력해주세요' : '';
  const phoneError = touched.phone && phone.length > 0 && phone.length < 10 ? '올바른 전화번호를 입력해주세요' : '';
  const canNext = name.trim().length > 0 && phone.length >= 10;

  const progressPct = Math.round((1 / 7) * 100);

  return (
    <div style={{ background: '#fff', minHeight: '100dvh', maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column' }}>

      <CommentBoundary name="헤더">
        <Top title="근로계약서 작성" />
        <div style={{ height: 3, background: '#E5E8EB' }}>
          <div style={{ height: '100%', width: `${progressPct}%`, background: '#3182F6', transition: 'width 0.3s' }} />
        </div>
      </CommentBoundary>

      <div style={{ flex: 1, padding: '32px 24px 120px' }}>

        <CommentBoundary name="스텝-제목">
          <Paragraph typography="t6" color="grey-500">근로자 정보 (1/7)</Paragraph>
          <Spacing size={16} />
          {/* 변경: raw CSS 26px bold → TDS t2 */}
          <Paragraph typography="t2" fontWeight="bold">근로자 정보를<br />입력해주세요</Paragraph>
          <Spacing size={32} />
        </CommentBoundary>

        <CommentBoundary name="이름-필드">
          {/* 변경: funnel-huge-input native input → TDS TextField */}
          <TextField
            variant="line"
            labelOption="sustain"
            label="근로자 이름"
            placeholder="예: 홍길동"
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={() => setTouched(t => ({ ...t, name: true }))}
            hasError={!!nameError}
            help={nameError || undefined}
            autoFocus
          />
        </CommentBoundary>

        <Spacing size={32} />

        <CommentBoundary name="전화번호-필드">
          <TextField
            variant="line"
            labelOption="sustain"
            label="전화번호"
            placeholder="01012345678"
            value={phone}
            type="tel"
            onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
            onBlur={() => setTouched(t => ({ ...t, phone: true }))}
            hasError={!!phoneError}
            help={phoneError || '- 없이 숫자만 입력해주세요'}
          />
        </CommentBoundary>

        <Spacing size={32} />

        <CommentBoundary name="주소-필드">
          <TextField
            variant="line"
            labelOption="sustain"
            label="주소 (선택)"
            placeholder="서울특별시 강남구..."
            value={address}
            onChange={e => setAddress(e.target.value)}
            help="선택사항이며 나중에 적어도 돼요"
          />
        </CommentBoundary>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, padding: '16px 24px 32px', background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, #fff 20%)' }}>
        <Button
          color="primary"
          variant="fill"
          display="block"
          size="xlarge"
          disabled={!canNext}
        >
          다음
        </Button>
      </div>
    </div>
  );
}
