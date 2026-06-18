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
  visited,
  dotRef,
}: {
  n: number;
  active: boolean;
  visited: boolean;
  dotRef: (el: HTMLDivElement | null) => void;
}) {
  const bg = active ? '#3182F6' : visited ? '#BFDFFF' : '#E5E8EB';
  const fg = active ? '#fff' : visited ? '#1B64DA' : '#8B95A1';
  return (
    <div
      ref={dotRef}
      style={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.2s',
      }}
    >
      <span style={{ fontSize: 10, fontWeight: 700, color: fg }}>{n}</span>
    </div>
  );
}

export function ContractFormProgress({
  currentIndex,
  labels,
  onStepClick,
}: {
  currentIndex: number;
  labels: readonly string[];
  /** 과거 단계(이미 방문한) 클릭 시 호출. 현재/미래 단계는 클릭 불가. */
  onStepClick?: (index: number) => void;
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
      <ProgressStepper variant="icon" activeStepIndex={currentIndex} paddingTop="default">
        {labels.map((label, i) => {
          const clickable = i < currentIndex && !!onStepClick;
          return (
            <ProgressStep
              key={label}
              // 과거 단계 클릭 시 이동. ProgressStep은 div HTMLElement이므로 onClick 직접 전달.
              onClick={clickable ? () => onStepClick!(i) : undefined}
              style={clickable ? { cursor: 'pointer' } : undefined}
              icon={
                <NumberIcon
                  n={i + 1}
                  active={i === currentIndex}
                  visited={i < currentIndex}
                  dotRef={(el) => {
                    dotRefs.current[i] = el;
                  }}
                />
              }
            />
          );
        })}
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
