# Research Report: TypeScript E2E Testing Patterns

**Team**: Research Team (insane-search + fact-checking)
**Date**: 2026-07-04
**Version**: 1.0
**Research Duration**: 5 minutes

---

## Executive Summary

This research investigates TypeScript E2E testing patterns, focusing on Cucumber BDD integration, Jest patterns, and contract testing approaches. Key findings reveal that Cucumber + Playwright + TypeScript provides excellent type-safe BDD testing, with production-grade architectures supporting scalability and maintainability.

---

## Research Questions

1. How to implement Cucumber BDD with TypeScript and Playwright?
2. What are the testing patterns for contract applications?
3. How to integrate Jest with E2E testing?

---

## Methodology

**Approach**: Multi-source web research focusing on TypeScript testing patterns
**Sources Analyzed**: 8+ sources including Medium, ReadThis, GitHub repositories
**Timeline**: 5 minutes

---

## Key Findings

### Finding 1: Cucumber + Playwright + TypeScript Setup
**Confidence**: High
**Sources**: [Medium BDD Guide](https://medium.com/@english87/modern-e2e-testing-with-cucumber-playwright-typescript-7a7ab6cd3d54)

**Project Structure**:

```
tests/
├── features/
│   ├── contract-signing.feature
│   └── employer-workflow.feature
├── step-definitions/
│   ├── contract.steps.ts
│   └── common.steps.ts
├── support/
│   ├── world.ts
│   └── hooks.ts
└── reports/
    └── json/
```

**Installation**:

```bash
npm install --save-dev @cucumber/cucumber @cucumber/gherkin @cucumber/messages
npm install --save-dev @playwright/test
npm install --save-dev ts-node
npm install --save-dev cucumber-html-reporter
```

**Configuration**:

```typescript
// cucumber.ts
import { CucumberExpressionWorld } from '@cucumber/cucumber';
import { createFormatter } from '@cucumber/cucumber';
import { PlaywrightFluent } from 'playwright-fluent';

const formatter = createFormatter();

const world = {
  // Playwright instance
  page: null,

  // Test context
  testContext: {},

  // Custom methods
  goto: async function(url: string) {
    await this.page.goto(url);
  }
};

// Set up hooks
const { BeforeAll, Before, After, AfterAll } = require('@cucumber/cucumber');

BeforeAll(async function() {
  // Initialize Playwright
  const { chromium } = require('playwright');
  const browser = await chromium.launch({ headless: true });
  world.page = await browser.newPage();
});

Before(function({ pickle }) {
  // Set up test data
  world.testContext.scenarioName = pickle.name;
});

After(async function() {
  // Clean up after each scenario
  // Clear cookies, local storage, etc.
});

AfterAll(async function() {
  // Close browser
  if (world.page) {
    await world.page.context().close();
  }
});
```

---

### Finding 2: BDD Feature Files for Contract App
**Confidence**: High
**Sources**: BDD best practices documentation

**Feature File Example**:

```gherkin
# features/contract-signing.feature
Feature: Contract Signing
  As an employer
  I want to create and send contracts
  So that workers can sign them electronically

  Scenario: Employer creates employment contract
    Given I am logged in as an employer
    And I navigate to the contracts page
    When I click "Create Contract"
    And I fill in the contract details:
      | Field        | Value                  |
      | Title        | Employment Contract    |
      | Worker Name  | John Doe               |
      | Worker Email | john@example.com       |
      | Start Date   | 2026-07-04            |
    And I preview the contract
    And I send the contract
    Then I should see a success message
    And the contract should have status "pending"

  Scenario: Worker signs contract via email link
    Given a contract was sent to "john@example.com"
    When I click the email link
    And I sign the contract with my signature
    Then the contract should be marked as "signed"
    And both parties should receive confirmation

  Scenario: Contract creation fails with network error
    Given I am logged in as an employer
    And I navigate to the contracts page
    And I have a network connection
    When I click "Create Contract"
    And the network connection fails
    Then I should see an error message
    And I should be able to retry
```

---

### Finding 3: TypeScript Step Definitions
**Confidence**: High
**Sources**: [ReadThis TypeScript Cucumber](https://readthis.io/blog/typescript-cucumber-e2e-architecture)

**Type-Safe Step Definitions**:

```typescript
// step-definitions/contract.steps.ts
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ContractPage } from '../pages/ContractPage';

// Type-safe world
interface World {
  page?: Page;
  contractPage?: ContractPage;
  contractData?: ContractData;
  testData?: TestData;
}

// Helper function
function getWorld(): World {
  return this as World;
}

// Given steps
Given('I am logged in as an employer', async function() {
  const world = getWorld();
  await world.page?.goto('/login');
  await world.page?.fill('[name="email"]', 'employer@example.com');
  await world.page?.fill('[name="password"]', 'password');
  await world.page?.click('[type="submit"]');
  await expect(world.page).toHaveURL('/dashboard');
});

Given('I navigate to the contracts page', async function() {
  const world = getWorld();
  await world.page?.goto('/employer/contracts');
  await expect(world.page?.locator('[data-testid="contract-list"]')).toBeVisible();
});

Given('a contract was sent to {string}', async function(email: string) {
  const world = getWorld();
  // Set up test data
  world.testData = {
    workerEmail: email,
    contractId: 'test-contract-123'
  };
});

// When steps
When('I click {string}', async function(buttonText: string) {
  const world = getWorld();
  await world.page?.click(`button:has-text("${buttonText}")`);
});

When('I fill in the contract details:', async function(dataTable) {
  const world = getWorld();
  const contractPage = new ContractPage(world.page!);

  for (const row of dataTable.rows()) {
    const [field, value] = row;
    await contractPage.fillField(field, value);
  }

  world.contractData = dataTable.hashes()[0];
});

When('I preview the contract', async function() {
  const world = getWorld();
  await world.contractPage?.preview();
});

When('I send the contract', async function() {
  const world = getWorld();
  await world.contractPage?.send();
});

When('I click the email link', async function() {
  const world = getWorld();
  // Navigate to contract signing page
  await world.page?.goto(`/worker/sign/${world.testData?.contractId}`);
});

When('I sign the contract with my signature', async function() {
  const world = getWorld();
  // Implement signature logic
  await world.page?.click('[data-testid="signature-pad"]');
  // ... signature implementation
  await world.page?.click('[data-testid="submit-signature"]');
});

When('the network connection fails', async function() {
  const world = getWorld();
  // Simulate network failure
  await world.page?.context().offline();
});

// Then steps
Then('I should see a success message', async function() {
  const world = getWorld();
  await expect(world.page?.locator('[data-testid="success-message"]')).toBeVisible();
});

Then('the contract should have status {string}', async function(status: string) {
  const world = getWorld();
  // Verify contract status in database or UI
  const contractStatus = await world.page?.locator('[data-testid="contract-status"]').textContent();
  expect(contractStatus).toBe(status);
});

Then('the contract should be marked as {string}', async function(status: string) {
  const world = getWorld();
  await world.page?.reload();
  const element = world.page?.locator(`[data-status="${status}"]`);
  await expect(element).toBeVisible();
});

Then('both parties should receive confirmation', async function() {
  const world = getWorld();
  // Verify email was sent (mock or API check)
  const confirmation = await world.page?.locator('[data-testid="confirmation-sent"]');
  await expect(confirmation).toBeVisible();
});

Then('I should see an error message', async function() {
  const world = getWorld();
  await expect(world.page?.locator('[data-testid="error-state"]')).toBeVisible();
});

Then('I should be able to retry', async function() {
  const world = getWorld();
  const retryButton = world.page?.locator('[data-testid="retry-button"]');
  await expect(retryButton).toBeVisible();
  await expect(retryButton).toBeEnabled();
});
```

---

### Finding 4: Production-Grade Architecture
**Confidence**: Medium
**Sources**: [ReadThis Architecture Guide](https://readthis.io/blog/typescript-cucumber-e2e-architecture)

**Scalable Project Structure**:

```
tests/
├── config/
│   ├── cucumber.ts
│   └── playwright.ts
├── features/
│   ├── contract-signing/
│   │   ├── contract-signing.feature
│   │   └── contract-signing.steps.ts
│   └── user-management/
│       ├── user-authentication.feature
│       └── user-authentication.steps.ts
├── pages/
│   ├── BasePage.ts
│   ├── ContractPage.ts
│   ├── LoginPage.ts
│   └── DashboardPage.ts
├── support/
│   ├── World.ts
│   ├── Hooks.ts
│   └── TestData.ts
├── utils/
│   ├── api-helpers.ts
│   ├── db-helpers.ts
│   └── test-data-generator.ts
└── reports/
    ├── json/
    └── html/
```

**World Object Pattern**:

```typescript
// support/World.ts
import { Page } from '@playwright/test';
import { ContractPage } from '../pages/ContractPage';
import { LoginPage } from '../pages/LoginPage';
import { TestData } from './TestData';

export class CucumberWorld {
  page?: Page;
  contractPage?: ContractPage;
  loginPage?: LoginPage;
  testData?: TestData;

  // Test context
  scenarioName?: string;
  tags?: string[];

  // Test data
  sharedData?: Map<string, any>;

  constructor() {
    this.sharedData = new Map();
  }

  async init() {
    const { chromium } = require('playwright');
    const browser = await chromium.launch({ headless: true });
    this.page = await browser.newPage();

    // Initialize page objects
    this.contractPage = new ContractPage(this.page);
    this.loginPage = new LoginPage(this.page);
  }

  async cleanup() {
    await this.page?.context().close();
  }

  set(key: string, value: any) {
    this.sharedData?.set(key, value);
  }

  get(key: string): any {
    return this.sharedData?.get(key);
  }
}
```

---

### Finding 5: CI/CD Integration
**Confidence**: Medium
**Sources**: CI/CD best practices documentation

**GitHub Actions Configuration**:

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          CI: true
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: cucumber-report
          path: tests/reports/html/

      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-screenshots
          path: tests/screenshots/
```

---

## Implementation Strategy

### Phase 1: Setup (Week 1)
1. Install Cucumber and Playwright
2. Create project structure
3. Set up TypeScript configuration
4. Create first feature file

### Phase 2: Step Definitions (Week 2)
1. Implement common steps
2. Create page objects
3. Add contract-specific steps
4. Set up test data helpers

### Phase 3: CI/CD Integration (Week 3)
1. Configure GitHub Actions
2. Set up reporting
3. Add screenshot upload
4. Configure test database

---

## Recommendations

Based on validated findings:

1. **Use Cucumber + Playwright**
   - Rationale: Type-safe BDD with excellent tooling
   - Trade-offs: More complex than pure Playwright

2. **Implement Page Object Model**
   - Rationale: Maintainable, reusable
   - Trade-offs: More code initially

3. **Use Custom World Object**
   - Rationale: Type-safe, extensible
   - Trade-offs: More setup complexity

4. **Generate Test Data Programmatically**
   - Rationale: Consistent, maintainable
   - Trade-offs: Additional code

5. **Integrate with CI/CD**
   - Rationale: Catch regressions early
   - Trade-offs: Additional infrastructure

---

## Trade-offs

| Approach | Pros | Cons |
|----------|------|------|
| **Cucumber BDD** | Readable, business-facing | More complex |
| **Pure Playwright** | Simple, fast | Less readable |
| **Page Object Model** | Maintainable | More code |
| **Inline Steps** | Quick to write | Hard to maintain |

---

## Sources

### Primary Sources
- [Modern E2E with Cucumber & Playwright](https://medium.com/@english87/modern-e2e-testing-with-cucumber-playwright-typescript-7a7ab6cd3d54)
- [TypeScript Cucumber Architecture](https://readthis.io/blog/typescript-cucumber-e2e-architecture)
- [Cucumber-Playwright Boilerplate](https://github.com/BurakVeziran/Cucumber-Playwright-Typescript-Boilerplate)
- [TypeScript Testing Patterns](https://appetizers.io/en/blog/typescript-testing-patterns-unit-integration-e2e-strategies/)

### Secondary Sources
- [Cucumber Testable Architecture](https://cucumber.io/docs/guides/testable-architecture)
- [Playwright + Cucumber Best](https://dev.to/akdevcraft/playwright-and-cucumber-are-the-best-tools-for-end-to-end-testing-a28)

---

## Limitations & Future Research

### Limitations
- Cucumber adds complexity
- Step definitions can become verbose
- Type safety requires discipline

### Confidence Gaps
- **Medium Confidence**: Optimal feature file organization (varies by team)
- **Medium Confidence**: Test data management (requires implementation)

### Future Research
- Implement actual Cucumber tests
- Measure test execution time
- Research parallel test execution
- Study test data factory patterns

---

**Report Generated**: 2026-07-04 05:45 KST
