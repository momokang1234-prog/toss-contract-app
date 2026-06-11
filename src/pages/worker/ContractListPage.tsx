import { useNavigate } from 'react-router-dom';
import { useContracts } from '../../hooks/useContracts';
import { useAuth } from '../../contexts/AuthContext';
import { Top, Paragraph, Spacing, Button, List, ListRow, Badge } from '@toss/tds-mobile';
import styles from './ContractListPage.module.css';


export default function WorkerContractListPage() {
  const navigate = useNavigate();
  const { contracts } = useContracts();
  const { setRole } = useAuth();

  const badgeFor = (status: string) => {
    if (status === 'sent') return { label: '미열람', color: 'blue' as const };
    if (status === 'viewed') return { label: '확인완료', color: 'blue' as const };
    if (status === 'signed') return { label: '서명완료', color: 'yellow' as const };
    if (status === 'completed') return { label: '계약완료', color: 'teal' as const };
    return { label: status, color: 'elephant' as const };
  };

  return (
    <div className={styles.page}>
      <Top title="내 계약 목록" />
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
              <ListRow key={c.id}
                onClick={() => navigate(`/worker/contracts/${c.id}`)}
                left={
                  <div className={styles.contractRow}>
                    <Paragraph typography="st5" fontWeight="bold">{c.workplace}</Paragraph>
                    <Paragraph typography="st7" color="grey-500">{c.job_description} · {c.start_date}</Paragraph>
                  </div>
                }
                right={<Badge size="small" variant="weak" color={badgeFor(c.status).color}>{badgeFor(c.status).label}</Badge>}
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

      <div style={{ display: 'flex', justifyContent: 'center', padding: '0 24px 24px' }}>
        <Button color="light" variant="weak" size="small"
          onClick={async () => { await setRole('employer'); navigate('/employer/dashboard', { replace: true }); }}>
          🔄 사장님으로 전환
        </Button>
      </div>
    </div>
  );
}
