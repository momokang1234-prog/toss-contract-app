# Error Handling Examples and Best Practices

**Comprehensive guide for using the unified error handling system in toss-contract-app**

---

## 📚 Table of Contents

1. [Basic Error Logging](#basic-error-logging)
2. [Component Error Handling](#component-error-handling)
3. [API Error Handling](#api-error-handling)
4. [Authentication Error Handling](#authentication-error-handling)
5. [Async Operation Error Handling](#async-operation-error-handling)
6. [Error Boundary Integration](#error-boundary-integration)
7. [Advanced Patterns](#advanced-patterns)
8. [Best Practices](#best-practices)

---

## 🔥 Basic Error Logging

### Simple Error Logging

```ts
import { logError } from '@/utils/errorConsolidation';

try {
  await someOperation();
} catch (error) {
  logError('operationName', error);
}
```

### Error Logging with Context

```ts
import { logError } from '@/utils/errorConsolidation';

try {
  await createContract(contractData);
} catch (error) {
  logError('createContract', error, {
    contractId: contractData.id,
    userId: currentUser.id,
    contractType: contractData.type,
    timestamp: new Date().toISOString()
  });
}
```

### Error Logging for User Actions

```ts
import { logError } from '@/utils/errorConsolidation';

const handleUserAction = async (action: string, data: any) => {
  try {
    await performAction(action, data);
  } catch (error) {
    logError('userAction', error, {
      action,
      userId: data.userId,
      sessionId: data.sessionId,
      userAgent: navigator.userAgent
    });
  }
};
```

---

## 🎨 Component Error Handling

### Functional Component Error Handling

```ts
import { useState } from 'react';
import { logComponentError } from '@/utils/errorConsolidation';

export function MyComponent({ userId }) {
  const [data, setData] = useState(null);

  const loadData = async () => {
    try {
      const result = await fetchUserData(userId);
      setData(result);
    } catch (error) {
      logComponentError('MyComponent', error, {
        userId,
        componentState: { hasData: !!data }
      });
    }
  };

  return <div>{/* component content */}</div>;
}
```

### Error Boundary Integration

```ts
import { Component } from 'react';
import { logComponentError } from '@/utils/errorConsolidation';

class MyErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: any) {
    logComponentError('MyErrorBoundary', error, {
      componentStack: errorInfo.componentStack,
      errorBoundaryLevel: 'component'
    });
  }

  render() {
    return this.props.children;
  }
}
```

### Custom Error Boundary Logger

```ts
import { createErrorBoundaryLogger } from '@/utils/errorConsolidation';

const logContractError = createErrorBoundaryLogger('ContractErrorBoundary');

class ContractErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: any) {
    logContractError(error, {
      contractId: this.props.contractId,
      componentStack: errorInfo.componentStack
    });
  }

  render() {
    return this.props.children;
  }
}
```

---

## 🌐 API Error Handling

### Basic API Error Handling

```ts
import { logApiError } from '@/utils/errorConsolidation';

export const createContract = async (contractData: ContractData) => {
  try {
    const response = await fetch('/api/contracts', {
      method: 'POST',
      body: JSON.stringify(contractData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    logApiError('createContract', error, {
      endpoint: '/api/contracts',
      method: 'POST',
      status: response?.status,
      contractId: contractData.id
    });
    throw error;
  }
};
```

### API Error Logger Factory

```ts
import { createApiErrorLogger } from '@/utils/errorConsolidation';

const logContractsApiError = createApiErrorLogger('contractsApi');

export const contractsApi = {
  create: async (data: any) => {
    try {
      return await apiCall('/api/contracts', 'POST', data);
    } catch (error) {
      logContractsApiError(error, 'create', { contractId: data.id });
      throw error;
    }
  },

  update: async (id: string, data: any) => {
    try {
      return await apiCall(`/api/contracts/${id}`, 'PUT', data);
    } catch (error) {
      logContractsApiError(error, 'update', { contractId: id });
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      return await apiCall(`/api/contracts/${id}`, 'DELETE');
    } catch (error) {
      logContractsApiError(error, 'delete', { contractId: id });
      throw error;
    }
  }
};
```

### API Error Handling with Recovery

```ts
import { logApiError } from '@/utils/errorConsolidation';
import { getRecoveryStrategy } from '@/utils/errorClassification';

export const robustApiCall = async (endpoint: string, options: RequestInit) => {
  try {
    const response = await fetch(endpoint, options);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    logApiError('robustApiCall', error, {
      endpoint,
      method: options.method
    });

    // Get recovery strategy
    const classified = classifyError(error);
    const strategy = getRecoveryStrategy(classified);

    if (strategy.shouldRetry) {
      await new Promise(resolve => setTimeout(resolve, strategy.retryDelay));
      return robustApiCall(endpoint, options); // Retry
    }

    throw error;
  }
};
```

---

## 🔐 Authentication Error Handling

### Login Error Handling

```ts
import { logAuthError } from '@/utils/errorConsolidation';

export const login = async (email: string, password: string) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error('Authentication failed');
    }

    return await response.json();
  } catch (error) {
    logAuthError('login', error, {
      email,
      authMethod: 'email_password',
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};
```

### Token Refresh Error Handling

```ts
import { logAuthError } from '@/utils/errorConsolidation';

export const refreshAuthToken = async (refreshToken: string) => {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refreshToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    return await response.json();
  } catch (error) {
    logAuthError('refreshToken', error, {
      authMethod: 'token_refresh',
      tokenExpired: true
    });
    // Redirect to login if token refresh fails
    window.location.href = '/login';
    throw error;
  }
};
```

### Session Management Error Handling

```ts
import { logAuthError } from '@/utils/errorConsolidation';

export const validateSession = async () => {
  try {
    const response = await fetch('/api/auth/validate');
    if (!response.ok) {
      throw new Error('Session validation failed');
    }
    return await response.json();
  } catch (error) {
    logAuthError('validateSession', error, {
      authMethod: 'session_validation',
      sessionExpired: true
    });
    // Clear local session
    sessionStorage.clear();
    // Redirect to login
    window.location.href = '/login';
  }
};
```

---

## ⏱️ Async Operation Error Handling

### Performance Tracking with Error Handling

```ts
import { logAsyncError } from '@/utils/errorConsolidation';

export const processContract = async (contractId: string) => {
  const startTime = performance.now();

  try {
    // Complex processing logic
    await validateContract(contractId);
    await generatePDF(contractId);
    await sendNotifications(contractId);

    const duration = performance.now() - startTime;
    return { success: true, duration };
  } catch (error) {
    const duration = performance.now() - startTime;
    logAsyncError('processContract', error, duration, {
      contractId,
      processingSteps: ['validate', 'generate', 'notify']
    });
    throw error;
  }
};
```

### Batch Processing Error Handling

```ts
import { logAsyncError } from '@/utils/errorConsolidation';

export const processBatch = async (items: any[]) => {
  const results = [];
  const startTime = performance.now();

  for (const item of items) {
    try {
      const result = await processItem(item);
      results.push({ success: true, item, result });
    } catch (error) {
      const duration = performance.now() - startTime;
      logAsyncError('processBatch', error, duration, {
        itemId: item.id,
        batchSize: items.length,
        processedCount: results.length
      });
      results.push({ success: false, item, error });
    }
  }

  return results;
};
```

### Background Task Error Handling

```ts
import { logAsyncError } from '@/utils/errorConsolidation';

export const runBackgroundTask = async (taskId: string) => {
  const startTime = performance.now();

  try {
    // Simulate long-running task
    await new Promise(resolve => setTimeout(resolve, 5000));

    const duration = performance.now() - startTime;
    return { taskId, duration, status: 'completed' };
  } catch (error) {
    const duration = performance.now() - startTime;
    logAsyncError('backgroundTask', error, duration, {
      taskId,
      taskType: 'background',
      duration
    });
    throw error;
  }
};
```

---

## 🛡️ Error Boundary Integration

### Page-Level Error Boundary

```ts
import { createErrorBoundaryLogger } from '@/utils/errorConsolidation';

const logPageError = createErrorBoundaryLogger('ContractDetailPage');

export class ContractDetailErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: any) {
    logPageError(error, {
      contractId: this.props.contractId,
      componentStack: errorInfo.componentStack,
      pageLocation: window.location.href
    });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### Widget-Level Error Boundary

```ts
import { createErrorBoundaryLogger } from '@/utils/errorConsolidation';

const logWidgetError = createErrorBoundaryLogger('SignatureWidget');

export const SignatureWidgetErrorBoundary = ({ children }) => {
  const handleError = (error: Error, errorInfo: any) => {
    logWidgetError(error, {
      widgetType: 'signature',
      componentStack: errorInfo.componentStack
    });
  };

  return (
    <ErrorBoundary onError={handleError}>
      {children}
    </ErrorBoundary>
  );
};
```

### Global Error Boundary

```ts
import { createErrorBoundaryLogger } from '@/utils/errorConsolidation';

const logGlobalError = createErrorBoundaryLogger('GlobalErrorBoundary');

export class GlobalErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: any) {
    logGlobalError(error, {
      componentStack: errorInfo.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
  }

  render() {
    if (this.state.hasError) {
      return <GlobalErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

---

## 🚀 Advanced Patterns

### Retry Logic with Exponential Backoff

```ts
import { logError } from '@/utils/errorConsolidation';

export const retryWithBackoff = async (
  operation: () => Promise<any>,
  maxRetries: number = 3,
  baseDelay: number = 1000
) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      logError('retryWithBackoff', error, {
        attempt: attempt + 1,
        maxRetries,
        delay: baseDelay * Math.pow(2, attempt)
      });

      if (attempt === maxRetries - 1) {
        throw error;
      }

      await new Promise(resolve =>
        setTimeout(resolve, baseDelay * Math.pow(2, attempt))
      );
    }
  }
};

// Usage
const result = await retryWithBackoff(() => fetch('/api/data'));
```

### Circuit Breaker Pattern

```ts
import { logError } from '@/utils/errorConsolidation';

class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private isOpen = false;
  private threshold = 5;
  private timeout = 60000; // 1 minute

  async execute(operation: () => Promise<any>) {
    if (this.isOpen) {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.isOpen = false;
        this.failureCount = 0;
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await operation();
      this.failureCount = 0;
      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      logError('circuitBreaker', error, {
        failureCount: this.failureCount,
        threshold: this.threshold,
        isOpen: this.isOpen
      });

      if (this.failureCount >= this.threshold) {
        this.isOpen = true;
      }

      throw error;
    }
  }
}
```

### Error Aggregation

```ts
import { logError } from '@/utils/errorConsolidation';

export const processWithAggregation = async (tasks: Task[]) => {
  const errors: Array<{ task: Task; error: Error }> = [];

  const results = await Promise.allSettled(
    tasks.map(async (task) => {
      try {
        return await processTask(task);
      } catch (error) {
        errors.push({ task, error });
        logError('processWithAggregation', error, {
          taskId: task.id,
          totalTasks: tasks.length,
          errorCount: errors.length + 1
        });
        throw error;
      }
    })
  );

  return {
    successful: results.filter(r => r.status === 'fulfilled'),
    failed: results.filter(r => r.status === 'rejected'),
    errors
  };
};
```

---

## 📋 Best Practices

### DO's ✅

1. **Always provide context**: Include relevant information in error context
   ```ts
   logError('operation', error, { userId, contractId, action });
   ```

2. **Use specialized loggers**: Use domain-specific error loggers
   ```ts
   logApiError('createContract', error, { endpoint: '/api/contracts' });
   logAuthError('login', error, { email, authMethod });
   ```

3. **Handle errors appropriately**: Don't just log, handle them
   ```ts
   try {
     await operation();
   } catch (error) {
     logError('operation', error, context);
     // Handle error - show user message, retry, etc.
     showErrorMessage_to_user();
   }
   ```

4. **Include timing information**: Track performance for operations
   ```ts
   const startTime = performance.now();
   try {
     await operation();
   } catch (error) {
     const duration = performance.now() - startTime;
     logAsyncError('operation', error, duration, context);
   }
   ```

### DON'Ts ❌

1. **Don't use console.error**: Use proper error logging
   ```ts
   // ❌ Bad
   console.error('Something went wrong', error);

   // ✅ Good
   logError('operation', error, { context: 'details' });
   ```

2. **Don't lose error context**: Preserve error information
   ```ts
   // ❌ Bad
   catch (error) {
     logError('operation', 'Failed'); // Lost original error
   }

   // ✅ Good
   catch (error) {
     logError('operation', error, { details });
   }
   ```

3. **Don't ignore errors**: Always handle or re-throw
   ```ts
   // ❌ Bad
   catch (error) {
     logError('operation', error);
     // Error swallowed
   }

   // ✅ Good
   catch (error) {
     logError('operation', error);
     throw error; // Re-throw or handle
   }
   ```

4. **Don't log sensitive information**: Be careful with PII
   ```ts
   // ❌ Bad
   logError('login', error, {
     password: userPassword, // NEVER log passwords
     creditCard: userCard
   });

   // ✅ Good
   logError('login', error, {
     email: userEmail,
     userId: userId,
     timestamp: new Date().toISOString()
   });
   ```

---

## 🎯 Error Handling Strategy

### Error Classification System

The error handling system automatically classifies errors into 9 categories:

1. **Network**: Connection issues, timeouts
2. **Authentication**: Token expiration, invalid credentials
3. **Authorization**: Permission denied, access control
4. **Validation**: Invalid input, missing required fields
5. **Not Found**: Resource missing, 404 errors
6. **Conflict**: Duplicate operations, 409 errors
7. **Rate Limit**: Too many requests, 429 errors
8. **Server Error**: 500, 502, 503 errors
9. **Unknown**: Unclassified errors

### Recovery Strategies

Each error category has automatic recovery strategies:

```ts
import { classifyError, getRecoveryStrategy } from '@/utils/errorClassification';

try {
  await apiCall();
} catch (error) {
  const classified = classifyError(error);
  const strategy = getRecoveryStrategy(classified);

  if (strategy.shouldRetry) {
    setTimeout(() => apiCall(), strategy.retryDelay);
  } else if (strategy.shouldRedirect) {
    window.location.href = strategy.redirectPath;
  } else {
    alert(strategy.alertMessage);
  }
}
```

---

## 📚 Additional Resources

- **Error Classification**: `src/utils/errorClassification.ts`
- **Error Consolidation**: `src/utils/errorConsolidation.ts`
- **Analytics Integration**: `src/lib/analytics/index.ts`
- **Sentry Monitoring**: `src/lib/sentry.ts`

---

*Examples Updated: 2026-07-04 06:51 KST*
*Error Handling System Version: 1.0*