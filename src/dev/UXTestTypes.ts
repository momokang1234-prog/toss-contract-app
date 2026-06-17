/**
 * Shared type definitions for the UX Flow Test System.
 * Used by both the StateBridgeProvider (inside iframe) and the UXTestPage (host panel).
 */

// ─── Log ───

export type LogKind = 'console' | 'error' | 'network' | 'state';

export interface LogEntry {
  id: string;
  kind: LogKind;
  timestamp: number;
  message: string;
  stack?: string;
  /** Network-specific fields */
  url?: string;
  method?: string;
  status?: number;
  duration?: number;
}

// ─── State snapshots ───

export interface AuthSnapshot {
  isAuthenticated: boolean;
  userRole: 'employer' | 'worker' | null;
  userName: string | null;
}

export interface ContractSummary {
  id: string;
  status: string;
  workerName: string;
  workplace: string;
  contractType: string;
}

export interface FormSnapshot {
  step: string;
  errors: Record<string, string>;
  warningsCount: number;
  workerName: string;
  workplace: string;
}

export interface StateSnapshot {
  id: string;
  timestamp: number;
  route: string;
  auth: AuthSnapshot;
  contracts: ContractSummary[];
  businessesCount: number;
  form: FormSnapshot | null;
  loading: boolean;
}

// ─── Agent ───

export type IssueSeverity = 'error' | 'warning' | 'info';

export interface AgentIssue {
  id: string;
  severity: IssueSeverity;
  title: string;
  description: string;
  relevantRoute: string;
  statePath?: string;
  suggestedFixDescription?: string;
}

export interface FixProposal {
  id: string;
  issueId: string;
  filePath: string;
  diff: string;
  description: string;
}

// ─── Session ───

export type SessionStatus = 'recording' | 'analyzing' | 'fixing' | 'complete';

export interface TestSession {
  id: string;
  createdAt: number;
  status: SessionStatus;
  events: SessionEvent[];
  analysis?: {
    issues: AgentIssue[];
    proposedFixes: FixProposal[];
    timestamp: number;
  };
}

export type SessionEvent =
  | { type: 'state'; payload: StateSnapshot }
  | { type: 'log'; payload: LogEntry };

// ─── Message protocol (postMessage) ───

export type BridgeMessage =
  | { type: 'UX_TEST_STATE'; payload: StateSnapshot }
  | { type: 'UX_TEST_LOG'; payload: LogEntry };

export type CommandMessage =
  | { type: 'UX_TEST_COMMAND'; action: 'navigate'; path: string }
  | { type: 'UX_TEST_COMMAND'; action: 'setRole'; role: 'employer' | 'worker' }
  | { type: 'UX_TEST_COMMAND'; action: 'startRecording' }
  | { type: 'UX_TEST_COMMAND'; action: 'stopRecording' };