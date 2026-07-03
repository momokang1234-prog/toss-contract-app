import { useNavigate } from 'react-router-dom';
import { useContracts } from '../../hooks/useContracts';
import { Fragment } from 'react';
import { Top, Paragraph, Spacing, Button, List, ListRow, Badge } from '@toss/tds-mobile';
import { Suspense, Delay } from '@suspensive/react';
import { CONTRACT_TYPE_LABEL } from '../../utils/labels';
import { CommentBoundary } from '../dev/CommentBoundary';
import { getContractBadge } from '../../utils/badgeUtils';
import styles from './ContractListPage.module.css';

import { InviteWorkerSheet } from '../../components/delivery/InviteWorkerSheet';
import { useState } from 'react';
import { TextButton } from '@toss/tds-mobile';

function ContractListContent({ contracts, navigate, onNewContract }: {
  contracts: any[];
  navigate: (path: string) => void;
  onNewContract: () => void;
}) {
  return (
    <div className={styles.content}>
      <Paragraph typography="t3" fontWeight="bold">근로계약서</Paragraph>
      <Spacing size={12} />
      <Paragraph typography="t5" color="grey-500">
        {contracts.length > 0
          ? `총 ${contracts.length}건의 계약서가 있어요`
          : '아직 작성한 계약서가 없어요'}
      </Paragraph>

      <Spacing size={12} />

      {contracts.length > 0 ? (
        <CommentBoundary name="계약서-목록">
          <div style={{ margin: '0 -20px' }}>
            <List>
          {contracts.map((c, index) => {
            // 미성년자 계약의 미수령 서류 계산
            const pendingDocs = [
              c.doc_parent_consent_status,
              c.doc_family_cert_status,
              c.doc_employment_permit_status,
            ].filter(s => s === 'required').length;
            return (
              <Fragment key={c.id}>
            <ListRow
              onClick={() => navigate(`/employer/contracts/${c.id}`)}
              aria-label={c.worker_name}
              contents={
                <div className={pendingDocs > 0 ? styles.contractRowAlert : styles.contractRow}>
                  <div className={styles.nameRow}>
                    <Paragraph typography="t5" fontWeight="bold" color="grey-800">
                      {c.worker_name} ({CONTRACT_TYPE_LABEL[c.contract_type as keyof typeof CONTRACT_TYPE_LABEL]})
                    </Paragraph>
                    {c.is_minor && (
                      <span className={styles.minorTag}>미성년자</span>
                    )}
                  </div>
                  <Spacing size={4} />
                  <Paragraph typography="t7" color="grey-500">
                    {c.workplace}
                  </Paragraph>
                  <Spacing size={4} />
                  <Paragraph typography="t7" color="grey-500">
                    {c.start_date}
                  </Paragraph>
                  {c.is_minor && pendingDocs > 0 && (
                    <>
                      <Spacing size={6} />
                      <span className={styles.docAlert}>⚠️ 친권자 동의서 등 필수 수령 대기 서류 {pendingDocs}건</span>
                    </>
                  )}
                  {c.is_minor && pendingDocs === 0 && (
                    <>
                      <Spacing size={6} />
                      <span className={styles.docDone}>✅ 서류 비치 완료</span>
                    </>
                  )}
                </div>
              }
              right={
                <Badge size="small" variant="fill" color={getContractBadge(c.status).color}>
                  {getContractBadge(c.status).label}
                </Badge>
              }
            />
              {index < contracts.length - 1 && <div className={styles.divider} />}
              </Fragment>
            );
          })}
        </List>
          </div>
        </CommentBoundary>
      ) : (
        <div className={styles.empty}>
          <img src="https://static.toss.im/2d-emojis/png/4x/u1F4CB.png" alt=""
            style={{ width: 72, height: 72 }}
          />
          <Spacing size={16} />
          <Paragraph typography="t5" color="grey-600" fontWeight="bold">
            첫 계약서를 작성해보세요
          </Paragraph>
          <Spacing size={24} />
          <Button color="primary" variant="fill" size="large"
            onClick={onNewContract}>
            계약서 작성하기
          </Button>
        </div>
      )}

      <Spacing size={40} />
    </div>
  );
}
export default function ContractListPage() {
  const navigate = useNavigate();
  const { contracts, loading, error, refetch } = useContracts();
  const [isInviteSheetOpen, setIsInviteSheetOpen] = useState(false);

  // Filter out templates from the general list
  const activeContracts = contracts.filter(c => c.status !== 'template');

  // Error state
  if (error && !loading) {
    return (
      <div className={styles.page}>
        <Top title="">
          <Button color="primary" variant="weak" size="small"
            onClick={() => setIsInviteSheetOpen(true)}>
            + 새 계약서
          </Button>
        </Top>
        <div className={styles.content}>
          <div className={styles.empty}>
            <img src="https://static.toss.im/2d-emojis/png/4x/u1F514.png" alt=""
              style={{ width: 72, height: 72 }}
            />
            <Spacing size={16} />
            <Paragraph typography="t5" color="grey-600" fontWeight="bold">
              계약서를 불러오지 못했어요
            </Paragraph>
            <Spacing size={8} />
            <Paragraph typography="t7" color="grey-500">
              네트워크 연결을 확인하고 다시 시도해주세요
            </Paragraph>
            <Spacing size={24} />
            <TextButton color="primary" variant="ghost" size="large" onClick={refetch}>
              다시 시도
            </TextButton>
          </div>
        </div>
        <InviteWorkerSheet open={isInviteSheetOpen} onClose={() => setIsInviteSheetOpen(false)} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Top title="">
        <Button color="primary" variant="weak" size="small"
          onClick={() => setIsInviteSheetOpen(true)}>
          + 새 계약서
        </Button>
      </Top>

      <Suspense
        clientOnly
        fallback={
          <Delay ms={200}>
            {({ isDelayed }) => isDelayed && (
              <div style={{ opacity: isDelayed ? 1 : 0 }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{
                    height: 72, margin: '8px 0', borderRadius: 12,
                    background: '#F5F6F8', animation: 'pulse 1.5s infinite'
                  }} />
                ))}
              </div>
            )}
          </Delay>
        }
      >
        <ContractListContent contracts={activeContracts} navigate={navigate} onNewContract={() => setIsInviteSheetOpen(true)} />
      </Suspense>

      <InviteWorkerSheet open={isInviteSheetOpen} onClose={() => setIsInviteSheetOpen(false)} />
    </div>
  );
}
