/**
 * ContractFormProgress — 근로계약서 폼 단계 표시 (확정 디자인: FormStepLabelVariantB)
 * 원형 숫자 아이콘 스테퍼 + 현재 단계 슬라이딩 Badge.
 * dot ref로 실제 중심 x좌표를 측정해 Badge를 정확히 정렬한다(측정 전엔 % fallback).
 */
import { useRef, useLayoutEffect, useState } from 'react';
import { ProgressStepper, ProgressStep, Badge } from '@toss/tds-mobile';

function NumberIcon({
  n,
  active,
  dotRef,
}: {
  n: number;
  active: boolean;
  dotRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={dotRef}
      style={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: active ? '#3182F6' : '#E5E8EB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span style={{ fontSize: 10, fontWeight: 700, color: active ? '#fff' : '#8B95A1' }}>{n}</span>
    </div>
  );
}

export function ContractFormProgress({
  currentIndex,
  labels,
}: {
  currentIndex: number;
  labels: readonly string[];
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLDivElement | null)[]>(new Array(labels.length).fill(null));
  const [dotCenters, setDotCenters] = useState<number[]>([]);

  // 마운트 후 각 dot의 중심 x좌표를 wrapper 기준으로 측정 (레이아웃 고정이므로 1회만)
  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || !dotRefs.current.every(Boolean)) return;

    const wrapperLeft = wrapper.getBoundingClientRect().left;
    const centers = dotRefs.current.map((dot) => {
      const r = dot!.getBoundingClientRect();
      return r.left - wrapperLeft + r.width / 2;
    });
    setDotCenters(centers);
  }, []);

  const badgeLeft =
    dotCenters[currentIndex] !== undefined
      ? `${dotCenters[currentIndex]}px`
      : `calc(10px + ${currentIndex} / ${labels.length - 1} * (100% - 20px))`; // 측정 전 fallback

  return (
    <div ref={wrapperRef} style={{ position: 'relative', paddingBottom: 36 }}>
      <ProgressStepper variant="icon" activeStepIndex={currentIndex} checkForFinish paddingTop="default">
        {labels.map((label, i) => (
          <ProgressStep
            key={label}
            icon={
              <NumberIcon
                n={i + 1}
                active={i === currentIndex}
                dotRef={(el) => {
                  dotRefs.current[i] = el;
                }}
              />
            }
          />
        ))}
      </ProgressStepper>

      {/* 슬라이딩 Badge — dot 실측 좌표 기준 */}
      <div
        style={{
          position: 'absolute',
          bottom: 4,
          left: badgeLeft,
          transform: 'translateX(-50%)',
          transition: 'left 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          whiteSpace: 'nowrap',
        }}
      >
        <Badge size="small" variant="fill" color="blue">
          {labels[currentIndex]}
        </Badge>
      </div>
    </div>
  );
}
