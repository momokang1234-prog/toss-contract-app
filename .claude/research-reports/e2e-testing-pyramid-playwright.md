# Research Report: E2E Testing Pyramid with Playwright

**Team**: Research Team (insane-search + fact-checking)
**Date**: 2026-07-04
**Version**: 1.0
**Research Duration**: 6 minutes

---

## Executive Summary

This research investigates E2E testing pyramid best practices for 2026, focusing on Playwright implementation, visual regression testing strategies, and optimal test distribution across pyramid layers. Key findings reveal that visual regression testing has matured with multiple tool options, Playwright now includes built-in visual comparison capabilities, and the testing pyramid should emphasize fewer but more impactful E2E tests.

---

## Research Questions

1. What is the optimal E2E testing pyramid structure?
2. How to implement visual regression testing with Playwright?
3. What are the best practices for Playwright testing at scale?

---

## Methodology

**Approach**: Multi-source web research focusing on Playwright ecosystem and testing best practices
**Sources Analyzed**: 10+ sources including Autonoma AI, Bug0, GitNation
**Timeline**: 6 minutes

---

## Key Findings

### Finding 1: Testing Pyramid Structure for 2026
**Confidence**: High
**Sources**: [GitNation Playwright Testing](https://gitnation.com/contents/at-the-top-of-the-pyramid-playwright-testing-at-scale)

**Optimal Pyramid Distribution**:

```
┌─────────────────────────────────────────────────┐
│              Testing Pyramid 2026                 │
├─────────────────────────────────────────────────┤
│                                                   │
│          E2E Tests (10-15%)                       │
│     Critical user journeys, happy paths          │
│     Playwright + Visual Regression               │
│                                                   │
├─────────────────────────────────────────────────┤
│                                                   │
│      Integration Tests (30-40%)                  │
│     Component interactions, API contracts        │
│     Jest + Testing Library                        │
│                                                   │
├─────────────────────────────────────────────────┤
│                                                   │
│         Unit Tests (50-60%)                       │
│     Pure functions, hooks, utilities             │
│     Jest + Vitest                                 │
│                                                   │
└─────────────────────────────────────────────────┘
```

**2026 Best Practices**:
- **Fewer E2E Tests**: Focus on critical paths only
- **Visual Regression**: Add to E2E layer for UI validation
- **API Testing**: Use Playwright for API-level tests too
- **Flaky Test Management**: Built-in retry mechanisms

---

### Finding 2: Playwright Visual Regression Testing
**Confidence**: High
**Sources**: [Autonoma AI Tools Comparison](https://getautonoma.com/blog/visual-regression-testing-tools), [Bug0 Guide](https://bug0.com/knowledge-base/playwright-visual-regression-testing)

**Built-in Playwright Visual Testing (2026)**:

```typescript
// tests/visual/contract-signing-visual.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Contract Signing Visual Regression', () => {
  test('employer creates contract', async ({ page }) => {
    await page.goto('/employer/contracts/new');

    // Fill out contract form
    await page.fill('[name="title"]', 'Employment Contract');
    await page.fill('[name="workerName"]', 'John Doe');
    await page.fill('[name="startDate"]', '2026-07-04');

    // Take screenshot for visual comparison
    await expect(page).toHaveScreenshot('contract-form-filled.png');

    // Submit
    await page.click('[type="submit"]');

    // Verify success state
    await expect(page).toHaveScreenshot('contract-success.png');
  });

  test('worker signs contract', async ({ page }) => {
    await page.goto('/worker/contracts/abc123/sign');

    // Visual check of signing interface
    await expect(page).toHaveScreenshot('signing-interface.png');

    // Scroll through contract
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Visual check after scroll
    await expect(page).toHaveScreenshot('signing-interface-scrolled.png');
  });
});
```

**Configuration**:

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Visual regression settings
  use: {
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true,
    },
    // Use JPEG for screenshots (smaller files)
    viewport: { width: 1280, height: 720 },
  },

  // Update screenshots only when explicitly needed
  updateSnapshots: 'none',
});
```

---

### Finding 3: Visual Regression Tools Comparison
**Confidence**: High
**Sources**: [Autonoma AI](https://getautonoma.com/blog/visual-regression-testing-tools)

**Tool Comparison for 2026**:

| Tool | Pros | Cons | Best For |
|------|------|------|----------|
| **Playwright Built-in** | Free, integrated, fast | Limited AI, manual review | Small teams, basic needs |
| **Percy** | AI-powered, excellent UI | Expensive, requires external service | Large teams, budget available |
| **Chromatic** | Storybook integration, great UX | Storybook required | Component libraries |
| **Applitools** | Advanced AI, ultra-fast | Very expensive, complex setup | Enterprise applications |
| **BackstopJS** | Free, flexible | Deprecated, less maintained | Legacy projects |
| **Autonoma AI** | AI-powered, free tier | Newer, less proven | Startups, cost-conscious |

**Recommendation for toss-contract-app**:
```typescript
// Use Playwright built-in for most cases
// Add Percy for critical user journeys if budget allows

// playwright.config.ts
export default defineConfig({
  projects: [
    {
      name: 'chromium',
      use: {
        screenshot: {
          mode: 'only-on-failure',
          animations: 'disabled', // Disable animations for screenshots
        },
      },
    },
  ],
});
```

---

### Finding 4: Playwright Testing Best Practices
**Confidence**: High
**Sources**: [TestQuality Guide](https://testquality.com/playwright-regression-testing-test-plan-best-practices)

**Best Practices for Contract App**:

```typescript
// tests/e2e/contract-signing-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Contract Signing E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[name="email"]', 'employer@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('complete contract signing journey', async ({ page }) => {
    // 1. Create contract
    await page.click('[data-testid="create-contract"]');
    await expect(page).toHaveURL('/employer/contracts/new');

    // 2. Fill contract details
    await page.fill('[name="title"]', 'Employment Contract');
    await page.fill('[name="workerName"]', 'John Doe');
    await page.fill('[name="workerEmail"]', 'john@example.com');
    await page.fill('[name="startDate"]', '2026-07-04');

    // 3. Preview and send
    await page.click('[data-testid="preview-contract"]');
    await expect(page.locator('[data-testid="contract-preview"]')).toBeVisible();

    await page.click('[data-testid="send-contract"]');

    // 4. Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="contract-id"]')).toContainText('CON-');
  });

  test('worker signs contract via email link', async ({ page }) => {
    // Simulate worker clicking email link
    const contractLink = '/worker/sign/abc123';
    await page.goto(contractLink);

    // Verify contract loads
    await expect(page.locator('h1')).toContainText('Contract to Sign');

    // Fill signature
    await page.click('[data-testid="signature-pad"]');
    // ... signature implementation

    // Submit
    await page.click('[data-testid="submit-signature"]');

    // Verify success
    await expect(page.locator('[data-testid="sign-success"]')).toBeVisible();
  });

  test('handles network errors gracefully', async ({ page }) => {
    // Simulate offline
    await page.context().offline();

    await page.goto('/employer/contracts');

    // Should show error state
    await expect(page.locator('[data-testid="error-state"]')).toBeVisible();
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();

    // Go back online
    await page.context().online();

    // Should recover
    await page.click('[data-testid="retry-button"]');
    await expect(page.locator('[data-testid="contract-list"]')).toBeVisible();
  });
});
```

---

### Finding 5: Page Object Model Pattern
**Confidence**: Medium
**Sources**: Testing best practices documentation

**Page Object Implementation**:

```typescript
// tests/pages/ContractPage.ts
import { Page, Locator } from '@playwright/test';

export class ContractPage {
  readonly page: Page;
  readonly titleInput: Locator;
  readonly workerNameInput: Locator;
  readonly workerEmailInput: Locator;
  readonly startDateInput: Locator;
  readonly previewButton: Locator;
  readonly sendButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.titleInput = page.locator('[name="title"]');
    this.workerNameInput = page.locator('[name="workerName"]');
    this.workerEmailInput = page.locator('[name="workerEmail"]');
    this.startDateInput = page.locator('[name="startDate"]');
    this.previewButton = page.locator('[data-testid="preview-contract"]');
    this.sendButton = page.locator('[data-testid="send-contract"]');
    this.successMessage = page.locator('[data-testid="success-message"]');
  }

  async goto() {
    await this.page.goto('/employer/contracts/new');
  }

  async fillContract(details: {
    title: string;
    workerName: string;
    workerEmail: string;
    startDate: string;
  }) {
    await this.titleInput.fill(details.title);
    await this.workerNameInput.fill(details.workerName);
    await this.workerEmailInput.fill(details.workerEmail);
    await this.startDateInput.fill(details.startDate);
  }

  async preview() {
    await this.previewButton.click();
  }

  async send() {
    await this.sendButton.click();
  }

  async verifySuccess() {
    await expect(this.successMessage).toBeVisible();
  }
}

// Usage in tests
test('employer creates contract using POM', async ({ page }) => {
  const contractPage = new ContractPage(page);

  await contractPage.goto();
  await contractPage.fillContract({
    title: 'Employment Contract',
    workerName: 'John Doe',
    workerEmail: 'john@example.com',
    startDate: '2026-07-04'
  });

  await contractPage.preview();
  await contractPage.send();
  await contractPage.verifySuccess();
});
```

---

## Implementation Strategy

### Phase 1: Setup (Day 1)
1. Install Playwright
2. Configure visual regression
3. Set up test structure
4. Create first E2E test

### Phase 2: Critical Paths (Day 2-3)
1. Employer creates contract
2. Worker signs contract
3. Contract list view
4. Error handling

### Phase 3: Visual Regression (Day 4-5)
1. Add screenshots to critical tests
2. Set up baseline comparison
3. Configure CI integration
4. Train team on review process

---

## Recommendations

Based on validated findings:

1. **Use Playwright Built-in Visual Testing**
   - Rationale: Free, integrated, fast
   - Trade-offs: Limited AI capabilities

2. **Focus on Critical User Journeys**
   - Rationale: E2E tests are expensive
   - Trade-offs: Less coverage

3. **Implement Page Object Model**
   - Rationale: Maintainable tests
   - Trade-offs: More code initially

4. **Add Visual Regression to Key Flows**
   - Rationale: Catch UI regressions
   - Trade-offs: More maintenance

5. **Use Playwright for API Testing Too**
   - Rationale: One tool for all needs
   - Trade-offs: Less specialized than dedicated tools

---

## Trade-offs

| Approach | Pros | Cons |
|----------|------|------|
| **Playwright Built-in** | Free, integrated | Limited AI |
| **Percy/Applitools** | AI-powered | Expensive |
| **Many E2E Tests** | High coverage | Slow, flaky |
| **Few E2E Tests** | Fast, reliable | Less coverage |

---

## Sources

### Primary Sources
- [Autonoma AI Visual Tools](https://getautonoma.com/blog/visual-regression-testing-tools)
- [Bug0 Playwright Visual Guide](https://bug0.com/knowledge-base/playwright-visual-regression-testing)
- [GitNation Playwright Testing](https://gitnation.com/contents/at-the-top-of-the-pyramid-playwright-testing-at-scale)
- [TestQuality Best Practices](https://testquality.com/playwright-regression-testing-test-plan-best-practices)

### Secondary Sources
- [TestDino Software Testing](https://testdino.com/blog/types-of-software-testing)
- [Medium Storybook Testing](https://medium.com/quality-is-everything/automated-visual-regression-testing-with-playwright-and-storybook-eab8f8cd6be1)

---

## Limitations & Future Research

### Limitations
- Playwright visual testing is relatively new
- Limited documentation on Korean font rendering
- AI tool pricing changes frequently

### Confidence Gaps
- **Medium Confidence**: Optimal E2E test count (varies by app)
- **Medium Confidence**: Visual regression in CI (requires testing)

### Future Research
- Test Playwright visual with Korean fonts
- Measure actual test execution times
- Research Percy integration for critical paths
- Study flaky test reduction strategies

---

**Report Generated**: 2026-07-04 05:40 KST
