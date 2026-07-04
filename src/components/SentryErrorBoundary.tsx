/**
 * Sentry Error Boundary Component
 *
 * Integrates Sentry error capturing with React Error Boundaries
 * Captures React component errors with full component stack trace
 *
 * Based on research from .claude/research-reports/react-apm-monitoring.md
 */

import { Component, type ReactNode } from 'react';
import * as Sentry from '@sentry/react';
import { GlobalErrorFallback } from './shared/ErrorFallback';
import { logComponentError } from '../utils/errorConsolidation';

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary with Sentry integration
 * Catches React component errors and reports them to Sentry
 */
export class SentryErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    logComponentError('SentryErrorBoundary', error, {
      componentStack: errorInfo.componentStack,
      errorBoundaryLevel: 'sentry'
    });

    // Capture error with component stack trace in Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
      tags: {
        error_boundary: 'SentryErrorBoundary',
      },
    });
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback;
      return FallbackComponent ? (
        <FallbackComponent error={this.state.error} resetErrorBoundary={this.resetErrorBoundary} />
      ) : (
        <GlobalErrorFallback error={this.state.error} resetErrorBoundary={this.resetErrorBoundary} />
      );
    }

    return this.props.children;
  }
}

export default SentryErrorBoundary;
