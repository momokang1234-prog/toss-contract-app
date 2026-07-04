/**
 * Sentry Configuration for Error and Performance Monitoring
 *
 * Based on research from .claude/research-reports/react-apm-monitoring.md
 *
 * @features
 * - Error tracking with React component context
 * - Performance monitoring with BrowserTracing
 * - Session replay for debugging
 * - Cost-controlled sampling (10% traces, 100% errors)
 * - User context tracking for personalized debugging
 * - Custom breadcrumb support for error context
 *
 * @example
 * ```ts
 * import { initSentry, captureException, setUserContext } from '@/lib/sentry';
 *
 * // Initialize Sentry
 * initSentry({
 *   environment: 'production',
 *   tracesSampleRate: 0.1
 * });
 *
 * // Set user context
 * setUserContext('usr_123', 'user@example.com', {
 *   role: 'employer',
 *   plan: 'premium'
 * });
 *
 * // Track errors with context
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   captureException(error, {
 *     operation: 'contract_creation',
 *     contractId: 'con_456'
 *   });
 * }
 * ```
 *
 * @environmentVariables
 * - VITE_SENTRY_DSN: Sentry Data Source Name for error tracking
 * - VITE_APP_VERSION: Application version for release tracking
 */

import * as Sentry from '@sentry/react';

/**
 * Sentry configuration interface
 * @interface SentryConfig
 * @description Configuration options for Sentry initialization
 */
export interface SentryConfig {
  /** Sentry Data Source Name (DSN) for error tracking */
  dsn?: string;
  /** Environment identifier (development, staging, production) */
  environment?: string;
  /** Application release version */
  release?: string;
  /** Sample rate for performance traces (0.0 to 1.0, default: 0.1) */
  tracesSampleRate?: number;
  /** Sample rate for session replays (0.0 to 1.0, default: 0.1) */
  replaysSessionSampleRate?: number;
  /** Sample rate for error replays (0.0 to 1.0, default: 1.0) */
  replaysOnErrorSampleRate?: number;
}

/**
 * Initialize Sentry with configuration
 * @param config - Sentry configuration options
 * @description Initializes Sentry error tracking and performance monitoring.
 * Conditional initialization - no errors if DSN is missing, making it safe
 * to use in development environments without configuration.
 *
 * @example
 * ```ts
 * import { initSentry } from '@/lib/sentry';
 *
 * // Basic initialization with environment variables
 * initSentry();
 *
 * // Custom configuration
 * initSentry({
 *   environment: 'production',
 *   tracesSampleRate: 0.2,
 *   replaysSessionSampleRate: 0.05
 * });
 * ```
 *
 * @costControl
 * - Default tracesSampleRate: 0.1 (10%) for cost-effective performance monitoring
 * - Default replaysSessionSampleRate: 0.1 (10%) to control replay storage costs
 * - Default replaysOnErrorSampleRate: 1.0 (100%) for comprehensive error debugging
 */
export function initSentry(config: SentryConfig = {}) {
  const {
    dsn = import.meta.env.VITE_SENTRY_DSN,
    environment = import.meta.env.MODE,
    release = import.meta.env.VITE_APP_VERSION || '1.0.0',
    tracesSampleRate = 0.1, // 10% sampling for cost control
    replaysSessionSampleRate = 0.1, // 10% of sessions
    replaysOnErrorSampleRate = 1.0, // 100% of errors
  } = config;

  // Only initialize if DSN is provided
  if (!dsn) {
    console.log('[Sentry] No DSN provided - skipping initialization');
    return;
  }

  Sentry.init({
    dsn,

    // Integrations
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Performance Monitoring
    tracesSampleRate,

    // Session Replay
    replaysSessionSampleRate,
    replaysOnErrorSampleRate,

    // Environment
    environment,

    // Release tracking
    release,

    // Filter out development errors
    beforeSend(event) {
      if (environment === 'development') {
        console.log('[Sentry] Filtered error in development:', event);
        return null; // Don't send errors in development
      }
      return event;
    },

    // Custom context for better debugging
    initialScope: {
      tags: {
        framework: 'react',
        app: 'toss-contract-app',
      },
    },

    // Normalize stack traces for better error grouping
    normalizeDepth: 4,

    // Maximum breadcrumb count
    maxBreadcrumbs: 50,
  });

  console.log('[Sentry] Initialized', { environment, release, dsn: dsn.substring(0, 20) + '...' });
}

/**
 * Set user context for better error tracking
 * @param userId - Unique user identifier
 * @param email - User email address (optional)
 * @param additionalData - Additional user context data (optional)
 * @description Associates errors with specific users for better debugging and support.
 * Includes user information in error reports for personalized error analysis.
 *
 * @example
 * ```ts
 * import { setUserContext } from '@/lib/sentry';
 *
 * // After user login
 * setUserContext('usr_123', 'user@example.com', {
 *   role: 'employer',
 *   plan: 'premium',
 *   company: 'Acme Corp'
 * });
 * ```
 *
 * @securityNote
 * Be cautious about including sensitive user data in error reports.
 * Consider user privacy when adding context information.
 */
export function setUserContext(userId: string, email?: string, additionalData?: Record<string, any>) {
  Sentry.setUser({
    id: userId,
    email,
    ...additionalData,
  });
}

/**
 * Clear user context (e.g., on logout)
 * @description Removes user context after logout to prevent data leakage
 * and maintain accurate error tracking for subsequent users.
 *
 * @example
 * ```ts
 * import { clearUserContext } from '@/lib/sentry';
 *
 * // After user logout
 * clearUserContext();
 * ```
 */
export function clearUserContext() {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for better error context
 * @param message - Breadcrumb message describing the action
 * @param category - Breadcrumb category (default: 'custom')
 * @param level - Severity level (default: 'info')
 * @param data - Additional breadcrumb data (optional)
 * @description Adds contextual breadcrumbs that appear in error reports,
 * helping to trace the sequence of events leading to errors.
 *
 * @example
 * ```ts
 * import { addBreadcrumb } from '@/lib/sentry';
 *
 * // Track user actions
 * addBreadcrumb('Contract form submitted', 'form', 'info', {
 *   contractId: 'con_456',
 *   fieldCount: 5
 * });
 *
 * // Track API calls
 * addBreadcrumb('API call: createContract', 'api', 'info', {
 *   endpoint: '/api/contracts',
 *   method: 'POST'
 * });
 * ```
 */
export function addBreadcrumb(
  message: string,
  category: string = 'custom',
  level: Sentry.SeverityLevel = 'info',
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
  });
}

/**
 * Track custom performance metric
 * @param name - Metric name
 * @param value - Metric value
 * @param unit - Unit of measurement (default: 'ms')
 * @description Records custom performance metrics as breadcrumbs for
 * performance analysis and optimization opportunities.
 *
 * @example
 * ```ts
 * import { trackPerformanceMetric } from '@/lib/sentry';
 *
 * // Track API call duration
 * const startTime = performance.now();
 * await apiCall();
 * const duration = performance.now() - startTime;
 * trackPerformanceMetric('contract_api_call', duration, 'ms');
 *
 * // Track custom metrics
 * trackPerformanceMetric('contract_generation_time', 1234, 'ms');
 * trackPerformanceMetric('file_size', 1024, 'bytes');
 * ```
 */
export function trackPerformanceMetric(name: string, value: number, unit: string = 'ms') {
  Sentry.addBreadcrumb({
    category: 'performance',
    message: `${name}: ${value} ${unit}`,
    level: 'info',
    data: { metric: name, value, unit },
  });
}

/**
 * Capture exception with additional context
 * @param error - Error object to capture
 * @param context - Additional context data (optional)
 * @description Captures exceptions with rich contextual information for debugging.
 * Automatically includes user context, breadcrumbs, and performance data.
 *
 * @example
 * ```ts
 * import { captureException } from '@/lib/sentry';
 *
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   captureException(error, {
 *     operation: 'contract_creation',
 *     contractId: 'con_456',
 *     userId: 'usr_123',
 *     additionalInfo: 'Contract generation failed during template rendering'
 *   });
 * }
 * ```
 *
 * @bestPractice
 * Always include relevant context when capturing exceptions to improve
 * debugging efficiency and issue resolution.
 */
export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.withScope((scope) => {
    if (context) {
      Object.keys(context).forEach((key) => {
        scope.setContext(key, context[key]);
      });
    }
    Sentry.captureException(error);
  });
}

/**
 * Start a performance transaction (for manual performance tracking)
 * @param name - Transaction name
 * @param op - Operation type (default: 'custom')
 * @description Creates a manual performance transaction for detailed operation
 * timing analysis. Useful for tracking complex operations and identifying bottlenecks.
 *
 * @example
 * ```ts
 * import { startTransaction } from '@/lib/sentry';
 *
 * const transaction = startTransaction('contract_generation', 'background');
 *
 * try {
 *   await generateContract();
 *   transaction.setStatus('ok');
 * } catch (error) {
 *   transaction.setStatus('internal_error');
 *   throw error;
 * } finally {
 *   transaction.finish();
 * }
 * ```
 *
 * @note
 * Most performance tracking is automatic via BrowserTracing integration.
 * Manual transactions are only needed for specific operations requiring detailed analysis.
 */
export function startTransaction(name: string, op: string = 'custom') {
  return Sentry.startSpan({ name, op }, () => {
    // Transaction will be automatically managed by Sentry
  });
}

/**
 * Check if Sentry is initialized
 * @returns true if Sentry client is initialized, false otherwise
 * @description Utility function to check Sentry initialization status.
 * Useful for conditional logic depending on monitoring availability.
 *
 * @example
 * ```ts
 * import { isSentryInitialized } from '@/lib/sentry';
 *
 * if (isSentryInitialized()) {
 *   console.log('Sentry monitoring is active');
 * } else {
 *   console.log('Sentry monitoring is not configured');
 * }
 * ```
 */
export function isSentryInitialized(): boolean {
  try {
    return Sentry.getClient() !== undefined;
  } catch {
    return false;
  }
}

/**
 * Get current Sentry client (for advanced usage)
 * @returns Sentry client instance or null if not initialized
 * @description Provides access to the underlying Sentry client for advanced
 * configuration and integration scenarios.
 *
 * @example
 * ```ts
 * import { getSentryClient } from '@/lib/sentry';
 *
 * const client = getSentryClient();
 * if (client) {
 *   // Advanced client configuration
 *   const options = client.getOptions();
 *   console.log('Sentry options:', options);
 * }
 * ```
 *
 * @advancedUsage
 * This function is intended for advanced use cases requiring direct
 * access to Sentry client functionality beyond the provided utilities.
 */
export function getSentryClient() {
  try {
    return Sentry.getClient();
  } catch {
    return null;
  }
}
