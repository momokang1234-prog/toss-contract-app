/**
 * step-label Variant B (확정 디자인): 숫자 아이콘 스테퍼 + 슬라이딩 Badge
 * 헤더는 공유 컴포넌트(ContractFormProgress)를 사용 → 실제 폼(ContractFormPage)과 동일.
 * 이 페이지는 8단계 이전/다음 네비게이션으로 헤더 동작을 테스트하기 위한 dev 미리보기.
 * design session: 20260618_070000
 */
import { useState } from 'react';
import { TextField, Spacing, Button } from '@toss/tds-mobile';
import { FunnelQuestion } from '../../components/funnel/FunnelQuestion';
import { CommentBoundary } from './CommentBoundary';
import { ContractFormProgress } from '../employer/contract-form/ContractFormProgress';
import { STEP_ORDER, STEP_LABELS } from '../employer/contract-form/types';

const STEPS = STEP_ORDER.map((s) => STEP_LABELS[s]);

export default function FormStepLabelVariantB() {
  const [stepIndex, setStepIndex] = useState(0);
  const [activeField, setActiveField] = useState<'name' | 'phone' | 'address'>('name');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  return (
    <div style={{ background: '#fff', minHeight: '100vh', maxWidth: 480, margin: '0 auto' }}>
      <CommentBoundary name="진행표시-스테퍼+슬라이딩배지">
        <ContractFormProgress currentIndex={stepIndex} labels={STEPS} />
      </CommentBoundary>

      <div style={{ padding: '0 24px 160px' }}>
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

      {/* 데모용 단계 이동 — 헤더 스테퍼 동작 확인용 */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480,
        padding: '12px 24px 24px', background: '#fff',
        borderTop: '1px solid #E5E8EB', display: 'flex', gap: 12,
      }}>
        <Button color="light" variant="weak" display="block" size="xlarge"
          disabled={stepIndex === 0} onClick={() => setStepIndex(i => i - 1)}>
          이전
        </Button>
        <Button color="primary" variant="fill" display="block" size="xlarge"
          disabled={stepIndex === STEPS.length - 1} onClick={() => setStepIndex(i => i + 1)}>
          다음
        </Button>
      </div>
    </div>
  );
}
