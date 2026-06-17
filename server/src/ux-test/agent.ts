/**
 * UX Test Agent — Analysis + Fix generation + Application
 *
 * Server-side LLM calls for automatic issue detection.
 * Ouroboros skill (ux-test-guardrail) provides additional
 * domain-expert verification when invoked manually from CLI.
 */

import fs from 'fs';
import path from 'path';
import type { StoredSession } from './session-store';

// ─── LLM Configuration ───

const LLM_URL = process.env.UX_TEST_LLM_URL || 'http://localhost:11434/v1';
const LLM_MODEL = process.env.UX_TEST_LLM_MODEL || 'gemma3';

// ─── Data types ───

export interface AgentIssue {
  id: string;
  severity: 'error' | 'warning' | 'info';
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

// ─── LLM Call ───

interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function callLLM(messages: LLMMessage[], customApiKey?: string, customUrl?: string): Promise<string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const key = customApiKey || process.env.UX_TEST_LLM_API_KEY;
  if (key) {
    headers['Authorization'] = `Bearer ${key}`;
  }

  const url = customUrl || LLM_URL;

  const res = await fetch(`${url}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ model: customApiKey ? 'deepseek-chat' : LLM_MODEL, messages, temperature: 0.3 }),
  });

  if (!res.ok) {
    throw new Error(`LLM request failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

export async function applyCommentFix(filename: string, component: string, message: string, customApiKey?: string): Promise<void> {
  const SESSIONS_DIR = path.resolve(process.cwd(), 'ux-test-sessions');
  const designPath = path.resolve(SESSIONS_DIR, filename);
  if (!fs.existsSync(designPath)) return;
  const design = JSON.parse(fs.readFileSync(designPath, 'utf-8'));
  
  // Find which file is currently being edited based on variant ID
  const variantId = design.selectedId || 'B';
  const targetFile = `src/pages/dev/WorkerVariant${variantId}.tsx`;
  const targetPath = path.resolve(process.cwd(), '..', targetFile);
  
  if (!fs.existsSync(targetPath)) return;
  const currentCode = fs.readFileSync(targetPath, 'utf-8');

  const prompt = `You are an expert React developer. The user left a comment on the component "${component}" in variant ${variantId}.
Comment: "${message}"

Here is the current code of the file:
\`\`\`tsx
${currentCode}
\`\`\`

Return a unified diff that applies the requested changes.
Rules:
- Generate ONLY the changes needed.
- Use unified diff format (--- a/file, +++ b/file, @@ hunk headers, +add, -remove).
- Preserve Korean text.`;

  const response = await callLLM([
    { role: 'system', content: FIX_SYSTEM_PROMPT },
    { role: 'user', content: prompt }
  ], customApiKey, customApiKey ? 'https://api.deepseek.com/v1' : undefined);
  
  const diffMatch = response.match(/```diff\n([\s\S]*?)```/) || response.match(/```\n([\s\S]*?)```/);
  const diffStr = diffMatch ? diffMatch[1] : response;
  
  const patched = applyUnifiedDiff(currentCode, diffStr);
  fs.writeFileSync(targetPath, patched, 'utf-8');
}

function parseJSONFromLLM(text: string): unknown {
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try { return JSON.parse(codeBlockMatch[1].trim()); } catch { /* */ }
  }
  try { return JSON.parse(text.trim()); } catch { /* */ }

  const startBracket = text.indexOf('[');
  const startBrace = text.indexOf('{');
  const startIdx = startBracket === -1 ? startBrace : startBrace === -1 ? startBracket : Math.min(startBracket, startBrace);
  if (startIdx !== -1) {
    try { return JSON.parse(text.slice(startIdx)); } catch { /* */ }
  }
  return null;
}

// ─── Analysis ───

const ANALYSIS_SYSTEM_PROMPT = `You are a UX testing agent for a Korean React app (toss-contract-app — 근로계약서 작성 서비스).

Analyze the following test session data and identify UX flow issues.

For each issue found, return a JSON object with:
- "id": unique identifier (e.g., "issue-1")
- "severity": "error" | "warning" | "info"
- "title": short Korean description
- "description": detailed explanation
- "relevantRoute": the route where the issue was observed
- "statePath": dot-path to relevant state field
- "suggestedFixDescription": brief description of what to fix

Focus on: state inconsistencies, missing error handling, UX flow problems, accessibility issues, data display bugs.

Return ONLY a valid JSON array. If no issues found, return [].

Session data:
`;

export async function analyzeSession(session: StoredSession): Promise<AgentIssue[]> {
  const stateEvents = session.events.filter(e => e.type === 'state');
  const logEvents = session.events.filter(e => e.type === 'log');
  const firstTimestamp = stateEvents[0]?.payload?.timestamp as number | undefined;

  const sessionSummary = {
    id: session.id,
    status: session.status,
    duration: session.events.length > 0
      ? `From ${new Date(firstTimestamp ?? session.createdAt).toLocaleString()} with ${session.events.length} events`
      : 'No events',
    stateSnapshots: stateEvents.slice(-30).map(e => {
      const p = e.payload as Record<string, unknown>;
      const auth = p.auth as Record<string, unknown> | undefined;
      const form = p.form as Record<string, unknown> | undefined;
      const contracts = p.contracts as unknown[] | undefined;
      return {
        route: String(p.route ?? '/'),
        auth: auth ? { isAuthenticated: auth.isAuthenticated, userRole: auth.userRole } : null,
        contractsCount: contracts?.length ?? 0,
        form: form ? { step: String(form.step ?? ''), workerName: String(form.workerName ?? ''), workplace: String(form.workplace ?? '') } : null,
        loading: Boolean(p.loading),
      };
    }),
    errorLogs: logEvents.filter(e => String(e.payload.kind) === 'error').slice(-20).map(e => ({ message: String(e.payload.message ?? ''), stack: String(e.payload.stack ?? '').slice(0, 200) })),
    networkLogs: logEvents.filter(e => String(e.payload.kind) === 'network').slice(-20).map(e => ({ method: String(e.payload.method ?? ''), url: String(e.payload.url ?? ''), status: Number(e.payload.status ?? 0) })),
  };

  const response = await callLLM([
    { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
    { role: 'user', content: JSON.stringify(sessionSummary, null, 2) },
  ]);

  const parsed = parseJSONFromLLM(response);
  if (Array.isArray(parsed)) {
    return parsed.map((item: Record<string, unknown>, i: number) => ({
      id: (item.id as string) || `issue-${i + 1}`,
      severity: (['error', 'warning', 'info'].includes(item.severity as string) ? item.severity : 'info') as AgentIssue['severity'],
      title: (item.title as string) || 'Unknown issue',
      description: (item.description as string) || '',
      relevantRoute: (item.relevantRoute as string) || '/',
      statePath: item.statePath as string | undefined,
      suggestedFixDescription: item.suggestedFixDescription as string | undefined,
    }));
  }
  return [];
}

// ─── Fix Generation ───

const FIX_SYSTEM_PROMPT = `You are a code fix generator for a Korean React app (toss-contract-app — 근로계약서 작성 서비스).

Given the following UX issue, generate a minimal fix as a unified diff.
Rules:
- Generate ONLY the changes needed. Do not rewrite entire files.
- Use unified diff format (--- a/file, +++ b/file, @@ hunk headers, +add, -remove).
- Preserve Korean text and comments exactly.
- Return JSON: { "filePath": "relative/path", "diff": "unified diff string", "description": "Korean description" }
`;

export async function generateFix(issue: AgentIssue, session: StoredSession): Promise<FixProposal> {
  const response = await callLLM([
    { role: 'system', content: FIX_SYSTEM_PROMPT },
    { role: 'user', content: `Issue: ${JSON.stringify(issue, null, 2)}\nSession routes: ${session.events.filter(e => e.type === 'state').map(e => String((e.payload as Record<string, unknown>).route ?? '')).join(', ')}` },
  ]);

  const parsed = parseJSONFromLLM(response);
  if (parsed && typeof parsed === 'object') {
    return {
      id: `fix-${issue.id}-${Date.now()}`,
      issueId: issue.id,
      filePath: (parsed as Record<string, unknown>).filePath as string || 'unknown',
      diff: (parsed as Record<string, unknown>).diff as string || '',
      description: (parsed as Record<string, unknown>).description as string || '',
    };
  }

  return { id: `fix-${issue.id}-${Date.now()}`, issueId: issue.id, filePath: 'unknown', diff: '', description: '수정안 생성 실패' };
}

// ─── Fix Application ───

const PROJECT_ROOT = path.resolve(process.cwd(), '..');

export async function applyFix(fix: FixProposal): Promise<void> {
  const targetPath = path.resolve(PROJECT_ROOT, fix.filePath);
  if (!targetPath.startsWith(PROJECT_ROOT)) throw new Error(`Fix targets file outside project: ${fix.filePath}`);
  if (!fs.existsSync(targetPath)) throw new Error(`Target file not found: ${fix.filePath}`);

  const content = fs.readFileSync(targetPath, 'utf-8');
  const patched = applyUnifiedDiff(content, fix.diff);
  fs.writeFileSync(targetPath, patched, 'utf-8');
}

function applyUnifiedDiff(content: string, diff: string): string {
  let result = content;
  const hunks = diff.split(/\n(?=@@)/);
  for (const hunk of hunks) {
    const lines = hunk.split('\n');
    let inHunk = false;
    const oldLines: string[] = [];
    const newLines: string[] = [];
    for (const line of lines) {
      if (line.startsWith('@@')) { inHunk = true; continue; }
      if (!inHunk) continue;
      if (line.startsWith('-')) oldLines.push(line.slice(1));
      else if (line.startsWith('+')) newLines.push(line.slice(1));
      else if (line.startsWith(' ')) { oldLines.push(line.slice(1)); newLines.push(line.slice(1)); }
    }
    if (oldLines.length > 0) {
      result = result.replace(oldLines.join('\n'), newLines.join('\n'));
    }
  }
  return result;
}

// ─── Project Snapshots ───

const SESSIONS_DIR = path.resolve(process.cwd(), 'ux-test-sessions');

export async function snapshotProject(sessionId: string): Promise<string> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId)) {
    throw new Error('Invalid session ID format');
  }
  const snapshotDir = path.resolve(SESSIONS_DIR, 'snapshots', sessionId);
  const allowedParent = path.resolve(SESSIONS_DIR, 'snapshots');
  if (!snapshotDir.startsWith(allowedParent)) {
    throw new Error('Access Denied: Path Traversal Detected');
  }
  fs.mkdirSync(snapshotDir, { recursive: true });
  const srcDir = path.resolve(PROJECT_ROOT, 'src');
  if (fs.existsSync(srcDir)) copyDirSync(srcDir, path.join(snapshotDir, 'src'));
  return snapshotDir;
}


function copyDirSync(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDirSync(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}