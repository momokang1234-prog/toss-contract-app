import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function DevBypass() {
  const [searchParams] = useSearchParams();
  const { login, setRole } = useAuth();

  useEffect(() => {
    const role = searchParams.get('role') as 'employer' | 'worker';

    const rawPath = searchParams.get('path') || '';
    const xray = searchParams.get('xray');
    const v = searchParams.get('v');

    const [basePath, existingQs] = rawPath.split('?');
    const merged = new URLSearchParams(existingQs || '');
    if (xray === 'true') merged.set('xray', 'true');
    if (v) merged.set('v', v);
    const mergedQs = merged.toString();
    const finalPath = mergedQs ? `${basePath}?${mergedQs}` : basePath;
    if (role) {
      if (sessionStorage.getItem('force_mock') !== 'true') {
        sessionStorage.setItem('force_mock', 'true');
        window.location.reload();
        return;
      }
      login().then(() => setRole(role)).then(() => {
        window.location.replace(finalPath);
      });
    } else if (rawPath) {
      window.location.replace(finalPath);
    }
  }, [searchParams, login]);

  return <div style={{ padding: 20 }}>개발 환경 우회 중...</div>;
}
