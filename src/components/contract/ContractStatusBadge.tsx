import { Badge } from '@toss/tds-mobile';
import { getContractBadge } from '../../utils/badgeUtils';

export function ContractStatusBadge({ status }: { status: string }) {
  const badge = getContractBadge(status);
  return (
    <Badge size="small" variant="fill" color={badge.color}>
      {badge.label}
    </Badge>
  );
}
