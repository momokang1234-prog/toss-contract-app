import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { error: Error | null; hasError: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { error, hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary]', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, background: '#FFF0F0', borderBottom: '2px solid #FF5252', fontFamily: 'monospace', fontSize: 12 }}>
          <div style={{ fontWeight: 700, color: '#D32F2F', marginBottom: 8 }}>⚠️ React Error</div>
          <div style={{ color: '#333', whiteSpace: 'pre-wrap' }}>{this.state.error?.message}</div>
          {this.state.error?.stack && (
            <div style={{ color: '#888', marginTop: 8, fontSize: 10, whiteSpace: 'pre-wrap', maxHeight: 200, overflow: 'auto' }}>
              {this.state.error.stack.split('\n').slice(0, 8).join('\n')}
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 12, padding: '6px 16px', borderRadius: 8, border: 'none', background: '#D32F2F', color: '#fff', cursor: 'pointer', fontSize: 12 }}
          >새로고침</button>
        </div>
      );
    }
    return this.props.children;
  }
}
