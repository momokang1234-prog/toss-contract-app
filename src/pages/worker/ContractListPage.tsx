import { useNavigate } from 'react-router-dom';
import { useContracts } from '../../hooks/useContracts';
import { useBusiness } from '../../hooks/useBusiness';
import { useAuth } from '../../contexts/AuthContext';
import { Paragraph, Spacing, Button, List, ListRow, Badge, Text } from '@toss/tds-mobile';
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

  return (
    <div className={styles.page}>
      <CommentBoundary name="환영-헤더">
      <div className={styles.headerContainer}>
        <div className={styles.headerCard}>
          <Spacing size={16} />
          <Paragraph typography="t3" fontWeight="bold" style={{ color: '#fff', wordBreak: 'keep-all' }}>
            안녕하세요, {userName || '근로자'}님
          </Paragraph>
          <Spacing size={8} />
          <Paragraph typography="t5" style={{ color: 'rgba(255,255,255,0.85)', wordBreak: 'keep-all' }}>
            새로 도착한 계약서가 {pendingCount}건 있어요.<br />내용을 확인하고 서명을 완료해 보세요.
          </Paragraph>
          <Spacing size={24} />
          <div className={styles.headerEmoji}>✍️</div>
        </div>
      </div>
      </CommentBoundary>

      <CommentBoundary name="통계-그리드">
      <div className={styles.statGrid}>
        <div className={styles.statBox}>
          <Paragraph typography="t6" color="grey-600" style={{ marginBottom: 12 }}>서명 대기</Paragraph>
          <div className={`${styles.statValue} ${styles.statPrimary}`}>
            <Text typography="t1" className={styles.tossBlueText} fontWeight="bold">{pendingCount}</Text>
            <Text typography="t5" color="grey-800" fontWeight="bold" style={{ paddingBottom: 2 }}>건</Text>
          </div>
        </div>
        <div className={styles.statBox}>
          <Paragraph typography="t6" color="grey-600" style={{ marginBottom: 12 }}>완료된 계약</Paragraph>
          <div className={styles.statValue}>
            <Text typography="t1" color="grey-900" fontWeight="bold">{completedCount}</Text>
            <Text typography="t5" color="grey-800" fontWeight="bold" style={{ paddingBottom: 2 }}>건</Text>
          </div>
        </div>
      </div>
      </CommentBoundary>

      <CommentBoundary name="계약-리스트">
      <div className={styles.urgentList}>
        <Paragraph typography="t5" fontWeight="bold" style={{ marginBottom: '16px' }}>진행 중인 계약</Paragraph>
        
        {contracts.length > 0 ? (
          <div>
            {contracts.map(c => (
              <div key={c.id} className={styles.contractRow} onClick={() => navigate(`/worker/contracts/${c.id}`)}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Paragraph typography="t5" fontWeight="bold" color="grey-800">
                    {businessMap[c.business_id] ?? c.workplace}
                  </Paragraph>
                  <Spacing size={4} />
                  <Paragraph typography="t7" color="grey-500">
                    최신 업데이트: {c.start_date}
                  </Paragraph>
                </div>
                <Badge size="small" variant="fill" color={getContractBadge(c.status).color}>
                  {getContractBadge(c.status).label}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <Paragraph typography="t5" color="grey-500">계약서가 없습니다</Paragraph>
          </div>
        )}
      </div>
      </CommentBoundary>

      <div className={styles.buttonContainer}>
        <Button size="large" display="block" onClick={() => navigate('/worker/contracts')}>전체 목록 보기</Button>
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
