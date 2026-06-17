import { type ReactNode } from 'react';
import { DevStateBridgeProvider } from './StateBridgeProvider';

/**
 * In dev mode, wraps children with DevStateBridgeProvider which
 * broadcasts state changes to the parent UX Test panel.
 * In production, Vite dead-code-eliminates the entire branch,
 * so DevStateBridgeProvider and its deps are tree-shaken out.
 */
export function DevBridge({ children }: { children: ReactNode }) {
  if (import.meta.env.DEV) {
    return <DevStateBridgeProvider>{children}</DevStateBridgeProvider>;
  }
  return <>{children}</>;
}