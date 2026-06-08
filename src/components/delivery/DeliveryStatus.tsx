interface DeliveryStatusProps {
  status: string;
  sentAt?: string;
  viewedAt?: string;
  signedAt?: string;
}

export function DeliveryStatus({ status }: DeliveryStatusProps) {
  const steps = [
    { key: 'draft', label: '작성 완료', done: true },
    { key: 'sent', label: '전송 완료', done: ['sent','viewed','signed','completed'].includes(status) },
    { key: 'viewed', label: '확인 완료', done: ['viewed','signed','completed'].includes(status) },
    { key: 'signed', label: '서명 완료', done: ['signed','completed'].includes(status) },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '12px 0' }}>
      {steps.map((step) => (
        <div key={step.key} style={{ flex: 1, textAlign: 'center' }}>
          <div style={{
            height: 4, borderRadius: 2,
            backgroundColor: step.done ? '#3182F6' : '#E5E8EB',
            marginBottom: 6,
          }} />
          <span style={{ fontSize: 11, color: step.done ? '#3182F6' : '#6B7684' }}>{step.label}</span>
        </div>
      ))}
    </div>
  );
}
