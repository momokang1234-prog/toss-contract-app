import { useNavigate } from 'react-router-dom';
import { ContractStatusBadge } from './ContractStatusBadge';
import type { Contract } from '../../hooks/useContracts';

interface ContractCardProps {
  contract: Contract;
  basePath: string; // '/employer/contracts' or '/worker/contracts'
}

export function ContractCard({ contract, basePath }: ContractCardProps) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`${basePath}/${contract.id}`)}
      style={{ padding: '16px', marginBottom: 8, border: '1px solid #E5E8EB', borderRadius: 12, cursor: 'pointer' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 15, fontWeight: 600 }}>{contract.worker_name}</span>
        <ContractStatusBadge status={contract.status} />
      </div>
      <div style={{ fontSize: 13, color: '#6B7684' }}>
        {contract.contract_type === 'partTime' ? '단시간' : contract.contract_type === 'fullTime' ? '정규직' : '기간제'} · {contract.base_wage.toLocaleString()}원 · {new Date(contract.created_at).toLocaleDateString('ko-KR')}
      </div>
    </div>
  );
}
