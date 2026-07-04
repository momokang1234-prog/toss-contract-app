/**
 * Analytics Hooks for React Components
 * Provides easy integration with analytics tracking
 */

import { useEffect, useRef, useCallback } from 'react';
import { analytics } from '../lib/analytics';

// Page view tracking hook
export function usePageView(pageName: string, properties?: Record<string, any>) {
  useEffect(() => {
    analytics.trackPageView(pageName, properties);
  }, [pageName, JSON.stringify(properties)]);
}

// Contract creation tracking hook
export function useContractTracking(contractId: string | null) {
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (contractId) {
      startTimeRef.current = Date.now();
    }
  }, [contractId]);

  const trackSigningStarted = useCallback((recipientId: string) => {
    if (!contractId) return;

    analytics.trackContractSigningStarted({
      contractId,
      recipientId,
      timeFromView: Math.floor((Date.now() - startTimeRef.current) / 1000),
    });
  }, [contractId]);

  const trackFieldCompleted = useCallback((
    recipientId: string,
    fieldType: 'signature' | 'text' | 'date' | 'checkbox',
    fieldIndex: number,
    totalFields: number
  ) => {
    if (!contractId) return;

    analytics.trackContractFieldCompleted({
      contractId,
      recipientId,
      fieldType,
      fieldIndex,
      totalFields,
    });
  }, [contractId]);

  const trackSigned = useCallback((recipientId: string, totalTimeToSign: number) => {
    if (!contractId) return;

    const deviceType = /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop';

    analytics.trackContractSigned({
      contractId,
      recipientId,
      totalTimeToSign,
      deviceType,
    });
  }, [contractId]);

  return {
    trackSigningStarted,
    trackFieldCompleted,
    trackSigned,
  };
}

// Performance tracking hook
export function usePerformanceTracking(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      if (process.env.NODE_ENV === 'development') {
        console.log(`Performance: ${componentName} rendered in ${renderTime.toFixed(2)}ms`);
      }

      // Track render times exceeding 100ms
      if (renderTime > 100) {
        analytics.track('slow_render', {
          component: componentName,
          renderTime: Math.round(renderTime),
        });
      }
    };
  }, [componentName]);
}

// Error tracking hook
export function useErrorTracking() {
  const trackError = useCallback((
    errorType: 'validation' | 'network' | 'auth' | 'timeout',
    contractId: string,
    recipientId: string,
    fieldIndex?: number
  ) => {
    analytics.trackContractSigningError({
      contractId,
      recipientId,
      errorType,
      fieldIndex,
    });
  }, []);

  const trackAbandonment = useCallback((
    contractId: string,
    recipientId: string,
    stage: 'viewed' | 'signing_started' | 'identity_failed',
    timeInStage: number
  ) => {
    analytics.trackContractAbandoned({
      contractId,
      recipientId,
      abandonmentStage: stage,
      timeInStage,
    });
  }, []);

  return {
    trackError,
    trackAbandonment,
  };
}

// Form progress tracking hook
export function useFormProgressTracking(formName: string) {
  const startTimeRef = useRef<number>(Date.now());
  const fieldsCompletedRef = useRef<Set<string>>(new Set());

  const trackFieldInteraction = useCallback((fieldName: string) => {
    fieldsCompletedRef.current.add(fieldName);
  }, []);

  const trackFormCompletion = useCallback((success: boolean) => {
    const totalTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const fieldsCompleted = fieldsCompletedRef.current.size;

    analytics.track('form_completed', {
      formName,
      success,
      totalTime,
      fieldsCompleted,
      timestamp: Date.now(),
    });
  }, [formName]);

  return {
    trackFieldInteraction,
    trackFormCompletion,
  };
}

// Session tracking hook
export function useSessionTracking() {
  useEffect(() => {
    const sessionStart = Date.now();

    // Track session start
    analytics.track('session_started', {
      timestamp: sessionStart,
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
    });

    return () => {
      // Track session end
      const sessionDuration = Math.floor((Date.now() - sessionStart) / 1000);

      analytics.track('session_ended', {
        timestamp: Date.now(),
        sessionDuration,
      });

      // Flush events before unmount
      (analytics as any).flush();
    };
  }, []);
}