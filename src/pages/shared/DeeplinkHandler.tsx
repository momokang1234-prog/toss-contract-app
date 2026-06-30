import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Paragraph } from '@toss/tds-mobile';
import styles from './DeeplinkHandler.module.css';
import { useContracts } from '../../hooks/useContracts';

export function DeeplinkHandler() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useAuth();
  const { getContract } = useContracts();

  useEffect(() => {
    async function handle() {
      if (!id) { navigate('/login'); return; }
      if (!isAuthenticated) { navigate(`/login?redirect=/contract/${id}`, { replace: true }); return; }

      const contract = await getContract(id);
      
      if (contract?.status === 'invited' && userRole === 'worker') {
        navigate(`/worker/invite/${id}`, { replace: true });
        return;
      }

      if (userRole === 'worker') {
        navigate(`/worker/contracts/${id}`, { replace: true });
      } else if (userRole === 'employer') {
        navigate(`/employer/contracts/${id}`, { replace: true });
      } else {
        navigate(`/worker/contracts/${id}`, { replace: true });
      }
    }
    handle();
  }, [id, isAuthenticated, userRole, navigate, getContract]);

  return (
    <div className={styles.container}>
      <Paragraph typography="st4" color="grey-600">계약서 로딩 중...</Paragraph>
    </div>
  );
}
