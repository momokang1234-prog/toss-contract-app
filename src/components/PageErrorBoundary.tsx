import { Component, type ReactNode } from 'react';
import { PageErrorFallback } from './shared/ErrorFallback';

interface Props { children: ReactNode; }
interface State { error: Error | null; hasError: boolean; }

export class PageErrorBoundary extends Component<Props, State> {
  state: State = { error: null, hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { error, hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('[PageErrorBoundary]', error);
  }

  resetErrorBoundary = () => {
    this.setState({ error: null, hasError: false });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return <PageErrorFallback error={this.state.error} resetErrorBoundary={this.resetErrorBoundary} />;
    }
    return this.props.children;
  }
}
