import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useContracts, type Contract } from '../../hooks/useContracts';
import { Top, Paragraph, Spacing, Button, TextField, BottomSheet, ListRow } from '@toss/tds-mobile';
import { useFunnel } from '@use-funnel/browser';
import { useAuth } from '../../contexts/AuthContext';
import styles from './ContractSignPage.module.css';
import { handleApiError } from '../../utils/errorHandler';

export default function ContractSignPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { signContract, getContract } = useContracts();
  const { userProfile } = useAuth();
  const [contract, setContract] = useState<Contract | null>(null);

  const funnel = useFunnel<{
    Phone: undefined;
    Address: { phone: string };
    Account: { phone: string; address: string };
    Sign: { phone: string; address: string; account: string };
    Done: undefined;
  }>({
    id: 'worker-sign-funnel',
    initial: { step: 'Phone', context: undefined },
  });

  useEffect(() => {
    if (!id) return;
    getContract(id).then(setContract).catch(err => {
      alert('계약서를 불러오는데 실패했습니다.');
      navigate('/worker/contracts');
    });
  }, [id, getContract, navigate]);

  if (!id) return <Navigate to="/worker/contracts" replace />;
  if (!contract) return <div className={styles.page}><Top title="서명하기" /><div className={styles.center}><Spacing size={24} /><Paragraph typography="st5" color="grey-500">불러오는 중...</Paragraph></div></div>;

  return (
    <funnel.Render
      Phone={({ history }) => (
        <PhoneStep initialPhone={userProfile?.phone ?? ''} onNext={(phone) => history.push('Address', { phone })} />
      )}
      Address={({ context, history }) => (
        <AddressStep onNext={(address) => history.push('Account', { ...context, address })} />
      )}
      Account={({ context, history }) => (
        <AccountStep onNext={(account) => history.push('Sign', { ...context, account })} />
      )}
      Sign={({ context, history }) => (
        <SignStep
          id={id}
          context={context}
          userProfile={userProfile}
          signContract={signContract}
          onDone={() => history.push('Done')}
        />
      )}
      Done={() => (
        <DoneStep id={id} />
      )}
    />
  );
}

function PhoneStep({ initialPhone, onNext }: { initialPhone: string, onNext: (v: string) => void }) {
  const [val, setVal] = useState(initialPhone);

  useEffect(() => {
    if (initialPhone) setVal(initialPhone);
  }, [initialPhone]);

  return (
    <div className={styles.page}>
      <Top title="연락처 입력" />
      <div className={styles.content}>
        <Spacing size={24} />
        <Paragraph typography="st3" fontWeight="bold">연락처를 입력해주세요</Paragraph>
        <Spacing size={8} />
        <Paragraph typography="st6" color="grey-500">계약서에 필요한 정보예요</Paragraph>
        <Spacing size={24} />
        <TextField variant="box" placeholder="010-0000-0000" value={val} onChange={e => setVal(e.target.value)} />
        <Spacing size={32} />
        <Button color="primary" variant="fill" size="xlarge" display="block" onClick={() => { if (!val) return; onNext(val); }}>다음</Button>
      </div>
    </div>
  );
}

function AddressStep({ onNext }: { onNext: (v: string) => void }) {
  const [val, setVal] = useState('');
  return (
    <div className={styles.page}>
      <Top title="주소 입력" />
      <div className={styles.content}>
        <Spacing size={24} />
        <Paragraph typography="st3" fontWeight="bold">주소를 입력해주세요</Paragraph>
        <Spacing size={8} />
        <Paragraph typography="st6" color="grey-500">계약서에 기재될 주소예요</Paragraph>
        <Spacing size={24} />
        <TextField variant="box" placeholder="예: 서울시 강남구 역삼동" value={val} onChange={e => setVal(e.target.value)} />
        <Spacing size={32} />
        <Button color="primary" variant="fill" size="xlarge" display="block" onClick={() => { if (!val) return; onNext(val); }}>다음</Button>
      </div>
    </div>
  );
}

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
  { name: '신협', value: '신협', icon: '/icons/banks/shinhyup.svg' }
];

function AccountStep({ onNext }: { onNext: (v: string) => void }) {
  const [bank, setBank] = useState('');
  const [account, setAccount] = useState('');
  const [isBankOpen, setIsBankOpen] = useState(false);

  return (
    <div className={styles.page}>
      <Top title="계좌번호 입력" />
      <div className={styles.content}>
        <Spacing size={24} />
        <Paragraph typography="st3" fontWeight="bold">급여를 받을 계좌번호를 입력해주세요</Paragraph>
        <Spacing size={8} />
        <Paragraph typography="st6" color="grey-500">본인 명의의 은행 계좌를 입력해주세요</Paragraph>
        <Spacing size={24} />
        
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }} onClickCapture={(e) => { e.preventDefault(); e.stopPropagation(); setIsBankOpen(true); }}>
            <TextField variant="box" labelOption="sustain" label="은행" value={bank} onChange={() => {}} readOnly placeholder="선택" />
          </div>
          <div style={{ flex: 2 }}>
            <TextField variant="box" labelOption="sustain" label="계좌번호" type="tel" placeholder="- 없이 입력" value={account} onChange={e => setAccount(e.target.value.replace(/[^0-9]/g, ''))} />
          </div>
        </div>

        <Spacing size={32} />
        <Button color="primary" variant="fill" size="xlarge" display="block" onClick={() => { if (!bank || !account) return; onNext(`${bank} ${account}`); }}>다음</Button>
      </div>

      <BottomSheet open={isBankOpen} onDismiss={() => setIsBankOpen(false)} header={<BottomSheet.Header>은행 선택</BottomSheet.Header>}>
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
    </div>
  );
}

function SignStep({ id, context, userProfile, signContract, onDone }: { id: string, context: { phone: string; address: string; account: string; }, userProfile: any, signContract: any, onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    if (!hasSignature) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasSignature]);

  const clearCanvas = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (ctx) { ctx.clearRect(0,0,c.width,c.height); setHasSignature(false); }
  };

  const getCoords = (e: React.MouseEvent|React.TouchEvent, c: HTMLCanvasElement) => {
    const rect = c.getBoundingClientRect();
    const scaleX = c.width / rect.width;
    const scaleY = c.height / rect.height;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const startDraw = (e: React.MouseEvent|React.TouchEvent) => {
    setDrawing(true);
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoords(e, c);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#191f28';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
  };

  const draw = (e: React.MouseEvent|React.TouchEvent) => {
    if (!drawing) return;
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoords(e, c);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDraw = () => setDrawing(false);

  const handleSign = async () => {
    if (!id || !canvasRef.current) return;
    setSigning(true);
    try {
      const imageData = canvasRef.current.toDataURL('image/png');
      const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(imageData));
      const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
      const signatureData = {
        image: imageData,
        hash: hashHex,
        signedAt: new Date().toISOString(),
      };
      await signContract(id, {
        phone: context.phone,
        address: context.address,
        account: context.account,
        userKey: userProfile?.userKey,
        name: userProfile?.name,
        ci: userProfile?.ci,
        signatureData: JSON.stringify(signatureData)
      });
      onDone();
    } catch (err) {
      alert(handleApiError(err, 'ContractSign:sign'));
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className={styles.page}>
      <Top title="서명하기" />
      <div className={styles.content}>
        <Spacing size={24} />
        <Paragraph typography="st2" fontWeight="bold">전자서명</Paragraph>
        <Spacing size={8} />
        <Paragraph typography="st5" color="grey-500">화면에 서명을 그려주세요</Paragraph>
        <Spacing size={24} />

        <div className={styles.canvasWrap}>
          <canvas ref={canvasRef} className={styles.canvas}
            aria-label="전자서명 입력 영역"
            width={400} height={200}
            onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
            onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
          />
        </div>
        <Spacing size={12} />
        <Button color="primary" variant="weak" size="small" onClick={clearCanvas}>지우기</Button>

        <Spacing size={32} />
        <Button color="primary" variant="fill" display="block" size="xlarge"
          onClick={() => { if (!hasSignature || signing) return; handleSign(); }}>
          {signing ? '서명 중...' : '계약 완료'}
        </Button>
      </div>
    </div>
  );
}

function DoneStep({ id }: { id: string }) {
  const navigate = useNavigate();
  useEffect(() => { const t = setTimeout(() => navigate(`/worker/contracts/${id}`), 2000); return () => clearTimeout(t); }, [id, navigate]);
  return (
    <div className={styles.page}>
      <Top title="계약 완료" />
      <div className={styles.center} style={{ textAlign: 'center' }}>
        <Spacing size={60} />
        <div style={{ textAlign: 'center' }}>
          <img src="https://static.toss.im/illusts/wiki-highlight-L.png" alt=""
            style={{ width: 80, height: 80, marginBottom: 12 }}
          />
        </div>
        <Spacing size={16} />
        <Paragraph typography="st2" fontWeight="bold">서명이 완료되었어요</Paragraph>
        <Spacing size={8} />
        <Paragraph typography="st5" color="grey-500">잠시 후 계약서로 이동합니다</Paragraph>
        <Spacing size={32} />
        <Button color="primary" variant="weak" size="large"
          onClick={() => navigate(`/worker/contracts/${id}`)}>계약서 보기</Button>
      </div>
    </div>
  );
}
