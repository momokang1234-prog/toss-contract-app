import { useParams, useNavigate } from 'react-router-dom';
import { useContracts } from '../../hooks/useContracts';
import { Top, Spacing, Paragraph, Button, Loader } from '@toss/tds-mobile';
import { useState, useEffect } from 'react';

export default function WorkerInvitePage() {
  const { id } = useParams();
  const { getContract, acceptInvite } = useContracts();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState<any>(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const data = await getContract(id);
      setContract(data);
      setLoading(false);
    }
    load();
  }, [id, getContract]);

  const handleAccept = async () => {
    if (!id) return;
    setAccepting(true);
    try {
      // Mock CI flow
      const mockWorkerInfo = {
        name: '홍길동',
        phone: '01012345678',
        ci: 'MOCK_CI_12345'
      };
      await acceptInvite(id, mockWorkerInfo);
      alert('연결이 완료되었습니다! 사장님이 계약서를 작성하면 알림을 보내드릴게요.');
      navigate('/worker/contracts');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Loader size="large" />
      </div>
    );
  }

  if (!contract || contract.status !== 'invited') {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spacing size={100} />
        <Paragraph typography="t4">유효하지 않거나 이미 만료된 초대장입니다.</Paragraph>
        <Spacing size={24} />
        <Button onClick={() => navigate('/login')}>홈으로 가기</Button>
      </div>
    );
  }

  return (
    <div>
      <Top title="근로계약서 연결" />
      <div style={{ padding: '0 24px 24px' }}>
        <Spacing size={40} />
        <Paragraph typography="t3" fontWeight="bold">
          사장님이 근로계약서 작성을 위해<br />
          정보 연결을 요청했어요
        </Paragraph>
        <Spacing size={16} />
        <Paragraph typography="t5" color="grey-600">
          안전하고 정확한 전자계약을 위해 본인인증을 진행합니다.<br />
          사장님이 계약서를 완성하면 다시 알림을 드립니다.
        </Paragraph>

        <Spacing size={40} />
        
        <Button size="large" variant="fill" color="primary" loading={accepting} onClick={handleAccept}>
          본인인증하고 연결하기
        </Button>
      </div>
    </div>
  );
}
