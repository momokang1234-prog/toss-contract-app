import { useState } from 'react';
import { useDelivery } from '../../hooks/useDelivery';

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
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{workerName}에게 전송</h3>
      <p style={{ fontSize: 14, color: '#6B7684', marginBottom: 20 }}>전송 방식을 선택해주세요.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[{ v: 'sms', l: 'SMS' }, { v: 'push', l: 'Push 알림' }, { v: 'share', l: '직접 공유' }].map(opt => (
          <button key={opt.v} onClick={() => setMethod(opt.v as any)} style={{
            flex: 1, padding: '12px 0', fontSize: 14, fontWeight: method === opt.v ? 600 : 400,
            color: method === opt.v ? '#fff' : '#333D4B',
            backgroundColor: method === opt.v ? '#3182F6' : '#F5F6F8',
            border: 'none', borderRadius: 10, cursor: 'pointer',
          }}>{opt.l}</button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onClose} style={{ flex: 1, padding: '14px', backgroundColor: '#F5F6F8', border: 'none', borderRadius: 10, fontSize: 15, cursor: 'pointer' }}>취소</button>
        <button onClick={handleSend} disabled={sending} style={{
          flex: 2, padding: '14px', backgroundColor: '#3182F6', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600,
          cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.6 : 1,
        }}>{sending ? '전송 중...' : '전송하기'}</button>
      </div>
    </div>
  );
}
