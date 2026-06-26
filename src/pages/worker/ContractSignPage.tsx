import { useEffect, useState } from 'react';
import { CommentBoundary } from '../dev/CommentBoundary';
import SignaturePad from '../../components/SignaturePad';
import { FunnelQuestion } from '../../components/funnel/FunnelQuestion';
import { ContractFormProgress } from '../employer/contract-form/ContractFormProgress';
import { useParams, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { Player } from '@lottiefiles/react-lottie-player';
import { useContracts, type Contract, getAge, needsParentConsent, isYoungWorker, isUnderMinimumAge } from '../../hooks/useContracts';
import { Paragraph, Spacing, Button, TextField, BottomSheet, ListRow } from '@toss/tds-mobile';
import { useFunnel } from '@use-funnel/browser';
import { useAuth } from '../../contexts/AuthContext';
import styles from './ContractSignPage.module.css';
import { handleApiError } from '../../utils/errorHandler';

const BANKS = [
  { name: '토스뱅크', value: '토스뱅크', icon: '/icons/banks/toss.svg' },
  { name: 'KB국민은행', value: 'KB국민은행', icon: '/icons/banks/kb.svg' },
  { name: '신한은행', value: '신한은행', icon: '/icons/banks/shinhan.svg' },
  { name: '우리은행', value: '우리은행', icon: '/icons/banks/woori.svg' },
  { name: '하나은행', value: '하나은행', icon: '/icons/banks/hana.svg' },
  { name: 'NH농협은행', value: 'NH농협은행', icon: '/icons/banks/nh.svg' },
  { name: '카카오뱅크', value: '카카오뱅크', icon: '/icons/banks/kakao.svg' },
  { name: '케이뱅크', value: '케이뱅크', icon: '/icons/banks/kbank.svg' },
  { name: 'IBK기업은행', value: 'IBK기업은행', icon: '/icons/banks/ibk.svg' },
  { name: 'SC제일은행', value: 'SC제일은행', icon: '/icons/banks/sc.svg' },
  { name: '새마을금고', value: '새마을금고', icon: '/icons/banks/kfcc.svg' },
  { name: '우체국', value: '우체국', icon: '/icons/banks/post.svg' },
  { name: 'Sh수협은행', value: 'Sh수협은행', icon: '/icons/banks/suhyup.svg' },
  { name: '신협', value: '신협', icon: '/icons/banks/shinhyup.svg' },
];

export default function ContractSignPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { signContract, getContract } = useContracts();
  const { userProfile } = useAuth();
  const [contract, setContract] = useState<Contract | null>(null);

  // 입력 상태를 부모로 hoist — 하단 CTA가 단계별 검증/진행을 담당.
  const [phone, setPhone] = useState(userProfile?.phone ?? '');
  const [address, setAddress] = useState('');
  const [manualBirthDate, setManualBirthDate] = useState('');
  const [bank, setBank] = useState('');
  const [account, setAccount] = useState('');
  const [parentConsentData, setParentConsentData] = useState('');
  const [sigData, setSigData] = useState('');
  const location = useLocation();
  const [isBankOpen, setIsBankOpen] = useState(false);
  const [signing, setSigning] = useState(false);

  // 동적 스텝 상태 계산
  const needsBirth = !userProfile?.birthday;
  const birthDate = userProfile?.birthday || manualBirthDate;
  const isMinor = needsParentConsent(birthDate);

  const steps = [
    { name: 'Profile', label: '기본정보' },
    { name: 'Address', label: '주소' },
    ...(needsBirth ? [{ name: 'Birth', label: '생년월일' }] : []),
    { name: 'Account', label: '계좌' },
    { name: 'Sign', label: '서명' },
  ];

  const stepNames = steps.map(s => s.name);
  const stepLabels = steps.map(s => s.label);

  const funnel = useFunnel<{
    Profile: {};
    Address: {};
    Birth: {};
    Account: {};
    ParentalConsent: {};
    Sign: {};
    Done: {};
  }>({
    id: 'worker-sign-funnel',
    initial: { step: 'Profile', context: {} },
  });

  const currentIndex = stepNames.indexOf(funnel.step);
  const isDone = funnel.step === 'Done' || new URLSearchParams(location.search).get('debug') === 'done';
  const isSign = funnel.step === 'Sign';
  const accountStr = `${bank} ${account}`;

  const VALID_STEPS = ['Profile', 'Address', 'Birth', 'Account', 'ParentalConsent', 'Sign', 'Done'];
  const isValidStep = VALID_STEPS.includes(funnel.step);

  useEffect(() => {
    if (!isValidStep) {
      funnel.history.push('Profile');
    }
  }, [isValidStep, funnel.history]);

  useEffect(() => {
    if (!id) return;
    getContract(id).then(setContract).catch(() => {
      alert('계약서를 불러오는데 실패했습니다.');
      navigate('/worker/contracts');
    });
  }, [id, getContract, navigate]);

  useEffect(() => {
    if (userProfile?.phone) setPhone(userProfile.phone);
  }, [userProfile?.phone]);

  // 서명 중 이탈 방지
  useEffect(() => {
    if (!sigData) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [sigData]);

  if (!id) return <Navigate to="/worker/contracts" replace />;
  if (!contract) {
    return (
      <div className={styles.page}>
        <div className={styles.center} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Paragraph typography="st5" color="grey-500">불러오는 중...</Paragraph>
        </div>
      </div>
    );
  }

  const canProceed =
    funnel.step === 'Profile' ? true :
    funnel.step === 'Address' ? !!address :
    funnel.step === 'Birth' ? !!manualBirthDate && !isUnderMinimumAge(manualBirthDate) :
    funnel.step === 'Account' ? !!bank && !!account :
    funnel.step === 'Sign' ? !!sigData && !signing :
    true;

  const handleSign = async () => {
    if (!id || !sigData) return;
    setSigning(true);
    try {
      const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(sigData));
      const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
      const signatureData = {
        image: sigData,
        hash: hashHex,
        signedAt: new Date().toISOString(),
      };

      // 미성년자/연소근로자 세부 메타데이터 계산
      const age = getAge(birthDate);
      const isYoung = isYoungWorker(birthDate);
      
      const doc_parent_consent_status = isMinor ? 'required' : 'not_required';
      const doc_family_cert_status = isMinor ? 'required' : 'not_required';
      const doc_employment_permit_status = (isMinor && age !== null && age < 15) ? 'required' : 'not_required';

      await signContract(id, {
        phone,
        address,
        account: accountStr,
        userKey: userProfile?.userKey,
        name: userProfile?.name,
        ci: userProfile?.ci,
        signatureData: JSON.stringify(signatureData),
        worker_birth_date: birthDate || undefined,
        is_minor: isMinor,
        is_young_worker: isYoung,
        parent_consent_data: undefined,
        doc_parent_consent_status,
        doc_family_cert_status,
        doc_employment_permit_status,
      });
      funnel.history.push('Done');
    } catch (err) {
      alert(handleApiError(err, 'ContractSign:sign'));
    } finally {
      setSigning(false);
    }
  };

  const onCtaNext = () => {
    if (funnel.step === 'Profile') {
      funnel.history.push('Address');
    } else if (funnel.step === 'Address') {
      if (needsBirth) {
        funnel.history.push('Birth');
      } else {
        funnel.history.push('Account');
      }
    } else if (funnel.step === 'Birth') {
      if (isUnderMinimumAge(birthDate)) {
        alert('만 13세 미만은 법적으로 근로가 불가능하여 서명을 진행할 수 없습니다.');
        return;
      }
      funnel.history.push('Account');
    } else if (funnel.step === 'Account') {
      funnel.history.push('Sign');
    } else if (funnel.step === 'ParentalConsent') {
      if (!parentConsentData) {
        alert('친권자 동의 정보와 서명을 완료해주세요.');
        return;
      }
      funnel.history.push('Sign');
    } else if (funnel.step === 'Sign') {
      handleSign();
    }
  };

  return (
    <div className={styles.page}>
      {isDone ? (
        <DoneStep id={id} />
      ) : (
        <>
          <div className={styles.content}>
            <div style={{ paddingTop: 20 }}>
              <Paragraph typography="st3" fontWeight="bold">전자서명</Paragraph>
            </div>
            <Spacing size={16} />
            <ContractFormProgress
              currentIndex={currentIndex}
              labels={stepLabels}
              onStepClick={(i) => { if (i < currentIndex) funnel.history.push(stepNames[i] as any); }}
            />
            <Spacing size={8} />
            {isValidStep && (
              <funnel.Render
                Profile={() => <ProfileStep name={userProfile?.name ?? ''} phone={phone} />}
                Address={() => <AddressStep value={address} onChange={setAddress} />}
                Birth={() => <BirthStep value={manualBirthDate} onChange={setManualBirthDate} workerName={contract.worker_name} />}
                Account={() => (
                  <AccountStep
                    bank={bank}
                    setBank={setBank}
                    account={account}
                    setAccount={setAccount}
                    isBankOpen={isBankOpen}
                    setIsBankOpen={setIsBankOpen}
                  />
                )}
                ParentalConsent={() => (
                  <LocalParentalConsentStep
                    workerName={contract.worker_name}
                    birthDate={birthDate}
                    value={parentConsentData}
                    onChange={setParentConsentData}
                  />
                )}
                Sign={() => <SignStep onChange={(data) => setSigData(data ?? '')} />}
                Done={() => null}
              />
            )}
          </div>

          <div className={styles.bottomCta}>
            <div style={{ display: 'flex', gap: 12, width: '100%' }}>
              {currentIndex > 0 && (
                <div style={{ flex: 1 }}>
                  <Button color="light" variant="weak" display="block" size="xlarge" onClick={() => funnel.history.back()}>
                    이전
                  </Button>
                </div>
              )}
              <div style={{ flex: currentIndex > 0 ? 2 : 1 }}>
                <Button
                  color="primary"
                  variant="fill"
                  display="block"
                  size="xlarge"
                  disabled={!canProceed || signing}
                  onClick={onCtaNext}
                >
                  {isSign ? (signing ? '서명 중...' : '계약 완료') : '다음'}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ProfileStep({ name, phone }: { name: string; phone: string }) {
  return (
    <FunnelQuestion isActive title={<>기본 정보를<br />확인해주세요</>} subtitle="토스 본인인증으로 확인된 실명과 연락처예요">
      <CommentBoundary name="기본정보-확인-패널">
        <div style={{ backgroundColor: '#f9fafb', borderRadius: 12, padding: 20, border: '1px solid #e5e8eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ color: '#8b95a1', fontSize: 14 }}>실명</span>
            <span style={{ fontWeight: 'bold', fontSize: 16 }}>{name || '이름 없음'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#8b95a1', fontSize: 14 }}>연락처</span>
            <span style={{ fontWeight: 'bold', fontSize: 16 }}>{phone || '번호 없음'}</span>
          </div>
        </div>
        <Spacing size={16} />
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: 13, color: '#1b64da', backgroundColor: '#e8f3ff', padding: '6px 12px', borderRadius: 20, fontWeight: 'bold' }}>
            ✓ 본인인증 완료
          </span>
        </div>
      </CommentBoundary>
    </FunnelQuestion>
  );
}

function AddressStep({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <FunnelQuestion isActive title={<>주소를<br />입력해주세요</>} subtitle="계약서에 기재될 주소예요">
      <CommentBoundary name="주소-입력-폼">
        <span className="funnel-label">주소</span>
        <input
          className="funnel-huge-input"
          placeholder="예: 서울시 강남구 역삼동"
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      </CommentBoundary>
    </FunnelQuestion>
  );
}

function BirthStep({ value, onChange, workerName }: { value: string; onChange: (v: string) => void; workerName: string }) {
  const age = getAge(value);
  const isMinor = needsParentConsent(value);

  return (
    <FunnelQuestion isActive title={<>{workerName}님의 생년월일을<br />입력해주세요</>} subtitle="미성년자(만 19세 미만) 여부를 확인해요">
      <CommentBoundary name="생년월일-입력-폼">
        <span className="funnel-label">생년월일</span>
        <input
          className="funnel-huge-input"
          type="date"
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        {value && isMinor && !isUnderMinimumAge(value) && (
          <div style={{ marginTop: 12, padding: 16, background: '#FFF9E6', border: '1px solid #FFE082', borderRadius: 12, fontSize: 14, color: '#694500', lineHeight: 1.5 }}>
            ⓘ 만 {age}세로 미성년자예요. 서명 과정 중 친권자(법정대리인)의 동의 서명이 추가로 필요해요.
          </div>
        )}
        {value && isUnderMinimumAge(value) && (
          <div style={{ marginTop: 12, padding: 16, background: '#FEEBEE', border: '1px solid #FDA4AF', borderRadius: 12, fontSize: 14, color: '#991B1B', lineHeight: 1.5 }}>
            🚫 만 13세 미만은 법적으로 근로가 불가능하여 서명을 진행할 수 없습니다.
          </div>
        )}
      </CommentBoundary>
    </FunnelQuestion>
  );
}

function AccountStep({
  bank, setBank, account, setAccount, isBankOpen, setIsBankOpen,
}: {
  bank: string; setBank: (v: string) => void;
  account: string; setAccount: (v: string) => void;
  isBankOpen: boolean; setIsBankOpen: (v: boolean) => void;
}) {
  return (
    <>
      <FunnelQuestion isActive title={<>급여 받을 계좌번호를<br />입력해주세요</>} subtitle="본인 명의의 은행 계좌를 입력해주세요">
        <CommentBoundary name="계좌-입력-폼">
          <div onClickCapture={(e) => { e.preventDefault(); e.stopPropagation(); setIsBankOpen(true); }}>
            <TextField variant="box" labelOption="sustain" label="은행" value={bank} onChange={() => {}} readOnly placeholder="선택" />
          </div>
          <Spacing size={12} />
          <span className="funnel-label">계좌번호</span>
          <input
            className="funnel-huge-input"
            type="tel"
            placeholder="- 없이 입력"
            value={account}
            onChange={e => setAccount(e.target.value.replace(/[^0-9]/g, ''))}
          />
        </CommentBoundary>
      </FunnelQuestion>

      <BottomSheet open={isBankOpen} onClose={() => setIsBankOpen(false)} header={<BottomSheet.Header>은행 선택</BottomSheet.Header>}>
        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {BANKS.map((b) => (
            <ListRow
              key={b.value}
              contents={<ListRow.Texts type="1RowTypeA" top={b.name} />}
              left={
                <img src={b.icon} alt={b.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'contain' }} />
              }
              onClick={() => {
                setBank(b.name);
                setIsBankOpen(false);
              }}
            />
          ))}
        </div>
      </BottomSheet>
    </>
  );
}

interface ConsentData {
  signer?: string;
  relation?: string;
  phone?: string;
  signature?: string;
  hash?: string;
  signedAt?: string;
}

function parseConsent(json?: string): ConsentData {
  if (!json) return {};
  try { return JSON.parse(json); } catch { return {}; }
}

interface LocalParentalConsentStepProps {
  workerName: string;
  birthDate: string;
  value: string;
  onChange: (v: string) => void;
}

function LocalParentalConsentStep({ workerName, birthDate, value, onChange }: LocalParentalConsentStepProps) {
  const [activeField, setActiveField] = useState<'parentName' | 'relation' | 'phone' | 'sign'>('parentName');
  const consent = parseConsent(value);

  const updateConsent = (patch: Partial<ConsentData>) => {
    const next = { ...consent, ...patch };
    onChange(JSON.stringify(next));
  };

  const age = getAge(birthDate);

  return (
    <div>
      <CommentBoundary name="친권자동의-이름">
        <FunnelQuestion
          title={<>친권자(법정대리인)의<br/>이름을 입력해주세요</>}
          subtitle={`만 ${age}세 미성년자 근로계약에 필요한 동의예요`}
          isActive={activeField === 'parentName'}
          onEnter={() => setActiveField('parentName')}
          summary={consent.signer ? `친권자: ${consent.signer}` : undefined}
        >
          <label className="funnel-label">친권자 이름</label>
          <input
            className="funnel-huge-input"
            placeholder="예: 홍길동"
            value={consent.signer ?? ''}
            onChange={e => updateConsent({ signer: e.target.value })}
            onKeyDown={e => { if (e.key === 'Enter' && (consent.signer ?? '').trim()) setActiveField('relation'); }}
          />
        </FunnelQuestion>
      </CommentBoundary>

      {(consent.signer ?? '').trim().length > 0 && (
        <CommentBoundary name="친권자동의-관계">
          <FunnelQuestion
            title={<>{consent.signer}님과 근로자의<br/>관계를 알려주세요</>}
            isActive={activeField === 'relation'}
            onEnter={() => setActiveField('relation')}
            summary={consent.relation ? `관계: ${consent.relation}` : undefined}
          >
            <label className="funnel-label">근로자와의 관계</label>
            <input
              className="funnel-huge-input"
              placeholder="예: 부, 모, 기타"
              value={consent.relation ?? ''}
              onChange={e => updateConsent({ relation: e.target.value })}
              onKeyDown={e => { if (e.key === 'Enter' && (consent.relation ?? '').trim()) setActiveField('phone'); }}
            />
          </FunnelQuestion>
        </CommentBoundary>
      )}

      {(consent.relation ?? '').trim().length > 0 && (
        <CommentBoundary name="친권자동의-연락처">
          <FunnelQuestion
            title={<>{consent.signer}님의 연락처를<br/>알려주세요</>}
            subtitle="- 없이 숫자만 입력해주세요"
            isActive={activeField === 'phone'}
            onEnter={() => setActiveField('phone')}
            summary={consent.phone ? `연락처: ${consent.phone}` : undefined}
          >
            <label className="funnel-label">친권자 연락처</label>
            <input
              className="funnel-huge-input"
              type="tel"
              placeholder="01012345678"
              value={consent.phone ?? ''}
              onChange={e => updateConsent({ phone: e.target.value.replace(/\D/g, '').slice(0, 11) })}
              onKeyDown={e => { if (e.key === 'Enter' && (consent.phone ?? '').length >= 10) setActiveField('sign'); }}
            />
          </FunnelQuestion>
        </CommentBoundary>
      )}

      {(consent.phone ?? '').length >= 10 && (
        <CommentBoundary name="친권자동의-서명">
          <FunnelQuestion
            title={<>{consent.signer}님의 서명을<br/>남겨주세요</>}
            subtitle="미성년자 근로계약 체결에 동의함을 서명합니다"
            isActive={activeField === 'sign'}
            onEnter={() => setActiveField('sign')}
          >
            <div style={{ background: '#FFF9E6', border: '1px solid #FFE082', borderRadius: 12, padding: 16, fontSize: 14, color: '#694500', lineHeight: 1.6, marginBottom: 16 }}>
              본인은 미성년자 <strong>{workerName}</strong>(만 {age}세)의 근로계약 체결에 동의합니다.
              <br /><span style={{ fontSize: 12 }}>근로기준법 제66조 · 민법 미성년자 규정</span>
            </div>
            <SignaturePad onChange={(data) => {
              if (data) {
                updateConsent({ signature: data, signedAt: new Date().toISOString() });
              } else {
                updateConsent({ signature: undefined, signedAt: undefined });
              }
            }} />
          </FunnelQuestion>
        </CommentBoundary>
      )}
    </div>
  );
}

function SignStep({ onChange }: { onChange: (data: string | null) => void }) {
  return (
    <FunnelQuestion isActive title={<>서명을<br />남겨주세요</>} subtitle="화면에 서명을 그려주세요">
      <CommentBoundary name="서명-패드">
        <SignaturePad onChange={onChange} />
      </CommentBoundary>
    </FunnelQuestion>
  );
}

function DoneStep({ id }: { id: string }) {
  const navigate = useNavigate();
  useEffect(() => {
    // 디버그 모드일 때는 자동 이동을 하지 않거나, 10초 뒤에 이동하도록 하여 애니메이션을 충분히 볼 수 있게 합니다.
    const isDebug = new URLSearchParams(window.location.search).get('debug') === 'done';
    if (isDebug) return;

    const t = setTimeout(() => navigate(`/worker/contracts/${id}`), 2000);
    return () => clearTimeout(t);
  }, [id, navigate]);
  return (
    <div className={styles.center} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <CommentBoundary name="완료-화면">
        <div style={{ textAlign: 'center', marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
          <Player
            autoplay
            keepLastFrame
            src="/lottie/contract-complete.json"
            style={{ height: '140px', width: '140px' }}
          />
        </div>
        <Spacing size={16} />
        <Paragraph typography="st2" fontWeight="bold">서명이 완료되었어요</Paragraph>
        <Spacing size={8} />
        <Paragraph typography="st5" color="grey-500">잠시 후 계약서로 이동합니다</Paragraph>
        <Spacing size={32} />
        <Button color="primary" variant="weak" size="large" onClick={() => navigate(`/worker/contracts/${id}`)}>계약서 보기</Button>
      </CommentBoundary>
    </div>
  );
}
