const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: '작성 중', color: '#6B7684', bg: '#F2F4F6' },
  sent: { label: '전송 완료', color: '#3182F6', bg: '#E8F0FE' },
  viewed: { label: '확인 완료', color: '#00826D', bg: '#E6F9F1' },
  signed: { label: '서명 완료', color: '#00826D', bg: '#E6F9F1' },
  completed: { label: '계약 완료', color: '#00826D', bg: '#E6F9F1' },
  cancelled: { label: '취소됨', color: '#FF5252', bg: '#FFEBEE' },
  expired: { label: '만료됨', color: '#6B7684', bg: '#F2F4F6' },
};

export function ContractStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <span style={{
      display: 'inline-block', padding: '4px 10px', borderRadius: 6,
      fontSize: 12, fontWeight: 600, color: config.color, backgroundColor: config.bg,
    }}>
      {config.label}
    </span>
  );
}
