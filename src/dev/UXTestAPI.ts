import type { SessionEvent, AgentIssue, FixProposal } from './UXTestTypes';

const getBaseUrl = () => {
  if (import.meta.env.VITE_UX_TEST_URL) {
    return import.meta.env.VITE_UX_TEST_URL;
  }
  if (typeof window !== 'undefined' && window.location.protocol.startsWith('http')) {
    return `${window.location.origin}/api/ux-test`;
  }
  return 'http://localhost:3001/api/ux-test';
};

const BASE_URL = getBaseUrl();

export async function createSession(): Promise<string> {
  const res = await fetch(`${BASE_URL}/session`, { method: 'POST' });
  if (!res.ok) throw new Error(`Failed to create session: ${res.status}`);
  const data = await res.json();
  return data.sessionId;
}

export async function sendEvents(sessionId: string, events: SessionEvent[]): Promise<void> {
  const res = await fetch(`${BASE_URL}/session/${sessionId}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ events }),
  });
  if (!res.ok) throw new Error(`Failed to send events: ${res.status}`);
}

export async function getSession(sessionId: string): Promise<unknown> {
  const res = await fetch(`${BASE_URL}/session/${sessionId}`);
  if (!res.ok) throw new Error(`Failed to get session: ${res.status}`);
  return res.json();
}

export interface AnalysisResult {
  issues: AgentIssue[];
  fixes: Record<string, FixProposal>,
}

export async function analyzeSession(sessionId: string): Promise<AnalysisResult> {
  const res = await fetch(`${BASE_URL}/analyze/${sessionId}`, { method: 'POST' });
  if (!res.ok) {
    if (res.status === 503) throw new Error('LLM 서비스를 사용할 수 없습니다. Ollama가 실행 중인지 확인하세요.');
    throw new Error(`Analysis failed: ${res.status}`);
  }
  const data = await res.json();
  return {
    issues: data.issues ?? [],
    fixes: data.fixes ?? {},
  };
}

export async function confirmFixes(sessionId: string, fixIds: string[]): Promise<void> {
  const res = await fetch(`${BASE_URL}/confirm/${sessionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ approvedFixes: fixIds }),
  });
  if (!res.ok) throw new Error(`Failed to apply fixes: ${res.status}`);
}

export interface GuardrailResult {
  domain: string;
  passed: boolean;
  violations: string[];
  suggestions: string[];
}

export async function runGuardrails(sessionId: string, fix: FixProposal): Promise<GuardrailResult[]> {
  const res = await fetch(`${BASE_URL}/guardrail/${sessionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fix }),
  });
  if (!res.ok) throw new Error(`Guardrail check failed: ${res.status}`);
  const data = await res.json();
  return data.results ?? [];
}

export interface DesignHistoryItem {
  filename: string;
  createdAt: number;
  taskId: string;
  page: string;
  selectedId: string | null;
  isSpec: boolean;
  summary: string;
  error?: string;
}

export async function fetchDesigns(): Promise<DesignHistoryItem[]> {
  const res = await fetch(`${BASE_URL}/designs`);
  if (!res.ok) throw new Error(`Failed to fetch design list: ${res.status}`);
  return res.json();
}

export async function fetchDesignContent(filename: string): Promise<any> {
  const encodedPath = filename.split('/').map(encodeURIComponent).join('/');
  const res = await fetch(`${BASE_URL}/designs/${encodedPath}`);
  if (!res.ok) throw new Error(`Failed to fetch design content: ${res.status}`);
  return res.json();
}