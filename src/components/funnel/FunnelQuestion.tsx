import React, { useEffect, useRef } from 'react';
import { BoardRow, Spacing } from '@toss/tds-mobile';
import styles from './FunnelQuestion.module.css';

interface FunnelQuestionProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  isActive: boolean;
  onEnter?: () => void;
  summary?: React.ReactNode;
  children: React.ReactNode;
}

export function FunnelQuestion({ title, subtitle, isActive, onEnter, summary, children }: FunnelQuestionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const timer = setTimeout(() => {
      containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const input = containerRef.current?.querySelector('input, textarea');
      (input as HTMLElement | null)?.focus();
    }, 320);

    onEnter?.();
    return () => clearTimeout(timer);
  }, [isActive, onEnter]);

  // 아직 입력된 적 없는 비활성 질문은 렌더하지 않아요.
  if (!isActive && !summary) return null;

  // 헤더에는 summary(예: "이름: 홍길동")만 노출해 접힌 상태를 표현해요.
  // 활성 질문의 큰 title(24px)은 항상 본문(.title)에 렌더해 폰트 크기를 유지해요.
  const headerTitle = summary ?? '';

  return (
    <div ref={containerRef} className={styles.boardRowWrapper}>
      <BoardRow
        isOpened={isActive}
        onOpen={onEnter}
        prefix={summary ? <BoardRow.Prefix>✓</BoardRow.Prefix> : undefined}
        title={headerTitle}
        className={styles.boardRow}
      >
        <div className={styles.title}>{title}</div>
        {subtitle && <div className={styles.subtitle}>{subtitle}</div>}

        <Spacing size={32} />

        <div className={styles.content}>{children}</div>
      </BoardRow>
    </div>
  );
}
