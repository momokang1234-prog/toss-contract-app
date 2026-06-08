import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, userRole, isLoading } = useAuth();

  // 이미 로그인된 경우 역할에 따라 리다이렉트
  if (isAuthenticated && !isLoading) {
    if (userRole === 'employer') navigate('/employer/dashboard', { replace: true });
    else if (userRole === 'worker') navigate('/worker/contracts', { replace: true });
    else navigate('/role-select', { replace: true });
    return null;
  }

  const handleLogin = async () => {
    try {
      await login();
    } catch (err) {
      console.error('로그인 실패:', err);
      alert('로그인에 실패했습니다.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>근로계약서</h1>
      <p style={{ color: '#6B7684', marginBottom: 32 }}>토스에서 간편하게 근로계약서를 작성하고 관리하세요.</p>
      <button
        onClick={handleLogin}
        style={{ width: '100%', maxWidth: 320, padding: '16px 24px', backgroundColor: '#3182F6', color: '#fff', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: 'pointer' }}
      >
        토스로 시작하기
      </button>
    </div>
  );
}
