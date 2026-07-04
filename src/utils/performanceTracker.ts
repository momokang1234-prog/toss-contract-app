/**
 * Performance Monitoring Utilities
 * Provides comprehensive performance tracking for the application
 */

import { trackPerformance } from '../lib/analytics';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  metadata?: Record<string, any>;
}

class PerformanceTracker {
  private activeMeasurements: Map<string, PerformanceMetric> = new Map();

  /**
   * Start measuring a performance operation
   */
  start(name: string, metadata?: Record<string, any>): void {
    this.activeMeasurements.set(name, {
      name,
      startTime: performance.now(),
      metadata,
    });
  }

  /**
   * End measuring a performance operation and track it
   */
  end(name: string): number {
    const measurement = this.activeMeasurements.get(name);
    if (!measurement) {
      console.warn(`Performance measurement "${name}" not found`);
      return 0;
    }

    const endTime = performance.now();
    const duration = endTime - measurement.startTime;

    this.activeMeasurements.delete(name);

    // Track the performance metric
    trackPerformance(name, duration, measurement.metadata);

    return duration;
  }

  /**
   * Measure an async operation
   */
  async measure<T>(
    name: string,
    operation: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.start(name, metadata);
    try {
      const result = await operation();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  /**
   * Measure a sync operation
   */
  measureSync<T>(
    name: string,
    operation: () => T,
    metadata?: Record<string, any>
  ): T {
    this.start(name, metadata);
    try {
      const result = operation();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  /**
   * Get all active measurements
   */
  getActiveMeasurements(): string[] {
    return Array.from(this.activeMeasurements.keys());
  }

  /**
   * Clear all active measurements
   */
  clear(): void {
    this.activeMeasurements.clear();
  }
}

// Export singleton instance
export const performanceTracker = new PerformanceTracker();

/**
 * Decorator to measure method performance
 */
export function measurePerformance(name?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const metricName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      performanceTracker.start(metricName);
      try {
        const result = await originalMethod.apply(this, args);
        performanceTracker.end(metricName);
        return result;
      } catch (error) {
        performanceTracker.end(metricName);
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Measure API call performance
 */
export async function measureApiCall<T>(
  apiName: string,
  apiCall: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  return performanceTracker.measure(apiName, apiCall, {
    ...metadata,
    type: 'api_call',
  });
}

/**
 * Measure render performance
 */
export function measureRender(
  componentName: string,
  renderFn: () => void
): number {
  const start = performance.now();
  renderFn();
  const duration = performance.now() - start;

  trackPerformance(`render_${componentName}`, duration, {
    type: 'render',
    component: componentName,
  });

  return duration;
}

/**
 * Get navigation timing metrics
 */
export function getNavigationTiming(): {
  domContentLoaded: number;
  loadComplete: number;
  domReady: number;
  firstPaint?: number;
  firstContentfulPaint?: number;
} {
  if (typeof window === 'undefined' || !window.performance) {
    return {
      domContentLoaded: 0,
      loadComplete: 0,
      domReady: 0,
    };
  }

  const navigation = window.performance.getEntriesByType(
    'navigation'
  )[0] as PerformanceNavigationTiming;

  return {
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.startTime,
    loadComplete: navigation.loadEventEnd - navigation.startTime,
    domReady: navigation.domInteractive - navigation.startTime,
  };
}

/**
 * Get resource timing metrics
 */
export function getResourceTiming(): {
  totalResources: number;
  slowestResource: { name: string; duration: number };
  totalTransferSize: number;
} {
  if (typeof window === 'undefined' || !window.performance) {
    return {
      totalResources: 0,
      slowestResource: { name: 'none', duration: 0 },
      totalTransferSize: 0,
    };
  }

  const resources = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[];

  const slowest = resources.reduce((max, resource) => {
    const duration = resource.responseEnd - resource.startTime;
    return duration > max.duration ? { name: resource.name, duration } : max;
  }, { name: 'none', duration: 0 });

  const totalTransferSize = resources.reduce(
    (total, resource) => total + (resource.transferSize || 0),
    0
  );

  return {
    totalResources: resources.length,
    slowestResource: slowest,
    totalTransferSize,
  };
}