export type BadgeColor = 'blue' | 'teal' | 'green' | 'red' | 'yellow' | 'elephant';

export const getContractBadge = (status: string): { label: string; color: BadgeColor } => {
  switch (status) {
    case 'draft':
    case 'sent':
    case 'viewed':
    case 'rejected':
      return { label: '서명 대기', color: 'yellow' };
    case 'signed':
    case 'completed':
      return { label: '완료', color: 'blue' };
    case 'cancelled':
    case 'expired':
      return { label: '취소됨', color: 'elephant' };
    default:
      return { label: status, color: 'elephant' };
  }
};
