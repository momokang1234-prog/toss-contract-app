import { useEffect, useState } from 'react';
import { CommentBoundary } from '../dev/CommentBoundary';
import { supabase, IS_MOCK } from '../../api/supabase';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useContracts, type Contract } from '../../hooks/useContracts';
import { useBusiness } from '../../hooks/useBusiness';
import { Top, Paragraph, Spacing, Button, Badge, TextField, ListRow, BottomSheet } from '@toss/tds-mobile';
import { getContractBadge } from '../../utils/badgeUtils';
import { ContractDocumentView } from '../../components/contract/ContractDocumentView';
import styles from './ContractDetailPage.module.css';

function ArrowLeftIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="#191F28" />
    </svg>
  );
}

function FloatingBackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        zIndex: 100,
        cursor: 'pointer'
      }}
    >
      <ArrowLeftIcon />
    </button>
  );
}

function getHeaderConfig(status: string, businessName: string, t: (k: string, opt?: Record<string, unknown>) => string) {
  if (status === 'sent' || status === 'viewed') {
    return {
      cardClass: '',
      title: t('worker.header.sent', { business: businessName }),
      subtitle: t('worker.header.sentSub'),
      emoji: '✍️',
    };
  }
  if (status === 'signed' || status === 'completed') {
    return {
      cardClass: styles.completed,
      title: t('worker.header.signed', { business: businessName }),
      subtitle: t('worker.header.signedSub'),
      emoji: '✅',
    };
  }
  if (status === 'rejected') {
    return {
      cardClass: styles.rejected,
      title: t('worker.header.rejected'),
      subtitle: t('worker.header.rejectedSub'),
      emoji: '💬',
    };
  }
  return {
    cardClass: '',
    title: t('worker.header.default', { business: businessName }),
    subtitle: '',
    emoji: '📄',
  };
}

export default function WorkerContractDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getContract, viewContract, rejectContract, requestChangeContract } = useContracts();
  const { businesses } = useBusiness();
  const [contract, setContract] = useState<Contract | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [rejectHardReason, setRejectHardReason] = useState('');
  const [rejectingHard, setRejectingHard] = useState(false);
  const [isHardRejectBottomSheetOpen, setIsHardRejectBottomSheetOpen] = useState(false);
  const [isConsentBottomSheetOpen, setIsConsentBottomSheetOpen] = useState(false);
  const [parentPhone, setParentPhone] = useState('');
  const [sendingConsent, setSendingConsent] = useState(false);

  useEffect(() => {
    if (!id) { setError('계약서 ID가 없습니다'); return; }
    getContract(id).then(c => {
      if (!c) setError('계약서를 찾을 수 없습니다');
      else {
        setContract(c);
        if (c.status === 'sent') {
          viewContract(id).then(u => {
            if (u) setContract(u);
          });
        }
      }
    }).catch(() => setError('불러오기에 실패했습니다'));
  }, [id]);

  const handleChangeRequest = async () => {
    if (!contract || (contract.status !== 'sent' && contract.status !== 'viewed')) return;
    if (!confirm(t('worker.action.rejectConfirm'))) return;
    setRejecting(true);
    try {
      const updated = await requestChangeContract(id!, rejectionReason || '수정 요청');
      setContract(updated);
      setIsBottomSheetOpen(false);
    } catch {
      alert(t('worker.action.rejectFailed'));
    } finally {
      setRejecting(false);
    }
  };

  // Realtime: 페이지 열려 있는 동안 계약 상태 변경 자동 반영
  useEffect(() => {
    if (!id || IS_MOCK) return;
    const channel = supabase
      .channel(`worker-contract-${id}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'contracts', filter: `id=eq.${id}` },
        (payload) => { setContract(payload.new as Contract); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  const businessName = contract
    ? businesses.find(b => b.id === contract.business_id)?.business_name ?? contract.workplace
    : '';

  if (!id) return <Navigate to="/worker/contracts" replace />;
  if (error) {
    return (
      <div className={styles.page}>
        <FloatingBackButton onClick={() => navigate('/worker/contracts')} />
        <div className={styles.center}>
          <Spacing size={40} />
          <Paragraph typography="t4" color="grey-600">{error}</Paragraph>
        </div>
      </div>
    );
  }
  if (!contract) {
    return (
      <div className={styles.page}>
        <FloatingBackButton onClick={() => navigate('/worker/contracts')} />
        <div className={styles.center}>
          <Spacing size={24} />
          <Paragraph typography="t5" color="grey-500">불러오는 중...</Paragraph>
        </div>
      </div>
    );
  }

  const b = getContractBadge(contract.status);
  const canSign = contract.status === 'sent' || contract.status === 'viewed';
  const header = getHeaderConfig(contract.status, businessName, t);

  return (
    <div className={styles.page} style={{ position: 'relative' }}>
      <FloatingBackButton onClick={() => navigate('/worker/contracts')} />
      <div style={{ padding: '0 24px', paddingTop: '64px' }}>

        <CommentBoundary name="계약서-서식">
          <ContractDocumentView contract={contract} />
        </CommentBoundary>

        <Spacing size={24} />

        {/* 미성년자 안내 배너 */}
        {contract.is_minor &&
          (contract.doc_parent_consent_status === 'required' || contract.doc_family_cert_status === 'required') && (
          <>
            <div style={{ backgroundColor: 'var(--orange50, #FFF9F0)', padding: 20, borderRadius: 16, marginBottom: 16, border: '2px solid var(--orange500, #F27A18)' }}>
              <Paragraph typography="t5" fontWeight="bold" style={{ color: 'var(--orange500, #F27A18)' }}>친권자 동의서와 가족관계증명서를 제출해주세요</Paragraph>
              <Spacing size={8} />
              <Paragraph typography="t7" color="grey-600">
                미성년자 근로계약을 위해 부모님(친권자)의 동의서와 가족관계기록사항에 관한 증명서(가족관계증명서)를 사장님께 꼭 제출하셔야 합니다. 미제출 시 계약이 성립될 수 없습니다.
              </Paragraph>
            </div>
            {contract.doc_parent_consent_status === 'required' && (
              <Button color="primary" variant="weak" size="large" display="block" onClick={() => setIsConsentBottomSheetOpen(true)}>
                부모님께 모바일로 동의 요청하기
              </Button>
            )}
          </>
        )}

        <Spacing size={40} />

        {/* Action buttons */}
        <CommentBoundary name="서명-액션-영역">
          {canSign && (
            <>
              <ListRow
                contents={<ListRow.Texts type="2RowTypeA" top={t('worker.action.rejectPrompt')} bottom={t('worker.action.rejectPromptSub')} />}
                withArrow={true}
                onClick={() => setIsBottomSheetOpen(true)}
              />
              <BottomSheet
                open={isBottomSheetOpen}
                onClose={() => setIsBottomSheetOpen(false)}
                header={<BottomSheet.Header>{t('worker.action.rejectTitle')}</BottomSheet.Header>}
                headerDescription={<BottomSheet.HeaderDescription>{t('worker.action.rejectPromptSub')}</BottomSheet.HeaderDescription>}
                cta={
                  <BottomSheet.CTA>
                    <Button color="primary" variant="fill" size="xlarge" disabled={rejecting} onClick={handleChangeRequest}>
                      {rejecting ? t('worker.action.rejectProcessing') : t('worker.action.rejectSubmit')}
                    </Button>
                  </BottomSheet.CTA>
                }
              >
                <div style={{ padding: '0 24px 24px' }}>
                  <TextField variant="box" label={t('worker.action.rejectReasonLabel')} placeholder={t('worker.action.rejectReasonPlaceholder')} value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} />
                </div>
              </BottomSheet>

              <ListRow
                contents={<ListRow.Texts type="2RowTypeA" top={t('worker.action.rejectHardPrompt')} bottom={t('worker.action.rejectHardPromptSub')} />}
                withArrow={true}
                onClick={() => setIsHardRejectBottomSheetOpen(true)}
              />
              <BottomSheet
                open={isHardRejectBottomSheetOpen}
                onClose={() => setIsHardRejectBottomSheetOpen(false)}
                header={<BottomSheet.Header>{t('worker.action.rejectHardTitle')}</BottomSheet.Header>}
                headerDescription={<BottomSheet.HeaderDescription>{t('worker.action.rejectHardPromptSub')}</BottomSheet.HeaderDescription>}
                cta={
                  <BottomSheet.CTA>
                    <Button color="danger" variant="fill" size="xlarge" disabled={rejectingHard} onClick={async () => {
                      if (!confirm(t('worker.action.rejectHardConfirm'))) return;
                      setRejectingHard(true);
                      try { const updated = await rejectContract(id, rejectHardReason || '거절됨'); setContract(updated); setIsHardRejectBottomSheetOpen(false); }
                      catch { alert(t('worker.action.rejectHardFailed')); } finally { setRejectingHard(false); }
                    }}>
                      {rejectingHard ? t('worker.action.rejectHardProcessing') : t('worker.action.rejectHardSubmit')}
                    </Button>
                  </BottomSheet.CTA>
                }
              >
                <div style={{ padding: '0 24px 24px' }}>
                  <TextField variant="box" label={t('worker.action.rejectHardReasonLabel')} placeholder={t('worker.action.rejectHardReasonPlaceholder')} value={rejectHardReason} onChange={e => setRejectHardReason(e.target.value)} />
                </div>
              </BottomSheet>
            </>
          )}

          {contract.is_minor && (
            <BottomSheet
              open={isConsentBottomSheetOpen}
              onClose={() => setIsConsentBottomSheetOpen(false)}
              header={<BottomSheet.Header>부모님께 동의서 요청하기</BottomSheet.Header>}
              headerDescription={<BottomSheet.HeaderDescription>입력하신 부모님 연락처로 알림톡이 전송됩니다. 부모님이 모바일로 간편하게 서명하실 수 있어요.</BottomSheet.HeaderDescription>}
              cta={
                <BottomSheet.CTA>
                  <Button color="primary" variant="fill" size="xlarge" disabled={!parentPhone || sendingConsent} onClick={async () => {
                    setSendingConsent(true);
                    await new Promise(r => setTimeout(r, 600)); // 모의 지연
                    setSendingConsent(false);
                    setIsConsentBottomSheetOpen(false);
                    alert('부모님께 동의 요청 알림톡이 성공적으로 발송되었습니다.');
                  }}>
                    {sendingConsent ? '전송 중...' : '동의 요청 알림톡 보내기'}
                  </Button>
                </BottomSheet.CTA>
              }
            >
              <div style={{ padding: '0 24px 24px' }}>
                <TextField variant="box" label="부모님 연락처" placeholder="- 없이 번호만 입력 (예: 01012345678)" value={parentPhone} onChange={e => setParentPhone(e.target.value)} type="tel" />
              </div>
            </BottomSheet>
          )}
        </CommentBoundary>

        <Spacing size={100} />
      </div>

      {/* 플로팅 서명하기 버튼 */}
      {canSign && (
        <div className={styles.bottomCta}>
          <Button
            color="primary"
            variant="fill"
            display="block"
            size="xlarge"
            onClick={() => navigate(`/worker/contracts/${id}/sign`)}
          >
            {t('worker.action.sign')}
          </Button>
        </div>
      )}
    </div>
  );
}
