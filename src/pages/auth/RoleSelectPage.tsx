import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function RoleSelectPage() {
  const navigate = useNavigate();
  const { setRole } = useAuth();

  const handleSelect = async (role: 'employer' | 'worker') => {
    await setRole(role);
    if (role === 'employer') navigate('/employer/dashboard', { replace: true });
    else navigate('/worker/contracts', { replace: true });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>시작 방법 선택</h2>
      <p style={{ color: '#6B7684', marginBottom: 32, textAlign: 'center' }}>어떻게 사용하시나요?</p>

      <button
        onClick={() => handleSelect('employer')}
        style={{ width: '100%', maxWidth: 320, padding: '20px', marginBottom: 12, backgroundColor: '#fff', border: '2px solid #E5E8EB', borderRadius: 12, cursor: 'pointer', textAlign: 'left' }}
      >
        <div style={{ fontSize: 16, fontWeight: 600 }}>사장님</div>
        <div style={{ fontSize: 14, color: '#6B7684', marginTop: 4 }}>근로계약서를 작성하고 관리해요</div>
      </button>

      <button
        onClick={() => handleSelect('worker')}
        style={{ width: '100%', maxWidth: 320, padding: '20px', backgroundColor: '#fff', border: '2px solid #E5E8EB', borderRadius: 12, cursor: 'pointer', textAlign: 'left' }}
      >
        <div style={{ fontSize: 16, fontWeight: 600 }}>근로자</div>
        <div style={{ fontSize: 14, color: '#6B7684', marginTop: 4 }}>받은 계약서를 확인하고 서명해요</div>
      </button>
    </div>
  );
}
