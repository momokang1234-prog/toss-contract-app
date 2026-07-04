import { Component, type ReactNode } from 'react';
import { GlobalErrorFallback } from './shared/ErrorFallback';
import { logComponentError } from '../utils/errorConsolidation';

interface Props { children: ReactNode; }
interface State { error: Error | null; hasError: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { error, hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    logComponentError('ErrorBoundary', error, {
      componentStack: errorInfo.componentStack,
      errorBoundaryLevel: 'global'
    });
  }

  resetErrorBoundary = () => {
    this.setState({ error: null, hasError: false });
    window.location.reload(); // Global level fallback does reload
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return <GlobalErrorFallback error={this.state.error} resetErrorBoundary={this.resetErrorBoundary} />;
    }
    return this.props.children;
  }
}
