import { useEffect, useRef, type ReactNode } from 'react';
import { BoardRow, Spacing } from '@toss/tds-mobile';
import styles from './FunnelQuestion.module.css';

interface FunnelQuestionProps {
  title: ReactNode;
  subtitle?: ReactNode;
  isActive: boolean;
  onEnter?: () => void;
  summary?: ReactNode;
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
  // 활성 상태일 때는 중복을 피하기 위해 헤더를 비웁니다.
  const headerTitle = !isActive && summary ? summary : '';
  const prefix = !isActive && summary ? <BoardRow.Prefix>✓</BoardRow.Prefix> : undefined;

  return (
    <div ref={containerRef} className={`${styles.boardRowWrapper} ${isActive ? styles.active : styles.completed}`}>
      <BoardRow
        isOpened={isActive}
        onOpen={onEnter}
        prefix={prefix}
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
