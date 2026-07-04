import * as Sentry from '@sentry/react';
import { trackError } from '../lib/analytics';

export type ErrorContext = 'api' | 'auth' | 'network' | 'validation' | 'unknown';

export interface ErrorDetails {
  context: string;
  type: ErrorContext;
  userMessage: string;
  technicalMessage?: string;
  recoverable: boolean;
}

export function handleApiError(error: unknown, context: string): string {
  const errorDetails = analyzeError(error, context);

  // Track error in analytics
  trackError(errorDetails.type, errorDetails.context, {
    message: errorDetails.technicalMessage || String(error),
    recoverable: errorDetails.recoverable,
  });

  // Send to Sentry for production monitoring
  if (error instanceof Error) {
    Sentry.captureException(error, {
      tags: {
        context: context,
        errorType: errorDetails.type,
      },
      extra: {
        userMessage: errorDetails.userMessage,
        recoverable: errorDetails.recoverable,
      },
    });
  }

  return errorDetails.userMessage;
}

function analyzeError(error: unknown, context: string): ErrorDetails {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Network errors
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return {
        context,
        type: 'network',
        userMessage: '네트워크 연결을 확인해주세요.',
        technicalMessage: error.message,
        recoverable: true,
      };
    }

    // Authentication errors
    if (message.includes('auth') || message.includes('token') || message.includes('unauthorized')) {
      return {
        context,
        type: 'auth',
        userMessage: '인증이 만료되었습니다. 다시 로그인해주세요.',
        technicalMessage: error.message,
        recoverable: true,
      };
    }

    // Permission errors
    if (message.includes('permission') || message.includes('forbidden')) {
      return {
        context,
        type: 'auth',
        userMessage: '해당 작업에 대한 권한이 없습니다.',
        technicalMessage: error.message,
        recoverable: false,
      };
    }

    // Validation errors
    if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
      return {
        context,
        type: 'validation',
        userMessage: '입력값을 확인해주세요.',
        technicalMessage: error.message,
        recoverable: true,
      };
    }
  }

  // Unknown errors
  return {
    context,
    type: 'unknown',
    userMessage: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    technicalMessage: error instanceof Error ? error.message : String(error),
    recoverable: true,
  };
}
