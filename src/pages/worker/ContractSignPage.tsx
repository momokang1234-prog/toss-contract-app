import { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContracts, type Contract } from '../../hooks/useContracts';
import { Button, Paragraph, Spacing } from '@toss/tds-mobile';

export default function ContractSignPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getContract, signContract } = useContracts();
  const [contract, setContract] = useState<Contract | null>(null);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (id) getContract(id).then(c => setContract(c));
  }, [id]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#191F28';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
  }, []);

  const getPos = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const startDraw = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const endDraw = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSign = async () => {
    if (!id || !canvasRef.current) return;
    if (!hasDrawn) {
      alert('서명을 그려주세요.');
      return;
    }
    setSigning(true);
    try {
      const signatureData = canvasRef.current.toDataURL('image/png');
      await signContract(id, signatureData);
      setSigned(true);
      setTimeout(() => {
        navigate(`/worker/contracts/${id}`, { replace: true });
      }, 1500);
    } catch (err) {
      console.error(err);
      alert('서명에 실패했습니다.');
    } finally {
      setSigning(false);
    }
  };

  if (signed) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 24 }}>
        <Paragraph typography="st1" style={{ fontSize: 48 }}>✅</Paragraph>
        <Spacing size={16} />
        <Paragraph typography="st3" fontWeight="bold">서명 완료!</Paragraph>
        <Paragraph typography="st4" color="grey600">근로계약서 서명이 완료되었습니다.</Paragraph>
      </div>
    );
  }

  if (!contract) return (
    <div style={{ padding: 24, textAlign: 'center' }}>
      <Paragraph typography="st4" color="grey600">로딩 중...</Paragraph>
    </div>
  );

  if (contract.status === 'signed' || contract.status === 'completed') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 24 }}>
        <Paragraph typography="st1" style={{ fontSize: 48 }}>📋</Paragraph>
        <Spacing size={16} />
        <Paragraph typography="st3" fontWeight="bold">이미 서명된 계약서입니다</Paragraph>
        <Spacing size={16} />
        <Button
          color="primary"
          variant="fill"
          size="large"
          onClick={() => navigate(`/worker/contracts/${id}`, { replace: true })}
        >
          계약서 보기
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 480, margin: '0 auto' }}>
      <Paragraph typography="st3" fontWeight="bold">전자서명</Paragraph>
      <Spacing size={8} />
      <Paragraph typography="st4" color="grey600">{contract.worker_name}님, 아래 영역에 서명해주세요.</Paragraph>
      <Spacing size={4} />
      <Paragraph typography="st6" color="grey500">근무지: {contract.workplace} | 시급: {contract.base_wage.toLocaleString()}원</Paragraph>
      <Spacing size={16} />

      <div style={{ border: '2px solid #E5E8EB', borderRadius: 12, overflow: 'hidden', marginBottom: 16, backgroundColor: '#fff' }}>
        <canvas
          ref={canvasRef}
          width={400}
          height={200}
          style={{ width: '100%', height: 200, touchAction: 'none' }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <Button
          color="light"
          variant="weak"
          display="block"
          size="large"
          style={{ flex: 1 }}
          onClick={clearCanvas}
        >
          다시 그리기
        </Button>
      </div>

      <Button
        color="primary"
        variant="fill"
        display="block"
        size="large"
        onClick={handleSign}
        disabled={signing || !hasDrawn}
      >
        {signing ? '서명 중...' : '서명 완료'}
      </Button>
    </div>
  );
}
