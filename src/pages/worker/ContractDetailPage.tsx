import { useEffect, useState } from 'react';
import { supabase, IS_MOCK } from '../../api/supabase';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useContracts, type Contract } from '../../hooks/useContracts';
import { Top, Paragraph, Spacing, Button, Badge, TextField, ListRow, BottomSheet } from '@toss/tds-mobile';
import { CONTRACT_TYPE_LABEL, WAGE_TYPE_LABEL, WORK_DAY_LABEL } from '../../utils/labels';
import styles from './ContractDetailPage.module.css';

export default function WorkerContractDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getContract, viewContract, rejectContract } = useContracts();
  const [contract, setContract] = useState<Contract | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [account, setAccount] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  useEffect(() => {
    if (!id) { setError('계약서 ID가 없습니다'); return; }
    getContract(id).then(c => {
      if (!c) setError('계약서를 찾을 수 없습니다');
      else {
        setContract(c);
        if (c.status === 'sent') viewContract(id).then(u => setContract(u));
      }
    }).catch(() => setError('불러오기에 실패했습니다'));
  }, [id]);

  // Realtime: 페이지 열려 있는 동안 계약 상태 변경 자동 반영
  useEffect(() => {
    if (!id || IS_MOCK) return;
    const channel = supabase
      .channel(`worker-contract-${id}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'contracts', filter: `id=eq.${id}` },
        (payload) => { setContract(payload.new as Contract); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  if (!id) return <Navigate to="/worker/contracts" replace />;
  if (error) return <div className={styles.page}><Top title="계약서" /><div className={styles.center}><Spacing size={40} /><Paragraph typography="st4" color="grey-600">{error}</Paragraph></div></div>;
  if (!contract) return <div className={styles.page}><Top title="계약서" /><div className={styles.center}><Spacing size={24} /><Paragraph typography="st5" color="grey-500">불러오는 중...</Paragraph></div></div>;

  const b = { sent: { label:'미열람',color:'blue' as const}, viewed: { label:'확인완료',color:'blue' as const}, signed: { label:'서명완료',color:'yellow' as const}, completed: { label:'계약완료',color:'teal' as const}, rejected: { label:'수정 요청됨',color:'blue' as const} }[contract.status] || { label:contract.status, color:'elephant' as const };
  const canSign = contract.status === 'sent' || contract.status === 'viewed';
  const wageLabel = WAGE_TYPE_LABEL[contract.wage_type] || '';
  const dayStr = contract.work_days.map(d => WORK_DAY_LABEL[d] || d).join(', ');

  const CheckCircleIcon = ({ size = 60, color = "#3182f6" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill={color}/>
    </svg>
  );

  return (
    <div className={styles.page}>
      <Top title="사장님저출근했어요">
        <Badge size="small" variant="weak" color={b.color}>{b.label}</Badge>
      </Top>
      <div className={styles.content}>
        <Spacing size={24} />
        <div className={styles.card}>
          <Paragraph typography="st2" fontWeight="bold">근로계약서</Paragraph>
          <Spacing size={24} />
          <SectionT title="근로자" />
          <Row label="이름" value={contract.worker_name} />
          <SectionT title="근로조건" />
          <Row label="계약 유형" value={CONTRACT_TYPE_LABEL[contract.contract_type] || contract.contract_type} />
          <Row label="근무 장소" value={contract.workplace} />
          <Row label="직무" value={contract.job_description} />
          <Row label="시작일" value={contract.start_date} />
          {contract.end_date&&<Row label="종료일" value={contract.end_date}/>}
          <SectionT title="임금" />
          <Row label="급여 형태" value={wageLabel} />
          <Row label="기본급" value={`${contract.base_wage.toLocaleString()}원`} />
          <Row label="지급일" value={contract.wage_payment_date} />
          <SectionT title="근무시간" />
          <Row label="근무 요일" value={dayStr} />
          <Row label="근무 시간" value={`${contract.start_time}~${contract.end_time}`} />
          <Row label="휴게시간" value={`${contract.break_start_time} ~ ${contract.break_end_time}`} />
          <SectionT title="기타 근로조건" />
          <Row label="연차유급휴가" value={contract.paid_leave_clause?'근로기준법에 따름':'미포함'} />
          <Row label="국민연금" value={contract.pension?'가입':'미가입'} />
          <Row label="건강보험" value={contract.health_insurance?'가입':'미가입'} />
          <Row label="고용보험" value={contract.employment_insurance?'가입':'미가입'} />
          <Row label="산재보험" value={contract.accident_insurance?'가입':'미가입'} />
          <Row label="퇴직금" value={contract.severance_clause?'퇴직급여 보장법에 따름':'해당 없음'} />

          {(contract.status === 'signed' || contract.status === 'completed') && (
            <>
              <Spacing size={32} />
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1, backgroundColor: '#f9fafb', borderRadius: 12, padding: '20px 0', textAlign: 'center' }}>
                  <Paragraph typography="t6" color="grey-600">사업주</Paragraph>
                  <Spacing size={8} />
                  <Paragraph typography="t5" fontWeight="bold" style={{ fontFamily: 'serif' }}>{contract.business_id} (서명)</Paragraph>
                </div>
                <div style={{ flex: 1, backgroundColor: '#f9fafb', borderRadius: 12, padding: '20px 0', textAlign: 'center' }}>
                  <Paragraph typography="t6" color="grey-600">근로자</Paragraph>
                  <Spacing size={8} />
                  {contract.worker_signature_data ? (
                    <img src={contract.worker_signature_data} alt="근로자 서명" style={{ height: 40, objectFit: 'contain' }} />
                  ) : (
                    <Paragraph typography="t5" fontWeight="bold" style={{ fontFamily: 'serif' }}>{contract.worker_name} (서명)</Paragraph>
                  )}
                </div>
              </div>
              <Spacing size={16} />
            </>
          )}
        </div>

        {canSign && (
          <>
            <Spacing size={32} />
            <Button color="primary" variant="fill" display="block" size="xlarge"
              onClick={() => navigate(`/worker/contracts/${id}/sign`)}>서명하기</Button>
          </>
        )}

        {/* 수정 요청 버튼 — sent, viewed 상태에서만 노출 */}
        {canSign && (
          <>
            <Spacing size={24} />
            <ListRow
              contents={
                <ListRow.Texts
                  type="2RowTypeA"
                  top="계약서 내용이 조금 다른가요?"
                  bottom="사장님께 수정을 요청할 수 있어요"
                />
              }
              withArrow={true}
              onClick={() => setIsBottomSheetOpen(true)}
            />
            <BottomSheet 
              open={isBottomSheetOpen} 
              onDismiss={() => setIsBottomSheetOpen(false)}
              header={<BottomSheet.Header>계약서 수정 요청</BottomSheet.Header>}
              headerDescription={
                <BottomSheet.HeaderDescription>
                  수정 요청 시 사장님께 전달되며, 사장님이 내용을 수정할 수 있습니다.
                </BottomSheet.HeaderDescription>
              }
              cta={
                <BottomSheet.CTA>
                  <Button
                    color="primary"
                    variant="fill"
                    size="xlarge"
                    disabled={rejecting}
                    onClick={async () => {
                      if (!confirm(`정말 계약 수정을 요청하시겠습니까?`)) return;
                      setRejecting(true);
                      try {
                        const updated = await rejectContract(id, rejectionReason || undefined);
                        setContract(updated);
                        setIsBottomSheetOpen(false);
                      } catch {
                        alert('수정 요청 처리에 실패했습니다');
                      } finally {
                        setRejecting(false);
                      }
                    }}
                  >
                    {rejecting ? '처리 중...' : '수정 요청하기'}
                  </Button>
                </BottomSheet.CTA>
              }
            >
              <div style={{ padding: '0 24px 24px' }}>
                <TextField
                  variant="box"
                  label="수정 요청 사유 (선택)"
                  placeholder="예: 근무 시간이 조금 달라요"
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                />
              </div>
            </BottomSheet>
          </>
        )}

        {contract.status === 'rejected' && (
          <>
            <Spacing size={24} />
            <div style={{
              backgroundColor: '#E8F3FF', borderRadius: 8, padding: 16,
              textAlign: 'center', border: '1px solid #C9E2FF',
            }}>
              <Paragraph typography="st5" fontWeight="bold" color="blue-500">💬 계약 수정을 요청했어요</Paragraph>
              <Spacing size={4} />
              <Paragraph typography="st7" color="grey-600">사장님이 확인 후 계약서를 수정할 수 있습니다</Paragraph>
            </div>
          </>
        )}

        {contract.status === 'completed' && (
          <div style={{ marginTop: 32 }}>
            <div style={{ textAlign: 'center', padding: '32px 0', backgroundColor: '#f9fafb', borderRadius: 16 }}>
              <CheckCircleIcon size={60} />
              <Spacing size={16} />
              <Paragraph typography="t4" fontWeight="bold">계약이 완료되었어요</Paragraph>
              <Spacing size={8} />
              <Paragraph typography="st6" color="grey-600">사장님과 근로자 모두 서명을 마쳤습니다</Paragraph>
            </div>
          </div>
        )}
        <Spacing size={40} />
      </div>
    </div>
  );
}

function SectionT({ title }: { title: string }) {
  return <><Spacing size={20} /><Paragraph typography="st3" fontWeight="bold">{title}</Paragraph><Spacing size={12} /></>;
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className={styles.row}><Paragraph typography="st6" color="grey-500">{label}</Paragraph><Paragraph typography="st5">{value}</Paragraph></div>;
}
