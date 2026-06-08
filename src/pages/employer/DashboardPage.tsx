import { Link } from 'react-router-dom';
import { useBusiness } from '../../hooks/useBusiness';
import { useContracts } from '../../hooks/useContracts';

export default function DashboardPage() {
  const { businesses, loading: bizLoading } = useBusiness();
  const { contracts } = useContracts();

  const stats = {
    total: contracts.length,
    draft: contracts.filter(c => c.status === 'draft').length,
    sent: contracts.filter(c => c.status === 'sent').length,
    signed: contracts.filter(c => c.status === 'signed').length,
  };

  return (
    <div style={{ padding: 24, maxWidth: 480, margin: '0 auto' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>사장님 대시보드</h2>

      {businesses.length === 0 && !bizLoading && (
        <div style={{ padding: 20, backgroundColor: '#FFF8E1', borderRadius: 12, marginBottom: 24, textAlign: 'center' }}>
          <p style={{ marginBottom: 12 }}>사업장을 먼저 등록해주세요.</p>
          <Link to="/employer/business/new" style={{ color: '#3182F6', fontWeight: 600 }}>사업장 등록하기</Link>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        {[{ label: '전체', value: stats.total }, { label: '작성 중', value: stats.draft }, { label: '전송됨', value: stats.sent }, { label: '서명 완료', value: stats.signed }].map(s => (
          <div key={s.label} style={{ padding: 16, border: '1px solid #E5E8EB', borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{s.value}</div>
            <div style={{ fontSize: 13, color: '#6B7684' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <Link to="/employer/contracts/new" style={{ flex: 1, padding: '14px', textAlign: 'center', backgroundColor: '#3182F6', color: '#fff', borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>+ 새 계약</Link>
        <Link to="/employer/contracts" style={{ flex: 1, padding: '14px', textAlign: 'center', backgroundColor: '#F5F6F8', color: '#333D4B', border: '1px solid #E5E8EB', borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>전체 목록</Link>
      </div>
    </div>
  );
}
