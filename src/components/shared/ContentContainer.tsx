import type { ReactNode } from 'react';
import styles from './ContentContainer.module.css';

interface ContentContainerProps {
  children: ReactNode;
  /** Override horizontal padding (default: 20px) */
  paddingX?: number;
}

export function ContentContainer({ children, paddingX }: ContentContainerProps) {
  return (
    <div
      className={styles.container}
      style={paddingX !== undefined ? { paddingLeft: paddingX, paddingRight: paddingX } : undefined}
    >
      {children}
    </div>
  );
}
