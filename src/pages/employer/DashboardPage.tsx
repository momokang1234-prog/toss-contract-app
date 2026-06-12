import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useContracts } from '../../hooks/useContracts';
import { ContractCard } from '../../components/contract/ContractCard';
import { Top, Paragraph, Spacing, Button, GridList, Badge, Text } from '@toss/tds-mobile';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { contracts } = useContracts();
  const { setRole } = useAuth();

  const totalCount = contracts.length;
  const inProgress = contracts.filter(c => c.status === 'sent' || c.status === 'viewed').length;
  const signedCount = contracts.filter(c => c.status === 'signed' || c.status === 'completed').length;
  const recent = contracts.slice(0, 5);

  return (
    <div className={styles.page}>
      <Top title="내 사업장" />

      <div className={styles.hero}>
        <Paragraph typography="st1" fontWeight="bold" style={{ marginBottom: 4 }}>
          근로계약서
        </Paragraph>
        <Paragraph typography="st1" fontWeight="bold" style={{ marginBottom: 16 }}>
          한눈에 확인해요
        </Paragraph>
        <Paragraph typography="st4" color="grey-500">
          작성부터 서명까지 토스에서 간편하게
        </Paragraph>
      </div>

      <Spacing size={36} />

      <div className={styles.stats}>
        <GridList column={3}>
          <div className={styles.statCardA}>
            <div style={{ marginBottom: 8 }}>
              <Text typography="t4" fontWeight="bold">{totalCount}</Text>
              <Text typography="st6" color="grey-500" style={{ marginLeft: 2 }}>건</Text>
            </div>
            <Paragraph typography="st7" color="grey-500">전체 계약</Paragraph>
          </div>
          <div className={styles.statCardA}>
            <div style={{ marginBottom: 8 }}>
              <Text typography="t4" fontWeight="bold">{inProgress}</Text>
              <Text typography="st6" color="grey-500" style={{ marginLeft: 2 }}>건</Text>
            </div>
            <Badge size="small" variant="fill" color="blue">진행 중</Badge>
          </div>
          <div className={styles.statCardA}>
            <div style={{ marginBottom: 8 }}>
              <Text typography="t4" fontWeight="bold">{signedCount}</Text>
              <Text typography="st6" color="grey-500" style={{ marginLeft: 2 }}>건</Text>
            </div>
            <Badge size="small" variant="fill" color="green">계약 완료</Badge>
          </div>
        </GridList>
      </div>

      <Spacing size={32} />

      <div className={styles.actions}>
        <Button
          color="primary"
          variant="fill"
          display="block"
          size="xlarge"
          onClick={() => navigate('/employer/contracts/new')}
        >
          새 계약서 작성
        </Button>
        <Spacing size={12} />
        <Button
          color="primary"
          variant="weak"
          display="block"
          size="xlarge"
          onClick={() => navigate('/employer/contracts')}
        >
          계약서 목록 보기
        </Button>
      </div>

      <Spacing size={40} />

      {recent.length > 0 && (
        <div className={styles.section}>
          <Paragraph typography="st4" fontWeight="bold">
            최근 계약서
          </Paragraph>
          <Spacing size={12} />
          {recent.map(c => (
            <div key={c.id} onClick={() => navigate(`/employer/contracts/${c.id}`)}>
              <ContractCard contract={c} />
            </div>
          ))}
        </div>
      )}

      {contracts.length === 0 && (
        <div className={styles.emptyState}>
          <Spacing size={40} />
          <img src="https://static.toss.im/2d-emojis/png/4x/u1F4CB.png" alt="" style={{ width: 80, height: 80, marginBottom: 12 }} />
          <Spacing size={16} />
          <Paragraph typography="st4" color="grey-500">
            아직 작성한 계약서가 없어요
          </Paragraph>
          <Spacing size={8} />
          <Paragraph typography="st6" color="grey-500">
            새 계약서를 작성해서 근로자에게 보내보세요
          </Paragraph>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
        <Button color="dark" variant="weak" size="small"
          onClick={async () => { await setRole('worker'); navigate('/worker/contracts', { replace: true }); }}>
          🔄 근로자로 전환
        </Button>
      </div>
    </div>
  );
}
