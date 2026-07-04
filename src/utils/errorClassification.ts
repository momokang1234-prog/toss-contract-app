/**
 * Error Classification and Recovery System
 *
 * Provides comprehensive error analysis and recovery strategies for
 * the toss-contract-app. Automatically categorizes errors and provides
 * user-friendly messages and recovery suggestions in Korean.
 *
 * @features
 * - Automatic error categorization (9 categories)
 * - Severity assessment (4 levels)
 * - Recovery strategy generation
 * - User-friendly Korean error messages
 * - Technical debugging information
 * - Retry logic with optimal delays
 *
 * @example
 * ```ts
 * import { classifyError, getRecoveryStrategy } from '@/utils/errorClassification';
 *
 * try {
 *   await apiCall();
 * } catch (error) {
 *   const classified = classifyError(error);
 *   const strategy = getRecoveryStrategy(classified);
 *
 *   if (strategy.shouldRetry) {
 *     setTimeout(() => apiCall(), strategy.retryDelay);
 *   } else if (strategy.shouldRedirect) {
 *     window.location.href = strategy.redirectPath;
 *   } else {
 *     alert(strategy.alertMessage);
 *   }
 * }
 * ```
 *
 * @errorCategories
 * - network: Network connectivity issues
 * - authentication: Authentication/token failures
 * - authorization: Permission/access denied errors
 * - validation: Input validation failures
 * - not_found: Resource not found errors
 * - conflict: Duplicate/conflicting operations
 * - rate_limit: API rate limiting errors
 * - server_error: Server-side errors (5xx)
 * - unknown: Unclassified errors
 */

/**
 * Error category classification
 * @type ErrorCategory
 * @description Defines 9 major error categories for comprehensive error handling
 */
export type ErrorCategory =
  | 'network'           /** Network connectivity issues (timeouts, connection errors) */
  | 'authentication'    /** Authentication failures (expired tokens, invalid credentials) */
  | 'authorization'    /** Permission/access denied errors */
  | 'validation'        /** Input validation failures (invalid format, missing required fields) */
  | 'not_found'         /** Resource not found errors (404, missing data) */
  | 'conflict'          /** Duplicate/conflicting operations (409, already exists) */
  | 'rate_limit'        /** API rate limiting errors (429, too many requests) */
  | 'server_error'      /** Server-side errors (500, 502, 503) */
  | 'unknown';          /** Unclassified or unexpected errors */

/**
 * Error severity levels
 * @type ErrorSeverity
 * @description Four-level severity system for error prioritization and response
 */
export type ErrorSeverity =
  | 'low'       /** Minor issues that don't block core functionality */
  | 'medium'    /** Issues that affect some features but have workarounds */
  | 'high'      /** Significant issues that require user attention */
  | 'critical'; /** Critical errors that completely block functionality */

/**
 * Classified error interface
 * @interface ClassifiedError
 * @description Comprehensive error information with recovery strategies
 */
export interface ClassifiedError {
  /** Error category classification */
  category: ErrorCategory;
  /** Error severity level */
  severity: ErrorSeverity;
  /** User-friendly error message in Korean */
  userMessage: string;
  /** Technical error message for debugging */
  technicalMessage: string;
  /** Whether the error is recoverable without user intervention */
  recoverable: boolean;
  /** Whether the operation can be retried automatically */
  retryable: boolean;
  /** Array of suggested user actions in Korean */
  suggestedActions: string[];
}

/**
 * Classify an error into category and generate recovery strategies
 * @param error - Error object or unknown error to classify
 * @returns Classified error with recovery strategies and user messages
 * @description Analyzes error messages and stack traces to determine error
 * category, severity, and appropriate recovery strategies. Generates
 * user-friendly Korean messages and technical debugging information.
 *
 * @example
 * ```ts
 * import { classifyError } from '@/utils/errorClassification';
 *
 * try {
 *   await fetchContractData();
 * } catch (error) {
 *   const classified = classifyError(error);
 *
 *   console.log('Category:', classified.category);        // 'network'
 *   console.log('Severity:', classified.severity);         // 'medium'
 *   console.log('User message:', classified.userMessage); // '네트워크 연결을 확인해주세요.'
 *   console.log('Can retry:', classified.retryable);       // true
 *   console.log('Actions:', classified.suggestedActions); // ['인터넷 연결 상태를 확인해주세요', ...]
 * }
 * ```
 *
 * @classificationLogic
 * 1. Checks if error is an Error instance
 * 2. Analyzes error message and stack trace for patterns
 * 3. Matches against known error category patterns
 * 4. Assigns severity based on error category
 * 5. Generates user-friendly Korean messages
 * 6. Provides recovery strategies and suggested actions
 */
export function classifyError(error: unknown): ClassifiedError {
  const baseError: ClassifiedError = {
    category: 'unknown',
    severity: 'medium',
    userMessage: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    technicalMessage: 'Unknown error occurred',
    recoverable: true,
    retryable: true,
    suggestedActions: ['잠시 후 다시 시도해주세요'],
  };

  if (!(error instanceof Error)) {
    return {
      ...baseError,
      technicalMessage: String(error),
    };
  }

  const message = error.message.toLowerCase();
  const stack = error.stack?.toLowerCase() || '';

  // Network errors
  if (isNetworkError(message, stack)) {
    return {
      category: 'network',
      severity: 'medium',
      userMessage: '네트워크 연결을 확인해주세요.',
      technicalMessage: error.message,
      recoverable: true,
      retryable: true,
      suggestedActions: [
        '인터넷 연결 상태를 확인해주세요',
        'Wi-Fi를 켜거나 데이터 통신을 사용해주세요',
        '잠시 후 다시 시도해주세요',
      ],
    };
  }

  // Authentication errors
  if (isAuthError(message, stack)) {
    return {
      category: 'authentication',
      severity: 'high',
      userMessage: '인증이 만료되었습니다. 다시 로그인해주세요.',
      technicalMessage: error.message,
      recoverable: true,
      retryable: false,
      suggestedActions: [
        '다시 로그인해주세요',
        '로그인이 지속되지 않는 경우 고객센터에 문의해주세요',
      ],
    };
  }

  // Authorization errors
  if (isPermissionError(message, stack)) {
    return {
      category: 'authorization',
      severity: 'high',
      userMessage: '해당 작업에 대한 권한이 없습니다.',
      technicalMessage: error.message,
      recoverable: false,
      retryable: false,
      suggestedActions: [
        '접근 권한이 있는 계정으로 로그인해주세요',
        '관리자에게 권한 요청을 해주세요',
      ],
    };
  }

  // Validation errors
  if (isValidationError(message, stack)) {
    return {
      category: 'validation',
      severity: 'low',
      userMessage: '입력값을 확인해주세요.',
      technicalMessage: error.message,
      recoverable: true,
      retryable: false,
      suggestedActions: [
        '입력값을 다시 확인해주세요',
        '필수 항목이 모두 입력되었는지 확인해주세요',
      ],
    };
  }

  // Rate limiting
  if (isRateLimitError(message, stack)) {
    return {
      category: 'rate_limit',
      severity: 'medium',
      userMessage: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.',
      technicalMessage: error.message,
      recoverable: true,
      retryable: true,
      suggestedActions: [
        '잠시 후 다시 시도해주세요',
        '요청 횟수를 줄여주세요',
      ],
    };
  }

  // Server errors
  if (isServerError(message, stack)) {
    return {
      category: 'server_error',
      severity: 'critical',
      userMessage: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      technicalMessage: error.message,
      recoverable: true,
      retryable: true,
      suggestedActions: [
        '잠시 후 다시 시도해주세요',
        '문제가 지속되면 고객센터에 문의해주세요',
      ],
    };
  }

  // Not found errors
  if (isNotFoundError(message, stack)) {
    return {
      category: 'not_found',
      severity: 'medium',
      userMessage: '요청하신 정보를 찾을 수 없습니다.',
      technicalMessage: error.message,
      recoverable: false,
      retryable: false,
      suggestedActions: [
        'URL 또는 ID가 올바른지 확인해주세요',
        '이미 삭제된 정보일 수 있습니다',
      ],
    };
  }

  // Conflict errors
  if (isConflictError(message, stack)) {
    return {
      category: 'conflict',
      severity: 'medium',
      userMessage: '이미 처리된 요청입니다.',
      technicalMessage: error.message,
      recoverable: true,
      retryable: false,
      suggestedActions: [
        '이미 완료된 작업인지 확인해주세요',
        '새로운 작업을 시작해주세요',
      ],
    };
  }

  return {
    ...baseError,
    technicalMessage: error.message,
  };
}

/**
 * Check if error is a network error
 * @param message - Error message to analyze
 * @param stack - Stack trace to analyze
 * @returns true if error matches network error patterns
 * @description Identifies network connectivity issues, timeouts, and
 * connection failures by analyzing error messages and stack traces.
 *
 * @patterns
 * - "network", "fetch", "connection", "timeout"
 * - Stack contains "network"
 */
function isNetworkError(message: string, stack: string): boolean {
  return (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('connection') ||
    message.includes('timeout') ||
    stack.includes('network')
  );
}

/**
 * Check if error is an authentication error
 * @param message - Error message to analyze
 * @param stack - Stack trace to analyze
 * @returns true if error matches authentication error patterns
 * @description Identifies authentication failures including expired tokens,
 * invalid credentials, and session issues.
 *
 * @patterns
 * - "auth", "token", "unauthorized", "jwt", "session"
 * - Stack contains "auth"
 */
function isAuthError(message: string, stack: string): boolean {
  return (
    message.includes('auth') ||
    message.includes('token') ||
    message.includes('unauthorized') ||
    message.includes('jwt') ||
    message.includes('session') ||
    stack.includes('auth')
  );
}

/**
 * Check if error is an authorization/permission error
 * @param message - Error message to analyze
 * @param stack - Stack trace to analyze
 * @returns true if error matches permission error patterns
 * @description Identifies permission and authorization errors where users
 * lack necessary access rights.
 *
 * @patterns
 * - "permission", "forbidden", "access denied", "unauthorized"
 */
function isPermissionError(message: string, stack: string): boolean {
  return (
    message.includes('permission') ||
    message.includes('forbidden') ||
    message.includes('access denied') ||
    message.includes('unauthorized')
  );
}

/**
 * Check if error is a validation error
 * @param message - Error message to analyze
 * @param stack - Stack trace to analyze
 * @returns true if error matches validation error patterns
 * @description Identifies input validation failures including format
 * errors, missing required fields, and schema violations.
 *
 * @patterns
 * - "validation", "invalid", "required", "format", "schema"
 */
function isValidationError(message: string, stack: string): boolean {
  return (
    message.includes('validation') ||
    message.includes('invalid') ||
    message.includes('required') ||
    message.includes('format') ||
    message.includes('schema')
  );
}

/**
 * Check if error is a rate limiting error
 * @param message - Error message to analyze
 * @param stack - Stack trace to analyze
 * @returns true if error matches rate limit error patterns
 * @description Identifies API rate limiting errors when request limits
 * are exceeded.
 *
 * @patterns
 * - "rate limit", "too many requests", "429"
 */
function isRateLimitError(message: string, stack: string): boolean {
  return (
    message.includes('rate limit') ||
    message.includes('too many requests') ||
    message.includes('429')
  );
}

/**
 * Check if error is a server error
 * @param message - Error message to analyze
 * @param stack - Stack trace to analyze
 * @returns true if error matches server error patterns
 * @description Identifies server-side errors (5xx status codes) that
 * indicate backend failures.
 *
 * @patterns
 * - "500", "502", "503", "internal server error", "service unavailable"
 */
function isServerError(message: string, stack: string): boolean {
  return (
    message.includes('500') ||
    message.includes('502') ||
    message.includes('503') ||
    message.includes('internal server error') ||
    message.includes('service unavailable')
  );
}

/**
 * Check if error is a not found error
 * @param message - Error message to analyze
 * @param stack - Stack trace to analyze
 * @returns true if error matches not found error patterns
 * @description Identifies resource not found errors when requested
 * resources don't exist or have been deleted.
 *
 * @patterns
 * - "404", "not found", "does not exist"
 */
function isNotFoundError(message: string, stack: string): boolean {
  return (
    message.includes('404') ||
    message.includes('not found') ||
    message.includes('does not exist')
  );
}

/**
 * Check if error is a conflict error
 * @param message - Error message to analyze
 * @param stack - Stack trace to analyze
 * @returns true if error matches conflict error patterns
 * @description Identifies conflict errors when operations conflict with
 * existing state or duplicate operations are attempted.
 *
 * @patterns
 * - "409", "conflict", "already exists"
 */
function isConflictError(message: string, stack: string): boolean {
  return (
    message.includes('409') ||
    message.includes('conflict') ||
    message.includes('already exists')
  );
}

/**
 * Get recovery strategy for a classified error
 * @param error - Classified error to generate strategy for
 * @returns Recovery strategy with retry, redirect, and alert recommendations
 * @description Generates comprehensive recovery strategies based on error
 * classification. Provides retry logic with optimal delays, redirect
 * recommendations, and user alert messaging.
 *
 * @example
 * ```ts
 * import { classifyError, getRecoveryStrategy } from '@/utils/errorClassification';
 *
 * try {
 *   await apiCall();
 * } catch (error) {
 *   const classified = classifyError(error);
 *   const strategy = getRecoveryStrategy(classified);
 *
 *   // Automatic retry with optimal delay
 *   if (strategy.shouldRetry) {
 *     setTimeout(() => apiCall(), strategy.retryDelay);
 *   }
 *
 *   // Redirect to login for auth errors
 *   if (strategy.shouldRedirect) {
 *     window.location.href = strategy.redirectPath;
 *   }
 *
 *   // Show user-friendly alert
 *   if (strategy.shouldAlert) {
 *     alert(strategy.alertMessage);
 *   }
 * }
 * ```
 *
 * @retryLogic
 * - Network errors: 2 second delay
 * - Rate limit errors: 5 second delay
 * - Server errors: 3 second delay
 * - Other retryable errors: 1 second delay
 */
export function getRecoveryStrategy(error: ClassifiedError): {
  shouldRetry: boolean;
  retryDelay: number;
  shouldRedirect: boolean;
  redirectPath?: string;
  shouldAlert: boolean;
  alertMessage: string;
} {
  const strategy = {
    shouldRetry: error.retryable,
    retryDelay: getRetryDelay(error.category),
    shouldRedirect: error.category === 'authentication',
    redirectPath: error.category === 'authentication' ? '/login' : undefined,
    shouldAlert: true,
    alertMessage: error.userMessage,
  };

  return strategy;
}

/**
 * Get optimal retry delay for error category
 * @param category - Error category to determine delay for
 * @returns Retry delay in milliseconds
 * @description Calculates optimal retry delays based on error category
 * to prevent overwhelming the system while providing good UX.
 *
 * @delays
 * - Network errors: 2000ms (2 seconds)
 * - Rate limit errors: 5000ms (5 seconds)
 * - Server errors: 3000ms (3 seconds)
 * - Default: 1000ms (1 second)
 *
 * @rationale
 * Different error types require different cooldown periods:
 * - Network issues need time for connection recovery
 * - Rate limits need longer delays to avoid further limits
 * - Server errors need moderate delays for recovery
 */
function getRetryDelay(category: ErrorCategory): number {
  switch (category) {
    case 'network':
      return 2000; // 2 seconds
    case 'rate_limit':
      return 5000; // 5 seconds
    case 'server_error':
      return 3000; // 3 seconds
    default:
      return 1000; // 1 second
  }
}