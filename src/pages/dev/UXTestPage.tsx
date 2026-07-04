import { useState, useEffect, useRef, useCallback } from 'react';
import { Global, css } from '@emotion/react';
import type { StateSnapshot, LogEntry, LogKind, AgentIssue, FixProposal, SessionEvent } from '../../dev/UXTestTypes';
import * as api from '../../dev/UXTestAPI';
import type { GuardrailResult } from '../../dev/UXTestAPI';
import { logError } from '../../utils/errorConsolidation';

// ─── Styles ───
const styles = css`
* { box-sizing: border-box; }
.wk-root { display: flex; flex-direction: column; height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; color: var(--grey900, #191f28); background: var(--grey100, #f2f4f6); }
.wk-header { padding: 10px 20px; background: var(--grey900, #191f28); color: #fff; display: flex; align-items: center; gap: 12px; height: 50px; }
.wk-header h1 { font-size: 16px; margin: 0; font-weight: 700; }
.wk-header-sub { color: var(--grey500, #8b95a1); font-size: 12px; }
.wk-header-actions { margin-left: auto; display: flex; gap: 6px; }
.wk-header-error { color: var(--red500, #ff5252); font-size: 11px; align-self: center; }

/* Tabs inside header */
.wk-header-tabs { display: flex; gap: 8px; margin-left: 24px; }
.wk-tab-btn { background: none; border: none; color: var(--grey500, #8b95a1); font-size: 13px; font-weight: 600; padding: 6px 12px; cursor: pointer; border-bottom: 2px solid transparent; transition: color 0.15s, border-color 0.15s; }
.wk-tab-btn:hover { color: #fff; }
.wk-tab-btn-active { color: var(--blue500, #3182f6); border-color: var(--blue500, #3182f6); }
.wk-tab-btn-active:hover { color: var(--blue500, #3182f6); }

.wk-body { display: flex; flex: 1; overflow: hidden; }
.wk-sidebar { width: 260px; background: #fff; border-right: 1px solid var(--grey200, #e5e8eb); overflow-y: auto; padding: 12px; }
.wk-sidebar-section { margin-bottom: 16px; }
.wk-sidebar-title { font-size: 11px; font-weight: 700; color: var(--grey500, #8b95a1); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
.wk-state-row { display: flex; justify-content: space-between; padding: 2px 0; font-size: 12px; }
.wk-state-key { color: var(--grey500, #8b95a1); }
.wk-state-val { color: var(--grey800, #333d4b); font-weight: 500; }
.wk-canvas { flex: 1; overflow-y: auto; padding: 20px; }
.wk-group-header { font-size: 13px; font-weight: 700; color: var(--grey800, #333d4b); margin: 16px 0 10px; padding-bottom: 6px; border-bottom: 2px solid var(--grey200, #e5e8eb); }
.wk-group-header:first-child { margin-top: 0; }
.wk-grid { display: grid; grid-template-columns: repeat(auto-fill, 281px); gap: 16px; margin-bottom: 24px; }
.wk-card { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); cursor: pointer; transition: box-shadow 0.15s, transform 0.15s; position: relative; }
.wk-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.1); transform: translateY(-2px); }
.wk-card-header { padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--grey100, #f2f4f6); }
.wk-card-title { font-weight: 600; font-size: 13px; color: var(--grey800, #333d4b); }
.wk-card-role { background: var(--blue100, #e8f3ff); color: var(--blue500, #3182f6); padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; }
.wk-card-frame-container { width: 281px; height: 540px; position: relative; overflow: hidden; }
.wk-card-frame { width: 375px; height: 720px; border: none; background: #fff; pointer-events: none; transform: scale(0.75); transform-origin: top left; position: absolute; top: 0; left: 0; }
.wk-card-overlay { position: absolute; bottom: 0; left: 0; right: 0; padding: 6px 10px; background: rgba(25,31,40,0.85); color: #fff; font-size: 11px; display: flex; gap: 8px; align-items: center; z-index: 10; }
.wk-badge { display: inline-block; padding: 1px 6px; border-radius: 8px; font-size: 10px; font-weight: 600; }
.wk-badge-ok { background: var(--green500, #2e7d32); color: #fff; }
.wk-badge-err { background: var(--red500, #ff5252); color: #fff; }
.wk-badge-warn { background: #f9a825; color: #333; }
.wk-badge-loading { background: var(--blue500, #3182f6); color: #fff; }
.wk-focus-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 1000; display: flex; justify-content: center; align-items: center; }
.wk-focus-modal { background: #fff; border-radius: 16px; width: 90vw; max-width: 1200px; height: 85vh; display: flex; overflow: hidden; }
.wk-focus-iframe { flex: 1; border: none; background: #fff; }
.wk-focus-panel { width: 340px; border-left: 1px solid var(--grey200, #e5e8eb); overflow-y: auto; padding: 16px; }
.wk-focus-close { position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.5); color: #fff; border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; font-size: 16px; z-index: 1001; }
.wk-btn { padding: 6px 12px; border-radius: 6px; border: 1px solid #ddd; background: #fff; cursor: pointer; font-size: 12px; }
.wk-btn:disabled { opacity: 0.4; cursor: default; }
.wk-btn-primary { background: var(--blue500, #3182f6); color: #fff; border-color: var(--blue500, #3182f6); }
.wk-btn-danger { background: var(--red500, #ff5252); color: #fff; border-color: var(--red500, #ff5252); }
.wk-btn-xray-on { background: #7c3aed; color: #fff; border-color: #7c3aed; animation: xray-pulse 2s infinite; }
@keyframes xray-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(124,58,237,0.4); } 50% { box-shadow: 0 0 8px 2px rgba(124,58,237,0.3); } }
.wk-log-entry { padding: 1px 0; font-family: 'SF Mono', Menlo, monospace; font-size: 10px; border-bottom: 1px solid #f5f5f5; }
.wk-issue-card { border: 1px solid var(--grey200, #e5e8eb); border-radius: 8px; padding: 10px; margin-bottom: 6px; background: #fff; font-size: 12px; }
.wk-diff-add { background: var(--green100, #e8f5e9); color: var(--green500, #2e7d32); }
.wk-diff-del { background: var(--red100, #ffebee); color: var(--red500, #c62828); text-decoration: line-through; }
.wk-guardrail { padding: 8px; margin-bottom: 6px; border-radius: 8px; font-size: 12px; }
.wk-guardrail-pass { background: var(--green100, #e8f5e9); border: 1px solid #a5d6a7; }
.wk-guardrail-fail { background: var(--red100, #ffebee); border: 1px solid #ef9a9a; }
.wk-guardrail-pending { background: var(--grey100, #f5f5f5); border: 1px solid #e0e0e0; }

/* Design History master-detail layout */
.wk-history-container { display: flex; flex: 1; overflow: hidden; background: #fff; border-radius: 16px; margin: 20px; box-shadow: 0 4px 16px rgba(0,0,0,0.05); border: 1px solid var(--grey200, #e5e8eb); }
.wk-history-sidebar { width: 300px; border-right: 1px solid var(--grey200, #e5e8eb); display: flex; flex-direction: column; overflow-y: auto; background: #fafbfc; }
.wk-history-list { list-style: none; padding: 0; margin: 0; }
.wk-history-item { padding: 12px 16px; border-bottom: 1px solid var(--grey200, #e5e8eb); cursor: pointer; transition: background 0.15s; }
.wk-history-item:hover { background: var(--grey100, #f2f4f6); }
.wk-history-item-active { background: var(--blue100, #e8f3ff) !important; }
.wk-history-item-title { font-weight: 700; font-size: 13px; color: var(--grey900, #191f28); margin-bottom: 4px; }
.wk-history-item-meta { font-size: 11px; color: var(--grey500, #8b95a1); display: flex; justify-content: space-between; }

.wk-history-detail { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 24px; }
.wk-detail-header { border-bottom: 1px solid var(--grey200, #e5e8eb); padding-bottom: 16px; margin-bottom: 16px; }
.wk-detail-title { font-size: 18px; font-weight: 700; color: var(--grey900, #191f28); display: flex; align-items: center; gap: 8px; }
.wk-detail-subtitle { font-size: 12px; color: var(--grey500, #8b95a1); margin-top: 4px; }

/* Proposals View (A to E) */
.wk-proposals-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.wk-proposal-card { border: 1px solid var(--grey200, #e5e8eb); border-radius: 16px; padding: 16px; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.03); transition: transform 0.15s, border-color 0.15s; position: relative; }
.wk-proposal-card:hover { transform: translateY(-2px); border-color: var(--blue500, #3182f6); }
.wk-proposal-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.wk-proposal-id { font-size: 18px; font-weight: 800; color: var(--blue500, #3182f6); background: var(--blue100, #e8f3ff); width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
.wk-proposal-pattern { font-weight: 700; font-size: 12px; color: var(--grey700, #4e5968); background: var(--grey100, #f2f4f6); padding: 2px 6px; border-radius: 4px; }
.wk-proposal-desc { font-size: 12px; color: var(--grey700, #4e5968); margin-bottom: 12px; line-height: 1.5; }

.wk-proposal-desc-hoverable {
  margin-bottom: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 11px;
  cursor: help;
  position: relative;
}
.wk-proposal-desc-hoverable:hover {
  white-space: normal;
  overflow: visible;
  position: absolute;
  background: #fff;
  border: 1px solid #191f28;
  padding: 8px;
  border-radius: 6px;
  z-index: 100;
  width: calc(100% - 20px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  color: #191f28;
}

.wk-proposal-meta { font-size: 11px; color: var(--grey500, #8b95a1); display: flex; justify-content: space-between; border-top: 1px solid var(--grey100, #f2f4f6); padding-top: 8px; }

/* Component Spec Tree */
.wk-spec-section { background: #fafbfc; border-radius: 12px; border: 1px solid var(--grey200, #e5e8eb); padding: 16px; }
.wk-spec-title { font-weight: 700; font-size: 14px; color: var(--grey900, #191f28); margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
.wk-tree-node { margin-left: 16px; padding-left: 12px; border-left: 1px dashed #cbd5e1; position: relative; margin-top: 6px; }
.wk-tree-node::before { content: ""; position: absolute; left: 0; top: 8px; width: 8px; height: 1px; border-bottom: 1px dashed #cbd5e1; }
.wk-tree-node-label { font-weight: 600; font-size: 12px; color: var(--grey800, #333d4b); display: flex; align-items: center; gap: 6px; }
.wk-tree-node-props { font-size: 10px; color: var(--grey500, #8b95a1); font-family: 'SF Mono', Menlo, monospace; margin-left: 8px; }

/* UX Evaluation Styling */
.wk-ux-card { border: 1px solid var(--grey200, #e5e8eb); border-radius: 16px; overflow: hidden; background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
.wk-ux-header { padding: 14px 20px; background: #f8f9fa; border-bottom: 1px solid var(--grey200, #e5e8eb); font-weight: 700; font-size: 14px; color: var(--grey900, #191f28); display: flex; align-items: center; gap: 6px; }
.wk-ux-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
.wk-ux-section { border-bottom: 1px solid var(--grey100, #f2f4f6); padding-bottom: 14px; }
.wk-ux-section:last-child { border-bottom: none; padding-bottom: 0; }
.wk-ux-section-title { font-weight: 700; font-size: 12px; color: var(--grey700, #4e5968); margin-bottom: 6px; }
.wk-ux-text { font-size: 12px; color: var(--grey800, #333d4b); line-height: 1.6; }
.wk-ux-theory-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.wk-ux-theory-col { background: #fafbfc; border-radius: 8px; padding: 12px; border: 1px solid var(--grey200, #e5e8eb); }
.wk-ux-theory-item { margin-bottom: 8px; font-size: 12px; }
.wk-ux-theory-item:last-child { margin-bottom: 0; }
.wk-ux-theory-name { font-weight: 700; color: var(--grey900, #191f28); display: inline-block; padding: 1px 6px; border-radius: 4px; font-size: 10px; margin-right: 6px; }
.wk-ux-theory-pro { background: var(--green100, #e8f5e9); color: var(--green500, #2e7d32); }
.wk-ux-theory-con { background: var(--red100, #ffebee); color: var(--red500, #c62828); }

@media (max-width: 768px) {
  .wk-history-container { flex-direction: column; height: auto; overflow: visible; margin: 10px; }
  .wk-history-sidebar { width: 100%; border-right: none; border-bottom: 1px solid var(--grey200, #e5e8eb); max-height: 250px; }
  .wk-history-detail { padding: 16px; }
}
`;



// ─── Page definitions ───

interface PageDef {
  id: string;
  route: string;
  title: string;
  emoji: string;
  role: 'employer' | 'worker' | null;
  group: string;
}

const ALL_PAGES: PageDef[] = [
  { id: 'login', route: '/login?preview=true', title: '로그인', emoji: '🔐', role: null, group: '공통' },
  { id: 'employer-main', route: '/employer/dashboard', title: '사장님 뷰 (로그인 직후)', emoji: '🏪', role: 'employer', group: '공통' },
  { id: 'worker-main', route: '/worker/contracts', title: '알바생 뷰 (로그인 직후)', emoji: '✍️', role: 'worker', group: '공통' },
  { id: 'dashboard', route: '/employer/dashboard', title: '대시보드', emoji: '📊', role: 'employer', group: '사장님' },
  { id: 'business-new', route: '/employer/business/new', title: '사업장 등록', emoji: '🏪', role: 'employer', group: '사장님' },
  { id: 'business-manage', route: '/employer/business/manage', title: '사업장 관리', emoji: '⚙️', role: 'employer', group: '사장님' },
  { id: 'contracts', route: '/employer/contracts', title: '계약 목록', emoji: '📋', role: 'employer', group: '사장님' },
  { id: 'contract-new', route: '/employer/contracts/new', title: '계약서 작성', emoji: '📝', role: 'employer', group: '사장님' },
  { id: 'contract-detail', route: '/employer/contracts/mock-1', title: '계약서 상세', emoji: '🔍', role: 'employer', group: '사장님' },
  { id: 'contract-history', route: '/employer/contracts/mock-1/history', title: '계약서 히스토리', emoji: '📜', role: 'employer', group: '사장님' },
  { id: 'worker-list', route: '/worker/contracts', title: '내 계약 목록', emoji: '📋', role: 'worker', group: '근로자' },
  { id: 'worker-detail', route: '/worker/contracts/mock-1', title: '계약서 검토', emoji: '📄', role: 'worker', group: '근로자' },
  { id: 'worker-sign', route: '/worker/contracts/mock-1/sign', title: '전자서명', emoji: '✍️', role: 'worker', group: '근로자' },
];

const GROUP_ORDER = ['공통', '사장님', '근로자'];

const STATUS_COLORS: Record<string, string> = {
  draft: '#9e9e9e', sent: '#1565c0', viewed: '#6a1b9a', signed: '#2e7d32',
  completed: '#1b5e20', cancelled: '#c62828', expired: '#e65100', rejected: '#b71c1c',
};

const LOG_COLORS: Record<LogKind, string> = {
  console: '#333', error: '#d32f2f', network: '#1565c0', state: '#2e7d32',
};

const SEVERITY_ICONS: Record<string, string> = { error: '🔴', warning: '🟡', info: 'ℹ️' };
const SEVERITY_BORDER: Record<string, string> = { error: '#d32f2f', warning: '#f9a825', info: '#1565c0' };

// ─── Main component ───

export default function UXTestPage() {
  const [pageStates, setPageStates] = useState<Record<string, StateSnapshot>>({});
  const [pageLogs, setPageLogs] = useState<Record<string, LogEntry[]>>({});
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [issues, setIssues] = useState<AgentIssue[]>([]);
  const [fixes, setFixes] = useState<Record<string, FixProposal>>({});
  const [expandedFix, setExpandedFix] = useState<string | null>(null);
  const [guardrails, setGuardrails] = useState<GuardrailResult[]>([]);
  const [guardrailLoading, setGuardrailLoading] = useState(false);
  const [focusPage, setFocusPage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'playground' | 'design-history'>('playground');
  const [isXray, setIsXray] = useState(false);
  const [version, setVersion] = useState(() => Date.now());
  const [designs, setDesigns] = useState<any[]>([]);
  const [selectedFilename, setSelectedFilename] = useState<string | null>(null);
  const [selectedDesignContent, setSelectedDesignContent] = useState<any | null>(null);
  const [loadingDesigns, setLoadingDesigns] = useState(false);

  const iframeRefs = useRef<Record<string, HTMLIFrameElement>>({});
  const focusIframeRef = useRef<HTMLIFrameElement>(null);

  // Listen for state/log messages from ALL iframes
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data.type !== 'string') return;

      if (data.type === 'UX_TEST_STATE' && data.payload) {
        const route = (data.payload as StateSnapshot).route;
        const matchedPageIds = matchAllPagesToRoute(route);
        if (matchedPageIds.length > 0) {
          setPageStates(prev => {
            const next = { ...prev };
            matchedPageIds.forEach(pid => {
              next[pid] = data.payload as StateSnapshot;
            });
            return next;
          });
        }
      } else if (data.type === 'UX_TEST_LOG' && data.payload) {
        setPageLogs(prev => {
          const key = 'global';
          const existing = prev[key] ?? [];
          return { ...prev, [key]: [...existing.slice(-200), data.payload as LogEntry] };
        });
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // Pre-set force_mock so iframes skip the reload cycle
  useEffect(() => {
    sessionStorage.setItem('force_mock', 'true');
  }, []);

  // Auto-create session on mount
  useEffect(() => {
    api.createSession().then(id => setSessionId(id)).catch(() => {});
  }, []);

  // Fetch designs list
  const loadDesigns = useCallback(async () => {
    setLoadingDesigns(true);
    try {
      const list = await api.fetchDesigns();
      setDesigns(list);
      if (list.length > 0 && !selectedFilename) {
        setSelectedFilename(list[0].filename);
      }
    } catch (err) {
      logError('loadDesignsList', err, { api: 'UXTestAPI' });
    } finally {
      setLoadingDesigns(false);
    }
  }, [selectedFilename]);

  useEffect(() => {
    if (activeTab === 'design-history') {
      loadDesigns();
    }
  }, [activeTab, loadDesigns]);

  // Fetch specific design content
  useEffect(() => {
    if (selectedFilename) {
      api.fetchDesignContent(selectedFilename)
        .then(content => setSelectedDesignContent(content))
        .catch(err => logError('loadDesignContent', err, { filename: selectedFilename }));
    } else {
      setSelectedDesignContent(null);
    }
  }, [selectedFilename]);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const id = sessionId || await api.createSession();
      setSessionId(id);
      setRecording(true);
      // Tell all iframes to start log interception
      Object.values(iframeRefs.current).forEach(iframe => {
        iframe.contentWindow?.postMessage({ type: 'UX_TEST_COMMAND', action: 'startRecording' }, '*');
      });
    } catch {
      setError('UX 테스트 서버에 연결할 수 없습니다.');
    }
  }, [sessionId]);

  const stopRecording = useCallback(() => {
    setRecording(false);
    Object.values(iframeRefs.current).forEach(iframe => {
      iframe.contentWindow?.postMessage({ type: 'UX_TEST_COMMAND', action: 'stopRecording' }, '*');
    });
  }, []);

  const submitToAgent = useCallback(async () => {
    if (!sessionId) return;
    setAnalyzing(true);
    setError(null);
    try {
      const events: SessionEvent[] = [
        ...Object.values(pageStates).map(s => ({ type: 'state' as const, payload: s })),
        ...((pageLogs.global ?? []) as LogEntry[]).map(l => ({ type: 'log' as const, payload: l })),
      ];
      await api.sendEvents(sessionId, events);
      const result = await api.analyzeSession(sessionId);
      setIssues(result.issues);
      setFixes(result.fixes);
    } catch (err) {
      setError(err instanceof Error ? err.message : '분석 중 오류');
    } finally {
      setAnalyzing(false);
    }
  }, [sessionId, pageStates, pageLogs]);

  const runGuardrails = useCallback(async (fix: FixProposal) => {
    if (!sessionId) return;
    setGuardrailLoading(true);
    setGuardrails([]);
    try {
      const result = await api.runGuardrails(sessionId, fix);
      setGuardrails(result);
    } catch {
      setGuardrails([
        { domain: 'Supabase', passed: false, violations: ['가드레일 서버 연결 실패'], suggestions: [] },
        { domain: 'Mini-app', passed: false, violations: ['가드레일 서버 연결 실패'], suggestions: [] },
        { domain: 'Vite', passed: false, violations: ['가드레일 서버 연결 실패'], suggestions: [] },
      ]);
    } finally {
      setGuardrailLoading(false);
    }
  }, [sessionId]);

  const applyFix = useCallback(async (fixId: string) => {
    if (!sessionId) return;
    try {
      await api.confirmFixes(sessionId, [fixId]);
      setVersion(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : '수정 적용 중 오류');
    }
  }, [sessionId]);
  const iframeSrc = (page: PageDef) =>
    `${window.location.origin}/dev/bypass?role=${page.role ?? ''}&path=${encodeURIComponent(page.route)}${isXray ? '&xray=true' : ''}&v=${version}`;

  const toggleXray = useCallback(() => {
    setIsXray(prev => !prev);
    // iframes will reload automatically via React key change
  }, []);

  const globalState = Object.values(pageStates)[0] ?? null;
  const allLogs = pageLogs.global ?? [];

  return (
    <>
      <Global styles={styles} />
      <div className="wk-root">
        {/* Header */}
        <div className="wk-header">
          <h1>🧪 UX Test Workspace</h1>
          <span className="wk-header-sub">코드-연동 테스트</span>
          
          {/* Tabs */}
          <div className="wk-header-tabs">
            <button 
              className={`wk-tab-btn ${activeTab === 'playground' ? 'wk-tab-btn-active' : ''}`}
              onClick={() => setActiveTab('playground')}
            >
              통합 시뮬레이터
            </button>
            <button 
              className={`wk-tab-btn ${activeTab === 'design-history' ? 'wk-tab-btn-active' : ''}`}
              onClick={() => setActiveTab('design-history')}
            >
              디자인 히스토리
            </button>
            <button
              className="wk-tab-btn"
              onClick={() => window.open('/dev/flow-viewer?flow=contract', '_blank')}
            >
              계약서 작성 플로우
            </button>
            <button
              className="wk-tab-btn"
              onClick={() => window.open('/dev/flow-viewer?flow=sign', '_blank')}
            >
              전자서명 플로우
            </button>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            {activeTab === 'playground' && (
              <>
                <button className="wk-btn" onClick={() => setVersion(Date.now())} title="모든 iframe 새로고침">🔄 새로고침</button>
                {!recording ? (
                  <button className="wk-btn wk-btn-primary" onClick={startRecording} disabled={analyzing}>⏺ 녹화</button>
                ) : (
                  <button className="wk-btn wk-btn-danger" onClick={stopRecording}>⏹ 중지</button>
                )}
                <button className="wk-btn" onClick={submitToAgent} disabled={!sessionId || analyzing || Object.keys(pageStates).length === 0}>
                  {analyzing ? '🔍 분석 중...' : '🤖 분석'}
                </button>
                <button
                  className={`wk-btn ${isXray ? 'wk-btn-xray-on' : ''}`}
                  onClick={toggleXray}
                  title="엑스레이 모드: 각 컴포넌트 영역에 코멘트를 남기고 수정 플로우를 실행할 수 있습니다"
                >
                  {isXray ? '🔍 엑스레이 ON' : '🔍 엑스레이'}
                </button>
              </>
            )}
            {error && <span style={{ color: '#ff5252', fontSize: 11, alignSelf: 'center' }}>{error}</span>}
          </div>
        </div>

        {/* Body */}
        <div className="wk-body">
          {activeTab === 'playground' ? (
            <>
              {/* Sidebar */}
              <div className="wk-sidebar">
                <SidebarState globalState={globalState} pageStates={pageStates} />
                <SidebarGuardrails guardrails={guardrails} loading={guardrailLoading} />
                <SidebarIssues issues={issues} fixes={fixes} expandedFix={expandedFix}
                  onExpandFix={setExpandedFix} onRunGuardrails={runGuardrails} onApplyFix={applyFix} />
              </div>

              {/* Canvas */}
              <div className="wk-canvas">
                {GROUP_ORDER.map(group => {
                  const pages = ALL_PAGES.filter(p => p.group === group);
                  if (pages.length === 0) return null;
                  return (
                    <div key={group}>
                      <div className="wk-group-header">{group}</div>
                      <div className="wk-grid">
                        {pages.map(page => (
                          <PageCard
                            key={`${page.id}-${isXray}-${version}`}
                            page={page}
                            state={pageStates[page.id] ?? null}
                            src={iframeSrc(page)}
                            iframeRef={el => { if (el) { iframeRefs.current[page.id] = el; } else { delete iframeRefs.current[page.id]; } }}

                            onFocus={() => setFocusPage(page.id)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <DesignHistoryView 
              designs={designs}
              selectedFilename={selectedFilename}
              setSelectedFilename={setSelectedFilename}
              content={selectedDesignContent}
              loading={loadingDesigns}
              onRefresh={loadDesigns}
            />
          )}
        </div>

        {/* Focus modal */}
        {focusPage && (() => {
          const page = ALL_PAGES.find(p => p.id === focusPage);
          if (!page) return null;
          const state = pageStates[focusPage];
          return (
            <div className="wk-focus-overlay" onClick={() => setFocusPage(null)}>
              <div className="wk-focus-modal" onClick={e => e.stopPropagation()}>
                <button className="wk-focus-close" onClick={() => setFocusPage(null)}>✕</button>
                <iframe
                  ref={focusIframeRef}
                  className="wk-focus-iframe"
                  key={`focus-${focusPage}-${isXray}-${version}`}
                  src={iframeSrc(page)}
                  title={page.title}
                />
                <div className="wk-focus-panel">
                  <h3 style={{ margin: '0 0 8px' }}>{page.emoji} {page.title}</h3>
                  <div style={{ fontSize: 11, color: '#8b95a1', marginBottom: 12 }}>{page.route}</div>
                  {state && <StateDetailView state={state} />}
                  <h4 style={{ margin: '12px 0 4px' }}>로그</h4>
                  <LogStream entries={allLogs.slice(-30)} />
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </>
  );
}

// ─── Sub-components ───

function PageCard({ page, state, src, iframeRef, onFocus }: {
  page: PageDef;
  state: StateSnapshot | null;
  src: string;
  iframeRef: (el: HTMLIFrameElement) => void;
  onFocus: () => void;
}) {
  const errorCount = state?.form ? Object.keys(state.form.errors).length : 0;
  const contractCount = state?.contracts?.length ?? 0;
  const isLoading = state?.loading ?? false;

  return (
    <div className="wk-card" onClick={onFocus}>
      <div className="wk-card-header">
        <span className="wk-card-title">{page.emoji} {page.title}</span>
        {page.role && <span className="wk-card-role">{page.role === 'employer' ? '사장님' : '근로자'}</span>}
      </div>
      <div className="wk-card-frame-container">
        <iframe
          ref={iframeRef}
          className="wk-card-frame"
          src={src}
          title={page.title}

        />
      </div>
      <div className="wk-card-overlay">
        {isLoading && <span className="wk-badge wk-badge-loading">로딩</span>}
        {!isLoading && state && <span className="wk-badge wk-badge-ok">활성</span>}
        {!state && !isLoading && <span className="wk-badge wk-badge-warn">대기</span>}
        {errorCount > 0 && <span className="wk-badge wk-badge-err">에러 {errorCount}</span>}
        {contractCount > 0 && <span className="wk-badge" style={{ background: '#e8f3ff', color: '#3182f6' }}>계약 {contractCount}</span>}
        {state?.auth?.userRole && <span style={{ fontSize: 10 }}>{state.auth.userRole}</span>}
      </div>
    </div>
  );
}

function SidebarState({ globalState, pageStates }: { globalState: StateSnapshot | null; pageStates: Record<string, StateSnapshot> }) {
  return (
    <div className="wk-sidebar-section">
      <div className="wk-sidebar-title">📊 전역 상태</div>
      {globalState ? (
        <>
          <div className="wk-state-row"><span className="wk-state-key">인증</span><span className="wk-state-val">{globalState.auth.isAuthenticated ? `${globalState.auth.userRole}` : '미인증'}</span></div>
          <div className="wk-state-row"><span className="wk-state-key">활성 페이지</span><span className="wk-state-val">{Object.keys(pageStates).length}</span></div>
          <div className="wk-state-row"><span className="wk-state-key">계약 수</span><span className="wk-state-val">{globalState.contracts?.length ?? 0}</span></div>
          <div className="wk-state-row"><span className="wk-state-key">사업장 수</span><span className="wk-state-val">{globalState.businessesCount ?? 0}</span></div>
        </>
      ) : (
        <div style={{ color: '#8b95a1', fontSize: 12 }}>상태 대기 중...</div>
      )}
    </div>
  );
}

function SidebarGuardrails({ guardrails, loading }: { guardrails: GuardrailResult[]; loading: boolean }) {
  return (
    <div className="wk-sidebar-section">
      <div className="wk-sidebar-title">🛡️ 가드레일</div>
      {loading && <div style={{ fontSize: 12, color: '#8b95a1' }}>검증 중...</div>}
      {!loading && guardrails.length === 0 && <div style={{ fontSize: 12, color: '#8b95a1' }}>수정안 승인 전 검증</div>}
      {guardrails.map(g => (
        <div key={g.domain} className={`wk-guardrail ${g.passed ? 'wk-guardrail-pass' : 'wk-guardrail-fail'}`}>
          <div style={{ fontWeight: 600 }}>{g.passed ? '✅' : '❌'} {g.domain}</div>
          {g.violations.map((v, i) => <div key={i} style={{ color: '#c62828', fontSize: 11 }}>• {v}</div>)}
          {g.suggestions.map((s, i) => <div key={i} style={{ color: '#2e7d32', fontSize: 11 }}>💡 {s}</div>)}
        </div>
      ))}
    </div>
  );
}

function SidebarIssues({ issues, fixes, expandedFix, onExpandFix, onRunGuardrails, onApplyFix }: {
  issues: AgentIssue[];
  fixes: Record<string, FixProposal>;
  expandedFix: string | null;
  onExpandFix: (id: string | null) => void;
  onRunGuardrails: (fix: FixProposal) => void;
  onApplyFix: (id: string) => void;
}) {
  if (issues.length === 0) return null;
  return (
    <div className="wk-sidebar-section">
      <div className="wk-sidebar-title">🤖 감지된 이슈 ({issues.length})</div>
      {issues.map(issue => (
        <div key={issue.id} className="wk-issue-card" style={{ borderLeftColor: SEVERITY_BORDER[issue.severity] ?? '#ddd', borderLeftWidth: 3, borderLeftStyle: 'solid' }}>
          <div style={{ fontWeight: 600 }}>{SEVERITY_ICONS[issue.severity] ?? '•'} {issue.title}</div>
          <div style={{ color: '#8b95a1', fontSize: 11, margin: '2px 0' }}>{issue.description}</div>
          {fixes[issue.id] && (
            <div style={{ marginTop: 4 }}>
              <button className="wk-btn" style={{ fontSize: 11 }} onClick={() => onExpandFix(expandedFix === issue.id ? null : issue.id)}>
                {expandedFix === issue.id ? '▼ 숨기기' : '▶ 수정안'}
              </button>
              {expandedFix === issue.id && (
                <div style={{ marginTop: 4 }}>
                  <div style={{ fontSize: 11, color: '#8b95a1' }}>{fixes[issue.id].filePath}</div>
                  <pre style={{ fontSize: 10, margin: '4px 0', whiteSpace: 'pre-wrap', maxHeight: 80, overflow: 'auto' }}>
                    {fixes[issue.id].diff.split('\n').map((line, i) => (
                      <div key={i} className={line.startsWith('+') ? 'wk-diff-add' : line.startsWith('-') ? 'wk-diff-del' : ''}>{line}</div>
                    ))}
                  </pre>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="wk-btn wk-btn-primary" style={{ fontSize: 11 }} onClick={() => onRunGuardrails(fixes[issue.id])}>🛡️ 가드레일 검증</button>
                    <button className="wk-btn" style={{ fontSize: 11 }} onClick={() => onApplyFix(fixes[issue.id].id)}>✅ 적용</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function StateDetailView({ state }: { state: StateSnapshot }) {
  return (
    <div>
      <div className="wk-state-row"><span className="wk-state-key">경로</span><span className="wk-state-val">{state.route}</span></div>
      <div className="wk-state-row"><span className="wk-state-key">인증</span><span className="wk-state-val">{state.auth.isAuthenticated ? `${state.auth.userRole} (${state.auth.userName})` : '미인증'}</span></div>
      <div className="wk-state-row"><span className="wk-state-key">로딩</span><span className="wk-state-val">{state.loading ? 'Yes' : 'No'}</span></div>
      <div className="wk-state-row"><span className="wk-state-key">계약</span><span className="wk-state-val">{state.contracts.length}개</span></div>
      {state.form && (
        <>
          <div className="wk-state-row"><span className="wk-state-key">폼 단계</span><span className="wk-state-val">{state.form.step}</span></div>
          <div className="wk-state-row"><span className="wk-state-key">근로자</span><span className="wk-state-val">{state.form.workerName || '(없음)'}</span></div>
          <div className="wk-state-row"><span className="wk-state-key">근무장소</span><span className="wk-state-val">{state.form.workplace || '(없음)'}</span></div>
          {Object.keys(state.form.errors).length > 0 && (
            <div style={{ color: '#d32f2f', fontSize: 11, marginTop: 4 }}>
              오류: {Object.entries(state.form.errors).map(([k, v]) => `${k}`).join(', ')}
            </div>
          )}
        </>
      )}
      {state.contracts.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 11 }}>
          {state.contracts.map((c, i) => (
            <div key={i} style={{ padding: '2px 0', borderBottom: '1px solid #f0f0f0' }}>
              <span className="wk-badge" style={{ background: STATUS_COLORS[c.status] ?? '#757575', color: '#fff', marginRight: 4 }}>{c.status}</span>
              {c.workerName} — {c.workplace}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LogStream({ entries }: { entries: LogEntry[] }) {
  if (entries.length === 0) return <div style={{ color: '#8b95a1', fontSize: 12 }}>로그 없음</div>;
  return (
    <div style={{ maxHeight: 150, overflowY: 'auto' }}>
      {entries.map(e => (
        <div key={e.id} className="wk-log-entry" style={{ color: LOG_COLORS[e.kind] }}>
          <span style={{ color: '#8b95a1' }}>{new Date(e.timestamp).toLocaleTimeString()}</span>{' '}
          {e.kind === 'network' ? `${e.method} ${e.url?.slice(-40)} → ${e.status}` : e.message.slice(0, 80)}
        </div>
      ))}
    </div>
  );
}

// ─── Design History Sub-components ───

function DesignHistoryView({ 
  designs, 
  selectedFilename, 
  setSelectedFilename, 
  content, 
  loading,
  onRefresh
}: {
  designs: any[];
  selectedFilename: string | null;
  setSelectedFilename: (filename: string) => void;
  content: any | null;
  loading: boolean;
  onRefresh: () => void;
}) {
  const [isXray, setIsXray] = useState(false);

  return (
    <div className="wk-history-container">
      {/* Left Sidebar: Timeline list */}
      <div className="wk-history-sidebar">
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e8eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, color: '#4e5968' }}>디자인 세션 이력 ({designs.length})</span>
          <button className="wk-btn" style={{ fontSize: 11, padding: '2px 6px' }} onClick={onRefresh}>새로고침</button>
        </div>
        {loading && <div style={{ padding: 16, color: '#8b95a1' }}>이력 로딩 중...</div>}
        {!loading && designs.length === 0 && <div style={{ padding: 16, color: '#8b95a1' }}>디자인 내역이 없습니다.</div>}
        <ul className="wk-history-list">
          {designs.map(d => (
            <li 
              key={d.filename}
              className={`wk-history-item ${selectedFilename === d.filename ? 'wk-history-item-active' : ''}`}
              onClick={() => setSelectedFilename(d.filename)}
            >
              <div className="wk-history-item-title">
                {d.isSpec ? '📝 최종 스펙' : '🔗 레이아웃 제안'}
              </div>
              <div style={{ fontSize: 11, color: '#4e5968', marginBottom: 4 }}>
                Task: <strong style={{ color: '#191f28' }}>{d.taskId}</strong>
              </div>
              <div className="wk-history-item-meta">
                <span>{new Date(d.createdAt).toLocaleString()}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Right Content Panel: Master Detail */}
      <div className="wk-history-detail">
        {content ? (
          <>
            <div className="wk-detail-header">
              <div className="wk-detail-title">
                {selectedFilename?.includes('-spec') ? '📝 최종 채택 UI 디자인 스펙' : '🔗 5종 UI 레이아웃 제안서'}
                <span className="wk-proposal-pattern" style={{ fontSize: 11, marginLeft: 8 }}>{content.taskId}</span>
              </div>
              <div className="wk-detail-subtitle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>경로: {content.page}</span>
                <button 
                  onClick={() => setIsXray(!isXray)}
                  style={{ 
                    padding: '4px 12px', background: isXray ? '#3182f6' : '#f2f4f6', 
                    color: isXray ? '#fff' : '#4e5968', border: 'none', borderRadius: 4, 
                    fontSize: 12, fontWeight: 'bold', cursor: 'pointer' 
                  }}
                >
                  {isXray ? '엑스레이 모드 ON 🔍' : '엑스레이 모드 OFF'}
                </button>
              </div>
            </div>

            {/* Render 5 Layout Proposals */}
            {content.proposals && (
              <div>
                <h3 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 700 }}>제안된 5가지 레이아웃 패턴</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                  {content.proposals.map((item: any) => (
                    <div key={item.id} className="wk-proposal-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', width: '281px' }}>
                      <div style={{ padding: '8px 10px', background: '#f8f9fa', borderBottom: '1px solid #e5e8eb', flexShrink: 0 }}>
                        <div className="wk-proposal-card-header" style={{ marginBottom: 4 }}>
                          <span className="wk-proposal-id" style={{ width: 20, height: 20, fontSize: 12 }}>{item.id}</span>
                          <span className="wk-proposal-pattern" style={{ fontSize: 9 }}>{item.pattern}</span>
                        </div>
                        <div 
                          className="wk-proposal-desc-hoverable" 
                          title={item.description}
                        >
                          {item.description}
                        </div>
                      </div>
                      <div style={{ width: '281px', height: '510px', position: 'relative', overflow: 'hidden' }}>
                        <iframe 
                          src={`${window.location.origin}/dev/bypass?path=${encodeURIComponent((content.page && content.page !== 'unknown' ? '/dev' + content.page : '/dev/login') + '/variant-' + item.id.toLowerCase() + (isXray ? '?xray=true' : ''))}`}
                          style={{ border: 'none', width: '375px', height: '680px', transform: 'scale(0.75)', transformOrigin: 'top left', background: '#fff', position: 'absolute', top: 0, left: 0 }}
                          title={`Variant ${item.id}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Render Full Spec (Component Tree + UX Evaluation) */}
            {!content.proposals && (
              <>
                {/* 1. UX Evaluation Section */}
                {content.uxEvaluation && (
                  <div className="wk-ux-card">
                    <div className="wk-ux-header">
                      💡 UX 이론 기반 디자인 의도 및 분석 평가
                    </div>
                    <div className="wk-ux-body">
                      <div className="wk-ux-section">
                        <div className="wk-ux-section-title">디자인 철학 및 의도 (Intent & Philosophy)</div>
                        <div className="wk-ux-text">{content.uxEvaluation.philosophyAndIntent}</div>
                      </div>
                      <div className="wk-ux-section">
                        <div className="wk-ux-section-title">기대 효과 (Expected Usability Impact)</div>
                        <div className="wk-ux-text">{content.uxEvaluation.expectedImpact}</div>
                      </div>
                      <div className="wk-ux-section">
                        <div className="wk-ux-theory-grid">
                          {/* Pros Column */}
                          <div className="wk-ux-theory-col">
                            <div className="wk-ux-section-title" style={{ color: '#2e7d32', marginBottom: 8 }}>장점 분석 (Pros)</div>
                            {content.uxEvaluation.pros?.map((item: any, i: number) => (
                              <div key={i} className="wk-ux-theory-item">
                                <span className="wk-ux-theory-name wk-ux-theory-pro">{item.theory}</span>
                                <div className="wk-ux-text" style={{ marginTop: 2 }}>{item.rationale}</div>
                              </div>
                            ))}
                          </div>
                          {/* Cons Column */}
                          <div className="wk-ux-theory-col">
                            <div className="wk-ux-section-title" style={{ color: '#c62828', marginBottom: 8 }}>단점 및 극복 방안 (Cons & Trade-offs)</div>
                            {content.uxEvaluation.cons?.map((item: any, i: number) => (
                              <div key={i} className="wk-ux-theory-item">
                                <span className="wk-ux-theory-name wk-ux-theory-con">{item.theory}</span>
                                <div className="wk-ux-text" style={{ marginTop: 2 }}>{item.rationale}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Component Tree Representation */}
                <div className="wk-spec-section">
                  <div className="wk-spec-title">🌳 컴포넌트 계층 명세 (Component Node Tree)</div>
                  {content.componentTree && (
                    <div style={{ marginLeft: -16 }}>
                      <TreeNodeView node={content.componentTree} />
                    </div>
                  )}
                </div>

                {/* 3. Interactions & State Bindings */}
                <div style={{ display: 'flex', gap: 16 }}>
                  {/* State Bindings */}
                  <div className="wk-spec-section" style={{ flex: 1 }}>
                    <div className="wk-spec-title">🔄 상태 바인딩 (State Bindings)</div>
                    {content.stateBindings && Object.entries(content.stateBindings).map(([key, binding]: [string, any]) => (
                      <div key={key} style={{ fontSize: 11, padding: '4px 0', borderBottom: '1px solid #f2f4f6' }}>
                        <strong style={{ color: '#3182f6' }}>{key}</strong>
                        <div style={{ color: '#8b95a1', marginTop: 2 }}>
                          From: <code style={{ color: '#4e5968' }}>{binding.from}</code>
                          {binding.setBy && <><br />SetBy: <code style={{ color: '#4e5968' }}>{binding.setBy}</code></>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Interactions */}
                  <div className="wk-spec-section" style={{ flex: 1 }}>
                    <div className="wk-spec-title" style={{ fontSize: 15, borderBottom: '2px solid #191f28', paddingBottom: 8, marginBottom: 12 }}>⚡ 사용자 인터랙션 명세 (Interactions)</div>
                    {content.interactions?.map((inter: any, i: number) => (
                      <div key={i} style={{ fontSize: 13, padding: '12px', background: '#f8f9fa', borderRadius: 8, marginBottom: 8 }}>
                        <strong style={{ color: '#191f28', display: 'block', marginBottom: 4 }}>{inter.trigger}</strong>
                        <div style={{ color: '#3182f6', fontWeight: 600 }}>➡️ {inter.action}</div>
                        {inter.errorHandling && <div style={{ color: '#ff5252', marginTop: 4, fontSize: 12 }}>⚠️ 예외 처리: {inter.errorHandling}</div>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Target Files */}
                <div className="wk-spec-section">
                  <div className="wk-spec-title">📂 수정 대상 파일 목록 (Target Files)</div>
                  {content.referenceFiles?.map((file: string, i: number) => (
                    <div key={i} style={{ fontFamily: 'monospace', fontSize: 11, padding: '4px 0', color: '#4e5968' }}>
                      • {file}
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: '#8b95a1' }}>
            좌측 목록에서 디자인 이력을 선택해 주세요.
          </div>
        )}
      </div>
    </div>
  );
}

function TreeNodeView({ node }: { node: any }) {
  if (!node) return null;
  return (
    <div className="wk-tree-node" style={{ padding: '8px 12px', background: '#fff', border: '1px solid #e5e8eb', borderRadius: 8, marginBottom: 8 }}>
      <div className="wk-tree-node-label" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#191f28' }}>📦 {node.component}</span>
        {node.props && Object.keys(node.props).length > 0 && (
          <span className="wk-tree-node-props" style={{ display: 'inline-block', maxWidth: '100%', wordBreak: 'break-all', fontSize: 11, color: '#4e5968', fontFamily: 'SF Mono, Menlo, monospace', marginLeft: 8, background: '#f2f4f6', padding: '2px 6px', borderRadius: 4 }}>
            {Object.entries(node.props).map(([k,v]) => `${k}=${typeof v === 'object' ? '{...}' : JSON.stringify(v)}`).join(' ')}
          </span>
        )}
        {node.bindTo && <span className="wk-badge wk-badge-loading" style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#e8f3ff', color: '#1b64da' }}>🔗 State: {node.bindTo}</span>}
        {node.action && <span className="wk-badge" style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#e8f5e9', color: '#2e7d32' }}>⚡ Action: {node.action}</span>}
        {node.actionLabel && <span style={{ fontSize: 11, color: '#4e5968', marginLeft: 4 }}>"{node.actionLabel}"</span>}
      </div>
      {node.children && node.children.length > 0 && (
        <div style={{ paddingLeft: 16, marginTop: 12, borderLeft: '2px solid #f2f4f6' }}>
          {node.children.map((child: any, i: number) => (
            <TreeNodeView key={i} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}


// ─── Helpers ───

function matchAllPagesToRoute(route: string): string[] {
  const matchedIds: string[] = [];

  // Normalize route to remove dynamic injected query parameters (like v= or xray=true)
  // But we must be careful: p.route for login is '/login?preview=true'
  // Let's strip query params entirely from both for the primary matching,
  // or just strip v= and xray=

  const routeUrl = new URL(route, 'http://localhost');
  routeUrl.searchParams.delete('v');
  routeUrl.searchParams.delete('xray');
  const normalizedRoute = routeUrl.pathname + routeUrl.search;

  // 1. Exact matches
  ALL_PAGES.forEach(p => {
    const pUrl = new URL(p.route, 'http://localhost');
    if (pUrl.pathname + pUrl.search === normalizedRoute) {
      matchedIds.push(p.id);
    }
  });

  if (matchedIds.length > 0) return matchedIds;

  // 2. Prefix match for dynamic routes
  if (route.includes('/employer/contracts/') && route.endsWith('/history')) {
    matchedIds.push('contract-history');
  } else if (route.includes('/employer/contracts/') && route.includes('/edit')) {
    matchedIds.push('contract-new');
  } else if (route.includes('/employer/contracts/') && !route.includes('/new')) {
    matchedIds.push('contract-detail');
  } else if (route.includes('/worker/contracts/') && route.endsWith('/sign')) {
    matchedIds.push('worker-sign');
  } else if (route.includes('/worker/contracts/')) {
    matchedIds.push('worker-detail');
  } else if (route.startsWith('/employer/dashboard')) {
    matchedIds.push('dashboard', 'employer-main');
  } else if (route.startsWith('/worker/contracts') && !route.includes('/mock-contract-')) {
    matchedIds.push('worker-list', 'worker-main');
  } else if (route.startsWith('/login')) {
    matchedIds.push('login');
  }

  // Deduplicate
  return Array.from(new Set(matchedIds));
}