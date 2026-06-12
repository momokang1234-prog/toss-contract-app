import { useNavigate } from 'react-router-dom';
import { useContracts } from '../../hooks/useContracts';
import { Top, Paragraph, Spacing, Badge, List, ListRow } from '@toss/tds-mobile';
import styles from './ContractHistoryPage.module.css';

const HISTORY_STATUSES: Record<string, true> = { completed: true, cancelled: true, expired: true };

function badgeFor(status: string): { label: string; color: 'teal' | 'red' | 'elephant' } {
  if (status === 'completed') return { label: '계약완료', color: 'teal' };
  if (status === 'cancelled') return { label: '취소', color: 'red' };
  if (status === 'expired')  return { label: '만료', color: 'elephant' };
  return { label: status, color: 'elephant' };
}

export default function ContractHistoryPage() {
  const navigate = useNavigate();
  const { contracts, loading } = useContracts();

  const historyContracts = contracts.filter(c => HISTORY_STATUSES[c.status]);

  return (
    <div className={styles.page}>
      <Top title="계약 이력" />
      <div className={styles.content}>
        <Spacing size={24} />
        <Paragraph typography="st2" fontWeight="bold">계약 이력</Paragraph>
        <Spacing size={8} />
        <Paragraph typography="st5" color="grey-500">
          {loading
            ? '불러오는 중...'
            : historyContracts.length > 0
              ? `완료·취소·만료된 계약 ${historyContracts.length}건`
              : '완료·취소·만료된 계약이 없어요'}
        </Paragraph>
        <Spacing size={24} />

        {historyContracts.length > 0 && (
          <List>
            {historyContracts.map(c => {
              const b = badgeFor(c.status);
              const dateLabel = c.end_date
                ? `${c.start_date} ~ ${c.end_date}`
                : c.start_date;

              return (
                <ListRow
                  key={c.id}
                  onClick={() => navigate(`/employer/contracts/${c.id}`)}
                  aria-label={`${c.worker_name} 계약 상세`}
                  contents={
                    <div className={styles.contractRow}>
                      <Paragraph typography="st5" fontWeight="bold">{c.worker_name}</Paragraph>
                      <Paragraph typography="st7" color="grey-500">
                        {c.workplace} · {dateLabel}
                      </Paragraph>
                    </div>
                  }
                  right={
                    <Badge size="small" variant="fill" color={b.color}>
                      {b.label}
                    </Badge>
                  }
                />
              );
            })}
          </List>
        )}

        <Spacing size={40} />
      </div>
    </div>
  );
}
