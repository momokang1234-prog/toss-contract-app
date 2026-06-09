import { useContracts } from '../../hooks/useContracts';
import { ContractCard } from '../../components/contract/ContractCard';
import { Link } from 'react-router-dom';
import { Button, Spacing, Skeleton, Paragraph } from '@toss/tds-mobile';

export default function ContractListPage() {
  const { contracts, loading } = useContracts();

  return (
    <div style={{ padding: 24, maxWidth: 480, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Paragraph typography="st3" fontWeight="bold">근로계약 목록</Paragraph>
        <Link to="/employer/contracts/new" style={{ textDecoration: 'none' }}>
          <Button color="primary" variant="fill" size="small">+ 새 계약</Button>
        </Link>
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Skeleton />
          <Spacing size={8} />
          <Skeleton />
          <Spacing size={8} />
          <Skeleton />
        </div>
      ) : contracts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#6B7684' }}>
          <p>아직 계약서가 없어요.</p>
          <Spacing size={12} />
          <Link to="/employer/contracts/new" style={{ color: '#3182F6' }}>첫 계약서 작성하기</Link>
        </div>
      ) : (
        contracts.map(c => <ContractCard key={c.id} contract={c} basePath="/employer/contracts" />)
      )}
    </div>
  );
}
