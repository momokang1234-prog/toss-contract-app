import { useContracts } from '../../hooks/useContracts';
import { ContractCard } from '../../components/contract/ContractCard';

export default function WorkerContractListPage() {
  const { contracts, loading } = useContracts();

  return (
    <div style={{ padding: 24, maxWidth: 480, margin: '0 auto' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>내 계약 목록</h2>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6B7684' }}>로딩 중...</div>
      ) : contracts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6B7684' }}>
          <p>아직 받은 계약서가 없어요.</p>
          <p style={{ fontSize: 13 }}>사장님이 계약서를 전송하면 여기에 표시돼요.</p>
        </div>
      ) : (
        contracts.map(c => <ContractCard key={c.id} contract={c} basePath="/worker/contracts" />)
      )}
    </div>
  );
}
