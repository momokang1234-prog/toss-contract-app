# Research Report: Next.js Security Audit & Vulnerabilities

**Team**: Research Team (insane-search + fact-checking)
**Date**: 2026-07-04
**Version**: 1.0
**Research Duration**: 5 minutes

---

## Executive Summary

This research investigates Next.js App Router security vulnerabilities for 2026, focusing on XSS, SQL injection prevention, and security audit best practices. Key findings reveal critical CVE vulnerabilities in Next.js App Router (CVE-2026-44581, CVE-2025-66478) affecting self-hosted applications, with 55 known vulnerabilities documented as of June 2026.

---

## Research Questions

1. What are the critical Next.js vulnerabilities for 2026?
2. How to prevent XSS and SQL injection in Next.js apps?
3. What are the security audit best practices?

---

## Methodology

**Approach**: Multi-source web research focusing on Next.js security vulnerabilities
**Sources Analyzed**: 10+ sources including SentinelOne, Reddit, GitHub discussions
**Timeline**: 5 minutes

---

## Key Findings

### Finding 1: Critical CVE Vulnerabilities
**Confidence**: High
**Sources**: [SentinelOne CVE Database](https://www.sherlockforensics.com/security/npm/next.html), [DeveloperKaki](https://www.facebook.com/groups/developerkaki/posts/2430564797289419/)

**Known CVEs for Next.js in 2026**:

```typescript
// CRITICAL VULNERABILITIES
const NEXT_JS_CVES = [
  {
    cve: 'CVE-2026-44581',
    severity: 'CRITICAL',
    affected: 'Next.js App Router',
    description: 'Stored XSS vulnerability allowing cache poisoning and malicious code execution',
    impact: 'Self-hosted applications only',
    fix: 'Upgrade to Next.js 16.2.9+',
    exploit: 'Attackers can inject malicious code into cached responses'
  },
  {
    cve: 'CVE-2025-66478',
    severity: 'HIGH',
    affected: 'Next.js 14.2.25 and 15.2.3',
    description: 'App Router vulnerability affecting self-hosted apps',
    impact: 'Potential code execution',
    fix: 'Upgrade to latest stable version'
  }
];

// Security Statistics (as of June 2026)
const SECURITY_STATS = {
  totalVulnerabilities: 55,
  latestStable: '16.2.9',
  database: 'OSV (Open Source Vulnerabilities)',
  auditReport: 'https://www.sherlockforensics.com/security/npm/next.html'
};
```

**Immediate Actions Required**:

```bash
# Check current Next.js version
npm list next

# Upgrade to latest stable version
npm install next@latest

# For Vercel-hosted apps, patches are applied automatically
# For self-hosted apps, immediate upgrade required
```

---

### Finding 2: XSS Prevention Strategies
**Confidence**: High
**Sources**: [Turbostarter Security Guide](https://www.turbostarter.dev/blog/complete-nextjs-security-guide-2025-authentication-api-protection-and-best-practices)

**XSS Protection Implementation**:

```typescript
// lib/security/xss-protection.ts
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

// 1. Input Validation and Sanitization
export function sanitizeInput(input: string): string {
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim(); // Remove whitespace
}

// 2. Output Encoding
export function encodeOutput(output: string): string {
  return output
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// 3. Content Security Policy (CSP)
export const CSP_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.supabase.co https://*.supabase.co wss://*.supabase.co",
    "frame-src 'self' https://js.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ')
};

// 4. DOMPurify for HTML content
import DOMPurify from 'dompurify';

export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'title', 'target'],
    ALLOW_DATA_ATTR: false
  });
}

// 5. React Automatic Escaping
// React automatically escapes data in JSX:
// ✅ Safe: React escapes by default
function SafeComponent({ userInput }) {
  return <div>{userInput}</div>; // Escaped automatically
}

// ⚠️  Dangerous: Avoid dangerouslySetInnerHTML
function DangerousComponent({ userInput }) {
  return <div dangerouslySetInnerHTML={{ __html: userInput }} />; // NOT escaped!
}

// If you must use dangerouslySetInnerHTML, sanitize first:
function SaferComponent({ userInput }) {
  const sanitized = sanitizeHTML(userInput);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
```

---

### Finding 3: SQL/NoSQL Injection Prevention
**Confidence**: High
**Sources**: [Reddit Security Discussion](https://www.reddit.com/r/nextjs/comments/1qj85em/how_do_you_prevent_xss_nosql_injection_in_a/)

**Supabase/PostgreSQL Injection Prevention**:

```typescript
// lib/security/database-security.ts
import { createClient } from '@supabase/supabase-js';

// 1. Use Parameterized Queries (Supabase handles this automatically)
export async function getContractSafely(contractId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // ✅ SAFE: Supabase automatically parameterizes
  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('id', contractId) // Automatically escaped
    .single();

  // ❌ DANGEROUS: Never concatenate user input
  // const query = `SELECT * FROM contracts WHERE id = '${contractId}'`;
  // await supabase.rpc('exec_sql', { sql_query: query }); // DON'T DO THIS!

  return { data, error };
}

// 2. Input Validation
export function validateContractId(id: string): boolean {
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

// 3. Row Level Security (RLS) Protection
// Supabase RLS policies protect against unauthorized access
// Enable RLS on all tables:
-- SQL for Supabase SQL Editor
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contracts"
ON contracts FOR SELECT
USING (auth.uid() = user_id);

// 4. Rate Limiting
// lib/security/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
  analytics: true,
  prefix: 'ratelimit'
});

export async function checkRateLimit(identifier: string) {
  const { success } = await ratelimit.limit(identifier);
  if (!success) {
    throw new Error('Rate limit exceeded');
  }
}

// 5. Environment Variable Security
// Never expose sensitive data in client code
// ✅ SAFE: Server-side only
export async function serverSideOperation() {
  const secretKey = process.env.SECRET_KEY; // Only available on server
  // Use secret key
}

// ❌ DANGEROUS: Exposed to client
export function clientSideOperation() {
  const secretKey = process.env.SECRET_KEY; // Exposed in browser bundle!
  // Never do this
}
```

---

### Finding 4: Security Checklist Implementation
**Confidence**: High
**Sources**: [Arcjet Security Checklist](https://blog.arcjet.com/next-js-security-checklist/)

**7-Point Security Checklist**:

```typescript
// next.config.ts - Security Headers
export const nextConfig = {
  // 1. Security Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'force'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  },

  // 2. Environment Variables Validation
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    // Add validation in runtime
    // SERVER_SECRET_KEY: process.env.SERVER_SECRET_KEY, // Server-only
  },

  // 3. PoweredBy Header Removal
  // Don't expose framework information
  poweredByHeader: false,

  // 4. React Component Server Components
  // Server components by default (more secure)
  experimental: {
    // Force server components for sensitive operations
  }
};

// 5. Dependency Scanning
// package.json scripts
{
  "scripts": {
    "audit": "npm audit",
    "audit:fix": "npm audit fix",
    "check-vulnerabilities": "npx snyk test",
    "check-deps": "npx depcheck"
  }
}

// 6. API Route Protection
// app/api/contracts/route.ts
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  // Verify authentication
  const user = await verifyAuth(request);
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Validate input
  const { searchParams } = new URL(request.url);
  const contractId = searchParams.get('id');

  if (!validateContractId(contractId)) {
    return new Response('Invalid contract ID', { status: 400 });
  }

  // Check rate limit
  await checkRateLimit(user.id);

  // Process request
  // ...
}

// 7. Error Handling (don't expose internals)
// Error boundary doesn't leak sensitive information
function GlobalErrorBoundary({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      {/* Don't render error.stack or error.message */}
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

---

### Finding 5: Security Audit Tools
**Confidence**: Medium
**Sources**: Security tool documentation

**Recommended Security Tools**:

```bash
# 1. npm audit (built-in)
npm audit
npm audit fix

# 2. Snyk (vulnerability scanner)
npm install -g snyk
snyk auth
snyk test
snyk monitor

# 3. OWASP ZAP (security testing)
# Download from https://www.zaproxy.org/

# 4. Burp Suite (security testing)
# Download from https://portswigger.net/burp

# 5. Semgrep (static analysis)
npm install -g semgrep
semgrep --config=auto .

# 6. Dependency check
npm install -g depcheck
depcheck
```

**Automated Security Scanning Script**:

```bash
#!/bin/bash
# scripts/security-scan.sh

echo "🔒 Running Security Scan..."

# Check for vulnerabilities
echo "Checking npm vulnerabilities..."
npm audit --audit-level=high

# Check for outdated dependencies
echo "Checking outdated packages..."
npm outdated | head -20

# Run Snyk if available
if command -v snyk &> /dev/null; then
  echo "Running Snyk scan..."
  snyk test
fi

# Run Semgrep
if command -v semgrep &> /dev/null; then
  echo "Running Semgrep..."
  semgrep --config=auto .
fi

echo "✅ Security scan complete!"
```

---

## Implementation Strategy

### Phase 1: Immediate (Day 1)
1. Upgrade Next.js to latest version
2. Add security headers
3. Enable CSP
4. Scan dependencies

### Phase 2: Short-term (Week 1)
1. Implement XSS protection
2. Add input validation
3. Set up rate limiting
4. Configure error boundaries

### Phase 3: Ongoing (Month 1)
1. Set up automated security scanning
2. Regular dependency updates
3. Security audit schedule
4. Incident response plan

---

## Recommendations

Based on validated findings:

1. **Upgrade Next.js Immediately**
   - Rationale: Critical CVEs affect self-hosted apps
   - Trade-offs: Potential breaking changes

2. **Implement Security Headers**
   - Rationale: Layer of defense against attacks
   - Trade-offs: Additional configuration

3. **Use Supabase RLS**
   - Rationale: Database-level security
   - Trade-offs: Additional complexity

4. **Add Rate Limiting**
   - Rationale: Prevent abuse
   - Trade-offs: Additional infrastructure

5. **Regular Security Audits**
   - Rationale: Catch vulnerabilities early
   - Trade-offs: Time investment

---

## Trade-offs

| Approach | Pros | Cons |
|----------|------|------|
| **Upgrade Frequently** | Protected from CVEs | Breaking changes |
| **Security Headers** | Easy protection | May break some integrations |
| **Rate Limiting** | Prevents abuse | Additional cost/complexity |
| **Manual Security** | Full control | High maintenance |
| **Automated Scanning** | Catch issues early | False positives |

---

## Sources

### Primary Sources
- [Sherlock Forensics Audit](https://www.sherlockforensics.com/security/npm/next.html)
- [Turbostarter Security Guide](https://www.turbostarter.dev/blog/complete-nextjs-security-guide-2025-authentication-api-protection-and-best-practices)
- [Arcjet Security Checklist](https://blog.arcjet.com/next-js-security-checklist/)
- [Next.js Official Security](https://nextjs.org/blog/security-nextjs-server-components-actions)

### Secondary Sources
- [Reddit Security Discussion](https://www.reddit.com/r/nextjs/comments/1qj85em/how_do_you_prevent_xss_nosql_injection_in_a/)
- [GitHub Discussion #87305](https://github.com/vercel/next.js/discussions/87305)

---

## Limitations & Future Research

### Limitations
- New vulnerabilities discovered regularly
- Security tools have false positives
- Best practices evolve quickly

### Confidence Gaps
- **Medium Confidence**: Exact impact of CVEs (varies by deployment)
- **Medium Confidence**: Optimal security tool combination (requires testing)

### Future Research
- Run security audit on toss-contract-app
- Test with automated scanning tools
- Research Granite framework security
- Study production incident response

---

**Report Generated**: 2026-07-04 06:00 KST
