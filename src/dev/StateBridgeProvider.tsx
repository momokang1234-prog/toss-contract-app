import { useEffect, useRef, useCallback, type ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useContracts } from '../hooks/useContracts';
import { useBusiness } from '../hooks/useBusiness';
import type { StateSnapshot, AuthSnapshot, ContractSummary, FormSnapshot, CommandMessage } from './UXTestTypes';
import { startIntercept, stopIntercept, setLogListener } from './LogInterceptor';
const STRIP_FIELDS: Record<string, true> = {
  contract_html: true, employer_signature_data: true, worker_signature_data: true, contract_pdf_url: true,
};
function stripLargeFields<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (STRIP_FIELDS[key]) continue;
    clean[key] = value;
  }
  return clean as Partial<T>;
}

let snapshotId = 0;

function uid(): string {
  return `ss-${Date.now()}-${snapshotId++}`;
}

export function DevStateBridgeProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const { contracts, loading: contractsLoading } = useContracts();
  const { businesses } = useBusiness();
  const lastBroadcastRef = useRef<string>('');
  const isIframe = window.parent !== window;

  const broadcast = useCallback(() => {
    if (!isIframe) return;

    const authSnap: AuthSnapshot = {
      isAuthenticated: auth.isAuthenticated,
      userRole: auth.userRole,
      userName: auth.userName,
    };

    const contractSummaries: ContractSummary[] = contracts.map(c => ({
      id: c.id,
      status: c.status,
      workerName: c.worker_name,
      workplace: c.workplace,
      contractType: c.contract_type,
    }));

    // Try to read form state from sessionStorage (wizard persistence)
    let formSnap: FormSnapshot | null = null;
    try {
      const raw = sessionStorage.getItem('wiz_form');
      if (raw) {
        const form = JSON.parse(raw);
        formSnap = {
          step: sessionStorage.getItem('wiz_step') ?? 'unknown',
          errors: {}, // errors aren't persisted; filled from validation state elsewhere
          warningsCount: 0,
          workerName: form.worker_name ?? '',
          workplace: form.workplace ?? '',
        };
      }
    } catch { /* no form persisted */ }

    const route = window.location.pathname + window.location.search;

    const snap: StateSnapshot = {
      id: uid(),
      timestamp: Date.now(),
      route,
      auth: authSnap,
      contracts: contractSummaries,
      businessesCount: businesses.length,
      form: formSnap,
      loading: contractsLoading,
    };

    // Dedup: skip if payload is identical to last broadcast
    const serialized = JSON.stringify(snap);
    if (serialized === lastBroadcastRef.current) return;
    lastBroadcastRef.current = serialized;

    try {
      window.parent.postMessage({ type: 'UX_TEST_STATE', payload: snap }, '*');
    } catch { /* cross-origin — ignore */ }
  }, [auth.isAuthenticated, auth.userRole, auth.userName, contracts, businesses, contractsLoading, isIframe]);

  // Debounced broadcast on state changes
  useEffect(() => {
    if (!isIframe) return;
    const timer = setTimeout(broadcast, 100);
    return () => clearTimeout(timer);
  }, [broadcast, isIframe]);

  // Broadcast on route changes
  useEffect(() => {
    if (!isIframe) return;
    broadcast();
  }, [window.location.pathname, window.location.search, broadcast, isIframe]);

  // Listen for commands from parent
  useEffect(() => {
    if (!isIframe) return;

    const handler = (event: MessageEvent) => {
      const data = event.data as CommandMessage;
      if (!data || data.type !== 'UX_TEST_COMMAND') return;

      switch (data.action) {
        case 'navigate':
          window.location.href = data.path;
          break;
        case 'setRole': {
          sessionStorage.setItem('mock_role', data.role);
          sessionStorage.setItem('force_mock', 'true');
          window.location.reload();
          break;
        }
        case 'startRecording':
          startIntercept();
          break;
        case 'stopRecording':
          stopIntercept();
          break;
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [isIframe]);

  // Start log interception when in iframe
  useEffect(() => {
    if (!isIframe) return;
    setLogListener((entry) => {
      // LogListener already sends via postMessage in LogInterceptor
      // This callback is for any in-frame processing if needed
    });
    return () => setLogListener(null);
  }, [isIframe]);

  // Initial broadcast
  useEffect(() => {
    if (isIframe) broadcast();
  }, [isIframe, broadcast]);

  return <>{children}</>;
}