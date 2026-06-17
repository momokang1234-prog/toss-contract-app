import type { LogEntry, LogKind } from './UXTestTypes';

let originalConsoleLog = console.log;
let originalConsoleError = console.error;
let originalConsoleWarn = console.warn;
let originalFetch = window.fetch;
let originalOnError: OnErrorEventHandler | null = null;
let originalOnUnhandledRejection: ((ev: PromiseRejectionEvent) => void) | null = null;
let active = false;
let nextId = 0;

function uid(): string {
  return `log-${Date.now()}-${nextId++}`;
}

export type LogListener = (entry: LogEntry) => void;

let listener: LogListener | null = null;

export function setLogListener(l: LogListener | null): void {
  listener = l;
}

function emit(kind: LogKind, message: string, extra: Partial<LogEntry> = {}): void {
  if (!active || !listener) return;
  const entry: LogEntry = {
    id: uid(),
    kind,
    timestamp: Date.now(),
    message,
    ...extra,
  };
  listener(entry);
  // Also forward via postMessage to parent (if in iframe)
  if (window.parent !== window) {
    try {
      window.parent.postMessage({ type: 'UX_TEST_LOG', payload: entry }, '*');
    } catch { /* cross-origin — ignore */ }
  }
}

export function startIntercept(): void {
  if (active) return;
  active = true;

  // Wrap console methods
  originalConsoleLog = console.log;
  originalConsoleError = console.error;
  originalConsoleWarn = console.warn;

  console.log = (...args: unknown[]) => {
    originalConsoleLog.apply(console, args);
    emit('console', args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 0) : String(a)).join(' '));
  };

  console.error = (...args: unknown[]) => {
    originalConsoleError.apply(console, args);
    emit('error', args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 0) : String(a)).join(' '));
  };

  console.warn = (...args: unknown[]) => {
    originalConsoleWarn.apply(console, args);
    emit('console', `[WARN] ${args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 0) : String(a)).join(' ')}`);
  };

  // Wrap fetch
  originalFetch = window.fetch;
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url ?? '';
    const method = init?.method ?? 'GET';
    const start = Date.now();
    try {
      const response = await originalFetch.call(window, input, init);
      emit('network', `${method} ${url}`, {
        url,
        method,
        status: response.status,
        duration: Date.now() - start,
      });
      return response;
    } catch (err) {
      emit('network', `${method} ${url} FAILED`, {
        url,
        method,
        status: 0,
        duration: Date.now() - start,
      });
      throw err;
    }
  };

  // Error handlers
  originalOnError = window.onerror;
  window.onerror = (msg, source, lineno, colno, error) => {
    emit('error', `Uncaught: ${msg}`, { stack: error?.stack ?? `${source}:${lineno}:${colno}` });
    if (originalOnError) originalOnError(msg, source, lineno, colno, error);
  };

  originalOnUnhandledRejection = window.onunhandledrejection as ((ev: PromiseRejectionEvent) => void) | null;
  window.onunhandledrejection = (ev: PromiseRejectionEvent) => {
    const reason = ev.reason;
    const message = reason instanceof Error ? reason.message : String(reason);
    const stack = reason instanceof Error ? reason.stack : undefined;
    emit('error', `Unhandled rejection: ${message}`, { stack });
    if (originalOnUnhandledRejection) originalOnUnhandledRejection.call(window, ev);
  };

  emit('state', 'Log interceptor started');
}

export function stopIntercept(): void {
  if (!active) return;
  active = false;
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  window.fetch = originalFetch;
  window.onerror = originalOnError;
  window.onunhandledrejection = originalOnUnhandledRejection;
}