import { useState } from 'react';
import { useDelivery } from '../../hooks/useDelivery';
import { Button, Paragraph, SegmentedControl, Spacing } from '@toss/tds-mobile';

interface SendContractSheetProps {
  contractId: string;
  workerName: string;
  onClose: () => void;
  onSent: () => void;
}

export function SendContractSheet({ contractId, workerName, onClose, onSent }: SendContractSheetProps) {
  const { send, sending } = useDelivery();
  const [method, setMethod] = useState<'sms' | 'push' | 'share'>('sms');

  const handleSend = async () => {
    await send(contractId, method);
    onSent();
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
      padding: 24, boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
      maxWidth: 480, margin: '0 auto',
    }}>
      <div style={{ width: 40, height: 4, backgroundColor: '#E5E8EB', borderRadius: 2, margin: '0 auto 16px' }} />
      <Paragraph typography="st2" fontWeight="bold">{workerName}에게 전송</Paragraph>
      <Spacing size={8} />
      <Paragraph typography="st4" color="grey600">전송 방식을 선택해주세요.</Paragraph>
      <Spacing size={16} />

      <SegmentedControl
        value={method}
        onChange={(value) => setMethod(value as 'sms' | 'push' | 'share')}
      >
        <SegmentedControl.Item value="sms">SMS</SegmentedControl.Item>
        <SegmentedControl.Item value="push">Push 알림</SegmentedControl.Item>
        <SegmentedControl.Item value="share">직접 공유</SegmentedControl.Item>
      </SegmentedControl>
      <Spacing size={24} />

      <div style={{ display: 'flex', gap: 8 }}>
        <Button color="light" variant="weak" size="large" style={{ flex: 1 }} onClick={onClose}>
          취소
        </Button>
        <Button
          color="primary"
          variant="fill"
          size="large"
          style={{ flex: 2 }}
          onClick={handleSend}
          disabled={sending}
        >
          {sending ? '전송 중...' : '전송하기'}
        </Button>
      </div>
    </div>
  );
}
