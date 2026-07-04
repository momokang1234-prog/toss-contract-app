/**
 * Performance-Optimized Analytics System
 *
 * Enhanced analytics with lazy loading, conditional initialization,
 * and performance optimizations for minimal bundle impact.
 *
 * @performance
 * - Lazy loads analytics providers on demand
 * - Conditional initialization based on environment
 * - Queue system for early events before initialization
 * - Automatic cleanup to prevent memory leaks
 *
 * @example
 * ```ts
 * import { analytics } from '@/lib/analytics/optimized';
 *
 * // Analytics auto-initializes on first use
 * analytics.trackContractCreated({
 *   contractId: 'con_123',
 *   creatorId: 'usr_456',
 *   contractType: 'employment'
 * });
 * ```
 */

import type { AnalyticsEvent } from './index';

/**
 * Analytics configuration interface
 * @interface AnalyticsConfig
 * @description Configuration options for analytics initialization
 */
export interface AnalyticsConfig {
  /** Enable/disable analytics globally */
  enabled?: boolean;
  /** Analytics provider to use ('none', 'console', 'mixpanel', 'amplitude') */
  provider?: 'none' | 'console' | 'mixpanel' | 'amplitude' | 'custom';
  /** Custom analytics endpoint (for custom provider) */
  endpoint?: string;
  /** Batch size for event sending */
  batchSize?: number;
  /** Flush interval in milliseconds */
  flushInterval?: number;
  /** Enable debug mode in development */
  debug?: boolean;
}

/**
 * Performance-Optimized Analytics Service
 * @class OptimizedAnalyticsService
 * @description Analytics service with lazy loading and performance optimizations
 */
class OptimizedAnalyticsService {
  private queue: AnalyticsEvent[] = [];
  private isInitialized = false;
  private provider: any = null;
  private config: AnalyticsConfig;
  private flushTimer: number | null = null;

  constructor(config: AnalyticsConfig = {}) {
    this.config = {
      enabled: import.meta.env.PROD || import.meta.env.DEV,
      provider: 'console',
      batchSize: 10,
      flushInterval: 5000,
      debug: import.meta.env.DEV,
      ...config
    };
  }

  /**
   * Initialize analytics provider lazily
   * @private
   * @description Loads analytics provider only when first needed
   */
  private async initializeProvider() {
    if (this.isInitialized || !this.config.enabled) return;

    try {
      switch (this.config.provider) {
        case 'mixpanel':
          // Lazy load Mixpanel (if installed)
          try {
            // @ts-ignore - Optional dependency
            const mixpanel = await import('mixpanel-browser');
            this.provider = mixpanel;
            // Initialize Mixpanel with your token
            // this.provider.init(import.meta.env.VITE_MIXPANEL_TOKEN);
          } catch (e) {
            console.warn('[Analytics] Mixpanel not installed, falling back to console');
            this.config.provider = 'console';
          }
          break;

        case 'amplitude':
          // Lazy load Amplitude (if installed)
          try {
            // @ts-ignore - Optional dependency
            const amplitude = await import('@amplitude/analytics-browser');
            this.provider = amplitude;
            // Initialize Amplitude
            // this.provider.init(import.meta.env.VITE_AMPLITUDE_API_KEY);
          } catch (e) {
            console.warn('[Analytics] Amplitude not installed, falling back to console');
            this.config.provider = 'console';
          }
          break;

        case 'custom':
          // Custom endpoint integration
          this.provider = {
            send: async (events: AnalyticsEvent[]) => {
              if (!this.config.endpoint) return;
              await fetch(this.config.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ events })
              });
            }
          };
          break;

        case 'console':
        default:
          // Console provider (default)
          this.provider = {
            send: (events: AnalyticsEvent[]) => {
              if (this.config.debug) {
                console.group('📊 Analytics Events');
                events.forEach(event => {
                  console.log(`Event: ${event.eventName}`, event.properties);
                });
                console.groupEnd();
              }
            }
          };
          break;
      }

      this.isInitialized = true;

      // Setup automatic flush interval
      if (this.config.flushInterval && this.config.flushInterval > 0) {
        this.flushTimer = window.setTimeout(
          () => this.flush(),
          this.config.flushInterval
        ) as unknown as number;
      }

      // Process queued events
      await this.processQueue();

      if (this.config.debug) {
        console.log('[Analytics] Initialized with provider:', this.config.provider);
      }
    } catch (error) {
      console.error('[Analytics] Initialization failed:', error);
      // Fallback to console provider
      this.config.provider = 'console';
      this.isInitialized = false;
    }
  }

  /**
   * Process queued events after initialization
   * @private
   */
  private async processQueue() {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    await this.sendEvents(events);
  }

  /**
   * Send events to analytics provider
   * @private
   */
  private async sendEvents(events: AnalyticsEvent[]) {
    if (!this.provider || events.length === 0) return;

    try {
      if (this.provider && 'send' in this.provider && typeof this.provider.send === 'function') {
        await this.provider.send(events);
      }
    } catch (error) {
      console.error('[Analytics] Send failed:', error);
      // Re-queue failed events
      this.queue.unshift(...events);
    }
  }

  /**
   * Queue event for processing
   * @param eventName - Event name
   * @param properties - Event properties
   * @param immediate - Send immediately without queuing
   */
  async track(eventName: string, properties: Record<string, any>, immediate = false) {
    if (!this.config.enabled) return;

    const event: AnalyticsEvent = {
      eventName,
      properties,
      timestamp: Date.now(),
    };

    // Auto-initialize on first track
    if (!this.isInitialized) {
      await this.initializeProvider();
    }

    // Critical events or immediate events get sent right away
    if (immediate || eventName.includes('error') || eventName.includes('signed')) {
      await this.sendEvents([event]);
      return;
    }

    // Queue event
    this.queue.push(event);

    // Auto-flush if queue gets too large
    if (this.queue.length >= (this.config.batchSize || 10)) {
      await this.flush();
    }
  }

  /**
   * Flush queued events
   * @description Send all queued events to analytics provider
   */
  async flush() {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    await this.sendEvents(events);
  }

  /**
   * Cleanup analytics service
   * @description Clear timers and reset state for cleanup
   */
  cleanup() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    // Flush remaining events
    this.flush();

    this.isInitialized = false;
    this.provider = null;
    this.queue = [];
  }

  /**
   * Get current queue size
   * @returns Number of events in queue
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Check if analytics is initialized
   * @returns true if initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}

/**
 * Create optimized analytics instance
 * @param config - Analytics configuration
 * @returns Optimized analytics service instance
 * @description Factory function to create analytics instances with specific configuration
 *
 * @example
 * ```ts
 * const analytics = createOptimizedAnalytics({
 *   provider: 'mixpanel',
 *   batchSize: 20,
 *   flushInterval: 10000
 * });
 * ```
 */
export function createOptimizedAnalytics(config: AnalyticsConfig = {}) {
  return new OptimizedAnalyticsService(config);
}

/**
 * Default optimized analytics instance
 * @description Global analytics instance with default configuration
 */
export const analytics = createOptimizedAnalytics();

/**
 * Performance-optimized error tracking
 * @param errorType - Type of error
 * @param context - Context where error occurred
 * @param details - Additional error details
 * @description Lightweight error tracking with lazy initialization
 *
 * @example
 * ```ts
 * import { trackErrorOptimized } from '@/lib/analytics/optimized';
 *
 * try {
 *   await operation();
 * } catch (error) {
 *   trackErrorOptimized('network_error', 'api_call', { endpoint: '/api/data' });
 * }
 * ```
 */
export async function trackErrorOptimized(
  errorType: string,
  context: string,
  details: Record<string, any>
) {
  await analytics.track('error_occurred', {
    errorType,
    context,
    ...details,
    timestamp: Date.now(),
  }, true); // Send immediately
}

/**
 * Performance-optimized performance tracking
 * @param operation - Operation name
 * @param duration - Operation duration in milliseconds
 * @param metadata - Additional performance metadata
 * @description Lightweight performance tracking
 *
 * @example
 * ```ts
 * import { trackPerformanceOptimized } from '@/lib/analytics/optimized';
 *
 * const startTime = performance.now();
 * await heavyOperation();
 * const duration = performance.now() - startTime;
 * trackPerformanceOptimized('heavyOperation', duration, { inputSize: data.length });
 * ```
 */
export async function trackPerformanceOptimized(
  operation: string,
  duration: number,
  metadata?: Record<string, any>
) {
  await analytics.track('performance_metric', {
    operation,
    duration,
    unit: 'ms',
    ...metadata,
    timestamp: Date.now(),
  });
}

/**
 * Batch event tracking
 * @param events - Array of events to track
 * @description Track multiple events efficiently in a single batch
 *
 * @example
 * ```ts
 * import { trackBatch } from '@/lib/analytics/optimized';
 *
 * const events = [
 *   { eventName: 'step1', properties: { value: 1 } },
 *   { eventName: 'step2', properties: { value: 2 } },
 *   { eventName: 'step3', properties: { value: 3 } }
 * ];
 * await trackBatch(events);
 * ```
 */
export async function trackBatch(events: Array<{ eventName: string; properties: Record<string, any> }>) {
  await Promise.all(
    events.map(({ eventName, properties }) =>
      analytics.track(eventName, properties)
    )
  );
}

/**
 * Conditional event tracking
 * @param condition - Whether to track the event
 * @param eventName - Event name
 * @param properties - Event properties
 * @description Track event only if condition is met
 *
 * @example
 * ```ts
 * import { trackConditional } from '@/lib/analytics/optimized';
 *
 * // Only track if user is premium
 * await trackConditional(user.isPremium, 'premium_feature_used', { feature: 'export' });
 * ```
 */
export async function trackConditional(
  condition: boolean,
  eventName: string,
  properties: Record<string, any>
) {
  if (condition) {
    await analytics.track(eventName, properties);
  }
}

/**
 * Throttled event tracking
 * @param eventName - Event name
 * @param properties - Event properties
 * @param delay - Throttle delay in milliseconds
 * @description Track events with throttling to prevent excessive tracking
 *
 * @example
 * ```ts
 * import { trackThrottled } from '@/lib/analytics/optimized';
 *
 * // Throttle scroll events to once per second
 * window.addEventListener('scroll', () => {
 *   trackThrottled('scroll', { scrollY: window.scrollY }, 1000);
 * });
 * ```
 */
export const trackThrottled = (() => {
  const lastTrackTime = new Map<string, number>();

  return async (eventName: string, properties: Record<string, any>, delay = 1000) => {
    const now = Date.now();
    const lastTime = lastTrackTime.get(eventName) || 0;

    if (now - lastTime >= delay) {
      lastTrackTime.set(eventName, now);
      await analytics.track(eventName, properties);
    }
  };
})();

/**
 * Debounced event tracking
 * @param eventName - Event name
 * @param properties - Event properties
 * @param delay - Debounce delay in milliseconds
 * @description Track events with debouncing to consolidate rapid events
 *
 * @example
 * ```ts
 * import { trackDebounced } from '@/lib/analytics/optimized';
 *
 * // Debounce search input events
 * searchInput.addEventListener('input', (e) => {
 *   trackDebounced('search_input', { query: e.target.value }, 500);
 * });
 * ```
 */
export const trackDebounced = (() => {
  const debounceTimers = new Map<string, number>();

  return async (eventName: string, properties: Record<string, any>, delay = 500) => {
    const existingTimer = debounceTimers.get(eventName);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = window.setTimeout(async () => {
      await analytics.track(eventName, properties);
      debounceTimers.delete(eventName);
    }, delay);

    debounceTimers.set(eventName, timer);
  };
})();

/**
 * Cleanup analytics on page unload
 * @description Ensures all events are sent before page unload
 */
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    analytics.cleanup();
  });
}