import React, { useEffect, useRef } from 'react';
import { Spacing } from '@toss/tds-mobile';
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
    if (isActive && containerRef.current) {
      setTimeout(() => {
        containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const input = containerRef.current?.querySelector('input, textarea');
        if (input) {
          (input as HTMLElement).focus();
        }
      }, 300);
      if (onEnter) onEnter();
    }
  }, [isActive, onEnter]);

  if (!isActive) {
    if (!summary) return null;
    return (
      <div 
        className={styles.summaryContainer}
        onClick={onEnter}
      >
        <div className={styles.summaryContent}>{summary}</div>
        <div className={styles.summaryEdit}>수정</div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={`${styles.container} ${styles.active}`}
    >
      <div className={styles.title}>{title}</div>
      {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
      
      <Spacing size={32} />
      
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}
