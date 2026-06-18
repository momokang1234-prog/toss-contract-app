/**
 * Step1 기본정보 — Variant B: 7개 Badge 가로 나열 — 현재=fill blue, 나머지=outline
 * design session: 20260618_060000
 */
import { useState } from 'react';
import { Badge, TextField, Spacing } from '@toss/tds-mobile';
import { FunnelQuestion } from '../../components/funnel/FunnelQuestion';
import { CommentBoundary } from './CommentBoundary';

const STEPS = ['기본정보', '근무조건', '근무일정', '임금·보험', '체크', '미리보기', '서명'];
const STEP_INDEX = 0;

export default function FormVariantB() {
  const [activeField, setActiveField] = useState<'name' | 'phone' | 'address'>('name');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  return (
    <div style={{ background: '#fff', minHeight: '100vh', maxWidth: 480, margin: '0 auto' }}>
      <CommentBoundary name="진행표시-배지7개">
        <div style={{
          padding: '16px 20px 0',
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}>
          {STEPS.map((label, i) => (
            <Badge
              key={label}
              size="small"
              variant={i === STEP_INDEX ? 'fill' : 'weak'}
              color={i === STEP_INDEX ? 'blue' : 'elephant'}
              style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              {label}
            </Badge>
          ))}
        </div>
        <Spacing size={20} />
      </CommentBoundary>

      <div style={{ padding: '0 24px 120px' }}>
        <CommentBoundary name="기본정보-이름필드">
          <FunnelQuestion
            title={<>근로자의 이름을<br />입력해주세요</>}
            subtitle="본명이 아니면 법적 효력이 없을 수 있어요"
            isActive={activeField === 'name'}
            onEnter={() => setActiveField('name')}
            summary={name ? `이름: ${name}` : undefined}
          >
            <TextField variant="line" label="근로자 이름" value={name}
              onChange={(e) => setName(e.target.value)} placeholder="예: 홍길동" required />
            <Spacing size={16} />
          </FunnelQuestion>
        </CommentBoundary>

        {name.trim().length > 0 && (
          <CommentBoundary name="기본정보-전화번호필드">
            <FunnelQuestion
              title={<>{name}님의<br />전화번호를 알려주세요</>}
              subtitle="- 없이 숫자만 입력해주세요"
              isActive={activeField === 'phone'}
              onEnter={() => setActiveField('phone')}
              summary={phone ? `전화번호: ${phone}` : undefined}
            >
              <TextField variant="line" label="전화번호" value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="01012345678" required />
              <Spacing size={16} />
            </FunnelQuestion>
          </CommentBoundary>
        )}

        {phone.length >= 10 && (
          <CommentBoundary name="기본정보-주소필드">
            <FunnelQuestion
              title={<>{name}님의<br />주소를 입력해주세요</>}
              subtitle="선택사항이며 나중에 적어도 돼요"
              isActive={activeField === 'address'}
              onEnter={() => setActiveField('address')}
              summary={address ? `주소: ${address}` : undefined}
            >
              <TextField variant="line" label="근로자 주소 (선택)" value={address}
                onChange={(e) => setAddress(e.target.value)} placeholder="서울특별시 강남구..." />
              <Spacing size={16} />
            </FunnelQuestion>
          </CommentBoundary>
        )}
      </div>
    </div>
  );
}
