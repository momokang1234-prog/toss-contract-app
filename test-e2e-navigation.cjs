/**
 * Page Navigation E2E Test: toss-contract-app
 *
 * Tests navigation to different pages and verifies they render correctly
 * without requiring complex user interactions
 */

const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Starting Page Navigation E2E Test...');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  let allPassed = true;
  const bugs = [];
  const visitedPages = [];

  function report(name, passed, detail) {
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} ${name}: ${detail}`);
    if (!passed) {
      allPassed = false;
      bugs.push({ test: name, detail });
    }
  }

  const page = await browser.newPage();
  page.setDefaultTimeout(10000);

  try {
    // =========================================================================
    // TEST 1: Language Page
    // =========================================================================
    console.log('\n━━━ TEST 1: Language Page ━━━');

    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    const languageUrl = page.url();
    const isLanguagePage = languageUrl.includes('/language');
    report('Nav-Language-Page', isLanguagePage, `Navigated to: ${languageUrl}`);

    const languageContent = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const hasKorean = buttons.some(b => b.textContent.includes('한국어'));
      const hasConfirm = buttons.some(b => b.textContent.trim() === '확인');
      return { hasKorean, hasConfirm, buttonCount: buttons.length };
    });

    report('Language-Has-Options', languageContent.hasKorean, 'Korean option found');
    visitedPages.push({ name: 'Language', url: languageUrl });

    // Complete language onboarding for subsequent tests
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const confirmBtn = buttons.find(b => b.textContent.trim() === '확인');
      if (confirmBtn) confirmBtn.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    // =========================================================================
    // TEST 2: Login Page
    // =========================================================================
    console.log('\n━━━ TEST 2: Login Page ━━━');

    const loginUrl = page.url();
    const isLoginPage = loginUrl.includes('/login');
    report('Nav-Login-Page', isLoginPage, `Navigated to: ${loginUrl}`);

    const loginContent = await page.evaluate(() => {
      const title = document.querySelector('h1, h2, h3');
      const buttons = Array.from(document.querySelectorAll('button'));
      const listItems = document.querySelectorAll('[role="listitem"]');

      return {
        title: title ? title.textContent : null,
        buttonCount: buttons.length,
        featureCount: listItems.length,
        hasStartButton: buttons.some(b => b.textContent.includes('시작하기')),
      };
    });

    report('Login-Has-Title', !!loginContent.title, `Title: "${loginContent.title}"`);
    report('Login-Has-Features', loginContent.featureCount >= 3,
      `Found ${loginContent.featureCount} features`);
    visitedPages.push({ name: 'Login', url: loginUrl });

    // =========================================================================
    // TEST 3: 404 Page
    // =========================================================================
    console.log('\n━━━ TEST 3: 404 Page ━━━');

    await page.goto('http://localhost:5173/non-existent-page', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));

    const notFoundUrl = page.url();
    const notFoundContent = await page.evaluate(() => {
      const body = document.body.textContent || '';
      const hasNotFound = body.includes('404') || body.includes('찾을 수 없') ||
                         body.includes('없습니다') || body.includes('Not Found');
      const hasButton = document.querySelectorAll('button').length > 0;
      return { hasNotFound, hasButton, bodyText: body.substring(0, 100) };
    });

    report('NotFound-Rendered', notFoundContent.hasNotFound || notFoundContent.hasButton,
      notFoundContent.hasNotFound ? '404 message found' :
      notFoundContent.hasButton ? 'Has button (alternative 404)' :
      'Body: ' + notFoundContent.bodyText);
    visitedPages.push({ name: 'NotFound', url: notFoundUrl });

    // =========================================================================
    // TEST 4: Language Settings Page
    // =========================================================================
    console.log('\n━━━ TEST 4: Language Settings Page ━━━');

    await page.goto('http://localhost:5173/settings/language', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));

    const settingsUrl = page.url();
    const settingsContent = await page.evaluate(() => {
      const title = document.querySelector('h1, h2, h3');
      const buttons = Array.from(document.querySelectorAll('button'));

      return {
        hasTitle: !!title,
        hasLanguageOptions: buttons.some(b =>
          b.textContent.includes('한국어') || b.textContent.includes('English')),
        buttonCount: buttons.length,
      };
    });

    report('Settings-Has-Content', settingsContent.hasTitle || settingsContent.hasLanguageOptions,
      `Title: ${settingsContent.hasTitle}, Options: ${settingsContent.hasLanguageOptions}`);
    visitedPages.push({ name: 'LanguageSettings', url: settingsUrl });

    // =========================================================================
    // TEST 5: Root Redirect
    // =========================================================================
    console.log('\n━━━ TEST 5: Root Redirect Behavior ━━━');

    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));

    const rootUrl = page.url();
    // Should redirect to /login if language already onboarded
    const redirectToLogin = rootUrl.includes('/login');
    const redirectToLanguage = rootUrl.includes('/language');

    report('Root-Redirect-Works', redirectToLogin || redirectToLanguage,
      redirectToLogin ? 'Redirected to /login' : redirectToLanguage ? 'Redirected to /language' : rootUrl);
    visitedPages.push({ name: 'Root', url: rootUrl });

    // =========================================================================
    // TEST 6: Page Meta Tags
    // =========================================================================
    console.log('\n━━━ TEST 6: Page Meta Tags ━━━');

    // Check each visited page for proper meta tags
    let metaTagsOk = true;
    const metaResults = [];

    for (const pg of visitedPages) {
      await page.goto(pg.url, { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 1000));

      const metaCheck = await page.evaluate(() => {
        const viewport = document.querySelector('meta[name="viewport"]');
        const charset = document.querySelector('meta[charset]');

        return {
          hasViewport: !!viewport,
          viewportContent: viewport ? viewport.content : null,
          hasCharset: !!charset,
        };
      });

      const pageOk = metaCheck.hasViewport && metaCheck.hasCharset;
      metaTagsOk = metaTagsOk && pageOk;
      metaResults.push({ page: pg.name, ok: pageOk, viewport: metaCheck.viewportContent });
    }

    report('Meta-Tags-All-Pages', metaTagsOk,
      metaResults.map(r => `${r.page}: ${r.ok ? '✅' : '❌'}`).join(', '));

    // =========================================================================
    // TEST 7: Page Load Performance
    // =========================================================================
    console.log('\n━━━ TEST 7: Page Load Performance ━━━');

    const perfResults = [];
    for (const pg of [{ name: 'Login', url: 'http://localhost:5173/login' }]) {
      const startTime = Date.now();
      await page.goto(pg.url, { waitUntil: 'domcontentloaded' });
      const loadTime = Date.now() - startTime;

      perfResults.push({ page: pg.name, loadTime });
      report(`Perf-${pg.name}`, loadTime < 5000, `Loaded in ${loadTime}ms`);
    }

    // =========================================================================
    // SUMMARY
    // =========================================================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Pages Visited: ${visitedPages.length}`);
    visitedPages.forEach(p => console.log(`  - ${p.name}: ${p.url}`));

    if (allPassed) {
      console.log('🎉 ALL TESTS PASSED - No bugs found!');
    } else {
      console.log('⚠️  SOME TESTS FAILED - Bugs detected:');
      bugs.forEach((bug, i) => {
        console.log(`   ${i + 1}. ${bug.test}: ${bug.detail}`);
      });
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Screenshot
    await page.screenshot({ path: 'e2e-navigation-result.png', fullPage: true });
    console.log('📸 Full page screenshot saved: e2e-navigation-result.png');

  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.error(error.stack);
    allPassed = false;
  } finally {
    await browser.close();
    process.exit(allPassed ? 0 : 1);
  }
})();
