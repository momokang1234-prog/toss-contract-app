# toss-contract-app — Implementation Roadmap

**Generated**: 2026-07-04
**Based on**: 16 comprehensive research reports
**Focus**: Actionable insights for immediate application

---

## 📊 Executive Summary

This document distills actionable insights from 16 research reports into immediate, phased, and strategic implementation tasks for toss-contract-app.

**Status**:
- ✅ **Implemented**: Analytics tracking, Sentry monitoring, Vite build optimization
- 🔄 **In Progress**: React Compiler migration
- ⏳ **Pending**: User personalization, Granite deployment, E2E testing

---

## 🎯 Category 1: Immediate Actions (Week 1)

### 1.1 Enable React Compiler

**Source**: `react-performance-2026.md`

**Action**:
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  reactCompiler: true, // Add this
});
```

**Benefits**:
- 90% reduction in manual optimization work
- Automatic memoization at build time
- Cleaner, more maintainable code

**Migration Steps**:
1. Enable compiler in config
2. Remove unnecessary `useMemo`/`useCallback`
3. Remove `React.memo()` wrappers
4. Run test suite to verify

**Files to Modify**:
- `vite.config.ts`
- All component files with manual memoization

---

### 1.2 Upgrade to Vite 6 (Preparation)

**Source**: `vite-plugin-ecosystem.md`

**Current Status**: Vite 5.x
**Target**: Vite 6 with Rolldown

**Benefits**:
- 10x faster builds with Rolldown
- Better tree-shaking
- Improved HMR

**Preparation Steps**:
1. Check package.json for Vite dependencies
2. Review Vite 6 breaking changes
3. Test in development environment first
4. Measure build time improvements

**Trade-offs**:
- Rolldown is still in beta
- Potential plugin compatibility issues
- Requires testing

---

### 1.3 Security Headers for Next.js

**Source**: `nextjs-security-audit.md`

**Action**:
```typescript
// next.config.ts (if using Next.js)
export default defineConfig({
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
});
```

**Headers to Add**:
- `X-Frame-Options`: Prevent clickjacking
- `X-Content-Type-Options`: Prevent MIME sniffing
- `X-XSS-Protection`: Enable XSS filter
- `Referrer-Policy`: Control referrer information

---

## 🏗️ Category 2: Architecture Improvements (Week 2-4)

### 2.1 User Preferences Table

**Source**: `personalization-data-architecture.md`

**Schema**:
```sql
-- supabase/migrations/015_user_preferences.sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Role
  role TEXT CHECK (role IN ('employer', 'worker')) NOT NULL,

  -- UI Preferences
  default_view TEXT,
  theme TEXT CHECK (theme IN ('light', 'dark', 'auto')),
  language TEXT CHECK (language IN ('ko', 'en')) DEFAULT 'ko',

  -- Notification Preferences
  notification_channels TEXT[] DEFAULT '{push}',
  notification_time TEXT CHECK (notification_time IN ('morning', 'afternoon', 'evening')),

  -- Feature Flags
  beta_features TEXT[] DEFAULT '{}',

  -- Consent
  personalization_consent BOOLEAN DEFAULT false,
  analytics_consent BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- RLS Policies
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_user_preferences_role ON user_preferences(role);
CREATE INDEX idx_user_preferences_consent ON user_preferences(personalization_consent);

-- Updated_at trigger
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Implementation Steps**:
1. Create migration file
2. Run migration: `supabase db push`
3. Generate TypeScript types: `supabase gen types typescript`
4. Update auth logic to create preferences on signup

---

### 2.2 Role Detection System

**Source**: `user-personalization-strategies.md`

**Implementation**:
```typescript
// src/lib/role-detection.ts
import { User } from '@supabase/supabase-js';

interface RoleSignals {
  accountType?: string;
  companySize?: number;
  activityPattern?: string;
  selfDeclared?: string;
}

export function detectUserRole(user: User, signals: RoleSignals): 'employer' | 'worker' {
  // Priority 1: Self-declared role
  if (signals.selfDeclared === 'employer' || signals.selfDeclared === 'worker') {
    return signals.selfDeclared;
  }

  // Priority 2: Account type from metadata
  if (signals.accountType === 'business') {
    return 'employer';
  }

  // Priority 3: Company size indicator
  if (signals.companySize && signals.companySize > 1) {
    return 'employer';
  }

  // Priority 4: Activity pattern analysis
  if (signals.activityPattern === 'creates_contracts') {
    return 'employer';
  } else if (signals.activityPattern === 'signs_contracts') {
    return 'worker';
  }

  // Default: Worker (safer default)
  return 'worker';
}

// Usage in auth flow
export async function initializeUserRole(user: User) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('account_type, company_size')
    .eq('id', user.id)
    .single();

  const signals: RoleSignals = {
    accountType: profile?.account_type,
    companySize: profile?.company_size,
  };

  const role = detectUserRole(user, signals);

  // Store in user_preferences
  await supabase
    .from('user_preferences')
    .upsert({ user_id: user.id, role });

  return role;
}
```

---

### 2.3 Consent Management System

**Source**: `user-personalization-strategies.md`, Korean PIPA compliance

**Schema Addition**:
```sql
-- Add to user_preferences table
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS consent_version TEXT DEFAULT '1.0';
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS consented_at TIMESTAMPTZ;
```

**Implementation**:
```typescript
// src/lib/consent-manager.ts
export interface ConsentScope {
  personalization: boolean;
  analytics: boolean;
  marketing: boolean;
}

export class ConsentManager {
  async getConsent(userId: string): Promise<ConsentScope> {
    const { data } = await supabase
      .from('user_preferences')
      .select('personalization_consent, analytics_consent')
      .eq('user_id', userId)
      .single();

    return {
      personalization: data?.personalization_consent || false,
      analytics: data?.analytics_consent || false,
      marketing: false, // Not implemented yet
    };
  }

  async updateConsent(userId: string, scope: ConsentScope) {
    await supabase
      .from('user_preferences')
      .update({
        personalization_consent: scope.personalization,
        analytics_consent: scope.analytics,
        consent_version: '1.0',
        consented_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
  }

  async checkConsent(userId: string, requiredScope: keyof ConsentScope): Promise<boolean> {
    const consent = await this.getConsent(userId);
    return consent[requiredScope] || false;
  }
}

// Usage example
const consentManager = new ConsentManager();

// Before tracking analytics
if (await consentManager.checkConsent(userId, 'analytics')) {
  analytics.track('event_name', properties);
}

// Before applying personalization
if (await consentManager.checkConsent(userId, 'personalization')) {
  const preferences = await getUserPreferences(userId);
  applyPersonalization(preferences);
}
```

---

### 2.4 Personalization Engine

**Source**: `user-personalization-strategies.md`

**Implementation**:
```typescript
// src/lib/personalization-engine.ts
import { User } from '@supabase/supabase-js';

interface PersonalizationRule {
  trigger: (user: User, prefs: UserPreferences) => boolean;
  action: PersonalizationAction;
  priority: number;
}

type PersonalizationAction =
  | 'show-advanced-analytics'
  | 'highlight-pending-contracts'
  | 'simplify-ui'
  | 'show-management-tools'
  | 'show-signing-tools'
  | 'use-default-experience';

export class PersonalizationEngine {
  private rules: PersonalizationRule[] = [
    // Employer rules
    {
      trigger: (user, prefs) => prefs.role === 'employer' && prefs.contracts_count > 10,
      action: 'show-advanced-analytics',
      priority: 1,
    },
    {
      trigger: (user, prefs) => prefs.role === 'employer',
      action: 'show-management-tools',
      priority: 2,
    },

    // Worker rules
    {
      trigger: (user, prefs) => prefs.role === 'worker' && prefs.pending_contracts > 0,
      action: 'highlight-pending-contracts',
      priority: 1,
    },
    {
      trigger: (user, prefs) => prefs.role === 'worker',
      action: 'show-signing-tools',
      priority: 2,
    },
    {
      trigger: (user, prefs) => prefs.role === 'worker' && prefs.device_type === 'mobile',
      action: 'simplify-ui',
      priority: 3,
    },

    // Privacy rules (highest priority)
    {
      trigger: (user, prefs) => !prefs.personalization_consent,
      action: 'use-default-experience',
      priority: 10,
    },
  ];

  async apply(user: User): Promise<PersonalizationAction[]> {
    const prefs = await this.getUserPreferences(user.id);

    // Check consent first
    if (!prefs.personalization_consent) {
      return ['use-default-experience'];
    }

    // Apply rules
    return this.rules
      .filter(rule => rule.trigger(user, prefs))
      .sort((a, b) => a.priority - b.priority)
      .map(rule => rule.action);
  }

  private async getUserPreferences(userId: string): Promise<UserPreferences> {
    const { data } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    return data || this.getDefaultPreferences();
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      role: 'worker',
      personalization_consent: false,
      analytics_consent: false,
      contracts_count: 0,
      pending_contracts: 0,
      device_type: 'mobile',
    };
  }
}

// React Hook for easy usage
export function usePersonalization() {
  const { user } = useAuth();
  const [actions, setActions] = useState<PersonalizationAction[]>([]);

  useEffect(() => {
    if (!user) return;

    const engine = new PersonalizationEngine();
    engine.apply(user).then(setActions);
  }, [user]);

  return actions;
}
```

---

## 🔒 Category 3: Security & Compliance (Week 3-4)

### 3.1 Content Security Policy (CSP)

**Source**: `nextjs-security-audit.md`

**Implementation**:
```typescript
// vite.config.ts or next.config.ts
export default defineConfig({
  // For Vite: Use vite-plugin-csp
  plugins: [
    csp({
      policies: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'https:'],
        'connect-src': ["'self'", 'https://api.supabase.co', 'https://*.supabase.co'],
        'frame-src': ["'none'"],
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
        'frame-ancestors': ["'none'"],
        'upgrade-insecure-requests': [],
      },
    }),
  ],
});
```

---

### 3.2 Input Validation & Sanitization

**Source**: `nextjs-security-audit.md`

**Implementation**:
```typescript
// src/lib/security/validation.ts
import DOMPurify from 'dompurify';

export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

export function validateContractInput(data: ContractInput): ValidationResult {
  const errors: string[] = [];

  // Validate required fields
  if (!data.title || data.title.length > 200) {
    errors.push('Title must be 1-200 characters');
  }

  if (!data.worker_name || data.worker_name.length > 100) {
    errors.push('Worker name must be 1-100 characters');
  }

  // Sanitize free-text fields
  const sanitized = {
    ...data,
    title: sanitizeInput(data.title),
    worker_name: sanitizeInput(data.worker_name),
    description: sanitizeInput(data.description || ''),
  };

  return {
    valid: errors.length === 0,
    errors,
    sanitized,
  };
}

// Usage in contract creation
export async function createContract(data: ContractInput) {
  const validation = validateContractInput(data);

  if (!validation.valid) {
    throw new ValidationError(validation.errors);
  }

  return supabase.from('contracts').insert(validation.sanitized);
}
```

---

### 3.3 Rate Limiting

**Source**: `load-balancing-scalability.md`

**Edge Function Implementation**:
```typescript
// supabase/functions/rate-limit/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const rateLimits = new Map<string, { count: number; resetTime: number }>();

serve(async (req) => {
  const userId = req.headers.get('user-id');
  const clientId = req.headers.get('client-id');
  const identifier = userId || clientId || req.headers.get('ip')!;

  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 100;

  let rateLimit = rateLimits.get(identifier);

  if (!rateLimit || now > rateLimit.resetTime) {
    rateLimit = { count: 0, resetTime: now + windowMs };
    rateLimits.set(identifier, rateLimit);
  }

  rateLimit.count++;

  if (rateLimit.count > maxRequests) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded' }),
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  // Process request
  return await processRequest(req);
});
```

---

## ⚡ Category 4: Performance Optimization (Week 4-6)

### 4.1 Implement ISR for Static Pages

**Source**: `serverless-rendering-patterns.md`

**Applicable Pages**:
- Privacy Policy
- Terms of Service
- Public contract templates
- Help/FAQ pages

**Implementation** (if migrating to Next.js):
```typescript
// app/privacy/page.tsx
export const revalidate = 86400; // Revalidate every 24 hours

export async function generateStaticParams() {
  return [{}]; // Static page
}

export default async function PrivacyPage() {
  const content = await getPrivacyPolicy();
  return <div>{content}</div>;
}
```

**Current Workaround** (Vite/React):
```typescript
// Cache static content in localStorage
const STATIC_CACHE_KEY = 'static_content';
const CACHE_DURATION = 86400 * 1000; // 24 hours

export function useStaticContent(key: string) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = localStorage.getItem(`${STATIC_CACHE_KEY}_${key}`);

    if (cached) {
      const { data, timestamp } = JSON.parse(cached);

      if (Date.now() - timestamp < CACHE_DURATION) {
        setContent(data);
        setLoading(false);
        return;
      }
    }

    // Fetch fresh content
    fetchStaticContent(key).then(data => {
      setContent(data);
      localStorage.setItem(
        `${STATIC_CACHE_KEY}_${key}`,
        JSON.stringify({ data, timestamp: Date.now() })
      );
      setLoading(false);
    });
  }, [key]);

  return { content, loading };
}
```

---

### 4.2 Optimize Edge Functions

**Source**: `supabase-edge-optimization.md`

**Strategies**:
1. Use persistent storage for caching
2. Lazy load dependencies
3. Minimize cold start impact

**Implementation**:
```typescript
// supabase/functions/contracts-view/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Lazy load Supabase client
let supabaseClient: SupabaseClient;

async function getSupabaseClient() {
  if (!supabaseClient) {
    const { createClient } = await import('@supabase/supabase-js@2');
    supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );
  }
  return supabaseClient;
}

// Cache frequently accessed data
const cache = new Map<string, { data: any; expiry: number }>();

serve(async (req) => {
  const contractId = new URL(req.url).searchParams.get('id');

  // Check cache first
  const cached = cache.get(contractId!);
  if (cached && Date.now() < cached.expiry) {
    return new Response(JSON.stringify(cached.data), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Fetch from database
  const supabase = await getSupabaseClient();
  const { data } = await supabase
    .from('contracts')
    .select('*')
    .eq('id', contractId)
    .single();

  // Cache for 5 minutes
  cache.set(contractId!, { data, expiry: Date.now() + 300000 });

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

---

### 4.3 CDN Caching Strategy

**Source**: `load-balancing-scalability.md`

**Implementation**:
```typescript
// public/_headers (for Cloudflare/Pages)
/*
  /*
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin

  /assets/*
  Cache-Control: public, max-age=31536000, immutable

  /fonts/*
  Cache-Control: public, max-age=31536000, immutable

  /images/*
  Cache-Control: public, max-age=2592000

  /*.html
  Cache-Control: public, max-age=0, must-revalidate
*/

// public/_redirects (for single-page app)
/*  /index.html  200
```

---

## 🧪 Category 5: Testing & Quality (Week 6-8)

### 5.1 E2E Testing with Playwright

**Source**: `e2e-testing-pyramid-playwright.md`

**Setup**:
```bash
npm install -D @playwright/test
npx playwright install
```

**Configuration**:
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' },
    },
    {
      name: 'webkit',
      use: { browserName: 'webkit' },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

**Sample Test**:
```typescript
// tests/e2e/contract-signing.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Contract Signing Flow', () => {
  test('employer can create contract', async ({ page }) => {
    await page.goto('/employer/dashboard');

    await page.click('text=Create Contract');
    await page.fill('[name="title"]', 'Test Contract');
    await page.fill('[name="worker_name"]', 'John Doe');
    await page.fill('[name="worker_email"]', 'john@example.com');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/employer\/contracts\/.+/);
    await expect(page.locator('h1')).toContainText('Test Contract');
  });

  test('worker can sign contract', async ({ page }) => {
    const contractId = 'test-contract-id';
    await page.goto(`/worker/contract/${contractId}`);

    await page.click('text=View Contract');
    await page.waitForSelector('[data-testid="signature-pad"]');

    // Draw signature
    await page.locator('[data-testid="signature-pad"]').click({ position: { x: 100, y: 100 } });
    await page.locator('[data-testid="signature-pad"]').click({ position: { x: 200, y: 150 } });

    await page.click('text=Sign Contract');

    await expect(page.locator('text=Contract signed successfully')).toBeVisible();
  });
});
```

---

### 5.2 Visual Regression Testing

**Source**: `e2e-testing-pyramid-playwright.md`

**Configuration**:
```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
```

**Test**:
```typescript
// tests/e2e/visual.spec.ts
import { test, expect } from '@playwright/test';

test('contract form visual regression', async ({ page }) => {
  await page.goto('/employer/contract-form');

  // Wait for page to fully load
  await page.waitForLoadState('networkidle');

  // Take screenshot
  await page.screenshot({
    path: 'screenshots/contract-form.png',
    fullPage: true,
  });

  // Compare with baseline (if using playwright-visual)
  // Or use a dedicated visual regression tool
});
```

---

## 🚀 Category 6: Granite Migration (Month 2-3)

### 6.1 Assess Granite Readiness

**Source**: `toss-miniapp-launch-complete.md`

**Checklist**:
- [ ] App works as standalone web app
- [ ] All features tested on mobile devices
- [ ] Bundle size under 200KB (current Granite target)
- [ ] No dependencies incompatible with React Native
- [ ] Toss Developer Center access secured

**Preparation Steps**:
1. Audit dependencies for React Native compatibility
2. Replace web-only dependencies with RN-compatible alternatives
3. Optimize bundle size
4. Test on iOS and Android devices

---

### 6.2 Granite Project Setup

**Commands**:
```bash
# Create Granite project
npx create-granite-app@latest toss-contract-granite
cd toss-contract-granite

# Migrate React components
# - Copy src/ to granite/src/
# - Update imports for React Native
# - Replace web APIs with RN equivalents
```

**Key Changes**:
- `div` → `View`
- `span` → `Text`
- `input` → `TextInput`
- CSS → StyleSheet
- Web APIs → React Native APIs

---

### 6.3 Deployment Pipeline

**Source**: `granite-production-deployment.md`

**Infrastructure**:
```typescript
// Pulumi setup for CDN
import { ReactNativeBundleCDN } from '@granite-js/pulumi-aws';

const cdn = new ReactNativeBundleCDN('toss-contract-cdn', {
  bucketName: 'toss-contract-bundles',
  region: 'ap-northeast-2', // Seoul
});
```

**Deployment Command**:
```bash
npm run granite build
npm run granite-forge deploy --bucket toss-contract-bundles
```

---

## 📊 Implementation Priority Matrix

### Priority 1 (Week 1-2) - Immediate Impact
- ✅ Enable React Compiler
- ✅ Add user preferences table
- ✅ Implement consent management
- ✅ Add security headers

### Priority 2 (Week 3-4) - Foundation
- ✅ Role detection system
- ✅ Personalization engine
- ✅ Input validation
- ✅ Rate limiting

### Priority 3 (Week 5-8) - Quality
- ⏳ E2E testing with Playwright
- ⏳ Visual regression testing
- ⏳ Performance monitoring
- ⏳ Error tracking refinement

### Priority 4 (Month 2-3) - Growth
- ⏳ Vite 6 upgrade
- ⏳ Edge function optimization
- ⏳ CDN caching
- ⏳ Granite migration preparation

---

## 📝 Checklist

### Week 1
- [ ] Enable React Compiler
- [ ] Remove manual memoization
- [ ] Test performance improvements
- [ ] Add security headers

### Week 2
- [ ] Create user_preferences migration
- [ ] Implement consent manager
- [ ] Add role detection
- [ ] Test onboarding flow

### Week 3-4
- [ ] Implement personalization engine
- [ ] Add input validation
- [ ] Set up rate limiting
- [ ] Test personalization features

### Week 5-8
- [ ] Set up Playwright
- [ ] Write E2E tests for critical paths
- [ ] Add visual regression tests
- [ ] Set up performance monitoring

### Month 2-3
- [ ] Audit dependencies for Granite
- [ ] Optimize bundle size
- [ ] Set up Pulumi infrastructure
- [ ] Begin Granite migration

---

**Last Updated**: 2026-07-04
**Next Review**: After Phase 1 completion (Week 2)
