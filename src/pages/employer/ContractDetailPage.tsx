import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useContracts, type Contract } from '../../hooks/useContracts';
import { ContractStatusBadge } from '../../components/contract/ContractStatusBadge';
import { ContractPreview } from '../../components/contract/ContractPreview';

export default function ContractDetailPage() {
  const { id } = useParams();
  const { getContract } = useContracts();
  const [contract, setContract] = useState<Contract | null>(null);

  useEffect(() => {
    if (id) getContract(id).then(c => setContract(c));
  }, [id]);

  if (!contract) return <div style={{ padding: 24, textAlign: 'center', color: '#6B7684' }}>로딩 중...</div>;

  return (
    <div style={{ padding: 24, maxWidth: 480, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>{contract.worker_name} 계약서</h2>
        <ContractStatusBadge status={contract.status} />
      </div>

      <ContractPreview contract={contract} />

      <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
        {contract.status === 'draft' && (
          <button style={{ flex: 1, padding: '14px', backgroundColor: '#3182F6', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
            근로자에게 전송
          </button>
        )}
        <Link to={`/employer/contracts/${contract.id}/history`} style={{
          flex: 1, padding: '14px', textAlign: 'center', backgroundColor: '#F5F6F8', color: '#333D4B',
          border: '1px solid #E5E8EB', borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: 'none',
        }}>이력 보기</Link>
      </div>
    </div>
  );
}
