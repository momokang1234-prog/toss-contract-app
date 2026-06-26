import { useState } from 'react';
import type { Contract } from '../../hooks/useContracts';
import { Button, Paragraph, Spacing, Badge } from '@toss/tds-mobile';
import styles from './DocumentReceiptTracker.module.css';

interface DocumentReceiptTrackerProps {
  contract: Contract;
  onMarkReceived: (docType: 'parent_consent' | 'family_cert' | 'employment_permit') => Promise<unknown>;
}

interface DocItem {
  key: 'parent_consent' | 'family_cert' | 'employment_permit';
  label: string;
  desc: string;
  status: 'not_required' | 'required' | 'received';
  markable: boolean; // 수령 확인 버튼 노출 여부 (실물 수령 서류만)
}

/**
 * 미성년자 근로계약 서류 수령 추적기.
 * 친권자 동의서는 전자로 완료되어 자동 received, 가족관계증명서/취직인허증은
 * 실물 오프라인 수령이므로 사장님이 "수령 확인" 버튼으로 상태 전환.
 */
export function DocumentReceiptTracker({ contract, onMarkReceived }: DocumentReceiptTrackerProps) {
  const [marking, setMarking] = useState<string | null>(null);

  if (!contract.is_minor) return null;

  const items: DocItem[] = [
    {
      key: 'parent_consent',
      label: '친권자 동의서',
      desc: '근로기준법 제66조 — 실물 사업장 비치 (자필 서명)',
      status: contract.doc_parent_consent_status ?? 'required',
      markable: true,
    },
    {
      key: 'family_cert',
      label: '가족관계증명서',
      desc: '근로기준법 제66조 — 실물 사업장 비치',
      status: contract.doc_family_cert_status ?? 'required',
      markable: true,
    },
    ...(contract.doc_employment_permit_status && contract.doc_employment_permit_status !== 'not_required'
      ? [{
          key: 'employment_permit' as const,
          label: '취직인허증',
          desc: '만 15세 미만 — 고용노동부 발급',
          status: contract.doc_employment_permit_status,
          markable: true,
        }]
      : []),
  ];

  const pendingCount = items.filter(i => i.status === 'required').length;

  const handleMark = async (docType: 'parent_consent' | 'family_cert' | 'employment_permit') => {
    setMarking(docType);
    try {
      await onMarkReceived(docType);
    } catch {
      alert('수령 확인 처리에 실패했습니다');
    } finally {
      setMarking(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Paragraph typography="t5" fontWeight="bold">📄 미성년자 필수 서류</Paragraph>
        {pendingCount > 0 ? (
          <Badge size="small" variant="fill" color="yellow">수령 대기 {pendingCount}건</Badge>
        ) : (
          <Badge size="small" variant="fill" color="green">전부 수령 완료</Badge>
        )}
      </div>
      <Spacing size={12} />
      <div className={styles.list}>
        {items.map(item => (
          <div key={item.key} className={styles.row}>
            <div className={styles.rowMain}>
              <div className={styles.rowLabel}>
                <span className={styles.dot} data-status={item.status} />
                <span className={styles.rowTitle}>{item.label}</span>
                {item.status === 'received' && <span className={styles.check}>✓</span>}
              </div>
              <Paragraph typography="t7" color="grey-500">{item.desc}</Paragraph>
            </div>
            {item.markable && item.status === 'required' && (
              <Button
                color="primary"
                variant="weak"
                size="small"
                loading={marking === item.key}
                onClick={() => handleMark(item.key as 'parent_consent' | 'family_cert' | 'employment_permit')}
              >
                직접 제출 받았어요
              </Button>
            )}
            {item.markable && item.status === 'received' && (
              <span className={styles.receivedLabel}>수령됨</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
