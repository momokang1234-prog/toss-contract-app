/**
 * [시안 3] 카드 섹션형
 * - Top 컴포넌트 + 스텝 인디케이터 점(dot) 방식
 * - 각 입력 그룹을 카드(회색 배경)로 구분
 * - TDS TextField + 입력 완료 시 카드가 접혀 요약 표시
 * - 시각적으로 각 스텝이 독립된 블록처럼 보임
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Top, Paragraph, Spacing, TextField, Button, TextButton } from '@toss/tds-mobile';
import { CommentBoundary } from './CommentBoundary';

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === current - 1 ? 20 : 6,
            height: 6,
            borderRadius: 3,
            background: i === current - 1 ? '#3182F6' : '#E5E8EB',
            transition: 'all 0.2s',
          }}
        />
      ))}
    </div>
  );
}

interface CardFieldProps {
  label: string;
  summary: string;
  isOpen: boolean;
  onEdit: () => void;
  children: React.ReactNode;
}

function CardField({ label, summary, isOpen, onEdit, children }: CardFieldProps) {
  if (!isOpen && summary) {
    return (
      <div style={{ background: '#F2F4F6', borderRadius: 16, padding: '16px 20px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Paragraph typography="t7" color="grey-500">{label}</Paragraph>
          <Spacing size={2} />
          <Paragraph typography="t5" fontWeight="bold" color="grey-800">{summary}</Paragraph>
        </div>
        <TextButton size="small" onClick={onEdit}>수정</TextButton>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div style={{ background: '#F8F9FA', borderRadius: 16, padding: '20px', marginBottom: 12, border: '1.5px solid #3182F6' }}>
      <Paragraph typography="t6" color="blue-500" fontWeight="bold">{label}</Paragraph>
      <Spacing size={16} />
      {children}
    </div>
  );
}

export default function FormProposal3() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [openCard, setOpenCard] = useState<'name' | 'phone' | 'address'>('name');

  const nameError = openCard !== 'name' && !name.trim() ? '이름을 입력해주세요' : '';
  const phoneError = openCard !== 'phone' && phone.length > 0 && phone.length < 10 ? '전화번호를 확인해주세요' : '';
  const canNext = name.trim().length > 0 && phone.length >= 10;

  return (
    <div style={{ background: '#fff', minHeight: '100dvh', maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column' }}>

      <CommentBoundary name="헤더">
        <Top title="근로계약서 작성" />
      </CommentBoundary>

      <div style={{ flex: 1, padding: '24px 24px 120px' }}>

        <CommentBoundary name="스텝-인디케이터">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Paragraph typography="t6" color="grey-500">근로자 정보 (1/7)</Paragraph>
            {/* 변경: raw 진행바 → 점 인디케이터 */}
            <StepDots current={1} total={7} />
          </div>
          <Spacing size={24} />
          <Paragraph typography="t2" fontWeight="bold">근로자 정보를<br />입력해주세요</Paragraph>
          <Spacing size={28} />
        </CommentBoundary>

        {/* ── 이름 카드 ── */}
        <CommentBoundary name="이름-카드">
          <CardField
            label="근로자 이름"
            summary={name}
            isOpen={openCard === 'name'}
            onEdit={() => setOpenCard('name')}
          >
            <TextField
              variant="line"
              labelOption="sustain"
              label="이름"
              placeholder="예: 홍길동"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
            <Spacing size={16} />
            <Button
              color="primary"
              variant="fill"
              display="block"
              size="large"
              disabled={!name.trim()}
              onClick={() => { if (name.trim()) setOpenCard('phone'); }}
            >
              확인
            </Button>
          </CardField>
        </CommentBoundary>

        {/* ── 전화번호 카드 (이름 완료 후 등장) ── */}
        {(name.trim() || openCard === 'phone' || openCard === 'address') && (
          <CommentBoundary name="전화번호-카드">
            <CardField
              label="전화번호"
              summary={phone.length >= 10 ? phone : ''}
              isOpen={openCard === 'phone'}
              onEdit={() => setOpenCard('phone')}
            >
              <TextField
                variant="line"
                labelOption="sustain"
                label="전화번호"
                placeholder="01012345678"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                help={phoneError || '- 없이 숫자만 입력해주세요'}
                hasError={!!phoneError}
                autoFocus
              />
              <Spacing size={16} />
              <Button
                color="primary"
                variant="fill"
                display="block"
                size="large"
                disabled={phone.length < 10}
                onClick={() => { if (phone.length >= 10) setOpenCard('address'); }}
              >
                확인
              </Button>
            </CardField>
          </CommentBoundary>
        )}

        {/* ── 주소 카드 (전화번호 완료 후 등장) ── */}
        {(phone.length >= 10 || openCard === 'address') && (
          <CommentBoundary name="주소-카드">
            <CardField
              label="주소 (선택)"
              summary={address}
              isOpen={openCard === 'address'}
              onEdit={() => setOpenCard('address')}
            >
              <TextField
                variant="line"
                labelOption="sustain"
                label="주소"
                placeholder="서울특별시 강남구..."
                value={address}
                onChange={e => setAddress(e.target.value)}
                help="선택사항이며 나중에 적어도 돼요"
                autoFocus
              />
              <Spacing size={16} />
              <Button
                color="primary"
                variant="fill"
                display="block"
                size="large"
                onClick={() => setOpenCard('address')}
              >
                확인
              </Button>
            </CardField>
          </CommentBoundary>
        )}
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
