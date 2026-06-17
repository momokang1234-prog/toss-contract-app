import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
// Local types to avoid cross-rootDir import from frontend source
export interface SessionEvent {
  type: 'state' | 'log';
  payload: Record<string, unknown>;
}

const SESSIONS_DIR = path.resolve(process.cwd(), 'ux-test-sessions');

// Ensure sessions directory exists
if (!fs.existsSync(SESSIONS_DIR)) {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

export interface StoredSession {
  id: string;
  createdAt: number;
  status: 'recording' | 'analyzing' | 'fixing' | 'complete';
  events: SessionEvent[];
  analysis?: {
    issues: unknown[];
    proposedFixes: unknown[];
    timestamp: number;
    guardrails?: unknown[];
  };
}

function sessionPath(id: string): string {
  return path.join(SESSIONS_DIR, `${id}.json`);
}

export function createSession(): string {
  const id = crypto.randomUUID();
  const session: StoredSession = {
    id,
    createdAt: Date.now(),
    status: 'recording',
    events: [],
  };
  fs.writeFileSync(sessionPath(id), JSON.stringify(session, null, 2));
  return id;
}

export function appendEvents(id: string, events: SessionEvent[]): void {
  const session = getSession(id);
  if (!session) throw new Error(`Session ${id} not found`);
  session.events.push(...events);
  fs.writeFileSync(sessionPath(id), JSON.stringify(session, null, 2));
}

export function getSession(id: string): StoredSession | null {
  const filePath = sessionPath(id);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as StoredSession;
}

export function updateAnalysis(id: string, analysis: StoredSession['analysis']): void {
  const session = getSession(id);
  if (!session) throw new Error(`Session ${id} not found`);
  session.analysis = analysis;
  fs.writeFileSync(sessionPath(id), JSON.stringify(session, null, 2));
}

export function updateStatus(id: string, status: StoredSession['status']): void {
  const session = getSession(id);
  if (!session) throw new Error(`Session ${id} not found`);
  session.status = status;
  fs.writeFileSync(sessionPath(id), JSON.stringify(session, null, 2));
}

export function listSessions(): Pick<StoredSession, 'id' | 'createdAt' | 'status'>[] {
  const files = fs.readdirSync(SESSIONS_DIR).filter(f => f.endsWith('.json'));
  return files.map(f => {
    const raw = fs.readFileSync(path.join(SESSIONS_DIR, f), 'utf-8');
    const s = JSON.parse(raw) as StoredSession;
    return { id: s.id, createdAt: s.createdAt, status: s.status };
  });
}