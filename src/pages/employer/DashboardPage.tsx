import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Analytics } from '@apps-in-toss/web-framework';
import { useAuth } from '../../contexts/AuthContext';
import { useContracts } from '../../hooks/useContracts';
import { useBusiness } from '../../hooks/useBusiness';
import { Top, Paragraph, Spacing, Button, Text, BottomSheet } from '@toss/tds-mobile';
import styles from './DashboardPage.module.css';
import { LoadingState } from '../../components/shared/LoadingState';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { contracts } = useContracts();
  const { businesses, loading, error: businessError, refetch } = useBusiness();
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
    return <LoadingState message="사업장 정보를 불러오는 중..." />;
  }

  // 비즈니스 데이터 로드 실패 시 에러 표시
  if (businessError) {
    return (
      <div className={styles.page}>
        <Top title="대시보드" />
        <div className={styles.content}>
          <div className={styles.empty}>
            <img src="https://static.toss.im/2d-emojis/png/4x/u1F514.png" alt=""
              style={{ width: 72, height: 72 }}
            />
            <Spacing size={16} />
            <Paragraph typography="t5" color="grey-600" fontWeight="bold">
              사업장 정보를 불러오지 못했어요
            </Paragraph>
            <Spacing size={8} />
            <Paragraph typography="t7" color="grey-500">
              네트워크 연결을 확인하고 다시 시도해주세요
            </Paragraph>
            <Spacing size={24} />
            <Button color="primary" variant="weak" size="large" onClick={refetch}>
              다시 시도
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const selectedBusiness = businesses.find(b => b.id === selectedBusinessId) || businesses[0];
  const businessContracts = contracts.filter(c => c.business_id === selectedBusiness.id);

  const inProgressCount = businessContracts.filter(c => c.status === 'sent' || c.status === 'viewed').length;
  const signedCount = businessContracts.filter(c => c.status === 'signed' || c.status === 'completed').length;
  
  const templates = businessContracts.filter(c => c.status === 'template');

  // 진행 중인 계약 최상단 노출
  const pendingContracts = businessContracts.filter(c => c.status === 'sent' || c.status === 'viewed').slice(0, 3);
  
  // 진행 중인 계약이 없다면 가장 최근 계약들
  const recentContracts = pendingContracts.length > 0 
    ? pendingContracts 
    : businessContracts.filter(c => c.status !== 'template').slice(0, 3);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'sent':
      case 'viewed': return <div className={styles.badgeBlue}>서명 대기</div>;
      case 'signed':
      case 'completed': return <div className={styles.badgeGreen}>완료</div>;
      case 'template': return <div className={styles.badgeGrey}>양식</div>;
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

      {templates.length > 0 && (
        <div className={styles.urgentList} style={{ marginBottom: 16 }}>
          <Paragraph typography="t4" fontWeight="bold" style={{ marginBottom: '16px' }}>
            내 양식함
          </Paragraph>
          {templates.map(t => (
            <div key={t.id} className={styles.contractRow} onClick={() => navigate(`/employer/contracts/new?templateId=${t.id}`)}>
              <div>
                <Paragraph typography="t5" fontWeight="bold">{t.template_name || '이름 없는 양식'}</Paragraph>
                <Spacing size={4} />
                <Paragraph typography="t7" color="grey-500">이 양식으로 새 계약서 작성하기</Paragraph>
              </div>
              <div style={{ color: '#3182f6', fontSize: 20 }}>+</div>
            </div>
          ))}
        </div>
      )}

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
