import { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useContracts } from '../../hooks/useContracts';
import { Top, Paragraph, Spacing, Badge } from '@toss/tds-mobile';
import { getContractBadge } from '../../utils/badgeUtils';
import styles from './ContractTimelinePage.module.css';

const ACTION_LABEL: Record<string, string> = {
  create:   '계약서 작성',
  send:     '근로자에게 전송',
  view:     '근로자가 열람',
  sign:     '근로자가 서명',
  complete: '계약 확정',
  cancel:   '계약 취소',
  expire:   '유효 기간 만료',
  reject:   '수정 요청',
};

const ACTOR_LABEL: Record<string, string> = {
  employer: '사장님',
  worker:   '근로자',
  system:   '시스템',
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

interface HistoryEvent {
  id: string;
  contract_id: string;
  action: string;
  actor_role: string;
  created_at: string;
}

export default function ContractTimelinePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getContract, getHistory } = useContracts();
  const [workerName, setWorkerName] = useState('');
  const [status, setStatus] = useState('');
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([getContract(id), getHistory(id)]).then(([contract, history]) => {
      if (contract) {
        setWorkerName(contract.worker_name);
        setStatus(contract.status);
      }
      setEvents(history ?? []);
      setLoading(false);
    });
  }, [id]);

  if (!id) return <Navigate to="/employer/dashboard" replace />;

  const b = status ? getContractBadge(status) : null;

  return (
    <div className={styles.page}>
      <Top title={workerName || '계약 이력'}>
        {b && <Badge size="small" variant="weak" color={b.color}>{b.label}</Badge>}
      </Top>

      <div style={{ padding: '0 24px' }}>
        <Paragraph typography="t3" fontWeight="bold">계약 진행 이력</Paragraph>
        <Spacing size={8} />
        <Paragraph typography="t6" color="grey-500">계약의 상태 변화를 시간순으로 보여드려요</Paragraph>
        <Spacing size={32} />

        {loading && <Paragraph typography="t5" color="grey-500">불러오는 중...</Paragraph>}

        {!loading && events.length === 0 && (
          <Paragraph typography="t5" color="grey-500">이력이 없습니다.</Paragraph>
        )}

        {!loading && events.length > 0 && (
          <div className={styles.timeline}>
            {events.map((ev, i) => (
              <div key={ev.id} className={styles.item}>
                <div className={styles.dotCol}>
                  <div className={styles.dot} />
                  {i < events.length - 1 && <div className={styles.line} />}
                </div>
                <div className={styles.body}>
                  <Paragraph typography="t5" fontWeight="bold" color="grey-800">
                    {ACTION_LABEL[ev.action] ?? ev.action}
                  </Paragraph>
                  <Spacing size={4} />
                  <Paragraph typography="t7" color="grey-500">
                    {ACTOR_LABEL[ev.actor_role] ?? ev.actor_role} · {formatDate(ev.created_at)}
                  </Paragraph>
                </div>
              </div>
            ))}
          </div>
        )}

        <Spacing size={40} />
      </div>
    </div>
  );
}
