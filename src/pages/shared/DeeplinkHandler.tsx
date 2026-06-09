import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Paragraph } from '@toss/tds-mobile';

export function DeeplinkHandler() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useAuth();

  useEffect(() => {
    if (!id) { navigate('/login'); return; }
    if (!isAuthenticated) { navigate(`/login?redirect=/contract/${id}`, { replace: true }); return; }

    if (userRole === 'worker') {
      navigate(`/worker/contracts/${id}`, { replace: true });
    } else if (userRole === 'employer') {
      navigate(`/employer/contracts/${id}`, { replace: true });
    } else {
      navigate(`/worker/contracts/${id}`, { replace: true });
    }
  }, [id, isAuthenticated, userRole, navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Paragraph typography="st4" color="grey600">계약서 로딩 중...</Paragraph>
    </div>
  );
}
