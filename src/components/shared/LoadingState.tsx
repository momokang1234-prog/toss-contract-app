import { Spacing } from '@toss/tds-mobile';
import styles from './LoadingState.module.css';

interface LoadingStateProps {
  message?: string;
  variant?: 'full' | 'inline' | 'small';
}

export function LoadingState({ message = '로딩 중...', variant = 'full' }: LoadingStateProps) {
  if (variant === 'small') {
    return (
      <div className={styles.loadingSmall}>
        <div className={styles.spinner} aria-label="로딩 중" />
        {message && <span className={styles.message}>{message}</span>}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={styles.loadingInline}>
        <div className={styles.spinner} aria-label="로딩 중" />
        {message && <span className={styles.message}>{message}</span>}
      </div>
    );
  }

  return (
    <div className={styles.loadingFull}>
      <div className={styles.spinner} aria-label="로딩 중" />
      <Spacing size={16} />
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}

interface PageSkeletonProps {
  type?: 'list' | 'form' | 'detail';
}

export function PageSkeleton({ type = 'list' }: PageSkeletonProps) {
  if (type === 'list') {
    return (
      <div className={styles.skeleton}>
        <div className={styles.skeletonHeader} />
        <div className={styles.skeletonItem} />
        <div className={styles.skeletonItem} />
        <div className={styles.skeletonItem} />
      </div>
    );
  }

  if (type === 'form') {
    return (
      <div className={styles.skeleton}>
        <div className={styles.skeletonHeader} />
        <div className={styles.skeletonForm} />
        <div className={styles.skeletonForm} />
        <div className={styles.skeletonButton} />
      </div>
    );
  }

  return (
    <div className={styles.skeleton}>
      <div className={styles.skeletonHeader} />
      <div className={styles.skeletonDetail} />
      <div className={styles.skeletonDetail} />
      <div className={styles.skeletonButton} />
    </div>
  );
}
