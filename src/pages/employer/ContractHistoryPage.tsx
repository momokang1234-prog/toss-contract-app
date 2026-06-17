import { useNavigate } from 'react-router-dom';
import { CommentBoundary } from '../dev/CommentBoundary';
import { useContracts } from '../../hooks/useContracts';
import { Top, Paragraph, Spacing, Badge, List, ListRow } from '@toss/tds-mobile';
import styles from './ContractHistoryPage.module.css';
import { getContractBadge } from '../../utils/badgeUtils';

const HISTORY_STATUSES: Record<string, true> = { completed: true, cancelled: true, expired: true };

export default function ContractHistoryPage() {
  const navigate = useNavigate();
  const { contracts, loading } = useContracts();

  const historyContracts = contracts.filter(c => HISTORY_STATUSES[c.status]);

  return (
    <div className={styles.page}>
      <Top title="계약 이력" />
      <div className={styles.content}>
        <Spacing size={24} />
        <CommentBoundary name="계약-이력-목록">
          <Paragraph typography="t3" fontWeight="bold">계약 이력</Paragraph>
          <Spacing size={12} />
          <Paragraph typography="t5" color="grey-500">
            {loading
              ? '불러오는 중...'
              : historyContracts.length > 0
                ? `완료·취소·만료된 계약 ${historyContracts.length}건`
                : '완료·취소·만료된 계약이 없어요'}
          </Paragraph>
          <Spacing size={32} />

          {historyContracts.length > 0 && (
            <List>
              {historyContracts.map(c => {
                const b = getContractBadge(c.status);
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
                        <Paragraph typography="t5" fontWeight="bold" color="grey-800">{c.worker_name}</Paragraph>
                        <Spacing size={4} />
                        <Paragraph typography="t7" color="grey-500">
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
        </CommentBoundary>

        <Spacing size={40} />
      </div>
    </div>
  );
}
