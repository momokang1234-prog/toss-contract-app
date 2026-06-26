import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContracts } from '../../hooks/useContracts';
import { useBusiness } from '../../hooks/useBusiness';
import { useAuth } from '../../contexts/AuthContext';
import { Paragraph, Spacing, Button, List, ListRow, Badge, Text, Top } from '@toss/tds-mobile';
import { Suspense, Delay } from '@suspensive/react';
import { getContractBadge } from '../../utils/badgeUtils';
import { CommentBoundary } from '../dev/CommentBoundary';
import styles from './ContractListPage.module.css';

function ContractListContent({ contracts, navigate, businessMap, userName }: {
  contracts: any[];
  navigate: (path: string) => void;
  businessMap: Record<string, string>;
  userName: string | null;
}) {
  const pendingCount = contracts.filter(c => c.status === 'sent' || c.status === 'viewed').length;
  const completedCount = contracts.filter(c => c.status === 'signed' || c.status === 'completed').length;
  const urgentCount = contracts.filter(c => c.doc_parent_consent_status === 'required').length;

  const [showUrgentModal, setShowUrgentModal] = useState(pendingCount > 0);

  const { userRole } = useAuth();
  const displayName = userRole === 'worker' ? userName : '김알바';

  return (
    <div style={{ background: '#f2f4f6', minHeight: '100vh', paddingBottom: 24, display: 'flex', flexDirection: 'column' }}>
      {showUrgentModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', width: '80%', borderRadius: 16, padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
            <Paragraph typography="t4" fontWeight="bold">서명이 필요한<br/>계약이 있어요!</Paragraph>
            <Spacing size={12} />
            <Paragraph typography="t6" color="grey-600">
              사장님이 보낸 근로계약서에 아직 서명하지 않았습니다. 내용을 확인하고 서명을 완료해 주세요.
            </Paragraph>
            <Spacing size={24} />
            <Button size="large" display="block" onClick={() => setShowUrgentModal(false)}>지금 서명하러 가기</Button>
            <Spacing size={12} />
            <div style={{ fontSize: 13, color: '#8b95a1', textDecoration: 'underline' }} onClick={() => setShowUrgentModal(false)}>나중에 하기</div>
          </div>
        </div>
      )}

      <CommentBoundary name="Header (인사말 영역)">
        <div style={{ background: '#3182f6', padding: '24px', color: '#fff', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
          <Spacing size={16} />
          <Paragraph typography="t4" fontWeight="bold" style={{ color: '#fff' }}>안녕하세요, {displayName}님!</Paragraph>
          <Spacing size={8} />
          <Paragraph typography="t6" style={{ color: 'rgba(255,255,255,0.8)' }}>
            새로 도착한 근로계약서가 {pendingCount}건 있습니다.<br />빠르게 서명하고 업무를 시작해 보세요.
          </Paragraph>
          <Spacing size={24} />
        </div>
      </CommentBoundary>

      <CommentBoundary name="SummaryCards (상태 요약 카드)">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: 24, marginTop: -40 }}>
          <div style={{ background: '#fff', padding: 16, borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Paragraph typography="t6" color="grey-600" style={{ marginBottom: 12 }}>서명 대기</Paragraph>
            <div style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 4, borderBottom: '2px solid #3182f6', paddingBottom: 2 }}>
              <Text typography="t3" color="primary" fontWeight="bold">{pendingCount}</Text>
              <Text typography="t5" color="grey-800" fontWeight="bold">건</Text>
            </div>
          </div>
          <div style={{ background: '#fff', padding: 16, borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Paragraph typography="t6" color="grey-600" style={{ marginBottom: 12 }}>완료된 계약</Paragraph>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
              <Text typography="t3" color="grey-900" fontWeight="bold">{completedCount}</Text>
              <Text typography="t5" color="grey-800" fontWeight="bold" style={{ paddingBottom: 2 }}>건</Text>
            </div>
          </div>
        </div>
      </CommentBoundary>

      <Spacing size={16} />
      <Paragraph typography="t5" fontWeight="bold" style={{ padding: '0 24px' }}>진행 중인 계약</Paragraph>
      <Spacing size={8} />

      <CommentBoundary name="List (계약 리스트)">
        {contracts.length > 0 ? (
          <List>
            {contracts.map(c => {
              const needsConsent = c.doc_parent_consent_status === 'required';
              return (
                <ListRow
                  key={c.id}
                  contents={
                    <div>
                      <Paragraph typography="t5" fontWeight="bold" color="grey-800">
                        {businessMap[c.business_id] ?? c.workplace}
                      </Paragraph>
                      <Paragraph typography="t7" color="grey-500">
                        최신 업데이트: {c.start_date}
                      </Paragraph>
                      {needsConsent && (
                        <div style={{ marginTop: '8px', color: '#ff5252', fontSize: 12, fontWeight: 'bold' }}>
                          ⚠️ 친권자 동의서 사장님께 제출 필요
                        </div>
                      )}
                    </div>
                  }
                  right={<Badge size="small" variant="fill" color={getContractBadge(c.status).color}>{getContractBadge(c.status).label}</Badge>}
                  onClick={() => navigate(`/worker/contracts/${c.id}`)}
                />
              );
            })}
          </List>
        ) : (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <Paragraph typography="t5" color="grey-500">계약서가 없습니다</Paragraph>
          </div>
        )}
      </CommentBoundary>

      <div style={{ padding: 24, marginTop: 'auto' }}>
        <CommentBoundary name="Button (전체보기 버튼)">
          <Button size="large" display="block" onClick={() => navigate('/worker/contracts')}>전체 목록 보기</Button>
        </CommentBoundary>
      </div>
    </div>
  );
}

export default function WorkerContractListPage() {
  const navigate = useNavigate();
  const { contracts } = useContracts();
  const { businesses } = useBusiness();
  const { userName } = useAuth();

  const businessMap = Object.fromEntries(businesses.map(b => [b.id, b.business_name]));



  return (
    <>
      <Suspense
        clientOnly
        fallback={
          <Delay ms={200}>
            {({ isDelayed }) => isDelayed && (
              <div style={{ opacity: isDelayed ? 1 : 0, padding: 24 }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{
                    height: 72, margin: '8px 0', borderRadius: 12,
                    background: '#F5F6F8', animation: 'pulse 1.5s infinite'
                  }} />
                ))}
              </div>
            )}
          </Delay>
        }
      >
        <ContractListContent
          contracts={contracts}
          navigate={navigate}
          businessMap={businessMap}
          userName={userName}
        />
      </Suspense>
    </>
  );
}
