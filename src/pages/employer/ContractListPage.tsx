import { useContracts } from '../../hooks/useContracts';
import { ContractCard } from '../../components/contract/ContractCard';
import { Link } from 'react-router-dom';

export default function ContractListPage() {
  const { contracts, loading } = useContracts();

  return (
    <div style={{ padding: 24, maxWidth: 480, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>근로계약 목록</h2>
        <Link to="/employer/contracts/new" style={{ padding: '8px 16px', backgroundColor: '#3182F6', color: '#fff', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>+ 새 계약</Link>
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6B7684' }}>로딩 중...</div>
      ) : contracts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6B7684' }}>
          <p>아직 계약서가 없어요.</p>
          <Link to="/employer/contracts/new" style={{ color: '#3182F6' }}>첫 계약서 작성하기</Link>
        </div>
      ) : (
        contracts.map(c => <ContractCard key={c.id} contract={c} basePath="/employer/contracts" />)
      )}
    </div>
  );
}
