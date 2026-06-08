import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { IS_MOCK } from '../../api/supabase';

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

  const handleLogin = async (role?: 'employer' | 'worker') => {
    try {
      await login(role);
    } catch (err) {
      console.error('로그인 실패:', err);
      alert('로그인에 실패했습니다.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>근로계약서</h1>
      <p style={{ color: '#6B7684', marginBottom: 32 }}>토스에서 간편하게 근로계약서를 작성하고 관리하세요.</p>

      {IS_MOCK ? (
        <>
          <button
            onClick={() => handleLogin('employer')}
            disabled={isLoading}
            style={{ width: '100%', maxWidth: 320, padding: '16px 24px', backgroundColor: '#3182F6', color: '#fff', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: 'pointer', marginBottom: 12 }}
          >
            {isLoading ? '로그인 중...' : '사장님으로 로그인'}
          </button>
          <button
            onClick={() => handleLogin('worker')}
            disabled={isLoading}
            style={{ width: '100%', maxWidth: 320, padding: '16px 24px', backgroundColor: '#fff', color: '#3182F6', border: '2px solid #3182F6', borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: 'pointer' }}
          >
            {isLoading ? '로그인 중...' : '근로자로 로그인'}
          </button>
        </>
      ) : (
        <button
          onClick={() => handleLogin()}
          disabled={isLoading}
          style={{ width: '100%', maxWidth: 320, padding: '16px 24px', backgroundColor: '#3182F6', color: '#fff', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: 'pointer' }}
        >
          토스로 시작하기
        </button>
      )}
    </div>
  );
}
