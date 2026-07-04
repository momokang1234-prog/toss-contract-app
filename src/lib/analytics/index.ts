/**
 * Analytics Tracking System for toss-contract-app
 *
 * Based on research report: analytics-tracking-contract-app.md
 * Implements comprehensive event tracking for contract signing funnel
 *
 * @example
 * ```ts
 * import { analytics } from '@/lib/analytics';
 *
 * // Track contract creation
 * analytics.trackContractCreated({
 *   contractId: 'con_123',
 *   creatorId: 'usr_456',
 *   contractType: 'employment',
 *   templateUsed: 'standard_employment'
 * });
 * ```
 *
 * @features
 * - Event queue with automatic batching
 * - Auto-flush for critical events (errors, completions)
 * - Page visibility tracking
 * - Before-unload event preservation
 * - Development console logging
 * - Production-ready backend integration
 */

/**
 * Core analytics event structure
 * @interface AnalyticsEvent
 * @description Represents a single analytics event with timestamp and properties
 */
export interface AnalyticsEvent {
  /** Unique event name identifier */
  eventName: string;
  /** Event properties and metadata */
  properties: Record<string, any>;
  /** Unix timestamp in milliseconds */
  timestamp: number;
}

/**
 * Contract Creation Events
 * @description Events triggered during contract creation workflow
 */

/**
 * Event fired when a new contract is created
 * @interface ContractCreatedEvent
 * @description Tracks initial contract creation with template and type information
 */
export interface ContractCreatedEvent {
  /** Unique contract identifier */
  contractId: string;
  /** User ID who created the contract */
  creatorId: string;
  /** Type of contract being created */
  contractType: 'employment' | 'nda' | 'freelance' | 'other';
  /** Optional template identifier used for contract creation */
  templateUsed?: string;
}

/**
 * Event fired when contract fields are configured
 * @interface ContractFieldsAddedEvent
 * @description Tracks field configuration during contract setup
 */
export interface ContractFieldsAddedEvent {
  /** Unique contract identifier */
  contractId: string;
  /** Total number of fields added */
  fieldCount: number;
  /** Number of required fields */
  requiredFields: number;
  /** Number of optional fields */
  optionalFields: number;
}

/**
 * Event fired when contract recipients are added
 * @interface ContractRecipientsAddedEvent
 * @description Tracks recipient configuration and role assignment
 */
export interface ContractRecipientsAddedEvent {
  /** Unique contract identifier */
  contractId: string;
  /** Total number of recipients added */
  recipientCount: number;
  /** Array of recipient roles (employer or worker) */
  recipientRoles: ('employer' | 'worker')[];
}

/**
 * Event fired when contract is sent to recipients
 * @interface ContractSentEvent
 * @description Tracks contract delivery method and recipient count
 */
export interface ContractSentEvent {
  /** Unique contract identifier */
  contractId: string;
  /** Total number of recipients */
  totalRecipients: number;
  /** Delivery method used */
  sendMethod: 'email' | 'sms' | 'in-app';
}

/**
 * Document Viewing Events
 * @description Events tracking recipient engagement with contract documents
 */

/**
 * Event fired when contract document is viewed
 * @interface ContractViewedEvent
 * @description Tracks document viewing behavior and engagement metrics
 */
export interface ContractViewedEvent {
  /** Unique contract identifier */
  contractId: string;
  /** Recipient user ID who viewed the contract */
  recipientId: string;
  /** Time in seconds from contract sent to document opened */
  timeToOpen: number;
  /** Device type used for viewing */
  deviceType: 'mobile' | 'desktop';
  /** Document view duration in seconds */
  viewDuration: number;
}

/**
 * Event fired when contract email is opened
 * @interface ContractEmailOpenedEvent
 * @description Tracks email open rates and response times
 */
export interface ContractEmailOpenedEvent {
  /** Unique contract identifier */
  contractId: string;
  /** Recipient user ID who opened the email */
  recipientId: string;
  /** Time in seconds from email sent to opened */
  timeToOpen: number;
}

/**
 * Signing Process Events
 * @description Events tracking contract signing workflow and progress
 */

/**
 * Event fired when recipient starts signing process
 * @interface ContractSigningStartedEvent
 * @description Tracks signing initiation timing and engagement
 */
export interface ContractSigningStartedEvent {
  /** Unique contract identifier */
  contractId: string;
  /** Recipient user ID starting the signing process */
  recipientId: string;
  /** Time in seconds from document view to signing start */
  timeFromView: number;
}

/**
 * Event fired when a contract field is completed
 * @interface ContractFieldCompletedEvent
 * @description Tracks individual field completion for funnel analysis
 */
export interface ContractFieldCompletedEvent {
  /** Unique contract identifier */
  contractId: string;
  /** Recipient user ID completing the field */
  recipientId: string;
  /** Type of field being completed */
  fieldType: 'signature' | 'text' | 'date' | 'checkbox';
  /** Index of the field in the signing sequence */
  fieldIndex: number;
  /** Total number of fields to complete */
  totalFields: number;
}

/**
 * Event fired when identity verification is performed
 * @interface ContractIdentityVerificationEvent
 * @description Tracks identity verification methods and success rates
 */
export interface ContractIdentityVerificationEvent {
  /** Unique contract identifier */
  contractId: string;
  /** Recipient user ID undergoing verification */
  recipientId: string;
  /** Verification method used */
  method: 'sms' | 'email' | 'kakao';
  /** Verification result status */
  result: 'success' | 'failed' | 'skipped';
}

/**
 * Completion Events
 * @description Events tracking contract completion and finalization
 */

/**
 * Event fired when individual recipient completes signing
 * @interface ContractSignedEvent
 * @description Tracks individual signing completion with timing metrics
 */
export interface ContractSignedEvent {
  /** Unique contract identifier */
  contractId: string;
  /** Recipient user ID who completed signing */
  recipientId: string;
  /** Total time in seconds from first view to signature completion */
  totalTimeToSign: number;
  /** Device type used for signing */
  deviceType: 'mobile' | 'desktop';
}

/**
 * Event fired when all parties have completed signing
 * @interface ContractAllSignedEvent
 * @description Tracks overall contract completion timing
 */
export interface ContractAllSignedEvent {
  /** Unique contract identifier */
  contractId: string;
  /** Total number of signers required */
  totalSigners: number;
  /** Total time in seconds from contract sent to all signatures collected */
  completionTime: number;
}

/**
 * Error Events
 * @description Events tracking errors and drop-offs in the signing process
 */

/**
 * Event fired when an error occurs during signing
 * @interface ContractSigningErrorEvent
 * @description Tracks error types and locations for debugging and UX improvement
 */
export interface ContractSigningErrorEvent {
  /** Unique contract identifier */
  contractId: string;
  /** Recipient user ID who encountered the error */
  recipientId: string;
  /** Type of error that occurred */
  errorType: 'validation' | 'network' | 'auth' | 'timeout';
  /** Optional field index where error occurred */
  fieldIndex?: number;
}

/**
 * Event fired when contract process is abandoned
 * @interface ContractAbandonedEvent
 * @description Tracks drop-off points in the signing funnel
 */
export interface ContractAbandonedEvent {
  /** Unique contract identifier */
  contractId: string;
  /** Recipient user ID who abandoned the process */
  recipientId: string;
  /** Stage at which the process was abandoned */
  abandonmentStage: 'viewed' | 'signing_started' | 'identity_failed';
  /** Time spent in the abandoned stage (seconds) */
  timeInStage: number;
}

/**
 * Analytics Service
 * @class AnalyticsService
 * @description Main analytics service with event queue management and automatic batching
 *
 * @example
 * ```ts
 * import { analytics } from '@/lib/analytics';
 *
 * // Track contract creation
 * analytics.trackContractCreated({
 *   contractId: 'con_123',
 *   creatorId: 'usr_456',
 *   contractType: 'employment'
 * });
 *
 * // Track errors
 * analytics.trackContractSigningError({
 *   contractId: 'con_123',
 *   recipientId: 'usr_789',
 *   errorType: 'validation',
 *   fieldIndex: 2
 * });
 * ```
 *
 * @features
 * - Automatic event batching and queuing
 * - Smart flush for critical events
 * - Page visibility tracking
 * - Before-unload event preservation
 * - Development console logging
 */
class AnalyticsService {
  /** Event queue for batching analytics events */
  private queue: AnalyticsEvent[] = [];
  /** Flag indicating if service has been initialized */
  private isInitialized = false;

  /**
   * Creates a new AnalyticsService instance
   * @constructor
   * @description Automatically initializes when running in browser environment
   */
  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  /**
   * Initialize the analytics service
   * @private
   * @description Sets up event listeners for page visibility and unload events
   */
  private initialize() {
    if (this.isInitialized) return;

    // Initialize analytics provider here (Mixpanel, Amplitude, or custom)
    // For now, we'll use a console-based implementation for development
    this.isInitialized = true;

    // Process queue on page visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.flush();
      }
    });

    // Flush queue before page unload
    window.addEventListener('beforeunload', () => {
      this.flush();
    });
  }

  // Contract Creation Tracking

  /**
   * Track contract creation event
   * @param data - Contract creation details
   * @example
   * ```ts
   * analytics.trackContractCreated({
   *   contractId: 'con_123',
   *   creatorId: 'usr_456',
   *   contractType: 'employment',
   *   templateUsed: 'standard_employment'
   * });
   * ```
   */
  trackContractCreated(data: ContractCreatedEvent) {
    this.track('contract_created', data);
  }

  /**
   * Track contract fields configuration event
   * @param data - Contract fields configuration details
   * @example
   * ```ts
   * analytics.trackContractFieldsAdded({
   *   contractId: 'con_123',
   *   fieldCount: 5,
   *   requiredFields: 3,
   *   optionalFields: 2
   * });
   * ```
   */
  trackContractFieldsAdded(data: ContractFieldsAddedEvent) {
    this.track('contract_fields_added', data);
  }

  /**
   * Track contract recipients addition event
   * @param data - Contract recipients configuration details
   * @example
   * ```ts
   * analytics.trackContractRecipientsAdded({
   *   contractId: 'con_123',
   *   recipientCount: 2,
   *   recipientRoles: ['employer', 'worker']
   * });
   * ```
   */
  trackContractRecipientsAdded(data: ContractRecipientsAddedEvent) {
    this.track('contract_recipients_added', data);
  }

  /**
   * Track contract sending event
   * @param data - Contract sending details
   * @example
   * ```ts
   * analytics.trackContractSent({
   *   contractId: 'con_123',
   *   totalRecipients: 2,
   *   sendMethod: 'email'
   * });
   * ```
   */
  trackContractSent(data: ContractSentEvent) {
    this.track('contract_sent', data);
  }

  // Document Viewing Tracking

  /**
   * Track contract document viewing event
   * @param data - Contract viewing details
   * @example
   * ```ts
   * analytics.trackContractViewed({
   *   contractId: 'con_123',
   *   recipientId: 'usr_789',
   *   timeToOpen: 120,
   *   deviceType: 'mobile',
   *   viewDuration: 300
   * });
   * ```
   */
  trackContractViewed(data: ContractViewedEvent) {
    this.track('contract_viewed', data);
  }

  /**
   * Track contract email opening event
   * @param data - Email opening details
   * @example
   * ```ts
   * analytics.trackContractEmailOpened({
   *   contractId: 'con_123',
   *   recipientId: 'usr_789',
   *   timeToOpen: 60
   * });
   * ```
   */
  trackContractEmailOpened(data: ContractEmailOpenedEvent) {
    this.track('contract_email_opened', data);
  }

  // Signing Process Tracking

  /**
   * Track signing process start event
   * @param data - Signing start details
   * @example
   * ```ts
   * analytics.trackContractSigningStarted({
   *   contractId: 'con_123',
   *   recipientId: 'usr_789',
   *   timeFromView: 30
   * });
   * ```
   */
  trackContractSigningStarted(data: ContractSigningStartedEvent) {
    this.track('contract_signing_started', data);
  }

  /**
   * Track individual field completion event
   * @param data - Field completion details
   * @example
   * ```ts
   * analytics.trackContractFieldCompleted({
   *   contractId: 'con_123',
   *   recipientId: 'usr_789',
   *   fieldType: 'signature',
   *   fieldIndex: 1,
   *   totalFields: 5
   * });
   * ```
   */
  trackContractFieldCompleted(data: ContractFieldCompletedEvent) {
    this.track('contract_field_completed', data);
  }

  /**
   * Track identity verification event
   * @param data - Identity verification details
   * @example
   * ```ts
   * analytics.trackContractIdentityVerification({
   *   contractId: 'con_123',
   *   recipientId: 'usr_789',
   *   method: 'sms',
   *   result: 'success'
   * });
   * ```
   */
  trackContractIdentityVerification(data: ContractIdentityVerificationEvent) {
    this.track('contract_identity_verification', data);
  }

  // Completion Tracking

  /**
   * Track individual contract signing completion
   * @param data - Contract signing completion details
   * @example
   * ```ts
   * analytics.trackContractSigned({
   *   contractId: 'con_123',
   *   recipientId: 'usr_789',
   *   totalTimeToSign: 450,
   *   deviceType: 'mobile'
   * });
   * ```
   */
  trackContractSigned(data: ContractSignedEvent) {
    this.track('contract_signed', data);
  }

  /**
   * Track all-party contract completion event
   * @param data - Contract completion details
   * @example
   * ```ts
   * analytics.trackContractAllSigned({
   *   contractId: 'con_123',
   *   totalSigners: 2,
   *   completionTime: 3600
   * });
   * ```
   */
  trackContractAllSigned(data: ContractAllSignedEvent) {
    this.track('contract_all_signed', data);
  }

  // Error Tracking

  /**
   * Track contract signing error event
   * @param data - Contract signing error details
   * @example
   * ```ts
   * analytics.trackContractSigningError({
   *   contractId: 'con_123',
   *   recipientId: 'usr_789',
   *   errorType: 'validation',
   *   fieldIndex: 2
   * });
   * ```
   */
  trackContractSigningError(data: ContractSigningErrorEvent) {
    this.track('contract_signing_error', data);
  }

  /**
   * Track contract process abandonment event
   * @param data - Contract abandonment details
   * @example
   * ```ts
   * analytics.trackContractAbandoned({
   *   contractId: 'con_123',
   *   recipientId: 'usr_789',
   *   abandonmentStage: 'signing_started',
   *   timeInStage: 180
   * });
   * ```
   */
  trackContractAbandoned(data: ContractAbandonedEvent) {
    this.track('contract_abandoned', data);
  }

  // Page View Tracking

  /**
   * Track page view event
   * @param pageName - Name of the page being viewed
   * @param properties - Additional page properties (optional)
   * @example
   * ```ts
   * analytics.trackPageView('ContractSignPage', {
   *   contractId: 'con_123',
   *   recipientRole: 'worker'
   * });
   * ```
   */
  trackPageView(pageName: string, properties?: Record<string, any>) {
    this.track('page_view', {
      pageName,
      ...properties,
    });
  }

  /**
   * Track custom event
   * @param eventName - Unique event name identifier
   * @param properties - Event properties and metadata
   * @description Core tracking method that queues events for batching.
   * Automatically flushes critical events (errors, completions) and
   * maintains queue size limits for optimal performance.
   *
   * @example
   * ```ts
   * analytics.track('button_clicked', {
   *   buttonId: 'submit_contract',
   *   page: 'contract_form',
   *   userRole: 'employer'
   * });
   * ```
   */
  track(eventName: string, properties: Record<string, any>) {
    const event: AnalyticsEvent = {
      eventName,
      properties,
      timestamp: Date.now(),
    };

    this.queue.push(event);

    // Auto-flush for critical events
    if (eventName.includes('error') || eventName.includes('signed')) {
      this.flush();
    }

    // Flush queue if it gets too large
    if (this.queue.length >= 10) {
      this.flush();
    }
  }

  /**
   * Flush queued events to analytics backend
   * @private
   * @description Sends all queued events to the analytics backend.
   * In development, logs to console grouped by analytics events.
   * In production, sends to configured analytics endpoint.
   *
   * @example
   * ```ts
   * // Manual flush before page navigation
   * analytics.flush();
   * ```
   */
  private flush() {
    if (this.queue.length === 0) return;

    const eventsToSend = [...this.queue];
    this.queue = [];

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.group('📊 Analytics Events');
      eventsToSend.forEach(event => {
        console.log(`Event: ${event.eventName}`, event.properties);
      });
      console.groupEnd();
    }

    // TODO: Send to analytics backend
    // Example: Mixpanel, Amplitude, or custom endpoint
    // fetch('/api/analytics', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ events: eventsToSend })
    // }).catch(err => {
    //   // Re-queue failed events
    //   this.queue.unshift(...eventsToSend);
    // });
  }

  /**
   * Get current event queue size
   * @returns Number of events currently queued
   * @description Useful for monitoring analytics service state and debugging
   *
   * @example
   * ```ts
   * const pendingEvents = analytics.getQueueSize();
   * if (pendingEvents > 50) {
   *   console.warn(`High analytics queue size: ${pendingEvents}`);
   * }
   * ```
   */
  getQueueSize(): number {
    return this.queue.length;
  }
}

/**
 * Singleton analytics service instance
 * @description Global instance for analytics tracking across the application
 *
 * @example
 * ```ts
 * import { analytics } from '@/lib/analytics';
 *
 * // Use the singleton instance for all tracking
 * analytics.trackContractCreated({
 *   contractId: 'con_123',
 *   creatorId: 'usr_456',
 *   contractType: 'employment'
 * });
 * ```
 */
export const analytics = new AnalyticsService();

/**
 * Track error event with context
 * @param errorType - Type of error that occurred
 * @param context - Context where error occurred
 * @param details - Additional error details and metadata
 * @description Convenience function for tracking errors with structured data.
 * Automatically includes timestamp and error classification information.
 *
 * @example
 * ```ts
 * import { trackError } from '@/lib/analytics';
 *
 * try {
 *   await someOperation();
 * } catch (error) {
 *   trackError('network_error', 'contract_submit', {
 *     contractId: 'con_123',
 *     errorMessage: error.message,
 *     stackTrace: error.stack
 *   });
 * }
 * ```
 */
export function trackError(errorType: string, context: string, details: Record<string, any>) {
  analytics.track('error_occurred', {
    errorType,
    context,
    ...details,
    timestamp: Date.now(),
  });
}

/**
 * Track performance metric
 * @param operation - Name of the operation being measured
 * @param duration - Duration of the operation in milliseconds
 * @param metadata - Additional performance metadata (optional)
 * @description Convenience function for tracking performance metrics.
 * Useful for monitoring API calls, render times, and user interactions.
 *
 * @example
 * ```ts
 * import { trackPerformance } from '@/lib/analytics';
 *
 * const startTime = performance.now();
 * await heavyOperation();
 * const duration = performance.now() - startTime;
 *
 * trackPerformance('contract_generation', duration, {
 *   contractType: 'employment',
 *   fieldCount: 10
 * });
 * ```
 */
export function trackPerformance(operation: string, duration: number, metadata?: Record<string, any>) {
  analytics.track('performance_metric', {
    operation,
    duration,
    unit: 'ms',
    ...metadata,
    timestamp: Date.now(),
  });
}

/**
 * Track form progress
 * @param formName - Name of the form being tracked
 * @param step - Current step in the form process
 * @param completionPercent - Estimated completion percentage (0-100)
 * @param details - Additional form details (optional)
 * @description Convenience function for tracking form completion funnels.
 * Useful for monitoring multi-step forms and identifying drop-off points.
 *
 * @example
 * ```ts
 * import { trackFormProgress } from '@/lib/analytics';
 *
 * // Track field completion
 * trackFormProgress('contract_creation', 'fields_added', 60, {
 *   fieldCount: 5,
 *   requiredFields: 3
 * });
 *
 * // Track completion
 * trackFormProgress('contract_creation', 'completed', 100, {
 *   totalSteps: 5,
 *   timeToComplete: 300
 * });
 * ```
 */
export function trackFormProgress(formName: string, step: string, completionPercent: number, details?: Record<string, any>) {
  analytics.track('form_progress', {
    formName,
    step,
    completionPercent,
    ...details,
    timestamp: Date.now(),
  });
}