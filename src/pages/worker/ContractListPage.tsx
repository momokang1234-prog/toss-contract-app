import { useNavigate } from 'react-router-dom';
import { useContracts } from '../../hooks/useContracts';
import { useBusiness } from '../../hooks/useBusiness';
import { useAuth } from '../../contexts/AuthContext';
import { Top, Paragraph, Spacing, Button, List, ListRow, Badge } from '@toss/tds-mobile';
import { Suspense, Delay } from '@suspensive/react';
import styles from './ContractListPage.module.css';


function ContractListContent({ contracts, navigate, businessMap, badgeFor }: {
  contracts: any[];
  navigate: (path: string) => void;
  businessMap: Record<string, string>;
  badgeFor: (status: string) => { label: string; color: string };
}) {
  return (
    <div className={styles.content}>
      <Spacing size={24} />
      <Paragraph typography="st2" fontWeight="bold">받은 계약서</Paragraph>
      <Spacing size={8} />
      <Paragraph typography="st5" color="grey-500">
        {contracts.length > 0 ? `${contracts.length}건의 계약서` : '아직 받은 계약서가 없어요'}
      </Paragraph>
      <Spacing size={24} />

      {contracts.length > 0 ? (
        <List>
          {contracts.map(c => (
            <ListRow
              key={c.id}
              onClick={() => navigate(`/worker/contracts/${c.id}`)}
              aria-label={businessMap[c.business_id] ?? c.workplace}
              left={
                <div className={styles.contractRow}>
                  <Paragraph typography="st5" fontWeight="bold">
                    {businessMap[c.business_id] ?? c.workplace}
                  </Paragraph>
                  <Paragraph typography="st7" color="grey-500">
                    {c.job_description} · {c.start_date}
                  </Paragraph>
                </div>
              }
              right={
                <Badge size="small" variant="weak" color={badgeFor(c.status).color}>
                  {badgeFor(c.status).label}
                </Badge>
              }
            />
          ))}
        </List>
      ) : (
        <div className={styles.empty}>
          <Paragraph typography="st1">📬</Paragraph>
          <Spacing size={16} />
          <Paragraph typography="st5" color="grey-500">사장님이 보낸 계약서가 여기에 표시돼요</Paragraph>
        </div>
      )}
      <Spacing size={40} />
    </div>
  );
}
export default function WorkerContractListPage() {
  const navigate = useNavigate();
  const { contracts } = useContracts();
  const { businesses } = useBusiness();
  const { setRole } = useAuth();

  const businessMap = Object.fromEntries(businesses.map(b => [b.id, b.business_name]));

  const badgeFor = (status: string) => {
    if (status === 'draft') return { label: '작성중', color: 'elephant' as const };
    if (status === 'sent') return { label: '수신', color: 'blue' as const };
    if (status === 'viewed') return { label: '확인완료', color: 'blue' as const };
    if (status === 'signed') return { label: '서명완료', color: 'yellow' as const };
    if (status === 'completed') return { label: '계약완료', color: 'teal' as const };
    return { label: status, color: 'elephant' as const };
  };

  return (
    <div className={styles.page}>
      <Top title="내 계약 목록" />
      <Suspense
        clientOnly
        fallback={
          <Delay ms={200}>
            {({ isDelayed }) => isDelayed && (
              <div style={{ opacity: isDelayed ? 1 : 0 }}>
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
          badgeFor={badgeFor}
        />
      </Suspense>

      <div style={{ display: 'flex', justifyContent: 'center', padding: '0 24px 24px' }}>
        <Button color="light" variant="weak" size="small"
          onClick={async () => { await setRole('employer'); navigate('/employer/dashboard', { replace: true }); }}>
          🔄 사장님으로 전환
        </Button>
      </div>
    </div>
  );
}
