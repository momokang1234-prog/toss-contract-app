import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useContracts, type Contract } from '../../hooks/useContracts';
import { ContractStatusBadge } from '../../components/contract/ContractStatusBadge';
import { ContractPreview } from '../../components/contract/ContractPreview';
import { IS_MOCK } from '../../api/supabase';
import { supabase } from '../../api/supabase';

export default function WorkerContractDetailPage() {
  const { id } = useParams();
  const { getContract, updateContract } = useContracts();
  const [contract, setContract] = useState<Contract | null>(null);

  useEffect(() => {
    if (id) {
      if (IS_MOCK) {
        // In mock mode, just fetch and update to 'viewed' if still 'sent'
        getContract(id).then(c => {
          if (c && c.status === 'sent') {
            updateContract(id, { status: 'viewed' }).then(updated => setContract(updated));
          } else {
            setContract(c);
          }
        });
      } else {
        // contracts-view Edge Function 호출 (viewed 상태 업데이트)
        supabase.functions.invoke('contracts-view', {
          body: {},
          headers: { 'x-contract-id': id },
        }).then(() => getContract(id)).then(c => setContract(c));
      }
    }
  }, [id]);

  if (!contract) return <div style={{ padding: 24, textAlign: 'center', color: '#6B7684' }}>로딩 중...</div>;

  return (
    <div style={{ padding: 24, maxWidth: 480, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>근로계약서</h2>
        <ContractStatusBadge status={contract.status} />
      </div>

      <ContractPreview contract={contract} />

      {['sent', 'viewed'].includes(contract.status) && (
        <Link to={`/worker/contracts/${contract.id}/sign`} style={{
          display: 'block', marginTop: 24, padding: '16px', textAlign: 'center',
          backgroundColor: '#3182F6', color: '#fff', borderRadius: 12, fontSize: 16, fontWeight: 600,
          textDecoration: 'none',
        }}>서명하기</Link>
      )}

      {contract.status === 'signed' && (
        <div style={{ marginTop: 24, padding: 16, backgroundColor: '#E6F9F1', borderRadius: 12, textAlign: 'center' }}>
          <span style={{ color: '#00826D', fontWeight: 600 }}>서명 완료</span>
        </div>
      )}
    </div>
  );
}
