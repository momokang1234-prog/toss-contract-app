import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useContracts } from '../../hooks/useContracts';
import { ContractCard } from '../../components/contract/ContractCard';
import { Top, Paragraph, Spacing, Button, GridList } from '@toss/tds-mobile';
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

      <div style={{ position: 'relative' }}>
        <img
          src="https://static.toss.im/lotties/point-blue2.png" alt=""
          style={{ position: 'absolute', top: -20, right: -10, width: 140, height: 140, opacity: 0.25, pointerEvents: 'none' }}
        />
        <img
          src="https://static.toss.im/lotties/point-purple2.png" alt=""
          style={{ position: 'absolute', bottom: -10, right: 20, width: 100, height: 100, opacity: 0.2, pointerEvents: 'none' }}
        />
        <div className={styles.hero}>
          <Paragraph typography="st1" fontWeight="bold">
            근로계약서
          </Paragraph>
          <Paragraph typography="st1" fontWeight="bold">
            한눈에 확인해요
          </Paragraph>
          <Spacing size={12} />
          <Paragraph typography="st4" color="grey-500">
            작성부터 서명까지 토스에서 간편하게
          </Paragraph>
        </div>
      </div>

      <Spacing size={36} />

      <div className={styles.stats}>
        <GridList column={3}>
          <div className={styles.statCardA}>
            <Paragraph typography="st2" fontWeight="bold">{totalCount}<Paragraph typography="st6" color="grey-500" display="inline">건</Paragraph></Paragraph>
            <Paragraph typography="st7" color="grey-500">전체 계약</Paragraph>
          </div>
          <div className={styles.statCardA}>
            <Paragraph typography="st2" fontWeight="bold">{inProgress}<Paragraph typography="st6" color="grey-500" display="inline">건</Paragraph></Paragraph>
            <Paragraph typography="st7" color="grey-500">진행 중</Paragraph>
          </div>
          <div className={styles.statCardA}>
            <Paragraph typography="st2" fontWeight="bold">{signedCount}<Paragraph typography="st6" color="grey-500" display="inline">건</Paragraph></Paragraph>
            <Paragraph typography="st7" color="grey-500">서명 완료</Paragraph>
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
          color="light"
          variant="fill"
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
        <Button color="light" variant="weak" size="small"
          onClick={async () => { await setRole('worker'); navigate('/worker/contracts', { replace: true }); }}>
          🔄 근로자로 전환
        </Button>
      </div>
    </div>
  );
}