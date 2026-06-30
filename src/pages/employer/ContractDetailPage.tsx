import { useEffect, useState } from 'react';
import { CommentBoundary } from '../dev/CommentBoundary';
import { supabase, IS_MOCK } from '../../api/supabase';
import { generateAndUploadPDF, downloadContractPDF } from '../../utils/pdf';
import { josa } from 'es-hangul';
import { useParams, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useContracts, type Contract } from '../../hooks/useContracts';
import { useBusiness } from '../../hooks/useBusiness';
import { shareContract } from '../../api/smart-messenger';
import { Top, Paragraph, Spacing, Button, Badge, TextButton, BottomSheet, TextField } from '@toss/tds-mobile';
import { getContractBadge } from '../../utils/badgeUtils';
import { ContractDocumentView } from '../../components/contract/ContractDocumentView';
import { DocumentReceiptTracker } from '../../components/contract/DocumentReceiptTracker';
import SignaturePad from '../../components/SignaturePad';
import styles from './ContractDetailPage.module.css';

export default function ContractDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getContract, sendContract, completeContract, cancelContract, markDocumentReceived, getHistory, createContract } = useContracts();
  const { businesses } = useBusiness();
  const [contract, setContract] = useState<Contract | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [isManageSheetOpen, setIsManageSheetOpen] = useState(false);
  const [isSignatureSheetOpen, setIsSignatureSheetOpen] = useState(false);
  const [employerSignature, setEmployerSignature] = useState('');
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(location.state?.justCreated === true);

  const [isTemplateSheetOpen, setIsTemplateSheetOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [savingTemplate, setSavingTemplate] = useState(false);

  const handleSaveAsTemplate = async () => {
    if (!contract || !templateName.trim()) return;
    setSavingTemplate(true);
    try {
      const templateData = { ...contract, status: 'template', template_name: templateName, id: undefined, created_at: undefined, updated_at: undefined };
      await createContract(templateData as any);
      setIsTemplateSheetOpen(false);
      alert('양식이 성공적으로 저장되었습니다!');
    } catch (e) {
      console.error(e);
      alert('양식 저장에 실패했습니다.');
    } finally {
      setSavingTemplate(false);
    }
  };

  useEffect(() => {
    if (location.state?.justCreated) {
      window.history.replaceState({}, '');
    }
  }, [location.state]);



  useEffect(() => {
    if (!id) { setError('계약서 ID가 없습니다'); return; }
    getContract(id).then(c => {
      if (!c) setError('계약서를 찾을 수 없습니다');
      else setContract(c);
    }).catch(() => setError('불러오기에 실패했습니다'));
  }, [id]);

  // 계약서 히스토리 인라인 로드
  interface HistoryEvent { id: string; contract_id: string; action: string; actor_role: string; created_at: string; }
  const [historyEvents, setHistoryEvents] = useState<HistoryEvent[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const ACTION_LABEL: Record<string, string> = {
    create: '계약서 작성', send: '근로자에게 전송', view: '근로자가 열람',
    sign: '근로자가 서명', complete: '계약 확정', cancel: '계약 취소',
    expire: '유효 기간 만료', reject: '수정 요청', edit: '계약서 수정',
  };
  const ACTOR_LABEL: Record<string, string> = { employer: '사장님', worker: '근로자', system: '시스템' };
  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  }
  useEffect(() => {
    if (!id) return;
    setHistoryLoading(true);
    getHistory(id).then(events => {
      setHistoryEvents(events ?? []);
      setHistoryLoading(false);
    });
  }, [id, contract?.status]);

  useEffect(() => {
    if (!id || IS_MOCK) return;
    const channel = supabase
      .channel(`contract-${id}`)
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

  if (!id) return <Navigate to="/employer/dashboard" replace />;

  if (error) {
    return (
      <div className={styles.page}>
        <Top title="계약서" />
        <div className={styles.center}>
          <Spacing size={40} />
          <Paragraph typography="t4" color="grey-600">{error}</Paragraph>
          <Spacing size={16} />
          <Button color="primary" variant="weak" size="large"
            onClick={() => navigate('/employer/dashboard')}>대시보드로</Button>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className={styles.page}>
        <Top title="계약서" />
        <div className={styles.center}>
          <Spacing size={24} />
          <Paragraph typography="t5" color="grey-500">불러오는 중...</Paragraph>
        </div>
      </div>
    );
  }

  const b = getContractBadge(contract.status);
  const canSend = contract.status === 'draft';
  const canComplete = contract.status === 'signed';
  const canEdit = contract.status === 'draft' || contract.status === 'rejected' || contract.status === 'change_requested';

  const primaryAction = canSend
    ? { label: '근로자에게 공유하기', action: async () => {
        try {
          const { shared, copied } = await shareContract(id);
          if (!shared && !copied) return; // 공유 취소 — 상태 변경 없음
          const u = await sendContract(id); setContract(u); alert('근로자에게 전송되었습니다.');
        } catch { alert('전송에 실패했습니다'); }
      }}
    : (contract.status === 'sent' || contract.status === 'viewed')
    ? { label: '서명 요청 재전송', action: () => { shareContract(id); } }
    : canComplete
    ? { label: completing ? '확정 중...' : '신원 확인 및 최종 서명', action: () => setIsSignatureSheetOpen(true) }
    : null;

  const handleFinalSign = async () => {
    if (!employerSignature) { alert('서명을 남겨주세요.'); return; }
    if (!confirm(`${josa('계약', '을/를')} 확정하시겠습니까?\n\n완료된 계약은 변경할 수 없습니다.`)) return;
    setCompleting(true);
    setIsSignatureSheetOpen(false);
    try {
      const pdfUrl = await generateAndUploadPDF({ ...contract, employer_signature_data: employerSignature });
      const u = await completeContract(id, undefined, pdfUrl || undefined, employerSignature);
      setContract(u);
    } catch (err) {
      console.error(err);
      alert('확정 처리에 실패했습니다. (PDF 생성 또는 DB 통신 에러)');
    } finally {
      setCompleting(false);
    }
  };

  if (import.meta.env.DEV) {
    (window as any).__openCompletionModal = () => setIsCompletionModalOpen(true);
    (window as any).__openSignatureSheet = () => setIsSignatureSheetOpen(true);
    (window as any).__setEmployerSignature = (data: string) => setEmployerSignature(data);
    (window as any).__handleFinalSign = handleFinalSign;
  }

  const canCancel = ['draft', 'sent', 'viewed'].includes(contract.status);
  return (
    <div className={styles.page}>
      <div style={{ position: 'relative' }}>
        <Top title="계약서" />
        {(canEdit || canCancel) && (
          <div style={{ position: 'absolute', top: 16, right: 24, zIndex: 10 }}>
            <TextButton size="small" onClick={() => setIsManageSheetOpen(true)}>관리</TextButton>
          </div>
        )}
      </div>
      
      <BottomSheet 
        open={isManageSheetOpen} 
        onClose={() => setIsManageSheetOpen(false)}
        header={<BottomSheet.Header>계약서 관리</BottomSheet.Header>}
      >
        <div style={{ padding: '0 24px 24px' }}>
          {canEdit && (
            <Button
              color="light"
              variant="weak"
              display="block"
              size="large"
              style={{ marginBottom: 12 }}
              onClick={() => { setIsManageSheetOpen(false); navigate(`/employer/contracts/${id}/edit`); }}
            >
              수정하기
            </Button>
          )}
          {canCancel && (
            <Button
              color="light"
              variant="weak"
              display="block"
              size="large"
              onClick={async () => {
                setIsManageSheetOpen(false);
                if (!confirm(`${josa('계약', '을/를')} 취소하시겠습니까?\n\n되돌릴 수 없습니다.`)) return;
                try { const u = await cancelContract(id); setContract(u); }
                catch { alert('취소 처리에 실패했습니다'); }
              }}
            >
              <span style={{ color: '#E31C5F' }}>계약 취소하기</span>
            </Button>
          )}
        </div>
      </BottomSheet>

      <div style={{ padding: '0 24px' }}>
        {/* 계약서 완성 상태 안내 (공식적인 박스 형태) */}
        {contract.status === 'draft' && (
          <CommentBoundary name="계약서-완성-상태창">
            <div style={{ backgroundColor: '#E8F3FF', padding: 20, borderRadius: 16, marginBottom: 24, border: '1px solid #D1E4FF', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ fontSize: 22, marginTop: 0 }}>📄</div>
              <div>
                <Paragraph typography="t5" fontWeight="bold" color="blue-500">계약서 작성이 완료되었습니다</Paragraph>
                <Spacing size={6} />
                <Paragraph typography="t7" color="grey-700" style={{ lineHeight: 1.5 }}>
                  근로자에게 서명을 요청할 준비가 되었습니다.<br/>
                  하단의 공유하기 버튼을 눌러 서명을 요청하세요.
                </Paragraph>
              </div>
            </div>
          </CommentBoundary>
        )}

        {/* 교차 검증 패널 (서명 대기 중) */}
        {contract.status === 'signed' && (
          <CommentBoundary name="교차-검증-패널">
            <div style={{ backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 24, border: '1px solid #e5e8eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <Paragraph typography="t5" fontWeight="bold" color="grey-800">근로자가 서명을 완료했습니다</Paragraph>
              <Spacing size={4} />
              <Paragraph typography="t7" color="grey-600">아래 정보를 확인 후 최종 서명을 진행해주세요.</Paragraph>
              <Spacing size={16} />
              
              <div style={{ backgroundColor: '#f9fafb', padding: 16, borderRadius: 12 }}>
                {/* 사장님 입력 정보 */}
                <div style={{ textAlign: 'left' }}>
                  <Paragraph typography="t7" color="grey-500" style={{ marginBottom: 4 }}>사장님 입력 정보</Paragraph>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <Paragraph typography="t6" fontWeight="bold">{contract.worker_name}</Paragraph>
                    <Paragraph typography="t6" color="grey-700">{contract.worker_phone}</Paragraph>
                  </div>
                </div>
                
                {/* 중간 구분선 */}
                <div style={{ height: 1, backgroundColor: '#e5e8eb', margin: '16px 0' }} />
                
                {/* 실제 인증 정보 */}
                <div style={{ textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Paragraph typography="t7" color="blue-500" fontWeight="bold">실명 인증 정보</Paragraph>
                    <span style={{ fontSize: 12, backgroundColor: '#e8f3ff', color: '#1b64da', padding: '2px 6px', borderRadius: 4, fontWeight: 'bold' }}>일치</span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <Paragraph typography="t6" fontWeight="bold" color="grey-800">{contract.worker_name}</Paragraph>
                    <Paragraph typography="t6" color="grey-800">{contract.worker_phone}</Paragraph>
                  </div>
                </div>
              </div>
            </div>
          </CommentBoundary>
        )}

        {/* 서류 서식 컴포넌트 */}
        <CommentBoundary name="계약서-서식">
          <ContractDocumentView contract={contract} />
        </CommentBoundary>

        <Spacing size={24} />

        {/* 미성년자 필수 서류 수령 추적 */}
        {contract.is_minor && (
          <CommentBoundary name="서류-수령-추적">
            <DocumentReceiptTracker contract={contract} onMarkReceived={(docType) => markDocumentReceived(id, docType).then(c => { if (c) setContract(c as Contract); })} />
            <Spacing size={16} />
          </CommentBoundary>
        )}

        <Spacing size={40} />

        {/* Status banners */}
        <CommentBoundary name="상태-배너">
          {contract.status === 'completed' && (
            <div style={{ backgroundColor: '#E4F4EC', padding: 20, borderRadius: 16, marginBottom: 24, border: '1px solid #C3E8D7' }}>
              <Paragraph typography="t5" fontWeight="bold" color="grey-800">🎉 계약이 확정되었습니다</Paragraph>
              <Spacing size={4} />
              <Paragraph typography="t7" color="grey-600">완료된 계약은 수정할 수 없습니다</Paragraph>
            </div>
          )}
          {contract.status === 'cancelled' && (
            <div style={{ backgroundColor: '#FFF0F0', padding: 20, borderRadius: 16, marginBottom: 24, border: '1px solid #FFD4D4' }}>
              <Paragraph typography="t5" fontWeight="bold" color="grey-800">🚫 취소된 계약입니다</Paragraph>
              <Spacing size={4} />
              <Paragraph typography="t7" color="grey-600">이 계약은 더 이상 진행할 수 없습니다</Paragraph>
            </div>
          )}
          {contract.status === 'rejected' && (
            <div style={{ backgroundColor: '#FFF0F0', padding: 20, borderRadius: 16, marginBottom: 24, border: '1px solid #FFD4D4' }}>
              <Paragraph typography="t5" fontWeight="bold" color="red-500">🚫 근로자가 계약을 거절했습니다</Paragraph>
              <Spacing size={8} />
              <div style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12 }}>
                <Paragraph typography="t7" color="red-500">거절 사유: {contract.rejection_reason || '사유 없음'}</Paragraph>
              </div>
            </div>
          )}
          {contract.status === 'change_requested' && (
            <div style={{ backgroundColor: '#E8F3FF', padding: 20, borderRadius: 16, marginBottom: 24, border: '1px solid #D1E4FF' }}>
              <Paragraph typography="t5" fontWeight="bold" color="blue-500">💬 근로자가 계약 수정을 요청했습니다</Paragraph>
              <Spacing size={8} />
              <div style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12 }}>
                <Paragraph typography="t7" color="blue-500">요청 사유: {contract.rejection_reason}</Paragraph>
              </div>
              <Spacing size={16} />
              <Button color="primary" variant="fill" size="medium" onClick={() => navigate(`/employer/contracts/${id}/edit`)}>
                계약서 수정하기
              </Button>
            </div>
          )}
          {contract.status === 'expired' && (
            <div style={{ backgroundColor: '#F2F4F6', padding: 20, borderRadius: 16, marginBottom: 24, border: '1px solid #E5E8EB' }}>
              <Paragraph typography="t5" fontWeight="bold" color="grey-800">⏰ 유효 기간이 만료되었습니다</Paragraph>
              <Spacing size={4} />
              <Paragraph typography="t7" color="grey-600">계약 유효 기간을 확인해주세요</Paragraph>
            </div>
          )}
        </CommentBoundary>

        {/* Action buttons */}
        <CommentBoundary name="액션-버튼">
          {primaryAction && (
            <>
              <div className={styles.bottomCta}>
                <Button
                  color="primary"
                  variant="fill"
                  display="block"
                  size="xlarge"
                  onClick={primaryAction.action}
                  disabled={completing}
                >
                  {primaryAction.label}
                </Button>
              </div>
            </>
          )}

          {contract.status !== 'cancelled' && contract.status !== 'template' && (
            <div style={{ marginTop: primaryAction ? 16 : 0, paddingBottom: 40, textAlign: 'center' }}>
              <TextButton size="large" onClick={() => setIsTemplateSheetOpen(true)}>
                이 계약서를 양식으로 저장
              </TextButton>
            </div>
          )}
        </CommentBoundary>

        {/* 계약서 히스토리 (인라인) */}
        <CommentBoundary name="계약-이력-타임라인">
          <Spacing size={16} />
          <div style={{ borderTop: '1px solid #E5E8EB', paddingTop: 24 }}>
            <Paragraph typography="t5" fontWeight="bold" color="grey-800">계약서 히스토리</Paragraph>
            <Spacing size={16} />
            {historyLoading && <Paragraph typography="t7" color="grey-500">불러오는 중...</Paragraph>}
            {!historyLoading && historyEvents.length === 0 && (
              <Paragraph typography="t7" color="grey-500">이력이 없습니다.</Paragraph>
            )}
            {!historyLoading && historyEvents.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {historyEvents.map((ev, i) => (
                  <div key={ev.id} style={{ display: 'flex', gap: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 12 }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#3182f6', flexShrink: 0, marginTop: 4 }} />
                      {i < historyEvents.length - 1 && (
                        <div style={{ width: 2, flex: 1, backgroundColor: '#e5e8eb', margin: '6px 0', minHeight: 24 }} />
                      )}
                    </div>
                    <div style={{ paddingBottom: 28, flex: 1 }}>
                      <Paragraph typography="t6" fontWeight="bold" color="grey-800">
                        {ACTION_LABEL[ev.action] ?? ev.action}
                      </Paragraph>
                      <Spacing size={4} />
                      <Paragraph typography="t7" color="grey-500">
                        {ACTOR_LABEL[ev.actor_role] ?? ev.actor_role} · {formatDate(ev.created_at)}
                      </Paragraph>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CommentBoundary>

        <Spacing size={100} />
      </div>

      {isCompletionModalOpen && (
        <CommentBoundary name="계약서-완성-모달">
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ backgroundColor: 'white', padding: 24, borderRadius: 16, width: '80%' }}>
              <Paragraph typography="t4" fontWeight="bold">계약서 완성</Paragraph>
              <Spacing size={8} />
              <Paragraph typography="t6" color="grey-500">계약서 작성이 모두 끝났습니다. 지금 바로 근로자에게 공유하시겠어요?</Paragraph>
              <Spacing size={24} />
              <div style={{ display: 'flex', gap: 8 }}>
                <Button size="xlarge" display="block" color="primary" variant="weak" onClick={() => setIsCompletionModalOpen(false)}>닫기</Button>
                <Button size="xlarge" display="block" color="primary" variant="fill" onClick={() => {
                  setIsCompletionModalOpen(false);
                  if (primaryAction?.action) primaryAction.action();
                }}>공유하기</Button>
              </div>
            </div>
          </div>
        </CommentBoundary>
      )}
      {/* 사장님 최종 서명 바텀시트 */}
      <BottomSheet 
        open={isSignatureSheetOpen} 
        onClose={() => setIsSignatureSheetOpen(false)}
        header={<BottomSheet.Header>최종 서명</BottomSheet.Header>}
      >
        <div style={{ padding: '0 24px 24px' }}>
          <Paragraph typography="t5" fontWeight="bold">사장님 서명을 남겨주세요</Paragraph>
          <Spacing size={8} />
          <Paragraph typography="t7" color="grey-600">서명이 완료되면 계약이 최종 확정되며, 근로자에게 계약서 사본이 발송됩니다.</Paragraph>
          <Spacing size={16} />
          <SignaturePad onChange={(data) => setEmployerSignature(data ?? '')} />
          <Spacing size={24} />
          <Button
            color="primary"
            variant="fill"
            display="block"
            size="xlarge"
            disabled={!employerSignature || completing}
            onClick={handleFinalSign}
          >
            {completing ? '처리 중...' : '최종 서명 및 계약 확정'}
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}
