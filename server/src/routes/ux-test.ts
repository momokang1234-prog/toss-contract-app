import { Router, type Request, type Response } from 'express';
import { createSession, appendEvents, getSession, updateAnalysis, updateStatus } from '../ux-test/session-store';
import { analyzeSession, generateFix, applyFix, snapshotProject, type AgentIssue, type FixProposal } from '../ux-test/agent';
import fs from 'fs';
import path from 'path';

const SESSIONS_DIR = path.resolve(process.cwd(), 'ux-test-sessions');
if (!fs.existsSync(SESSIONS_DIR)) {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

export const uxTestRoutes = Router();

// Middleware to validate session ID format (UUID v4) and prevent Path Traversal
const validateSessionId = (req: Request, res: Response, next: () => void) => {
  const { id } = req.params;
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    res.status(400).json({ error: 'Invalid session ID format. Must be a valid UUID.' });
    return;
  }

  const resolvedPath = path.resolve(SESSIONS_DIR, `${id}.json`);
  if (!resolvedPath.startsWith(SESSIONS_DIR)) {
    res.status(400).json({ error: 'Access Denied: Path Traversal Detected' });
    return;
  }

  next();
};

// POST /ux-test/session — Create a new test session
uxTestRoutes.post('/session', (_req: Request, res: Response) => {
  const sessionId = createSession();
  res.json({ sessionId });
});

// POST /ux-test/session/:id/events — Append events to a session
uxTestRoutes.post('/session/:id/events', validateSessionId, (req: Request, res: Response) => {
  const { id } = req.params;
  const { events } = req.body as { events: unknown[] };

  if (!Array.isArray(events)) {
    res.status(400).json({ error: 'events must be an array' });
    return;
  }

  try {
    appendEvents(id, events as Parameters<typeof appendEvents>[1]);
    res.json({ ok: true, count: events.length });
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
  }
});

// GET /ux-test/session/:id — Retrieve a session
uxTestRoutes.get('/session/:id', validateSessionId, (req: Request, res: Response) => {
  const session = getSession(req.params.id);
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }
  res.json(session);
});

// POST /ux-test/analyze/:id — Trigger LLM analysis of session data
uxTestRoutes.post('/analyze/:id', validateSessionId, async (req: Request, res: Response) => {
  const { id } = req.params;
  const session = getSession(id);

  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  if (session.events.length === 0) {
    res.status(400).json({ error: 'Session has no events to analyze' });
    return;
  }

  updateStatus(id, 'analyzing');

  try {
    const issues = await analyzeSession(session);
    const fixes: Record<string, FixProposal> = {};
    for (const issue of issues) {
      if (issue.suggestedFixDescription) {
        try { fixes[issue.id] = await generateFix(issue, session); } catch { /* non-fatal */ }
      }
    }

    updateAnalysis(id, { issues, proposedFixes: Object.values(fixes), timestamp: Date.now() });
    updateStatus(id, 'complete');
    res.json({ issues, fixes });
  } catch (err) {
    updateStatus(id, 'recording');
    const message = (err as Error).message;
    if (message.includes('LLM request failed') || message.includes('fetch failed')) {
      res.status(503).json({ error: 'LLM 서비스를 사용할 수 없습니다. Ollama가 실행 중인지 확인하세요.' });
      return;
    }
    res.status(500).json({ error: message });
  }
});

// GET /ux-test/analyze/:id — Get stored analysis results
uxTestRoutes.get('/analyze/:id', validateSessionId, (req: Request, res: Response) => {
  const session = getSession(req.params.id);
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  if (!session.analysis) {
    res.json({ issues: [], fixes: {} });
    return;
  }

  res.json({
    issues: session.analysis.issues,
    fixes: (session.analysis.proposedFixes as FixProposal[]).reduce(
      (acc, fix) => { acc[fix.issueId] = fix; return acc; },
      {} as Record<string, FixProposal>
    ),
  });
});

// POST /ux-test/confirm/:id — Apply confirmed fixes
uxTestRoutes.post('/confirm/:id', validateSessionId, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { approvedFixes } = req.body as { approvedFixes: string[] };
  const session = getSession(id);

  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  if (!session.analysis?.proposedFixes) {
    res.status(400).json({ error: 'No analysis found for this session' });
    return;
  }

  // Take a snapshot before applying fixes
  await snapshotProject(id);

  const applied: string[] = [];
  const failed: Record<string, string> = {};

  for (const fixId of approvedFixes) {
    const fix = (session.analysis.proposedFixes as FixProposal[]).find(f => f.id === fixId);
    if (!fix) {
      failed[fixId] = 'Fix not found';
      continue;
    }

    try {
      await applyFix(fix);
      applied.push(fixId);
    } catch (err) {
      failed[fixId] = (err as Error).message;
    }
  }

  res.json({ applied, failed });
});

// POST /ux-test/snapshot/:id — Take a code snapshot
uxTestRoutes.post('/snapshot/:id', validateSessionId, async (req: Request, res: Response) => {
  const { id } = req.params;
  const session = getSession(id);
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  const path = await snapshotProject(id);
  res.json({ snapshotPath: path });
});

// POST /ux-test/guardrail/:id — Store guardrail results
uxTestRoutes.post('/guardrail/:id', validateSessionId, (req: Request, res: Response) => {
  const { id } = req.params;
  const { results } = req.body as { results: Array<{ domain: string; passed: boolean; violations: string[]; suggestions: string[] }> };
  const session = getSession(id);

  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  const existingAnalysis = session.analysis ?? { issues: [], proposedFixes: [], timestamp: Date.now() };
  updateAnalysis(id, { ...existingAnalysis, guardrails: results });

  res.json({ ok: true, results });
});

// GET /ux-test/designs — List all design sessions
uxTestRoutes.get('/designs', (_req: Request, res: Response) => {
  try {
    if (!fs.existsSync(SESSIONS_DIR)) {
      res.json([]);
      return;
    }
    const files = fs.readdirSync(SESSIONS_DIR, { withFileTypes: true });
    const list: any[] = [];

    for (const d of files) {
      if (d.isFile() && d.name.startsWith('design-') && d.name.endsWith('.json')) {
        const filename = d.name;
        const filePath = path.join(SESSIONS_DIR, filename);
        const stats = fs.statSync(filePath);
        try {
          const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          list.push({
            filename,
            createdAt: stats.birthtimeMs || stats.mtimeMs,
            taskId: content.taskId || 'unknown',
            page: content.page || 'unknown',
            selectedId: content.selectedId || null,
            isSpec: filename.includes('-spec'),
            summary: content.intent || (content.uxEvaluation && content.uxEvaluation.philosophyAndIntent) || ''
          });
        } catch {
          list.push({
            filename,
            createdAt: stats.birthtimeMs || stats.mtimeMs,
            isSpec: filename.includes('-spec'),
            error: 'Failed to parse JSON'
          });
        }
      } else if (d.isDirectory() && d.name.startsWith('session-')) {
        const sessionFiles = ['design.json', 'design-spec.json'];
        for (const sf of sessionFiles) {
          const filePath = path.join(SESSIONS_DIR, d.name, sf);
          if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            try {
              const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
              list.push({
                filename: `${d.name}/${sf}`,
                createdAt: stats.birthtimeMs || stats.mtimeMs,
                taskId: content.taskId || 'unknown',
                page: content.page || 'unknown',
                selectedId: content.selectedId || null,
                isSpec: sf === 'design-spec.json',
                summary: content.intent || (content.uxEvaluation && content.uxEvaluation.philosophyAndIntent) || ''
              });
            } catch {
              list.push({
                filename: `${d.name}/${sf}`,
                createdAt: stats.birthtimeMs || stats.mtimeMs,
                isSpec: sf === 'design-spec.json',
                error: 'Failed to parse JSON'
              });
            }
          }
        }
      }
    }

    list.sort((a, b) => b.createdAt - a.createdAt);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// GET /ux-test/designs/* — Retrieve specific design file content
uxTestRoutes.get('/designs/*', (req: Request, res: Response) => {
  const filename = decodeURIComponent((req.params as any)[0] ?? '');

  const isRootDesign = /^design-[a-zA-Z0-9_\-\.]+\.json$/.test(filename);
  const isSessionDesign = /^session-[a-zA-Z0-9_\-\.]+\/(design|design-spec)\.json$/.test(filename);

  if (!isRootDesign && !isSessionDesign) {
    res.status(400).json({ error: 'Invalid filename format' });
    return;
  }

  const filePath = path.resolve(SESSIONS_DIR, filename);
  if (!filePath.startsWith(SESSIONS_DIR)) {
    res.status(400).json({ error: 'Access Denied: Path Traversal Detected' });
    return;
  }

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: 'Design file not found' });
    return;
  }

  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    res.json(content);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read or parse design file' });
  }
});

// POST /ux-test/designs/upload — Upload/Save a design proposal or spec
uxTestRoutes.post('/designs/upload', (req: Request, res: Response) => {
  const { filename, data, apiKey } = req.body as { filename: string; data: unknown; apiKey?: string };

  if (!filename || !data) {
    res.status(400).json({ error: 'filename and data are required' });
    return;
  }

  const isRootDesign = /^design-[a-zA-Z0-9_\-\.]+\.json$/.test(filename);
  const isSessionDesign = /^session-[a-zA-Z0-9_\-\.]+\/(design|design-spec)\.json$/.test(filename);

  if (!isRootDesign && !isSessionDesign) {
    res.status(400).json({ error: 'Invalid filename format' });
    return;
  }

  const filePath = path.resolve(SESSIONS_DIR, filename);
  if (!filePath.startsWith(SESSIONS_DIR)) {
    res.status(400).json({ error: 'Access Denied: Path Traversal Detected' });
    return;
  }

  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    
    const parsedData = data as any;
    if (parsedData.comments && Array.isArray(parsedData.comments) && parsedData.comments.length > 0) {
      const latest = parsedData.comments[parsedData.comments.length - 1];
      const logLine = `[COMMENT_ADDED] File: ${filename} | Component: ${latest.targetComponent} | Msg: ${latest.message}\n`;
      fs.appendFileSync(path.resolve(SESSIONS_DIR, 'comment-events.log'), logLine, 'utf-8');
      
      // Auto-trigger background fix using LLM
      import('../ux-test/agent').then(({ applyCommentFix }) => {
        applyCommentFix(filename, latest.targetComponent, latest.message, apiKey).catch(console.error);
      });
    }

    res.json({ ok: true, filename });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});