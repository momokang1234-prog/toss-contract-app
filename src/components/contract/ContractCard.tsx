import { Paragraph, Badge } from '@toss/tds-mobile';
import type { Contract } from '../../hooks/useContracts';
import styles from './ContractCard.module.css';

interface ContractCardProps {
  contract: Contract;
}

export function ContractCard({ contract }: ContractCardProps) {
  const typeLabel =
    contract.contract_type === 'fullTime' ? '정규직'
    : contract.contract_type === 'partTime' ? '단시간'
    : '기간제';

  const badge = (() => {
    switch (contract.status) {
      case 'draft': return { label: '작성중', color: 'blue' as const };
      case 'sent': case 'viewed': return { label: '진행중', color: 'teal' as const };
      case 'signed': return { label: '계약 완료', color: 'green' as const };
      case 'completed': return { label: '계약 완료', color: 'green' as const };
      case 'rejected': return { label: '수정 요청됨', color: 'blue' as const };
      default: return { label: contract.status, color: 'elephant' as const };
    }
  })();

  return (
    <div className={styles.card}>
      <div className={styles.row}>
        <Paragraph typography="st5" fontWeight="bold">{contract.worker_name}</Paragraph>
        <Badge size="small" variant="fill" color={badge.color}>{badge.label}</Badge>
      </div>
      <Paragraph typography="st7" color="grey-500">
        {typeLabel} · {contract.workplace} · {contract.start_date}
      </Paragraph>
    </div>
  );
}
