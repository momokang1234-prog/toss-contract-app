/**
 * [시안 1] 퍼널 UX 유지 + TDS 정제
 * - 현재 대화형 플로우(질문 하나씩 순차 등장) 유지
 * - Top 컴포넌트 + 뒤로가기 추가
 * - 타이포그래피를 TDS Paragraph로 교체 (st/raw CSS 제거)
 * - 진행바 위치·형태 현행 유지
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Top, Paragraph, Spacing } from '@toss/tds-mobile';
import { CommentBoundary } from './CommentBoundary';

export default function FormProposal1() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [activeField, setActiveField] = useState<'name' | 'phone' | 'address'>('name');

  const progressPct = Math.round(((1) / 7) * 100);

  return (
    <div style={{ background: '#fff', minHeight: '100dvh', maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column' }}>

      <CommentBoundary name="헤더-Top컴포넌트">
        {/* 변경: 기존 장식 이미지 + raw 텍스트 → Top 컴포넌트 */}
        <Top title="근로계약서 작성" />
      </CommentBoundary>

      {/* 변경: progressTrack을 Top 바로 아래 전체 너비로 */}
      <CommentBoundary name="진행바">
        <div style={{ height: 3, background: '#E5E8EB' }}>
          <div style={{ height: '100%', width: `${progressPct}%`, background: '#3182F6', transition: 'width 0.3s' }} />
        </div>
      </CommentBoundary>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
        <Spacing size={32} />

        {/* 변경: 현재 스텝 라벨을 TDS Paragraph로 교체 (기존 st7 → t6) */}
        <CommentBoundary name="스텝-레이블">
          <Paragraph typography="t6" color="grey-500">근로자 정보 (1/7)</Paragraph>
        </CommentBoundary>

        <Spacing size={20} />

        {/* ── 이름 질문 ── */}
        <CommentBoundary name="이름-질문">
          {activeField !== 'name' && name ? (
            <div
              onClick={() => setActiveField('name')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#F2F4F6', borderRadius: 12, marginBottom: 16, cursor: 'pointer' }}
            >
              <Paragraph typography="t5" fontWeight="bold" color="grey-800">이름: {name}</Paragraph>
              <Paragraph typography="t6" color="blue-500">수정</Paragraph>
            </div>
          ) : (
            <div style={{ paddingBottom: 40 }}>
              {/* 변경: font-size 24px raw CSS → TDS Paragraph t2 */}
              <Paragraph typography="t2" fontWeight="bold">
                근로자의 이름을<br />입력해주세요
              </Paragraph>
              <Spacing size={8} />
              {/* 변경: color: '#8b95a1' raw hex → TDS grey-500 */}
              <Paragraph typography="t6" color="grey-500">본명이 아니면 법적 효력이 없을 수 있어요</Paragraph>
              <Spacing size={32} />
              <label className="funnel-label">근로자 이름</label>
              <input
                className="funnel-huge-input"
                placeholder="예: 홍길동"
                value={name}
                autoFocus
                onChange={e => setName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && name.trim()) setActiveField('phone'); }}
              />
            </div>
          )}
        </CommentBoundary>

        {/* ── 전화번호 질문 (이름 입력 후 등장) ── */}
        {(name.trim().length > 0 || activeField === 'phone' || activeField === 'address') && (
          <CommentBoundary name="전화번호-질문">
            {activeField !== 'phone' && phone ? (
              <div
                onClick={() => setActiveField('phone')}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#F2F4F6', borderRadius: 12, marginBottom: 16, cursor: 'pointer' }}
              >
                <Paragraph typography="t5" fontWeight="bold" color="grey-800">전화번호: {phone}</Paragraph>
                <Paragraph typography="t6" color="blue-500">수정</Paragraph>
              </div>
            ) : (
              <div style={{ paddingBottom: 40 }}>
                <Paragraph typography="t2" fontWeight="bold">
                  {name}님의 전화번호를<br />알려주세요
                </Paragraph>
                <Spacing size={8} />
                <Paragraph typography="t6" color="grey-500">- 없이 숫자만 입력해주세요</Paragraph>
                <Spacing size={32} />
                <label className="funnel-label">전화번호</label>
                <input
                  className="funnel-huge-input"
                  type="tel"
                  placeholder="01012345678"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  onKeyDown={e => { if (e.key === 'Enter' && phone.length >= 10) setActiveField('address'); }}
                />
              </div>
            )}
          </CommentBoundary>
        )}

        {/* ── 주소 질문 (전화번호 입력 후 등장) ── */}
        {(phone.length >= 10 || activeField === 'address') && (
          <CommentBoundary name="주소-질문">
            <div style={{ paddingBottom: 120 }}>
              <Paragraph typography="t2" fontWeight="bold">
                {name}님의 주소를<br />입력해주세요
              </Paragraph>
              <Spacing size={8} />
              <Paragraph typography="t6" color="grey-500">선택사항이며 나중에 적어도 돼요</Paragraph>
              <Spacing size={32} />
              <label className="funnel-label">근로자 주소 (선택)</label>
              <input
                className="funnel-huge-input"
                placeholder="서울특별시 강남구..."
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>
          </CommentBoundary>
        )}
      </div>

      {/* 하단 CTA */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, padding: '16px 24px 32px', background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, #fff 20%)' }}>
        <button
          disabled={!name.trim() || phone.length < 10}
          style={{
            width: '100%', padding: '18px', borderRadius: 16, border: 'none',
            background: (!name.trim() || phone.length < 10) ? '#E5E8EB' : '#3182F6',
            color: (!name.trim() || phone.length < 10) ? '#B0B8C1' : '#fff',
            fontSize: 17, fontWeight: 700, cursor: (!name.trim() || phone.length < 10) ? 'not-allowed' : 'pointer',
          }}
        >
          다음
        </button>
      </div>
    </div>
  );
}
