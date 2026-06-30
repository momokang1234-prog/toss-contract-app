import { BottomSheet, Button, Spacing, Paragraph } from '@toss/tds-mobile';
import { useContracts } from '../../hooks/useContracts';
import { useBusiness } from '../../hooks/useBusiness';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export function InviteWorkerSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { businesses } = useBusiness();
  const { inviteWorker } = useContracts();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const businessId = businesses[0]?.id; // Defaulting to first business for MVP

  const handleInvite = async () => {
    if (!businessId) {
      alert('사업장을 먼저 등록해주세요.');
      onClose();
      navigate('/employer/business/new');
      return;
    }
    
    setLoading(true);
    try {
      const contract = await inviteWorker(businessId);
      onClose();
      // Mock Share SDK
      alert(`[Mock 카카오톡 공유]\n근로자에게 초대 링크가 발송되었습니다!\n초대장 딥링크: /worker/invite/${contract.id}`);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet open={open} onClose={onClose} header={<BottomSheet.Header>어떤 방식으로 연결할까요?</BottomSheet.Header>}>
      <div style={{ padding: '0 24px 24px' }}>
        <Paragraph typography="t5" color="grey-600">
          근로자의 카카오톡이나 문자로 연결 초대장을 보냅니다.<br />
          근로자가 본인인증을 완료하면 사장님이 계약서를 쓸 수 있습니다.
        </Paragraph>
        <Spacing size={24} />
        <Button size="large" variant="fill" color="primary" loading={loading} onClick={handleInvite}>
          카카오톡으로 초대하기
        </Button>
        <Spacing size={12} />
        <Button size="large" variant="weak" color="primary" onClick={onClose}>
          닫기
        </Button>
      </div>
    </BottomSheet>
  );
}
