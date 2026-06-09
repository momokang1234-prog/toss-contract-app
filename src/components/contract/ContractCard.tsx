import { useNavigate } from 'react-router-dom';
import { ContractStatusBadge } from './ContractStatusBadge';
import { Paragraph } from '@toss/tds-mobile';
import type { Contract } from '../../hooks/useContracts';

interface ContractCardProps {
  contract: Contract;
  basePath: string;
}

export function ContractCard({ contract, basePath }: ContractCardProps) {
  const navigate = useNavigate();
  const typeLabel = contract.contract_type === 'partTime' ? '단시간'
    : contract.contract_type === 'fullTime' ? '정규직' : '기간제';

  return (
    <div
      onClick={() => navigate(`${basePath}/${contract.id}`)}
      style={{ padding: '16px', marginBottom: 8, border: '1px solid #E5E8EB', borderRadius: 12, cursor: 'pointer' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Paragraph as="span" typography="st2" fontWeight="bold">
          {contract.worker_name}
        </Paragraph>
        <ContractStatusBadge status={contract.status} />
      </div>
      <Paragraph as="span" typography="st5" color="grey600">
        {typeLabel} · {contract.base_wage.toLocaleString()}원 · {new Date(contract.created_at).toLocaleDateString('ko-KR')}
      </Paragraph>
    </div>
  );
}
