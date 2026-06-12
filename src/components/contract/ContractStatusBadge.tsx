import { Badge } from '@toss/tds-mobile';

const STATUS_CONFIG: Record<string, { label: string; color: 'blue' | 'teal' | 'green' | 'red' | 'yellow' | 'elephant' }> = {
  draft: { label: '작성 중', color: 'elephant' },
  sent: { label: '전송 완료', color: 'blue' },
  viewed: { label: '확인 완료', color: 'teal' },
  signed: { label: '계약 완료', color: 'green' },
  completed: { label: '계약 완료', color: 'green' },
  cancelled: { label: '취소됨', color: 'red' },
  expired: { label: '만료됨', color: 'elephant' },
  rejected: { label: '수정 요청됨', color: 'blue' },
};

export function ContractStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <Badge size="small" variant="fill" color={config.color}>
      {config.label}
    </Badge>
  );
}
