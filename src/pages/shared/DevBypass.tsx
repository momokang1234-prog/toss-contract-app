import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function DevBypass() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const role = searchParams.get('role') as 'employer' | 'worker';
    const path = searchParams.get('path');

    if (role) {
      if (sessionStorage.getItem('force_mock') !== 'true') {
        sessionStorage.setItem('force_mock', 'true');
        window.location.reload();
        return;
      }
      login(role).then(() => {
        if (path) navigate(path, { replace: true });
      });
    } else if (path) {
      navigate(path, { replace: true });
    }
  }, [searchParams, navigate, login]);

  return <div style={{ padding: 20 }}>개발 환경 우회 중...</div>;
}
