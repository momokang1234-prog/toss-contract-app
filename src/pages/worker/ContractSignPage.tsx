import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useContracts, type Contract } from '../../hooks/useContracts';
import { Top, Paragraph, Spacing, Button } from '@toss/tds-mobile';
import styles from './ContractSignPage.module.css';

export default function ContractSignPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getContract, signContract } = useContracts();
  const [contract, setContract] = useState<Contract | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signing, setSigning] = useState(false);
  const [done, setDone] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!id) return;
    getContract(id).then(setContract);
  }, [id]);

  const clearCanvas = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (ctx) { ctx.clearRect(0,0,c.width,c.height); setHasSignature(false); }
  };

  const startDraw = (e: React.MouseEvent|React.TouchEvent) => {
    setDrawing(true);
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const rect = c.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
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
    const rect = c.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDraw = () => setDrawing(false);

  const handleSign = async () => {
    if (!id || !canvasRef.current) return;
    setSigning(true);
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const updated = await signContract(id, dataUrl);
      setContract(updated);
      setDone(true);
    } catch { alert('서명에 실패했어요'); }
    finally { setSigning(false); }
  };

  if (!id) return <Navigate to="/worker/contracts" replace />;
  if (!contract) return <div className={styles.page}><Top title="서명하기" /><div className={styles.center}><Spacing size={24} /><Paragraph typography="st5" color="grey-500">불러오는 중...</Paragraph></div></div>;
  if (done) {
    // Auto-navigate back to detail after 2s
    useEffect(() => { const t = setTimeout(() => navigate(`/worker/contracts/${id}`), 2000); return () => clearTimeout(t); }, [id]);
    return (
      <div className={styles.page}>
        <Top title="서명 완료" />
        <div className={styles.center} style={{ textAlign: 'center' }}>
          <Spacing size={60} />
          <div style={{ textAlign: 'center' }}>
            <img src="https://static.toss.im/3d-common/check-success.png" alt=""
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
            width={400} height={200}
            onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
            onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
          />
        </div>
        <Spacing size={12} />
        <Button color="primary" variant="outline" size="small" onClick={clearCanvas}>지우기</Button>

        <Spacing size={32} />
        <Button color="primary" variant="fill" display="block" size="xlarge"
          onClick={handleSign} disabled={!hasSignature || signing}>
          {signing ? '서명 중...' : '서명 완료'}
        </Button>
      </div>
    </div>
  );
}
