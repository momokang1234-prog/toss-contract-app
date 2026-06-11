import { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useContracts, type Contract } from '../../hooks/useContracts';
import { Top, Paragraph, Spacing, Button, Badge, TextField } from '@toss/tds-mobile';
import styles from './ContractDetailPage.module.css';

export default function WorkerContractDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getContract, viewContract } = useContracts();
  const [contract, setContract] = useState<Contract | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [account, setAccount] = useState('');

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

  if (!id) return <Navigate to="/worker/contracts" replace />;
  if (error) return <div className={styles.page}><Top title="계약서" /><div className={styles.center}><Spacing size={40} /><Paragraph typography="st4" color="grey-600">{error}</Paragraph></div></div>;
  if (!contract) return <div className={styles.page}><Top title="계약서" /><div className={styles.center}><Spacing size={24} /><Paragraph typography="st5" color="grey-500">불러오는 중...</Paragraph></div></div>;

  const b = { sent: { label:'미열람',color:'blue' as const}, viewed: { label:'확인완료',color:'blue' as const}, signed: { label:'서명완료',color:'yellow' as const}, completed: { label:'계약완료',color:'teal' as const} }[contract.status] || { label:contract.status, color:'elephant' as const };
  const canSign = contract.status === 'sent' || contract.status === 'viewed';
  const wageLabel = { hourly:'시급', daily:'일급', weekly:'주급', monthly:'월급' }[contract.wage_type] || '';
  const days: Record<string, string> = { mon:'월',tue:'화',wed:'수',thu:'목',fri:'금',sat:'토',sun:'일' };
  const dayStr = contract.work_days.map(d => days[d] || d).join(', ');

  return (
    <div className={styles.page}>
      <Top title={contract.workplace}>
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
          <Row label="계약 유형" value={contract.contract_type==='fullTime'?'정규직':contract.contract_type==='partTime'?'단시간':'기간제'} />
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
          <Row label="휴게시간" value={`${contract.break_minutes}분`} />
          <SectionT title="기타 근로조건" />
          <Row label="연차유급휴가" value={contract.paid_leave_clause?'근로기준법에 따름':'미포함'} />
          <Row label="사회보험" value={contract.social_insurance_clause?'4대보험 적용':'미적용'} />
          <Row label="퇴직금" value={contract.severance_clause?'퇴직급여 보장법에 따름':'해당 없음'} />
        </div>

        {canSign && (
          <>
            <Spacing size={32} />
            <Paragraph typography="st4" fontWeight="bold">연락처를 입력해주세요</Paragraph>
            <Spacing size={8} />
            <Paragraph typography="st6" color="grey-500">계약서에 필요한 정보예요</Paragraph>
            <Spacing size={16} />
            <TextField variant="box" labelOption="sustain" label="연락처" placeholder="010-0000-0000"
              value={phone} onChange={e => setPhone(e.target.value)} />
            <Spacing size={12} />
            <TextField variant="box" labelOption="sustain" label="주소" placeholder="서울시 강남구 역삼동"
              value={address} onChange={e => setAddress(e.target.value)} />
            <Spacing size={12} />
            <TextField variant="box" labelOption="sustain" label="계좌번호 (선택)" placeholder="은행 계좌번호"
              value={account} onChange={e => setAccount(e.target.value)} />
            <Spacing size={24} />
            <Button color="primary" variant="fill" display="block" size="xlarge"
              onClick={() => navigate(`/worker/contracts/${id}/sign`)}>서명하기</Button>
          </>
        )}

        {contract.status === 'completed' && (
          <>
            <Spacing size={16} />
            <Paragraph typography="st4" color="teal" textAlign="center">✅ 계약이 완료되었어요</Paragraph>
          </>
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
