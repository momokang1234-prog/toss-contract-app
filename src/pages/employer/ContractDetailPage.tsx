import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContracts, type Contract } from '../../hooks/useContracts';
import { ContractStatusBadge } from '../../components/contract/ContractStatusBadge';
import { ContractPreview } from '../../components/contract/ContractPreview';
import { Button, Paragraph, Spacing } from '@toss/tds-mobile';

export default function ContractDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getContract, sendContract, completeContract, cancelContract } = useContracts();
  const [contract, setContract] = useState<Contract | null>(null);
  const [sending, setSending] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (id) getContract(id).then(c => setContract(c));
  }, [id]);

  const handleSend = async () => {
    if (!id) return;
    setSending(true);
    try {
      const updated = await sendContract(id);
      setContract(updated);
    } catch (err) {
      console.error(err);
      alert('전송에 실패했습니다.');
    } finally {
      setSending(false);
    }
  };

  const handleComplete = async () => {
    if (!id) return;
    if (!confirm('계약을 확정하시겠습니까?')) return;
    setCompleting(true);
    try {
      const updated = await completeContract(id);
      setContract(updated);
    } catch (err) {
      console.error(err);
      alert('확정에 실패했습니다.');
    } finally {
      setCompleting(false);
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    if (!confirm('계약을 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
    setCancelling(true);
    try {
      const updated = await cancelContract(id);
      setContract(updated);
    } catch (err) {
      console.error(err);
      alert('취소에 실패했습니다.');
    } finally {
      setCancelling(false);
    }
  };

  if (!contract) return (
    <div style={{ padding: 24, textAlign: 'center' }}>
      <Paragraph typography="st4" color="grey600">로딩 중...</Paragraph>
    </div>
  );

  const isTerminal = contract.status === 'cancelled' || contract.status === 'expired';

  return (
    <div style={{ padding: 24, maxWidth: 480, margin: '0 auto', paddingBottom: 100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Paragraph typography="st3" fontWeight="bold">{contract.worker_name} 계약서</Paragraph>
        <ContractStatusBadge status={contract.status} />
      </div>

      <ContractPreview contract={contract} />

      {/* 서명 이미지 표시 */}
      {contract.worker_signature_data && (
        <>
          <Spacing size={16} />
          <div style={{ padding: 16, backgroundColor: '#F9FAFB', borderRadius: 12 }}>
            <Paragraph typography="st4" fontWeight="bold">근로자 서명</Paragraph>
            <Spacing size={8} />
            <img src={contract.worker_signature_data} alt="근로자 서명" style={{ maxWidth: 200, border: '1px solid #E5E8EB', borderRadius: 8 }} />
            {contract.worker_signed_at && (
              <Paragraph typography="st6" color="grey500">
                서명일: {new Date(contract.worker_signed_at).toLocaleString('ko-KR')}
              </Paragraph>
            )}
          </div>
        </>
      )}

      {/* 계약 이력 링크 */}
      <Spacing size={16} />
      <Button
        color="primary"
        variant="weak"
        size="large"
        onClick={() => navigate(`/employer/contracts/${id}/history`)}
      >
        계약 이력 보기
      </Button>

      {/* Terminal states: cancelled / expired */}
      {isTerminal && (
        <>
          <Spacing size={24} />
          <div style={{ padding: 16, backgroundColor: '#F2F4F6', borderRadius: 12, textAlign: 'center' }}>
            <Paragraph typography="st4" fontWeight="bold" color="grey600">
              {contract.status === 'cancelled' ? '🚫 취소된 계약입니다' : '⏰ 만료된 계약입니다'}
            </Paragraph>
            <Spacing size={4} />
            <Paragraph typography="st6" color="grey500">
              {contract.status === 'cancelled'
                ? '이 계약은 취소되어 더 이상 진행할 수 없습니다.'
                : '이 계약은 유효 기간이 만료되었습니다.'}
            </Paragraph>
          </div>
        </>
      )}

      {/* Action buttons for active states */}
      {!isTerminal && (
        <>
          <Spacing size={24} />
          <div style={{ display: 'flex', gap: 8 }}>
            {contract.status === 'draft' && (
              <>
                <Button
                  color="primary"
                  variant="fill"
                  display="block"
                  size="large"
                  style={{ flex: 1 }}
                  onClick={handleSend}
                  disabled={sending}
                >
                  {sending ? '전송 중...' : '근로자에게 전송'}
                </Button>
                <Button
                  color="danger"
                  variant="weak"
                  size="large"
                  onClick={handleCancel}
                  disabled={cancelling}
                >
                  {cancelling ? '취소 중...' : '취소'}
                </Button>
              </>
            )}
            {contract.status === 'signed' && (
              <>
                <Button
                  color="primary"
                  variant="fill"
                  display="block"
                  size="large"
                  style={{ flex: 1 }}
                  onClick={handleComplete}
                  disabled={completing}
                >
                  {completing ? '확정 중...' : '계약 확정'}
                </Button>
                <Button
                  color="danger"
                  variant="weak"
                  size="large"
                  onClick={handleCancel}
                  disabled={cancelling}
                >
                  {cancelling ? '취소 중...' : '취소'}
                </Button>
              </>
            )}
            {contract.status === 'completed' && (
              <div style={{ flex: 1, padding: '14px', textAlign: 'center', backgroundColor: '#E6F9F1', borderRadius: 10 }}>
                <Paragraph typography="st4" fontWeight="bold" color="teal700">✅ 계약 완료</Paragraph>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
