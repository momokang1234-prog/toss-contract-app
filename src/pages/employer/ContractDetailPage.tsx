import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useContracts, type Contract } from '../../hooks/useContracts';
import { ContractStatusBadge } from '../../components/contract/ContractStatusBadge';
import { ContractPreview } from '../../components/contract/ContractPreview';

export default function ContractDetailPage() {
  const { id } = useParams();
  const { getContract, sendContract, completeContract } = useContracts();
  const [contract, setContract] = useState<Contract | null>(null);
  const [sending, setSending] = useState(false);
  const [completing, setCompleting] = useState(false);

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

  if (!contract) return <div style={{ padding: 24, textAlign: 'center', color: '#6B7684' }}>로딩 중...</div>;

  return (
    <div style={{ padding: 24, maxWidth: 480, margin: '0 auto', paddingBottom: 100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>{contract.worker_name} 계약서</h2>
        <ContractStatusBadge status={contract.status} />
      </div>

      <ContractPreview contract={contract} />

      {/* 서명 이미지 표시 */}
      {contract.worker_signature_data && (
        <div style={{ marginTop: 16, padding: 16, backgroundColor: '#F9FAFB', borderRadius: 12 }}>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>근로자 서명</p>
          <img src={contract.worker_signature_data} alt="근로자 서명" style={{ maxWidth: 200, border: '1px solid #E5E8EB', borderRadius: 8 }} />
          {contract.worker_signed_at && (
            <p style={{ fontSize: 12, color: '#6B7684', marginTop: 4 }}>
              서명일: {new Date(contract.worker_signed_at).toLocaleString('ko-KR')}
            </p>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
        {contract.status === 'draft' && (
          <button
            onClick={handleSend}
            disabled={sending}
            style={{
              flex: 1, padding: '14px', backgroundColor: '#3182F6', color: '#fff',
              border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600,
              cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.6 : 1,
            }}
          >
            {sending ? '전송 중...' : '근로자에게 전송'}
          </button>
        )}
        {contract.status === 'signed' && (
          <button
            onClick={handleComplete}
            disabled={completing}
            style={{
              flex: 1, padding: '14px', backgroundColor: '#00826D', color: '#fff',
              border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600,
              cursor: completing ? 'not-allowed' : 'pointer', opacity: completing ? 0.6 : 1,
            }}
          >
            {completing ? '확정 중...' : '계약 확정'}
          </button>
        )}
        {contract.status === 'completed' && (
          <div style={{ flex: 1, padding: '14px', textAlign: 'center', backgroundColor: '#E6F9F1', borderRadius: 10 }}>
            <span style={{ color: '#00826D', fontWeight: 600, fontSize: 15 }}>✅ 계약 완료</span>
          </div>
        )}
      </div>
    </div>
  );
}
