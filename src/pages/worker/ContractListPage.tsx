import { useContracts } from '../../hooks/useContracts';
import { ContractCard } from '../../components/contract/ContractCard';
import { Spacing, Skeleton, Paragraph } from '@toss/tds-mobile';

export default function WorkerContractListPage() {
  const { contracts, loading } = useContracts();

  return (
    <div style={{ padding: 24, maxWidth: 480, margin: '0 auto' }}>
      <Paragraph typography="st3" fontWeight="bold">내 계약 목록</Paragraph>
      <Spacing size={24} />
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Skeleton />
          <Spacing size={8} />
          <Skeleton />
          <Spacing size={8} />
          <Skeleton />
        </div>
      ) : contracts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Paragraph typography="st4" color="grey600">아직 받은 계약서가 없어요.</Paragraph>
          <Spacing size={8} />
          <Paragraph typography="st6" color="grey500">사장님이 계약서를 전송하면 여기에 표시돼요.</Paragraph>
        </div>
      ) : (
        contracts.map(c => <ContractCard key={c.id} contract={c} basePath="/worker/contracts" />)
      )}
    </div>
  );
}
