import { useEffect, useState } from 'react';
import { CommentBoundary } from '../dev/CommentBoundary';
import { supabase, IS_MOCK } from '../../api/supabase';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useContracts, type Contract } from '../../hooks/useContracts';
import { Top, Paragraph, Spacing, Button, Badge, TextField, ListRow, BottomSheet } from '@toss/tds-mobile';
import { CONTRACT_TYPE_LABEL, WAGE_TYPE_LABEL, WORK_DAY_LABEL } from '../../utils/labels';
import { getContractBadge } from '../../utils/badgeUtils';
import { formatWorkScheduleForDisplay } from '../employer/contract-form/formatSchedule';
import styles from './ContractDetailPage.module.css';

export default function WorkerContractDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getContract, viewContract, rejectContract } = useContracts();
  const [contract, setContract] = useState<Contract | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [address] = useState('');
  const [phone] = useState('');
  const [account] = useState('');
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
  if (error) return <div className={styles.page}><Top title="계약서" /><div className={styles.center}><Spacing size={40} /><Paragraph typography="t4" color="grey-600">{error}</Paragraph></div></div>;
  if (!contract) return <div className={styles.page}><Top title="계약서" /><div className={styles.center}><Spacing size={24} /><Paragraph typography="t5" color="grey-500">불러오는 중...</Paragraph></div></div>;

  const b = getContractBadge(contract.status);
  const canSign = contract.status === 'sent' || contract.status === 'viewed';
  const wageLabel = WAGE_TYPE_LABEL[contract.wage_type] || '';
  const dayStr = contract.work_days.map(d => WORK_DAY_LABEL[d] || d).join(', ');
  const scheduleEntries = formatWorkScheduleForDisplay(contract);

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
        <Paragraph typography="t3" fontWeight="bold">근로계약서</Paragraph>
        <Spacing size={24} />

        <CommentBoundary name="계약상태-배너">
        {contract.status === 'completed' || contract.status === 'signed' ? (
          <div style={{ backgroundColor: '#E4F4EC', padding: 20, borderRadius: 16, marginBottom: 24, border: '1px solid #C3E8D7' }}>
            <Paragraph typography="t5" fontWeight="bold" color="grey-800">🎉 서명이 완료되었습니다</Paragraph>
            <Spacing size={4} />
            <Paragraph typography="t7" color="grey-600">계약이 정상적으로 체결되었습니다</Paragraph>
          </div>
        ) : contract.status === 'rejected' ? (
          <div style={{ backgroundColor: '#E8F3FF', padding: 20, borderRadius: 16, marginBottom: 24, border: '1px solid #D1E4FF' }}>
            <Paragraph typography="t5" fontWeight="bold" color="blue-500">💬 계약 수정을 요청했어요</Paragraph>
            <Spacing size={4} />
            <Paragraph typography="t7" color="grey-600">사장님이 확인 후 계약서를 수정할 수 있습니다</Paragraph>
          </div>
        ) : null}
        </CommentBoundary>

        <CommentBoundary name="근로자-정보">
        <Section title="근로자">
          <Row label="이름" value={contract.worker_name} />
        </Section>
        </CommentBoundary>
        <CommentBoundary name="근로조건-정보">
        <Section title="근로조건">
          <Row label="계약 유형" value={CONTRACT_TYPE_LABEL[contract.contract_type] || contract.contract_type} />
          <Row label="근무 장소" value={contract.workplace} />
          <Row label="직무" value={contract.job_description} />
          <Row label="시작일" value={contract.start_date} />
          {contract.end_date&&<Row label="종료일" value={contract.end_date}/>}
        </Section>
        </CommentBoundary>
        <CommentBoundary name="임금-정보">
        <Section title="임금">
          <Row label="급여 형태" value={wageLabel} />
          <Row label="기본급" value={`${contract.base_wage.toLocaleString()}원`} />
          <Row label="지급일" value={contract.wage_payment_date} />
        </Section>
        </CommentBoundary>
        <CommentBoundary name="근무시간-정보">
        <Section title="근무시간">
          <Row label="근무 요일" value={dayStr} />
          {scheduleEntries.length <= 1 ? (
            (() => {
              const e = scheduleEntries[0] ?? { workTime: `${contract.start_time}~${contract.end_time}`, breakTime: `${contract.break_start_time} ~ ${contract.break_end_time}` };
              return (
                <>
                  <Row label="근무 시간" value={e.workTime} />
                  {e.breakTime && <Row label="휴게시간" value={e.breakTime} />}
                </>
              );
            })()
          ) : (
            scheduleEntries.map((e, i) => (
              <Row key={i} label={`${e.label} 근무`} value={e.breakTime ? `${e.workTime} (휴게 ${e.breakTime})` : e.workTime} />
            ))
          )}
        </Section>
        </CommentBoundary>
        <CommentBoundary name="기타근로조건-정보">
        <Section title="기타 근로조건">
          <Row label="연차유급휴가" value={contract.paid_leave_clause?'근로기준법에 따름':'미포함'} />
          <Row label="국민연금" value={contract.pension?'가입':'미가입'} />
          <Row label="건강보험" value={contract.health_insurance?'가입':'미가입'} />
          <Row label="고용보험" value={contract.employment_insurance?'가입':'미가입'} />
          <Row label="산재보험" value={contract.accident_insurance?'가입':'미가입'} />
          <Row label="퇴직금" value={contract.severance_clause?'퇴직급여 보장법에 따름':'해당 없음'} />
        </Section>
        </CommentBoundary>

        <CommentBoundary name="서명-액션-영역">
        {canSign && (
          <>
            <Spacing size={32} />
            <Button color="primary" variant="fill" display="block" size="xlarge"
              onClick={() => navigate(`/worker/contracts/${id}/sign`)}>서명하기</Button>
            <Spacing size={24} />
            <ListRow
              contents={<ListRow.Texts type="2RowTypeA" top="계약서 내용이 조금 다른가요?" bottom="사장님께 수정을 요청할 수 있어요" />}
              withArrow={true}
              onClick={() => setIsBottomSheetOpen(true)}
            />
            <BottomSheet 
              open={isBottomSheetOpen} 
              onClose={() => setIsBottomSheetOpen(false)}
              header={<BottomSheet.Header>계약서 거절</BottomSheet.Header>}
              headerDescription={<BottomSheet.HeaderDescription>수정 요청 시 사장님께 전달되며, 사장님이 내용을 수정할 수 있습니다.</BottomSheet.HeaderDescription>}
              cta={
                <BottomSheet.CTA>
                  <Button color="primary" variant="fill" size="xlarge" disabled={rejecting} onClick={async () => {
                    if (!confirm(`정말 계약 수정을 요청하시겠습니까?`)) return;
                    setRejecting(true);
                    try { const updated = await rejectContract(id, rejectionReason || undefined); setContract(updated); setIsBottomSheetOpen(false); } 
                    catch { alert('수정 요청 처리에 실패했습니다'); } finally { setRejecting(false); }
                  }}>
                    {rejecting ? '처리 중...' : '수정 요청하기'}
                  </Button>
                </BottomSheet.CTA>
              }
            >
              <div style={{ padding: '0 24px 24px' }}>
                <TextField variant="box" label="수정 요청 사유 (선택)" placeholder="예: 근무 시간이 조금 달라요" value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} />
              </div>
            </BottomSheet>
          </>
        )}
        </CommentBoundary>
        <Spacing size={40} />
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={styles.section}>
      <Spacing size={20} />
      <Paragraph typography="t5" fontWeight="bold">{title}</Paragraph>
      <Spacing size={16} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Paragraph typography="t6" color="grey-500">{label}</Paragraph>
      <div style={{ textAlign: 'right', maxWidth: '60%' }}><Paragraph typography="t5">{value}</Paragraph></div>
    </div>
  );
}
