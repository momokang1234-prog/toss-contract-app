import { useRef, useEffect, useState } from 'react';
import { Button, Spacing } from '@toss/tds-mobile';
import { WidgetErrorBoundary } from './WidgetErrorBoundary';

interface SignaturePadProps {
  /** 서명이 바뀔 때마다(한 획 끝/지우기) dataURL 또는 null을 알려줘요. */
  onChange?: (dataUrl: string | null) => void;
}

/**
 * 서명 캔버스 + "다시 쓰기" 버튼만 렌더해요.
 * 타이틀/서브타이틄은 위자드 다른 단계와 동일하게 `FunnelQuestion`이 제공해요.
 */
function SignaturePadInner({ onChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hasDrawnRef = useRef(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 고해상도 디스플레이 대응
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#191F28';
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    };
  };

  const emit = () => {
    const canvas = canvasRef.current;
    if (canvas) onChange?.(canvas.toDataURL('image/png'));
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
      if (!hasDrawnRef.current) {
        hasDrawnRef.current = true;
        setHasSignature(true);
      }
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (hasDrawnRef.current) emit();
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    }
    hasDrawnRef.current = false;
    setHasSignature(false);
    onChange?.(null);
  };

  return (
    <>
      <div
        role="application"
        aria-label="서명 입력 영역"
        style={{
          border: '1px solid #E5E8EB',
          borderRadius: 16,
          overflow: 'hidden',
          background: '#F9FAFB',
          height: 300,
          position: 'relative',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', touchAction: 'none' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          aria-label="서명 캔버스. 손가락으로 서명하세요."
          role="img"
        />
        {!hasSignature && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#B0B8C1',
              pointerEvents: 'none',
              fontSize: 16,
            }}
            aria-hidden="true"
          >
            여기에 서명해 주세요
          </div>
        )}
      </div>

      <Spacing size={16} />

      <Button
        size="medium"
        variant="weak"
        display="block"
        disabled={!hasSignature}
        onClick={handleClear}
        aria-label="서명 지우고 다시 작성"
      >
        다시 쓰기
      </Button>
    </>
  );
}

export default function SignaturePad(props: SignaturePadProps) {
  return (
    <WidgetErrorBoundary>
      <SignaturePadInner {...props} />
    </WidgetErrorBoundary>
  );
}
