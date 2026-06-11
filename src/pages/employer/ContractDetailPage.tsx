import { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useContracts, type Contract } from '../../hooks/useContracts';
import { Top, Paragraph, Spacing, Button, Badge } from '@toss/tds-mobile';
import SendContractSheet from '../../components/delivery/SendContractSheet';
import styles from './ContractDetailPage.module.css';

export default function ContractDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getContract, sendContract, completeContract, cancelContract } = useContracts();
  const [contract, setContract] = useState<Contract | null>(null);
  const [sending, setSending] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [showSheet, setShowSheet] = useState(false);

  useEffect(() => {
    if (!id) { setError('계약서 ID가 없습니다'); return; }
    getContract(id).then(c => {
      if (!c) setError('계약서를 찾을 수 없습니다');
      else setContract(c);
    }).catch(() => setError('불러오기에 실패했습니다'));
  }, [id]);

  const badgeFor = (s: string) => {
    if (s === 'draft') return { label: '작성중', color: 'elephant' as const };
    if (s === 'sent' || s === 'viewed') return { label: '진행중', color: 'blue' as const };
    if (s === 'signed') return { label: '서명완료', color: 'yellow' as const };
    if (s === 'completed') return { label: '계약완료', color: 'teal' as const };
    return { label: s, color: 'elephant' as const };
  };

  if (!id) return <Navigate to="/employer/dashboard" replace />;

  if (error) {
    return (
      <div className={styles.page}>
        <Top title="계약서" />
        <div className={styles.center}>
          <Spacing size={40} />
          <Paragraph typography="st4" color="grey-600">{error}</Paragraph>
          <Spacing size={16} />
          <Button color="primary" variant="weak" size="large"
            onClick={() => navigate('/employer/dashboard')}>대시보드로</Button>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className={styles.page}>
        <Top title="계약서" />
        <div className={styles.center}>
          <Spacing size={24} />
          <Paragraph typography="st5" color="grey-500">불러오는 중...</Paragraph>
        </div>
      </div>
    );
  }

  const b = badgeFor(contract.status);
  const canSend = contract.status === 'draft';
  const canComplete = contract.status === 'signed';

  const wageLabel = { hourly: '시급', daily: '일급', weekly: '주급', monthly: '월급' }[contract.wage_type] || contract.wage_type;
  const payLabel = { bankTransfer: '계좌이체', cash: '현금', mixed: '혼합' }[contract.wage_payment_method] || contract.wage_payment_method;
  const days = { mon: '월', tue: '화', wed: '수', thu: '목', fri: '금', sat: '토', sun: '일' };
  const dayStr = contract.work_days.map(d => days[d as keyof typeof days] || d).join(', ');

  return (
    <div className={styles.page}>
      <Top title={contract.worker_name}>
        <Badge size="small" variant="weak" color={b.color}>{b.label}</Badge>
      </Top>

      <div className={styles.content}>
        <Spacing size={24} />

        {/* Preview card */}
        <div className={styles.card}>
          <Paragraph typography="st2" fontWeight="bold">근로계약서</Paragraph>
          <Spacing size={24} />

          <Section title="근로자" />
          <Row label="이름" value={contract.worker_name} />
          <Row label="연락처" value={contract.worker_phone} />

          <Section title="근로조건" />
          <Row label="계약 유형" value={contract.contract_type === 'fullTime' ? '정규직' : contract.contract_type === 'partTime' ? '단시간' : '기간제'} />
          <Row label="근무 장소" value={contract.workplace} />
          <Row label="직무" value={contract.job_description} />
          <Row label="시작일" value={contract.start_date} />
          {contract.end_date && <Row label="종료일" value={contract.end_date} />}

          <Section title="임금" />
          <Row label="급여 형태" value={wageLabel} />
          <Row label="기본급" value={`${contract.base_wage.toLocaleString()}원`} />
          <Row label="지급 방식" value={payLabel} />
          <Row label="지급일" value={contract.wage_payment_date} />

          <Section title="근무시간" />
          <Row label="근무 요일" value={dayStr} />
          <Row label="근무 시간" value={`${contract.start_time} ~ ${contract.end_time}`} />
          <Row label="휴게시간" value={`${contract.break_minutes}분`} />
          {contract.weekly_holiday && (
            <Row label="주휴일" value={days[contract.weekly_holiday as keyof typeof days] || contract.weekly_holiday} />
          )}

          <Section title="기타 근로조건" />
          <Row label="연차유급휴가" value={contract.paid_leave_clause ? '근로기준법에 따름' : '미포함'} />
          <Row label="사회보험" value={contract.social_insurance_clause ? '4대보험 적용' : '미적용'} />
          <Row label="퇴직금" value={contract.severance_clause ? '퇴직급여 보장법에 따름' : '해당 없음'} />

          {/* Signature */}
          {contract.worker_signature_data && (
            <>
              <Spacing size={24} />
              <div className={styles.divider} />
              <Spacing size={20} />
              <Paragraph typography="st4" fontWeight="bold">근로자 서명</Paragraph>
              <Spacing size={12} />
              <img src={contract.worker_signature_data} alt="서명" className={styles.sig} />
              {contract.worker_signed_at && (
                <>
                  <Spacing size={8} />
                  <Paragraph typography="st7" color="grey-500">
                    {new Date(contract.worker_signed_at).toLocaleString('ko-KR')}
                  </Paragraph>
                </>
              )}
            </>
          )}
        </div>

        <Spacing size={24} />

        {/* Actions */}
        {canSend && (
          <>
            <Button color="primary" variant="fill" display="block" size="large"
              onClick={() => setShowSheet(true)}
              disabled={sending}>{sending ? '전송 중...' : '근로자에게 전송'}</Button>
            <Spacing size={12} />
            <Button color="light" variant="weak" display="block" size="large"
              onClick={async () => {
                if (!confirm('계약을 취소하시겠습니까?\n\n되돌릴 수 없습니다.')) return;
                try { const u = await cancelContract(id); setContract(u); }
                catch { alert('취소 처리에 실패했습니다'); }
              }}>계약 취소하기</Button>
          </>
        )}
        {(contract.status === 'sent' || contract.status === 'viewed') && (
          <Button color="light" variant="weak" display="block" size="large"
            onClick={async () => {
              if (!confirm('계약을 취소하시겠습니까?\n\n되돌릴 수 없습니다.')) return;
              try { const u = await cancelContract(id); setContract(u); }
              catch { alert('취소 처리에 실패했습니다'); }
            }}>계약 취소하기</Button>
        )}
        {canComplete && (
          <Button color="primary" variant="fill" display="block" size="large"
            onClick={async () => {
              if (!confirm('계약을 확정하시겠습니까?\n\n완료된 계약은 변경할 수 없습니다.')) return;
              setCompleting(true);
              try { const u = await completeContract(id); setContract(u); }
              catch { alert('확정 실패'); }
              finally { setCompleting(false); }
            }}
            disabled={completing}>{completing ? '확정 중...' : '계약 확정하기'}</Button>
        )}
        {contract.status === 'completed' && (
          <>
            <div style={{
              backgroundColor: '#E8F5E9', borderRadius: 8, padding: 16, marginBottom: 12,
              textAlign: 'center', border: '1px solid #C8E6C9',
            }}>
              <Paragraph typography="st5" fontWeight="bold" color="grey-800">🎉 계약이 확정되었습니다</Paragraph>
              <Spacing size={4} />
              <Paragraph typography="st7" color="grey-600">완료된 계약은 수정할 수 없습니다</Paragraph>
            </div>
            <Button color="primary" variant="fill" display="block" size="large"
              onClick={() => { alert('PDF 다운로드 기능은 추후 제공됩니다 (utils/pdf.ts 연결 필요)'); }}>
              📥 PDF 다운로드
            </Button>
          </>
        )}
        {contract.status === 'cancelled' && (
          <div style={{
            backgroundColor: '#FFEBEE', borderRadius: 8, padding: 16,
            textAlign: 'center', border: '1px solid #FFCDD2',
          }}>
            <Paragraph typography="st5" fontWeight="bold" color="grey-800">🚫 취소된 계약입니다</Paragraph>
            <Spacing size={4} />
            <Paragraph typography="st7" color="grey-600">이 계약은 더 이상 진행할 수 없습니다</Paragraph>
          </div>
        )}
        {contract.status === 'expired' && (
          <div style={{
            backgroundColor: '#ECEFF1', borderRadius: 8, padding: 16,
            textAlign: 'center', border: '1px solid #CFD8DC',
          }}>
            <Paragraph typography="st5" fontWeight="bold" color="grey-800">⏰ 유효 기간이 만료되었습니다</Paragraph>
            <Spacing size={4} />
            <Paragraph typography="st7" color="grey-600">계약 유효 기간을 확인해주세요</Paragraph>
          </div>
        )}

        {/* Secondary actions */}
        <Spacing size={12} />
        <Button color="light" variant="weak" display="block" size="large"
          onClick={() => navigate(`/employer/contracts/${id}/history`)}>
          계약 이력 보기
        </Button>
      </div>

      {showSheet && contract && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }} onClick={() => setShowSheet(false)}>
          <div style={{
            background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 480,
          }} onClick={e => e.stopPropagation()}>
            <SendContractSheet
              contractTitle={contract.worker_name}
              deepLink={`${window.location.origin}/contract/${id}`}
              onSend={async () => {
                try { const u = await sendContract(id); setContract(u); setShowSheet(false); }
                catch { alert('전송에 실패했습니다'); }
              }}
              onCancel={() => setShowSheet(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title }: { title: string }) {
  return (
    <>
      <Spacing size={20} />
      <Paragraph typography="st3" fontWeight="bold">{title}</Paragraph>
      <Spacing size={12} />
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.row}>
      <Paragraph typography="st6" color="grey-500">{label}</Paragraph>
      <Paragraph typography="st5">{value}</Paragraph>
    </div>
  );
}
