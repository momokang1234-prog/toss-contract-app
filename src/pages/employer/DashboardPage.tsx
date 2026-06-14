import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Analytics } from '@apps-in-toss/web-framework';
import { useAuth } from '../../contexts/AuthContext';
import { useContracts } from '../../hooks/useContracts';
import { useBusiness } from '../../hooks/useBusiness';
import { Top, Paragraph, Spacing, Button, Text, BottomSheet } from '@toss/tds-mobile';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { contracts } = useContracts();
  const { businesses, loading } = useBusiness();
  const { setRole } = useAuth();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);

  useEffect(() => {
    // 최초 로그인 시 (등록된 사업장이 하나도 없을 때) 사업장 등록 페이지로 강제 이동
    if (!loading && businesses.length === 0) {
      navigate('/employer/business/new', { replace: true });
    }
  }, [loading, businesses.length, navigate]);

  useEffect(() => {
    if (businesses.length > 0 && !selectedBusinessId) {
      setSelectedBusinessId(businesses[0].id);
    }
  }, [businesses, selectedBusinessId]);

  // 로딩 중이거나, 등록된 사업장이 없어서 리다이렉트 될 예정이라면 화면을 그리지 않음 (깜빡임 방지)
  if (loading || businesses.length === 0) {
    return null;
  }

  const selectedBusiness = businesses.find(b => b.id === selectedBusinessId) || businesses[0];
  const businessContracts = contracts.filter(c => c.business_id === selectedBusiness.id);

  const inProgressCount = businessContracts.filter(c => c.status === 'sent' || c.status === 'viewed').length;
  const signedCount = businessContracts.filter(c => c.status === 'signed' || c.status === 'completed').length;
  
  // 진행 중인 계약 최상단 노출
  const pendingContracts = businessContracts.filter(c => c.status === 'sent' || c.status === 'viewed').slice(0, 3);
  
  // 진행 중인 계약이 없다면 가장 최근 계약들
  const recentContracts = pendingContracts.length > 0 ? pendingContracts : businessContracts.slice(0, 3);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'sent':
      case 'viewed': return <div className={styles.badgeBlue}>서명 대기</div>;
      case 'signed':
      case 'completed': return <div className={styles.badgeGreen}>완료</div>;
      default: return <div className={styles.badgeGrey}>{status}</div>;
    }
  };

  const getRelativeTimeString = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60));
    if (diffHours < 24) {
      return diffHours === 0 ? '방금 전' : `${diffHours}시간 전`;
    }
    return `${Math.floor(diffHours / 24)}일 전`;
  };

  return (
    <div className={styles.page}>
      <Top title="" />
      
      {businesses.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '24px' }}>
          <div 
            className={styles.businessSelector}
            onClick={() => {
              Analytics.click({ 
                log_name: 'dashboard_my_business_click',
                business_id: selectedBusiness.id
              });
              setIsSheetOpen(true);
            }}
          >
            🏢 {selectedBusiness.business_name} <span style={{ color: '#b0b8c1', fontSize: '12px' }}>▼</span>
          </div>
          <Text typography="t6" color="grey-500" style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => navigate('/employer/business/manage')}>
            관리
          </Text>
        </div>
      )}

      <BottomSheet 
        open={isSheetOpen} 
        onClose={() => setIsSheetOpen(false)}
        header={<BottomSheet.Header>사업장 선택</BottomSheet.Header>}
      >
        <BottomSheet.Select
          options={businesses.map(b => ({ name: b.business_name, label: b.business_name, value: b.id }))}
          value={selectedBusiness.id}
          onChange={(val: any) => {
            setSelectedBusinessId(val?.target?.value || val);
            setIsSheetOpen(false);
          }}
        />
      </BottomSheet>

      <div className={styles.floatingCardContainer}>
        <div className={styles.floatingCard} onClick={() => navigate('/employer/contracts/new')}>
          <Paragraph typography="t5" fontWeight="bold" style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '4px' }}>
            새 직원이 왔나요?
          </Paragraph>
          <Paragraph typography="t3" fontWeight="bold" style={{ color: 'white' }}>
            3분 만에 근로계약서<br/>작성하고 보내기
          </Paragraph>
          <button className={styles.floatingButton}>
            시작하기
          </button>
        </div>
      </div>

      <div className={styles.statGrid}>
        <div className={styles.statBox}>
          <Paragraph typography="t6" color="grey-600" style={{ marginBottom: '12px' }}>진행 중인 계약</Paragraph>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
            <Text typography="t3" color="primary" fontWeight="bold">{inProgressCount}</Text>
            <Text typography="t5" color="grey-800" fontWeight="bold" style={{ paddingBottom: '2px' }}>건</Text>
          </div>
        </div>
        <div className={styles.statBox}>
          <Paragraph typography="t6" color="grey-600" style={{ marginBottom: '12px' }}>완료된 계약</Paragraph>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
            <Text typography="t3" color="grey-900" fontWeight="bold">{signedCount}</Text>
            <Text typography="t5" color="grey-800" fontWeight="bold" style={{ paddingBottom: '2px' }}>건</Text>
          </div>
        </div>
      </div>

      {recentContracts.length > 0 ? (
        <div className={styles.urgentList}>
          <Paragraph typography="t4" fontWeight="bold" style={{ marginBottom: '16px' }}>
            {pendingContracts.length > 0 ? '서명 대기 중' : '최근 계약서'}
          </Paragraph>
          
          {recentContracts.map(c => (
            <div key={c.id} className={styles.contractRow} onClick={() => navigate(`/employer/contracts/${c.id}`)}>
              <div>
                <Paragraph typography="t5" fontWeight="bold">{c.worker_name || '이름 없음'}</Paragraph>
                <Spacing size={4} />
                <Paragraph typography="t7" color="grey-500">{getRelativeTimeString(c.updated_at)} 전송</Paragraph>
              </div>
              {getStatusBadge(c.status)}
            </div>
          ))}
          
          <Spacing size={16} />
          <Button color="dark" variant="weak" display="block" size="large" onClick={() => navigate('/employer/contracts')}>
            계약서 목록 전체보기
          </Button>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <Paragraph typography="t5" color="grey-600" fontWeight="bold">아직 작성한 계약서가 없어요</Paragraph>
          <Spacing size={8} />
          <Paragraph typography="t6" color="grey-500">새 계약서를 작성해서 근로자에게 보내보세요</Paragraph>
        </div>
      )}

      <Spacing size={40} />
      <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
        <Button color="dark" variant="weak" size="small"
          onClick={async () => { await setRole('worker'); navigate('/worker/contracts', { replace: true }); }}>
          🔄 근로자로 전환 (디버그용)
        </Button>
      </div>
    </div>
  );
}
