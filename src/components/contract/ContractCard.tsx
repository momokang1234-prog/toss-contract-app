import { Paragraph, Badge } from '@toss/tds-mobile';
import type { Contract } from '../../hooks/useContracts';
import { getContractBadge } from '../../utils/badgeUtils';
import styles from './ContractCard.module.css';

interface ContractCardProps {
  contract: Contract;
}

export function ContractCard({ contract }: ContractCardProps) {
  const typeLabel =
    contract.contract_type === 'fullTime' ? '정규직'
    : contract.contract_type === 'partTime' ? '단시간'
    : '기간제';

  const badge = getContractBadge(contract.status);

  return (
    <div className={styles.card}>
      <div className={styles.row}>
        <Paragraph typography="t5" fontWeight="bold">{contract.worker_name}</Paragraph>
        <Badge size="small" variant="fill" color={badge.color}>{badge.label}</Badge>
      </div>
      <div style={{ marginTop: 8 }}>
        <Paragraph typography="t7" color="grey-500">
          {typeLabel} · {contract.workplace} · {contract.start_date}
        </Paragraph>
      </div>
    </div>
  );
}
