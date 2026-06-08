import { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContracts, type Contract } from '../../hooks/useContracts';
import { supabase } from '../../api/supabase';

export default function ContractSignPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getContract } = useContracts();
  const [contract, setContract] = useState<Contract | null>(null);
  const [signing, setSigning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

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
  };

  const endDraw = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSign = async () => {
    if (!id || !canvasRef.current) return;
    setSigning(true);
    try {
      const signatureData = canvasRef.current.toDataURL('image/png');
      const { error } = await supabase.functions.invoke('contracts-sign', {
        body: { contractId: id, signatureData },
      });
      if (error) throw error;
      navigate(`/worker/contracts/${id}`, { replace: true });
    } catch (err) {
      console.error(err);
      alert('서명에 실패했습니다.');
    } finally {
      setSigning(false);
    }
  };

  if (!contract) return <div style={{ padding: 24, textAlign: 'center', color: '#6B7684' }}>로딩 중...</div>;

  return (
    <div style={{ padding: 24, maxWidth: 480, margin: '0 auto' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>전자서명</h2>
      <p style={{ fontSize: 14, color: '#6B7684', marginBottom: 24 }}>아래 영역에 서명해주세요.</p>

      <div style={{ border: '2px solid #E5E8EB', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
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
        <button onClick={clearCanvas} style={{
          flex: 1, padding: '12px', backgroundColor: '#F5F6F8', border: 'none', borderRadius: 10, fontSize: 14, cursor: 'pointer',
        }}>다시 그리기</button>
      </div>

      <button onClick={handleSign} disabled={signing} style={{
        width: '100%', padding: '16px', backgroundColor: '#3182F6', color: '#fff', border: 'none',
        borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: signing ? 'not-allowed' : 'pointer', opacity: signing ? 0.6 : 1,
      }}>{signing ? '서명 중...' : '서명 완료'}</button>
    </div>
  );
}
