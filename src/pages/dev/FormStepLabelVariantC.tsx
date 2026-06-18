/**
 * step-label Variant C: ProgressStep의 title prop으로 현재 스텝에만 "기본정보 1/7" 표시
 * design session: 20260618_070000
 */
import { useState } from 'react';
import { ProgressStepper, ProgressStep, TextField, Spacing } from '@toss/tds-mobile';
import { FunnelQuestion } from '../../components/funnel/FunnelQuestion';
import { CommentBoundary } from './CommentBoundary';

const STEPS = ['기본정보', '근무조건', '근무일정', '임금·보험', '체크리스트', '미리보기', '서명'];
const STEP_INDEX = 0;

function NumberIcon({ n, active }: { n: number; active: boolean }) {
  return (
    <div style={{
      width: 20, height: 20, borderRadius: '50%',
      background: active ? '#3182F6' : '#E5E8EB',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: active ? '#fff' : '#8B95A1' }}>{n}</span>
    </div>
  );
}

export default function FormStepLabelVariantC() {
  const [activeField, setActiveField] = useState<'name' | 'phone' | 'address'>('name');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  return (
    <div style={{ background: '#fff', minHeight: '100vh', maxWidth: 480, margin: '0 auto' }}>
      <CommentBoundary name="진행표시-스테퍼-title통합">
        <ProgressStepper variant="icon" activeStepIndex={STEP_INDEX} checkForFinish paddingTop="default">
          {STEPS.map((label, i) => (
            <ProgressStep
              key={label}
              icon={<NumberIcon n={i + 1} active={i === STEP_INDEX} />}
              title={i === STEP_INDEX ? `${label} ${i + 1}/${STEPS.length}` : undefined}
            />
          ))}
        </ProgressStepper>
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
