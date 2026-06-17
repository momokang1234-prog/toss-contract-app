import { useEffect, useState } from 'react';
import { CommentBoundary } from '../dev/CommentBoundary';
import { supabase, IS_MOCK } from '../../api/supabase';
import { maskPhoneNumber } from '../../utils/format';
import { generateAndUploadPDF } from '../../utils/pdfGenerator';
import { josa } from 'es-hangul';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useContracts, type Contract } from '../../hooks/useContracts';
import { Top, Paragraph, Spacing, Button, Badge, TextButton } from '@toss/tds-mobile';
import { CONTRACT_TYPE_LABEL, WAGE_TYPE_LABEL, WORK_DAY_LABEL, WAGE_PAYMENT_METHOD_LABEL } from '../../utils/labels';
import { getContractBadge } from '../../utils/badgeUtils';
import styles from './ContractDetailPage.module.css';

export default function ContractDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getContract, sendContract, completeContract, cancelContract } = useContracts();
  const [contract, setContract] = useState<Contract | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (!id) { setError('계약서 ID가 없습니다'); return; }
    getContract(id).then(c => {
      if (!c) setError('계약서를 찾을 수 없습니다');
      else setContract(c);
    }).catch(() => setError('불러오기에 실패했습니다'));
  }, [id]);

  useEffect(() => {
    if (!id || IS_MOCK) return;
    const channel = supabase
      .channel(`contract-${id}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'contracts', filter: `id=eq.${id}` },
        (payload) => { setContract(payload.new as Contract); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  if (!id) return <Navigate to="/employer/dashboard" replace />;

  if (error) {
    return (
      <div className={styles.page}>
        <Top title="계약서" />
        <div className={styles.center}>
          <Spacing size={40} />
          <Paragraph typography="t4" color="grey-600">{error}</Paragraph>
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
          <Paragraph typography="t5" color="grey-500">불러오는 중...</Paragraph>
        </div>
      </div>
    );
  }

  const b = getContractBadge(contract.status);
  const canSend = contract.status === 'draft';
  const canComplete = contract.status === 'signed';
  const canEdit = contract.status === 'draft' || contract.status === 'rejected';

  const wageLabel = WAGE_TYPE_LABEL[contract.wage_type] || contract.wage_type;
  const payLabel = WAGE_PAYMENT_METHOD_LABEL[contract.wage_payment_method] || contract.wage_payment_method;
  const dayStr = contract.work_days.map(d => WORK_DAY_LABEL[d] || d).join(', ');

  const primaryAction = canSend
    ? { label: '근로자에게 전송', action: async () => {
        try { const u = await sendContract(id); setContract(u); alert('근로자에게 전송되었습니다.'); }
        catch { alert('전송에 실패했습니다'); }
      }}
    : (contract.status === 'sent' || contract.status === 'viewed')
    ? { label: '서명 요청 재전송', action: () => { alert('근로자에게 서명 요청 알림을 다시 보냈습니다.'); } }
    : canComplete
    ? { label: completing ? '확정 중...' : '계약 확정하기', action: async () => {
        if (!confirm(`${josa('계약', '을/를')} 확정하시겠습니까?\n\n완료된 계약은 변경할 수 없습니다.`)) return;
        setCompleting(true);
        try {
          const pdfUrl = await generateAndUploadPDF('contract-document-container', id);
          const u = await completeContract(id, undefined, pdfUrl || undefined);
          setContract(u);
        } catch (err) {
          console.error(err);
          alert('확정 처리에 실패했습니다. (PDF 생성 또는 DB 통신 에러)');
        } finally {
          setCompleting(false);
        }
      }}
    : null;

  const canCancel = ['draft', 'sent', 'viewed', 'signed'].includes(contract.status);

  return (
    <div className={styles.page}>
      <Top title={contract.worker_name}>
        <Badge size="small" variant="weak" color={b.color}>{b.label}</Badge>
      </Top>

      <div style={{ padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Paragraph typography="t3" fontWeight="bold">근로계약서</Paragraph>
          {canEdit && (
            <TextButton size="small" onClick={() => navigate(`/employer/contracts/${id}/edit`)}>
              수정하기
            </TextButton>
          )}
        </div>
        <Spacing size={24} />

        <div id="contract-document-container">
          <CommentBoundary name="근로자-정보">
            <Paragraph typography="t6" color="grey-500" fontWeight="bold">근로자</Paragraph>
            <div className={styles.section}>
              <div className={styles.row}>
                <Paragraph typography="t6" color="grey-500">이름</Paragraph>
                <Paragraph typography="t5" color="grey-800" fontWeight="bold">{contract.worker_name}</Paragraph>
              </div>
              <div className={styles.row}>
                <Paragraph typography="t6" color="grey-500">연락처</Paragraph>
                <Paragraph typography="t5" color="grey-800" fontWeight="bold">{maskPhoneNumber(contract.worker_phone)}</Paragraph>
              </div>
            </div>
          </CommentBoundary>

          <Spacing size={32} />

          <CommentBoundary name="근로조건">
            <Paragraph typography="t6" color="grey-500" fontWeight="bold">근로조건</Paragraph>
            <div className={styles.section}>
              <div className={styles.row}>
                <Paragraph typography="t6" color="grey-500">계약 유형</Paragraph>
                <Paragraph typography="t5" color="grey-800" fontWeight="bold">{CONTRACT_TYPE_LABEL[contract.contract_type] || contract.contract_type}</Paragraph>
              </div>
              <div className={styles.row}>
                <Paragraph typography="t6" color="grey-500">근무 장소</Paragraph>
                <Paragraph typography="t5" color="grey-800" fontWeight="bold">{contract.workplace}</Paragraph>
              </div>
              <div className={styles.row}>
                <Paragraph typography="t6" color="grey-500">직무</Paragraph>
                <Paragraph typography="t5" color="grey-800" fontWeight="bold">{contract.job_description}</Paragraph>
              </div>
              <div className={styles.row}>
                <Paragraph typography="t6" color="grey-500">시작일</Paragraph>
                <Paragraph typography="t5" color="grey-800" fontWeight="bold">{contract.start_date}</Paragraph>
              </div>
              {contract.end_date && (
                <div className={styles.row}>
                  <Paragraph typography="t6" color="grey-500">종료일</Paragraph>
                  <Paragraph typography="t5" color="grey-800" fontWeight="bold">{contract.end_date}</Paragraph>
                </div>
              )}
            </div>
          </CommentBoundary>

          <Spacing size={32} />

          <CommentBoundary name="임금">
            <Paragraph typography="t6" color="grey-500" fontWeight="bold">임금</Paragraph>
            <div className={styles.section}>
              <div className={styles.row}>
                <Paragraph typography="t6" color="grey-500">급여 형태</Paragraph>
                <Paragraph typography="t5" color="grey-800" fontWeight="bold">{wageLabel}</Paragraph>
              </div>
              <div className={styles.row}>
                <Paragraph typography="t6" color="grey-500">기본급</Paragraph>
                <Paragraph typography="t5" color="grey-800" fontWeight="bold">{contract.base_wage.toLocaleString()}원</Paragraph>
              </div>
              <div className={styles.row}>
                <Paragraph typography="t6" color="grey-500">지급 방식</Paragraph>
                <Paragraph typography="t5" color="grey-800" fontWeight="bold">{payLabel}</Paragraph>
              </div>
              <div className={styles.row}>
                <Paragraph typography="t6" color="grey-500">지급일</Paragraph>
                <Paragraph typography="t5" color="grey-800" fontWeight="bold">{contract.wage_payment_date}</Paragraph>
              </div>
            </div>
          </CommentBoundary>

          <Spacing size={32} />

          <CommentBoundary name="근무시간">
            <Paragraph typography="t6" color="grey-500" fontWeight="bold">근무시간</Paragraph>
            <div className={styles.section}>
              <div className={styles.row}>
                <Paragraph typography="t6" color="grey-500">근무 요일</Paragraph>
                <Paragraph typography="t5" color="grey-800" fontWeight="bold">{dayStr}</Paragraph>
              </div>
              <div className={styles.row}>
                <Paragraph typography="t6" color="grey-500">근무 시간</Paragraph>
                <Paragraph typography="t5" color="grey-800" fontWeight="bold">{contract.start_time} ~ {contract.end_time}</Paragraph>
              </div>
              <div className={styles.row}>
                <Paragraph typography="t6" color="grey-500">휴게시간</Paragraph>
                <Paragraph typography="t5" color="grey-800" fontWeight="bold">{contract.break_start_time} ~ {contract.break_end_time}</Paragraph>
              </div>
              {contract.weekly_holiday && (
                <div className={styles.row}>
                  <Paragraph typography="t6" color="grey-500">주휴일</Paragraph>
                  <Paragraph typography="t5" color="grey-800" fontWeight="bold">{WORK_DAY_LABEL[contract.weekly_holiday] || contract.weekly_holiday}</Paragraph>
                </div>
              )}
            </div>
          </CommentBoundary>

          <Spacing size={32} />

          <Paragraph typography="t6" color="grey-500" fontWeight="bold">기타 근로조건</Paragraph>
          <div className={styles.section}>
            <div className={styles.row}>
              <Paragraph typography="t6" color="grey-500">연차유급휴가</Paragraph>
              <Paragraph typography="t5" color="grey-800" fontWeight="bold">{contract.paid_leave_clause ? '근로기준법에 따름' : '미포함'}</Paragraph>
            </div>
            <div className={styles.row}>
              <Paragraph typography="t6" color="grey-500">국민연금</Paragraph>
              <Paragraph typography="t5" color="grey-800" fontWeight="bold">{contract.pension ? '가입' : '미가입'}</Paragraph>
            </div>
            <div className={styles.row}>
              <Paragraph typography="t6" color="grey-500">건강보험</Paragraph>
              <Paragraph typography="t5" color="grey-800" fontWeight="bold">{contract.health_insurance ? '가입' : '미가입'}</Paragraph>
            </div>
            <div className={styles.row}>
              <Paragraph typography="t6" color="grey-500">고용보험</Paragraph>
              <Paragraph typography="t5" color="grey-800" fontWeight="bold">{contract.employment_insurance ? '가입' : '미가입'}</Paragraph>
            </div>
            <div className={styles.row}>
              <Paragraph typography="t6" color="grey-500">산재보험</Paragraph>
              <Paragraph typography="t5" color="grey-800" fontWeight="bold">{contract.accident_insurance ? '가입' : '미가입'}</Paragraph>
            </div>
            <div className={styles.row}>
              <Paragraph typography="t6" color="grey-500">퇴직금</Paragraph>
              <Paragraph typography="t5" color="grey-800" fontWeight="bold">{contract.severance_clause ? '퇴직급여 보장법에 따름' : '해당 없음'}</Paragraph>
            </div>
          </div>

          {contract.worker_signature_data && (
            <CommentBoundary name="서명">
              <Spacing size={32} />
              <Paragraph typography="t6" color="grey-500" fontWeight="bold">근로자 서명</Paragraph>
              <div style={{ padding: '20px 0', textAlign: 'center' }}>
                <img
                  src={contract.worker_signature_data}
                  alt="서명"
                  style={{ maxHeight: 100, border: '1px solid #E5E8EB', borderRadius: 8, padding: 8 }}
                />
                <Spacing size={8} />
                <Paragraph typography="t7" color="grey-500">
                  {contract.worker_signed_at ? new Date(contract.worker_signed_at).toLocaleString() : ''} 서명 완료
                </Paragraph>
              </div>
            </CommentBoundary>
          )}
        </div>

        <Spacing size={40} />

        {/* Status banners */}
        <CommentBoundary name="상태-배너">
          {contract.status === 'completed' && (
            <div style={{ backgroundColor: '#E4F4EC', padding: 20, borderRadius: 16, marginBottom: 24, border: '1px solid #C3E8D7' }}>
              <Paragraph typography="t5" fontWeight="bold" color="grey-800">🎉 계약이 확정되었습니다</Paragraph>
              <Spacing size={4} />
              <Paragraph typography="t7" color="grey-600">완료된 계약은 수정할 수 없습니다</Paragraph>
            </div>
          )}
          {contract.status === 'cancelled' && (
            <div style={{ backgroundColor: '#FFF0F0', padding: 20, borderRadius: 16, marginBottom: 24, border: '1px solid #FFD4D4' }}>
              <Paragraph typography="t5" fontWeight="bold" color="grey-800">🚫 취소된 계약입니다</Paragraph>
              <Spacing size={4} />
              <Paragraph typography="t7" color="grey-600">이 계약은 더 이상 진행할 수 없습니다</Paragraph>
            </div>
          )}
          {contract.status === 'rejected' && (
            <div style={{ backgroundColor: '#E8F3FF', padding: 20, borderRadius: 16, marginBottom: 24, border: '1px solid #D1E4FF' }}>
              <Paragraph typography="t5" fontWeight="bold" color="blue-500">💬 근로자가 계약 수정을 요청했습니다</Paragraph>
              <Spacing size={8} />
              <div style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12 }}>
                <Paragraph typography="t7" color="blue-500">요청 사유: {contract.rejection_reason}</Paragraph>
              </div>
              <Spacing size={16} />
              <Button color="primary" variant="fill" size="medium" onClick={() => navigate(`/employer/contracts/${id}/edit`)}>
                계약서 수정하기
              </Button>
            </div>
          )}
          {contract.status === 'expired' && (
            <div style={{ backgroundColor: '#F2F4F6', padding: 20, borderRadius: 16, marginBottom: 24, border: '1px solid #E5E8EB' }}>
              <Paragraph typography="t5" fontWeight="bold" color="grey-800">⏰ 유효 기간이 만료되었습니다</Paragraph>
              <Spacing size={4} />
              <Paragraph typography="t7" color="grey-600">계약 유효 기간을 확인해주세요</Paragraph>
            </div>
          )}
        </CommentBoundary>

        {/* Action buttons */}
        <CommentBoundary name="액션-버튼">
          {primaryAction && (
            <>
              <div className={styles.bottomCta}>
                <Button
                  color="primary"
                  variant="fill"
                  display="block"
                  size="xlarge"
                  onClick={primaryAction.action}
                  disabled={completing}
                >
                  {primaryAction.label}
                </Button>
              </div>
              <Spacing size={100} />
            </>
          )}

          {canCancel && (
            <>
              <Button color="light" variant="weak" display="block" size="large"
                onClick={async () => {
                  if (!confirm(`${josa('계약', '을/를')} 취소하시겠습니까?\n\n되돌릴 수 없습니다.`)) return;
                  try { const u = await cancelContract(id); setContract(u); }
                  catch { alert('취소 처리에 실패했습니다'); }
                }}>
                계약 취소하기
              </Button>
              <Spacing size={12} />
            </>
          )}

          <Button color="light" variant="weak" display="block" size="large"
            onClick={() => navigate(`/employer/contracts/${id}/history`)}>
            계약 이력 보기
          </Button>
        </CommentBoundary>

        <Spacing size={40} />
      </div>
    </div>
  );
}
