import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContracts, type Contract } from '../../hooks/useContracts';
import { Spacing, Paragraph, Button } from '@toss/tds-mobile';

interface HistoryEntry {
  id: string;
  contract_id: string;
  action: string;
  actor_role: string;
  created_at: string;
}

const ACTION_LABELS: Record<string, string> = {
  created: '계약서 작성',
  sent: '근로자에게 전송',
  viewed: '근로자가 확인',
  signed: '근로자 서명 완료',
  completed: '계약 확정',
  cancelled: '계약 취소',
  expired: '계약 만료',
};

const ROLE_LABELS: Record<string, string> = {
  employer: '사장님',
  worker: '근로자',
};

export default function ContractHistoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getContract, getHistory } = useContracts();
  const [contract, setContract] = useState<Contract | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getContract(id),
      getHistory(id),
    ]).then(([c, h]) => {
      setContract(c);
      setHistory(h);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <div style={{ padding: 24, textAlign: 'center', color: '#6B7684' }}>로딩 중...</div>;
  }

  if (!contract) {
    return <div style={{ padding: 24, textAlign: 'center', color: '#6B7684' }}>계약을 찾을 수 없습니다.</div>;
  }

  return (
    <div style={{ padding: 24, maxWidth: 480, margin: '0 auto', paddingBottom: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Paragraph typography="st3" fontWeight="bold">계약 이력</Paragraph>
        <Button
          color="primary"
          variant="weak"
          size="small"
          onClick={() => navigate(-1)}
        >
          뒤로
        </Button>
      </div>

      <Spacing size={8} />

      <div style={{ marginBottom: 24 }}>
        <Paragraph typography="st3" fontWeight="bold" style={{ margin: 0 }}>{contract.worker_name}</Paragraph>
        <Paragraph typography="st6" color="grey500" style={{ margin: '4px 0 0 0' }}>{contract.job_description}</Paragraph>
      </div>

      <Spacing size={16} />

      {history.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#8B95A1', padding: 40 }}>
          아직 이력이 없습니다.
        </div>
      ) : (
        <div style={{ position: 'relative', paddingLeft: 28 }}>
          {/* Vertical timeline line */}
          <div
            style={{
              position: 'absolute',
              left: 8,
              top: 0,
              bottom: 0,
              width: 2,
              backgroundColor: '#E5E8EB',
            }}
          />

          {history.map((entry, index) => (
            <div key={entry.id} style={{ position: 'relative', marginBottom: 24 }}>
              {/* Timeline dot */}
              <div
                style={{
                  position: 'absolute',
                  left: -20,
                  top: 4,
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: index === 0 ? '#3182F6' : '#E5E8EB',
                  border: '2px solid #FFFFFF',
                  zIndex: 1,
                }}
              />

              {/* Content */}
              <div>
                <Paragraph typography="st5" fontWeight="bold" style={{ margin: 0, color: '#191F28' }}>
                  {ACTION_LABELS[entry.action] ?? entry.action}
                </Paragraph>
                <Paragraph typography="st6" color="grey500" style={{ margin: '4px 0 0 0' }}>
                  {ROLE_LABELS[entry.actor_role] ?? entry.actor_role} · {new Date(entry.created_at).toLocaleString('ko-KR')}
                </Paragraph>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
