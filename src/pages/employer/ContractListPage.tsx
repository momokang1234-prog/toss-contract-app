import { useNavigate } from 'react-router-dom';
import { useContracts } from '../../hooks/useContracts';
import { Top, Paragraph, Spacing, Button, List, ListRow, Badge } from '@toss/tds-mobile';
import { Suspense, Delay } from '@suspensive/react';
import { CONTRACT_TYPE_LABEL } from '../../utils/labels';
import { CommentBoundary } from '../dev/CommentBoundary';
import styles from './ContractListPage.module.css';

function ContractListContent({ contracts, navigate, badgeFor }: {
  contracts: any[];
  navigate: (path: string) => void;
  badgeFor: (status: string) => { label: string; color: 'blue' | 'teal' | 'green' | 'red' | 'yellow' | 'elephant' };
}) {
  return (
    <div className={styles.content}>
      <Paragraph typography="t3" fontWeight="bold">근로계약서</Paragraph>
      <Spacing size={12} />
      <Paragraph typography="t5" color="grey-500">
        {contracts.length > 0
          ? `총 ${contracts.length}건의 계약서가 있어요`
          : '아직 작성한 계약서가 없어요'}
      </Paragraph>

      <Spacing size={12} />

      {contracts.length > 0 ? (
        <CommentBoundary name="계약서-목록">
          <div style={{ margin: '0 -20px' }}>
            <List>
          {contracts.map(c => (
            <ListRow
              key={c.id}
              onClick={() => navigate(`/employer/contracts/${c.id}`)}
              aria-label={c.worker_name}
              contents={
                <div className={styles.contractRow}>
                  <Paragraph typography="t5" fontWeight="bold" color="grey-800">
                    {c.worker_name} ({CONTRACT_TYPE_LABEL[c.contract_type as keyof typeof CONTRACT_TYPE_LABEL]})
                  </Paragraph>
                  <Spacing size={4} />
                  <Paragraph typography="t7" color="grey-500">
                    {c.workplace} · {c.start_date}
                  </Paragraph>
                </div>
              }
              right={
                <Badge size="small" variant="fill" color={badgeFor(c.status).color}>
                  {badgeFor(c.status).label}
                </Badge>
              }
            />
          ))}
        </List>
          </div>
        </CommentBoundary>
      ) : (
        <div className={styles.empty}>
          <img src="https://static.toss.im/2d-emojis/png/4x/u1F4CB.png" alt=""
            style={{ width: 72, height: 72 }}
          />
          <Spacing size={16} />
          <Paragraph typography="t5" color="grey-600" fontWeight="bold">
            첫 계약서를 작성해보세요
          </Paragraph>
          <Spacing size={24} />
          <Button color="primary" variant="fill" size="large"
            onClick={() => navigate('/employer/contracts/new')}>
            계약서 작성하기
          </Button>
        </div>
      )}

      <Spacing size={40} />
    </div>
  );
}
export default function ContractListPage() {
  const navigate = useNavigate();
  const { contracts } = useContracts();

  const badgeFor = (status: string) => {
    if (status === 'signed' || status === 'completed') {
      return { label: '완료', color: 'blue' as const };
    }
    if (status === 'cancelled' || status === 'expired') {
      return { label: '만료/취소', color: 'elephant' as const };
    }
    return { label: '서명 대기', color: 'yellow' as const };
  };
  return (
    <div className={styles.page}>
      <Top title="">
        <Button color="primary" variant="weak" size="small"
          onClick={() => navigate('/employer/contracts/new')}>
          + 새 계약서
        </Button>
      </Top>

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
        <ContractListContent contracts={contracts} navigate={navigate} badgeFor={badgeFor} />
      </Suspense>
    </div>
  );
}
