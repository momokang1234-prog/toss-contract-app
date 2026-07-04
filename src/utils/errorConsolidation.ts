/**
 * Consolidated Error Handling Utilities
 *
 * Provides unified error handling patterns across the application.
 * Replaces scattered console.error calls with structured error tracking.
 *
 * @features
 * - Unified error logging with Sentry integration
 * - Analytics tracking for error patterns
 * - Consistent error categorization
 * - Development-friendly console output
 * - Production-ready error monitoring
 *
 * @example
 * ```ts
 * import { logError, logComponentError } from '@/utils/errorConsolidation';
 *
 * try {
 *   await someOperation();
 * } catch (error) {
 *   logError('someOperation', error, {
 *     context: 'additional context',
 *     userId: 'usr_123'
 *   });
 * }
 * ```
 */

import { captureException, addBreadcrumb } from '../lib/sentry';
import { trackError, trackPerformance } from '../lib/analytics';
import { classifyError } from './errorClassification';

/**
 * Log application error with full monitoring integration
 * @param operation - Operation name where error occurred
 * @param error - Error object or unknown error
 * @param context - Additional context for debugging (optional)
 * @description Comprehensive error logging that integrates with Sentry,
 * analytics, and error classification. Replaces console.error calls.
 *
 * @example
 * ```ts
 * try {
 *   await apiCall();
 * } catch (error) {
 *   logError('apiCall', error, {
 *     endpoint: '/api/contracts',
 *     method: 'POST'
 *   });
 * }
 * ```
 */
export function logError(
  operation: string,
  error: unknown,
  context?: Record<string, any>
) {
  // Classify error for better handling
  const classified = classifyError(error);

  // Add breadcrumb for error context
  addBreadcrumb(
    `Error in ${operation}`,
    'error',
    'error',
    {
      operation,
      category: classified.category,
      severity: classified.severity,
      ...context
    }
  );

  // Track error in analytics
  trackError(classified.category, operation, {
    severity: classified.severity,
    technicalMessage: classified.technicalMessage,
    userMessage: classified.userMessage,
    ...context
  });

  // Send to Sentry if it's an Error object
  if (error instanceof Error) {
    captureException(error, {
      operation,
      errorCategory: classified.category,
      errorSeverity: classified.severity,
      ...context
    });
  }

  // Console output for development
  if (import.meta.env.DEV) {
    console.error(`[${operation}] Error:`, {
      error,
      category: classified.category,
      severity: classified.severity,
      userMessage: classified.userMessage,
      technicalMessage: classified.technicalMessage,
      suggestedActions: classified.suggestedActions,
      context
    });
  }
}

/**
 * Log component error with React context
 * @param componentName - Name of the component where error occurred
 * @param error - Error object or unknown error
 * @param context - Additional component context (optional)
 * @description Specialized error logging for React components.
 * Automatically includes component hierarchy and props information.
 *
 * @example
 * ```ts
 * import { logComponentError } from '@/utils/errorConsolidation';
 *
 * const MyComponent = ({ props }) => {
 *   try {
 *     // Component logic
 *   } catch (error) {
 *     logComponentError('MyComponent', error, { props });
 *   }
 * };
 * ```
 */
export function logComponentError(
  componentName: string,
  error: unknown,
  context?: Record<string, any>
) {
  logError(`Component: ${componentName}`, error, {
    componentType: 'react',
    ...context
  });
}

/**
 * Log API error with request/response context
 * @param apiOperation - API operation name
 * @param error - Error object or unknown error
 * @param context - API context (endpoint, method, status)
 * @description Specialized error logging for API calls with HTTP context.
 *
 * @example
 * ```ts
 * try {
 *   const response = await fetch('/api/contracts');
 * } catch (error) {
 *   logApiError('createContract', error, {
 *     endpoint: '/api/contracts',
 *     method: 'POST',
 *     status: response?.status
 *   });
 * }
 * ```
 */
export function logApiError(
  apiOperation: string,
  error: unknown,
  context?: {
    endpoint?: string;
    method?: string;
    status?: number;
    response?: any;
  }
) {
  logError(`API: ${apiOperation}`, error, {
    errorType: 'api_error',
    ...context
  });
}

/**
 * Log async operation error with timing
 * @param operation - Async operation name
 * @param error - Error object or unknown error
 * @param duration - Operation duration in milliseconds
 * @param context - Additional operation context (optional)
 * @description Error logging for async operations with performance timing.
 *
 * @example
 * ```ts
 * const startTime = performance.now();
 * try {
 *   await heavyOperation();
 * } catch (error) {
 *   const duration = performance.now() - startTime;
 *   logAsyncError('heavyOperation', error, duration, { inputSize: data.length });
 * }
 * ```
 */
export function logAsyncError(
  operation: string,
  error: unknown,
  duration: number,
  context?: Record<string, any>
) {
  // Track performance even for failed operations
  trackPerformance(operation, duration, {
    status: 'failed',
    ...context
  });

  logError(`Async: ${operation}`, error, {
    operationDuration: duration,
    ...context
  });
}

/**
 * Log authentication error with user context
 * @param authOperation - Authentication operation name
 * @param error - Error object or unknown error
 * @param context - Authentication context (optional)
 * @description Specialized error logging for authentication operations.
 *
 * @example
 * ```ts
 * try {
 *   await login(email, password);
 * } catch (error) {
 *   logAuthError('login', error, {
 *     email,
 *     authMethod: 'email_password'
 *   });
 * }
 * ```
 */
export function logAuthError(
  authOperation: string,
  error: unknown,
  context?: Record<string, any>
) {
  logError(`Auth: ${authOperation}`, error, {
    errorType: 'auth_error',
    ...context
  });
}

/**
 * Create error boundary logger for React components
 * @param componentName - Component name for error tracking
 * @returns Error logging function for use in error boundaries
 * @description Factory function that creates component-specific error loggers.
 *
 * @example
 * ```ts
 * const logErrorBoundary = createErrorBoundaryLogger('MyErrorBoundary');
 *
 * class MyErrorBoundary extends React.Component {
 *   componentDidCatch(error, errorInfo) {
 *     logErrorBoundary(error, {
 *       componentStack: errorInfo.componentStack
 *     });
 *   }
 * }
 * ```
 */
export function createErrorBoundaryLogger(componentName: string) {
  return (error: Error, context?: Record<string, any>) => {
    logComponentError(componentName, error, {
      errorBoundary: true,
      ...context
    });
  };
}

/**
 * Create API error logger for specific endpoints
 * @param apiName - API or service name
 * @returns Error logging function for API operations
 * @description Factory function that creates API-specific error loggers.
 *
 * @example
 * ```ts
 * const logContractApiError = createApiErrorLogger('contractsApi');
 *
 * try {
 *   await contractsApi.create(data);
 * } catch (error) {
 *   logContractApiError(error, 'create', { contractId: data.id });
 * }
 * ```
 */
export function createApiErrorLogger(apiName: string) {
  return (
    error: unknown,
    operation: string,
    context?: Record<string, any>
  ) => {
    logApiError(`${apiName}.${operation}`, error, context);
  };
}

/**
 * Console error replacement with full monitoring
 * @deprecated Use logError() instead for better error tracking
 * @description Direct replacement for console.error that adds monitoring.
 * Maintains console.error behavior while adding Sentry and analytics.
 *
 * @example
 * ```ts
 * // Old way:
 * console.error('Something went wrong', error);
 *
 * // New way:
 * monitoredConsoleError('Something went wrong', error);
 *
 * // Or better:
 * logError('operationName', error, { context: 'details' });
 * ```
 */
export function monitoredConsoleError(
  message: string,
  error?: unknown,
  context?: Record<string, any>
) {
  logError('console_error_replacement', error || message, {
    originalMessage: message,
    ...context
  });
}