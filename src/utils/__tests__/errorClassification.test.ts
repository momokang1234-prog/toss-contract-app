/**
 * Error Classification System Tests
 * Comprehensive unit tests for error classification and recovery strategies
 */

import { describe, it, expect } from 'vitest';
import { classifyError, getRecoveryStrategy, ErrorCategory, ErrorSeverity } from '../errorClassification';

describe('Error Classification System', () => {
  describe('Network Error Classification', () => {
    it('should classify network timeout errors', () => {
      const error = new Error('Network timeout occurred');
      const classified = classifyError(error);

      expect(classified.category).toBe('network');
      expect(classified.severity).toBe('medium');
      expect(classified.recoverable).toBe(true);
      expect(classified.retryable).toBe(true);
      expect(classified.userMessage).toContain('네트워크');
    });

    it('should classify connection errors', () => {
      const error = new Error('Failed to fetch - connection lost');
      const classified = classifyError(error);

      expect(classified.category).toBe('network');
      expect(classified.suggestedActions).toContain('인터넷 연결 상태를 확인해주세요');
    });

    it('should classify fetch errors', () => {
      const error = new Error('fetch failed - network error');
      const classified = classifyError(error);

      expect(classified.category).toBe('network');
    });
  });

  describe('Authentication Error Classification', () => {
    it('should classify authentication errors', () => {
      const error = new Error('Authentication failed - invalid token');
      const classified = classifyError(error);

      expect(classified.category).toBe('authentication');
      expect(classified.severity).toBe('high');
      expect(classified.recoverable).toBe(true);
      expect(classified.retryable).toBe(false);
      expect(classified.userMessage).toContain('인증');
    });

    it('should classify token expiration errors', () => {
      const error = new Error('JWT token expired');
      const classified = classifyError(error);

      expect(classified.category).toBe('authentication');
      expect(classified.suggestedActions).toContain('다시 로그인해주세요');
    });

    it('should classify unauthorized errors', () => {
      const error = new Error('Unauthorized access - session invalid');
      const classified = classifyError(error);

      expect(classified.category).toBe('authentication');
    });
  });

  describe('Authorization Error Classification', () => {
    it('should classify permission errors', () => {
      const error = new Error('Permission denied - insufficient rights');
      const classified = classifyError(error);

      expect(classified.category).toBe('authorization');
      expect(classified.severity).toBe('high');
      expect(classified.recoverable).toBe(false);
      expect(classified.retryable).toBe(false);
      expect(classified.userMessage).toContain('권한');
    });

    it('should classify forbidden errors', () => {
      const error = new Error('Access forbidden - admin only');
      const classified = classifyError(error);

      expect(classified.category).toBe('authorization');
      expect(classified.suggestedActions).toContain('접근 권한이 있는 계정으로 로그인해주세요');
    });
  });

  describe('Validation Error Classification', () => {
    it('should classify validation errors', () => {
      const error = new Error('Validation failed - invalid email format');
      const classified = classifyError(error);

      expect(classified.category).toBe('validation');
      expect(classified.severity).toBe('low');
      expect(classified.recoverable).toBe(true);
      expect(classified.retryable).toBe(false);
      expect(classified.userMessage).toContain('입력값');
    });

    it('should classify required field errors', () => {
      const error = new Error('Required field missing - name is required');
      const classified = classifyError(error);

      expect(classified.category).toBe('validation');
      expect(classified.suggestedActions).toContain('입력값을 다시 확인해주세요');
    });

    it('should classify format errors', () => {
      const error = new Error('Invalid format - phone number format incorrect');
      const classified = classifyError(error);

      expect(classified.category).toBe('validation');
    });
  });

  describe('Rate Limit Error Classification', () => {
    it('should classify rate limit errors', () => {
      const error = new Error('Rate limit exceeded - too many requests');
      const classified = classifyError(error);

      expect(classified.category).toBe('rate_limit');
      expect(classified.severity).toBe('medium');
      expect(classified.recoverable).toBe(true);
      expect(classified.retryable).toBe(true);
      expect(classified.userMessage).toContain('요청');
    });

    it('should classify 429 errors', () => {
      const error = new Error('HTTP 429 - rate limit exceeded');
      const classified = classifyError(error);

      expect(classified.category).toBe('rate_limit');
      expect(classified.suggestedActions).toContain('잠시 후 다시 시도해주세요');
    });
  });

  describe('Server Error Classification', () => {
    it('should classify 500 internal server errors', () => {
      const error = new Error('Internal server error - HTTP 500');
      const classified = classifyError(error);

      expect(classified.category).toBe('server_error');
      expect(classified.severity).toBe('critical');
      expect(classified.recoverable).toBe(true);
      expect(classified.retryable).toBe(true);
      expect(classified.userMessage).toContain('서버');
    });

    it('should classify 502 bad gateway errors', () => {
      const error = new Error('Bad gateway - HTTP 502');
      const classified = classifyError(error);

      expect(classified.category).toBe('server_error');
    });

    it('should classify 503 service unavailable errors', () => {
      const error = new Error('Service unavailable - HTTP 503');
      const classified = classifyError(error);

      expect(classified.category).toBe('server_error');
    });
  });

  describe('Not Found Error Classification', () => {
    it('should classify 404 not found errors', () => {
      const error = new Error('Resource not found - HTTP 404');
      const classified = classifyError(error);

      expect(classified.category).toBe('not_found');
      expect(classified.severity).toBe('medium');
      expect(classified.recoverable).toBe(false);
      expect(classified.retryable).toBe(false);
      expect(classified.userMessage).toContain('찾을 수 없습니다');
    });

    it('should classify does not exist errors', () => {
      const error = new Error('Contract does not exist');
      const classified = classifyError(error);

      expect(classified.category).toBe('not_found');
      expect(classified.suggestedActions).toContain('URL 또는 ID가 올바른지 확인해주세요');
    });
  });

  describe('Conflict Error Classification', () => {
    it('should classify 409 conflict errors', () => {
      const error = new Error('Resource conflict - HTTP 409');
      const classified = classifyError(error);

      expect(classified.category).toBe('conflict');
      expect(classified.severity).toBe('medium');
      expect(classified.recoverable).toBe(true);
      expect(classified.retryable).toBe(false);
      expect(classified.userMessage).toContain('이미 처리');
    });

    it('should classify already exists errors', () => {
      const error = new Error('Contract already exists with same ID');
      const classified = classifyError(error);

      expect(classified.category).toBe('conflict');
      expect(classified.suggestedActions).toContain('이미 완료된 작업인지 확인해주세요');
    });
  });

  describe('Unknown Error Classification', () => {
    it('should classify unknown errors', () => {
      const error = new Error('Something unexpected happened');
      const classified = classifyError(error);

      expect(classified.category).toBe('unknown');
      expect(classified.severity).toBe('medium');
      expect(classified.recoverable).toBe(true);
      expect(classified.retryable).toBe(true);
    });

    it('should handle non-Error objects', () => {
      const error = 'String error message';
      const classified = classifyError(error);

      expect(classified.category).toBe('unknown');
      expect(classified.technicalMessage).toBe('String error message');
    });

    it('should handle null errors', () => {
      const error = null;
      const classified = classifyError(error);

      expect(classified.category).toBe('unknown');
      expect(classified.technicalMessage).toBe('null');
    });

    it('should handle undefined errors', () => {
      const error = undefined;
      const classified = classifyError(error);

      expect(classified.category).toBe('unknown');
      expect(classified.technicalMessage).toBe('undefined');
    });
  });

  describe('Error Recovery Strategies', () => {
    it('should generate recovery strategy for network errors', () => {
      const error = new Error('Network timeout');
      const classified = classifyError(error);
      const strategy = getRecoveryStrategy(classified);

      expect(strategy.shouldRetry).toBe(true);
      expect(strategy.retryDelay).toBe(2000); // 2 seconds for network errors
      expect(strategy.shouldRedirect).toBe(false);
      expect(strategy.shouldAlert).toBe(true);
      expect(strategy.alertMessage).toContain('네트워크');
    });

    it('should generate recovery strategy for rate limit errors', () => {
      const error = new Error('Rate limit exceeded');
      const classified = classifyError(error);
      const strategy = getRecoveryStrategy(classified);

      expect(strategy.shouldRetry).toBe(true);
      expect(strategy.retryDelay).toBe(5000); // 5 seconds for rate limit
      expect(strategy.shouldRedirect).toBe(false);
    });

    it('should generate recovery strategy for server errors', () => {
      const error = new Error('Internal server error');
      const classified = classifyError(error);
      const strategy = getRecoveryStrategy(classified);

      expect(strategy.shouldRetry).toBe(true);
      expect(strategy.retryDelay).toBe(3000); // 3 seconds for server errors
      expect(strategy.shouldRedirect).toBe(false);
    });

    it('should generate recovery strategy for authentication errors', () => {
      const error = new Error('Authentication failed');
      const classified = classifyError(error);
      const strategy = getRecoveryStrategy(classified);

      expect(strategy.shouldRetry).toBe(false); // No automatic retry for auth errors
      expect(strategy.shouldRedirect).toBe(true);
      expect(strategy.redirectPath).toBe('/login');
      expect(strategy.shouldAlert).toBe(true);
      expect(strategy.alertMessage).toContain('인증');
    });

    it('should generate recovery strategy for validation errors', () => {
      const error = new Error('Validation failed');
      const classified = classifyError(error);
      const strategy = getRecoveryStrategy(classified);

      expect(strategy.shouldRetry).toBe(false); // No automatic retry for validation
      expect(strategy.shouldRedirect).toBe(false);
      expect(strategy.shouldAlert).toBe(true);
      expect(strategy.alertMessage).toContain('입력값');
    });

    it('should generate recovery strategy for authorization errors', () => {
      const error = new Error('Permission denied');
      const classified = classifyError(error);
      const strategy = getRecoveryStrategy(classified);

      expect(strategy.shouldRetry).toBe(false);
      expect(strategy.shouldRedirect).toBe(false);
      expect(strategy.shouldAlert).toBe(true);
      expect(strategy.alertMessage).toContain('권한');
    });

    it('should generate recovery strategy for not found errors', () => {
      const error = new Error('Resource not found');
      const classified = classifyError(error);
      const strategy = getRecoveryStrategy(classified);

      expect(strategy.shouldRetry).toBe(false);
      expect(strategy.shouldRedirect).toBe(false);
      expect(strategy.shouldAlert).toBe(true);
      expect(strategy.alertMessage).toContain('찾을 수 없습니다');
    });

    it('should generate recovery strategy for conflict errors', () => {
      const error = new Error('Resource already exists');
      const classified = classifyError(error);
      const strategy = getRecoveryStrategy(classified);

      expect(strategy.shouldRetry).toBe(false);
      expect(strategy.shouldRedirect).toBe(false);
      expect(strategy.shouldAlert).toBe(true);
      expect(strategy.alertMessage).toContain('이미 처리');
    });

    it('should generate recovery strategy for unknown errors', () => {
      const error = new Error('Unexpected error');
      const classified = classifyError(error);
      const strategy = getRecoveryStrategy(classified);

      expect(strategy.shouldRetry).toBe(true);
      expect(strategy.retryDelay).toBe(1000); // 1 second default
      expect(strategy.shouldRedirect).toBe(false);
      expect(strategy.shouldAlert).toBe(true);
    });
  });

  describe('Error Severity Levels', () => {
    it('should assign low severity to validation errors', () => {
      const error = new Error('Validation failed');
      const classified = classifyError(error);
      expect(classified.severity).toBe('low');
    });

    it('should assign medium severity to network errors', () => {
      const error = new Error('Network timeout');
      const classified = classifyError(error);
      expect(classified.severity).toBe('medium');
    });

    it('should assign medium severity to rate limit errors', () => {
      const error = new Error('Rate limit exceeded');
      const classified = classifyError(error);
      expect(classified.severity).toBe('medium');
    });

    it('should assign medium severity to not found errors', () => {
      const error = new Error('Resource not found');
      const classified = classifyError(error);
      expect(classified.severity).toBe('medium');
    });

    it('should assign medium severity to conflict errors', () => {
      const error = new Error('Resource already exists');
      const classified = classifyError(error);
      expect(classified.severity).toBe('medium');
    });

    it('should assign high severity to authentication errors', () => {
      const error = new Error('Authentication failed');
      const classified = classifyError(error);
      expect(classified.severity).toBe('high');
    });

    it('should assign high severity to authorization errors', () => {
      const error = new Error('Permission denied');
      const classified = classifyError(error);
      expect(classified.severity).toBe('high');
    });

    it('should assign critical severity to server errors', () => {
      const error = new Error('Internal server error');
      const classified = classifyError(error);
      expect(classified.severity).toBe('critical');
    });
  });

  describe('Recoverable and Retryable Flags', () => {
    it('should mark network errors as recoverable and retryable', () => {
      const error = new Error('Network timeout');
      const classified = classifyError(error);
      expect(classified.recoverable).toBe(true);
      expect(classified.retryable).toBe(true);
    });

    it('should mark rate limit errors as recoverable and retryable', () => {
      const error = new Error('Rate limit exceeded');
      const classified = classifyError(error);
      expect(classified.recoverable).toBe(true);
      expect(classified.retryable).toBe(true);
    });

    it('should mark server errors as recoverable and retryable', () => {
      const error = new Error('Internal server error');
      const classified = classifyError(error);
      expect(classified.recoverable).toBe(true);
      expect(classified.retryable).toBe(true);
    });

    it('should mark authentication errors as recoverable but not retryable', () => {
      const error = new Error('Authentication failed');
      const classified = classifyError(error);
      expect(classified.recoverable).toBe(true);
      expect(classified.retryable).toBe(false);
    });

    it('should mark validation errors as recoverable but not retryable', () => {
      const error = new Error('Validation failed');
      const classified = classifyError(error);
      expect(classified.recoverable).toBe(true);
      expect(classified.retryable).toBe(false);
    });

    it('should mark conflict errors as recoverable but not retryable', () => {
      const error = new Error('Resource already exists');
      const classified = classifyError(error);
      expect(classified.recoverable).toBe(true);
      expect(classified.retryable).toBe(false);
    });

    it('should mark authorization errors as not recoverable and not retryable', () => {
      const error = new Error('Permission denied');
      const classified = classifyError(error);
      expect(classified.recoverable).toBe(false);
      expect(classified.retryable).toBe(false);
    });

    it('should mark not found errors as not recoverable and not retryable', () => {
      const error = new Error('Resource not found');
      const classified = classifyError(error);
      expect(classified.recoverable).toBe(false);
      expect(classified.retryable).toBe(false);
    });
  });

  describe('User Messages and Suggested Actions', () => {
    it('should provide Korean user messages', () => {
      const error = new Error('Network timeout');
      const classified = classifyError(error);
      expect(classified.userMessage).toBeTruthy();
      expect(classified.userMessage).toMatch(/[\u3131-\u3163\uAC00-\uD7A3]/); // Korean characters
    });

    it('should provide suggested actions for network errors', () => {
      const error = new Error('Network timeout');
      const classified = classifyError(error);
      expect(classified.suggestedActions.length).toBeGreaterThan(0);
      expect(classified.suggestedActions).toContain('인터넷 연결 상태를 확인해주세요');
    });

    it('should provide suggested actions for authentication errors', () => {
      const error = new Error('Authentication failed');
      const classified = classifyError(error);
      expect(classified.suggestedActions.length).toBeGreaterThan(0);
      expect(classified.suggestedActions).toContain('다시 로그인해주세요');
    });

    it('should provide suggested actions for validation errors', () => {
      const error = new Error('Validation failed');
      const classified = classifyError(error);
      expect(classified.suggestedActions.length).toBeGreaterThan(0);
      expect(classified.suggestedActions).toContain('입력값을 다시 확인해주세요');
    });

    it('should include technical messages for debugging', () => {
      const errorMessage = 'Network timeout after 30 seconds';
      const error = new Error(errorMessage);
      const classified = classifyError(error);
      expect(classified.technicalMessage).toBe(errorMessage);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty error messages', () => {
      const error = new Error('');
      const classified = classifyError(error);
      expect(classified.category).toBe('unknown');
    });

    it('should handle errors with special characters', () => {
      const error = new Error('Error: @#$%^&*()');
      const classified = classifyError(error);
      expect(classified).toBeDefined();
    });

    it('should handle case-insensitive pattern matching', () => {
      const error = new Error('NETWORK TIMEOUT');
      const classified = classifyError(error);
      expect(classified.category).toBe('network');
    });

    it('should handle mixed case error messages', () => {
      const error = new Error('Network TIMEOUT occurred');
      const classified = classifyError(error);
      expect(classified.category).toBe('network');
    });

    it('should handle stack trace analysis', () => {
      const error = new Error('Some error');
      error.stack = 'Error: Some error\n    at networkHandler (network.js:10:15)';
      const classified = classifyError(error);
      expect(classified.category).toBe('network');
    });
  });
});