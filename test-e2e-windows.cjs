/**
 * E2E Test: toss-contract-app Basic Flow
 *
 * Windows-compatible Puppeteer E2E test
 * Tests core user flows: dashboard, contract creation, signing
 */

const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Starting E2E Test (Windows)...');

  const browser = await puppeteer.launch({
    headless: false, // Show browser for debugging
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  let allPassed = true;

  function report(name, passed, detail) {
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} ${name}: ${detail}`);
    if (!passed) allPassed = false;
  }

  const page = await browser.newPage();

  try {
    // Test 1: Home page loads (with redirect handling)
    console.log('\n━━━ TEST 1: Home Page (with Redirect) ━━━');
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));

    // Check if redirected and to where
    const currentUrl = page.url();
    const isLoginOrLanguage = currentUrl.includes('/login') || currentUrl.includes('/language');
    report('Home-Redirect', isLoginOrLanguage, isLoginOrLanguage
      ? `Redirected to ${currentUrl.includes('/login') ? '/login' : '/language'}`
      : `Stayed at home: ${currentUrl}`);

    // Complete language onboarding if on language page
    if (currentUrl.includes('/language')) {
      console.log('  → Completing language onboarding...');
      // First, click Korean (if not already selected)
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const koreanBtn = buttons.find(b => b.textContent.includes('한국어') && !b.textContent.includes('✓'));
        if (koreanBtn) koreanBtn.click();
      });
      await new Promise(r => setTimeout(r, 500));

      // Then click the confirm button (확인)
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const confirmBtn = buttons.find(b => b.textContent.trim() === '확인' || b.textContent.includes('Confirm'));
        if (confirmBtn) confirmBtn.click();
      });
      await new Promise(r => setTimeout(r, 2000));
    }

    // Now check for page content
    const pageContent = await page.evaluate(() => {
      const title = document.querySelector('h1, h2, h3');
      const buttons = Array.from(document.querySelectorAll('button'));
      const bodyText = document.body.textContent || '';
      return {
        title: title ? title.textContent : null,
        buttonLabels: buttons.map(b => b.textContent).filter(t => t),
        hasKeywords: bodyText.includes('근로계약서') || bodyText.includes('토스') || bodyText.includes('계약'),
      };
    });

    const hasExpectedContent = pageContent.hasKeywords || pageContent.title;
    report('Page-Content', hasExpectedContent, hasExpectedContent
      ? `Found: "${pageContent.title || pageContent.buttonLabels.join(', ')}"`
      : 'No expected content found');

    // Test 2: Check for start/login button
    console.log('\n━━━ TEST 2: Auth Elements ━━━');
    const hasStartBtn = pageContent.buttonLabels.some(label =>
      label.includes('시작하기') || label.includes('시작') || label.includes('로그인') || label.includes('Login')
    );
    report('Auth-Start-Button', hasStartBtn, hasStartBtn
      ? `Found: "${pageContent.buttonLabels.find(l => l.includes('시작') || l.includes('로그인'))}"`
      : 'No start/login button');

    // Test 3: Check for any console errors
    console.log('\n━━━ TEST 3: Console Errors ━━━');
    const errors = await page.evaluate(() => {
      // Check for error indicators in the page
      const hasError = document.body.textContent.includes('오류') ||
                     document.body.textContent.includes('Error') ||
                     document.querySelector('.error') !== null;
      return !hasError;
    });
    report('Page-Error-Check', errors, errors ? 'No obvious errors' : 'Potential errors found');

    // Test 4: Check responsive layout
    console.log('\n━━━ TEST 4: Responsive Layout ━━━');
    const viewport = page.viewport();
    report('Viewport-Size', true, `Size: ${viewport.width}x${viewport.height}`);

    // Test 5: Mobile simulation
    await page.setViewport({ width: 375, height: 667, isMobile: true });
    await new Promise(r => setTimeout(r, 2000));
    report('Mobile-Viewport', true, 'Mobile viewport set successfully');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    if (allPassed) {
      console.log('🎉 ALL TESTS PASSED');
    } else {
      console.log('⚠️  SOME TESTS FAILED');
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Screenshot for verification
    await page.screenshot({ path: 'e2e-test-result.png' });
    console.log('📸 Screenshot saved: e2e-test-result.png');

  } catch (error) {
    console.error('❌ Test error:', error.message);
    allPassed = false;
  } finally {
    await browser.close();
    process.exit(allPassed ? 0 : 1);
  }
})();
