import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useContracts } from '../../hooks/useContracts';
import { Top, Paragraph, Spacing, Badge, List, ListRow } from '@toss/tds-mobile';
import styles from './ContractHistoryPage.module.css';

const ACTION_LABELS: Record<string,string> = {
  create:'작성', send:'전송', view:'열람', sign:'서명', complete:'확정', cancel:'취소', expire:'만료'
};
const ROLE_LABELS: Record<string,string> = { employer:'사장님', worker:'근로자' };

interface HistoryEntry {
  id:string; contract_id:string; action:string; actor_role:string; created_at:string;
}

export default function ContractHistoryPage() {
  const { id = '' } = useParams();
  const { getHistory } = useContracts();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistory(id).then(setEntries).finally(() => setLoading(false));
  }, [id]);

  return (
    <div className={styles.page}>
      <Top title="계약 이력" />
      <div className={styles.content}>
        <Spacing size={24} />
        <Paragraph typography="st2" fontWeight="bold">계약 이력</Paragraph>
        <Spacing size={8} />
        <Paragraph typography="st5" color="grey-500">
          {loading ? '불러오는 중...' : entries.length > 0 ? `총 ${entries.length}건의 변경 기록` : '아직 기록이 없어요'}
        </Paragraph>
        <Spacing size={24} />

        {entries.length > 0 && (
          <List>
            {entries.map(e => (
              <ListRow key={e.id}
                left={
                  <div className={styles.entryRow}>
                    <Paragraph typography="st5" fontWeight="bold">{ACTION_LABELS[e.action] || e.action}</Paragraph>
                    <Paragraph typography="st7" color="grey-500">
                      {ROLE_LABELS[e.actor_role] || e.actor_role} · {new Date(e.created_at).toLocaleString('ko-KR')}
                    </Paragraph>
                  </div>
                }
                right={<Badge size="small" variant="weak" color="elephant">{e.action}</Badge>}
              />
            ))}
          </List>
        )}
        <Spacing size={40} />
      </div>
    </div>
  );
}
