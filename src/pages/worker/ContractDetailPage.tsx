import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useContracts, type Contract } from '../../hooks/useContracts';
import { ContractStatusBadge } from '../../components/contract/ContractStatusBadge';
import { ContractPreview } from '../../components/contract/ContractPreview';
import { IS_MOCK } from '../../api/supabase';
import { supabase } from '../../api/supabase';
import { Button, Paragraph, Spacing } from '@toss/tds-mobile';

export default function WorkerContractDetailPage() {
  const { id } = useParams();
  const { getContract, updateContract } = useContracts();
  const [contract, setContract] = useState<Contract | null>(null);

  useEffect(() => {
    if (id) {
      if (IS_MOCK) {
        getContract(id).then(c => {
          if (c && c.status === 'sent') {
            updateContract(id, { status: 'viewed' }).then(updated => setContract(updated));
          } else {
            setContract(c);
          }
        });
      } else {
        supabase.functions.invoke('contracts-view', {
          body: {},
          headers: { 'x-contract-id': id },
        }).then(() => getContract(id)).then(c => setContract(c));
      }
    }
  }, [id]);

  if (!contract) return (
    <div style={{ padding: 24, textAlign: 'center' }}>
      <Paragraph typography="st4" color="grey600">로딩 중...</Paragraph>
    </div>
  );

  return (
    <div style={{ padding: 24, maxWidth: 480, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Paragraph typography="st3" fontWeight="bold">근로계약서</Paragraph>
        <ContractStatusBadge status={contract.status} />
      </div>

      <ContractPreview contract={contract} />

      {['sent', 'viewed'].includes(contract.status) && (
        <>
          <Spacing size={16} />
          <Link to={`/worker/contracts/${contract.id}/sign`} style={{ textDecoration: 'none' }}>
            <Button color="primary" variant="fill" display="block" size="large">서명하기</Button>
          </Link>
        </>
      )}

      {contract.status === 'signed' && (
        <>
          <Spacing size={16} />
          <div style={{ padding: 16, backgroundColor: '#E6F9F1', borderRadius: 12, textAlign: 'center' }}>
            <Paragraph typography="st4" fontWeight="bold" color="teal700">✅ 서명 완료</Paragraph>
          </div>
        </>
      )}
    </div>
  );
}
