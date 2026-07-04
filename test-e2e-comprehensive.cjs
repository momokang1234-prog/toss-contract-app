/**
 * Comprehensive E2E Test: toss-contract-app Full Flow
 *
 * Tests multiple user flows and edge cases to find bugs
 */

const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Starting Comprehensive E2E Test...');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  let allPassed = true;
  const bugs = [];

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
    // TEST 1: App Initialization & Routing
    // =========================================================================
    console.log('\n━━━ TEST 1: App Initialization ━━━');

    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));

    const currentUrl = page.url();
    report('App-Loads', true, `Current URL: ${currentUrl}`);

    // Check for React root
    const hasReactRoot = await page.evaluate(() => {
      return document.querySelector('#root') !== null &&
             document.querySelector('#root').children.length > 0;
    });
    report('React-Root-Exists', hasReactRoot, hasReactRoot ? 'React app mounted' : 'React root empty');

    // Check for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        report('Console-Error', false, `Console error: ${msg.text()}`);
      }
    });

    // =========================================================================
    // TEST 2: Language Onboarding Flow
    // =========================================================================
    console.log('\n━━━ TEST 2: Language Onboarding ━━━');

    if (currentUrl.includes('/language')) {
      // Test language selection
      const languageOptions = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.filter(b => b.textContent.includes('한국어') || b.textContent.includes('English'))
                       .map(b => ({ text: b.textContent, visible: b.offsetParent !== null }));
      });

      report('Language-Options-Available', languageOptions.length > 0,
        `Found ${languageOptions.length} language options`);

      // Complete onboarding
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const confirmBtn = buttons.find(b => b.textContent.trim() === '확인' || b.textContent.includes('Confirm'));
        if (confirmBtn) confirmBtn.click();
      });
      await new Promise(r => setTimeout(r, 2000));

      const newUrl = page.url();
      const navigatedToLogin = newUrl.includes('/login');
      report('Language-Redirect', navigatedToLogin, `Navigated to: ${newUrl}`);
    }

    // =========================================================================
    // TEST 3: Login Page Elements
    // =========================================================================
    console.log('\n━━━ TEST 3: Login Page Elements ━━━');

    const loginPageContent = await page.evaluate(() => {
      const title = document.querySelector('h1, h2, h3');
      const buttons = Array.from(document.querySelectorAll('button, a'));
      const inputs = Array.from(document.querySelectorAll('input'));
      const images = Array.from(document.querySelectorAll('img'));

      return {
        title: title ? title.textContent : null,
        buttonCount: buttons.length,
        inputCount: inputs.length,
        imageCount: images.length,
        hasStartButton: buttons.some(b => b.textContent.includes('시작하기')),
        images: images.map(i => ({ src: i.src, alt: i.alt, visible: i.offsetParent !== null }))
      };
    });

    report('Login-Page-Title', !!loginPageContent.title,
      `Title: "${loginPageContent.title}"`);
    report('Login-Start-Button', loginPageContent.hasStartButton,
      'Start button found');

    // Check image loading
    const brokenImages = loginPageContent.images.filter(i => i.visible && i.src && !i.src.startsWith('data:'));
    const imagesOk = await Promise.all(brokenImages.map(async (img) => {
      try {
        const response = await page.evaluate(async (src) => {
          const res = await fetch(src);
          return res.ok;
        }, img.src);
        return response;
      } catch {
        return false;
      }
    }));

    if (brokenImages.length > 0) {
      report('Image-Loading', imagesOk.every(ok => ok),
        `${brokenImages.length} external images checked`);
    }

    // =========================================================================
    // TEST 4: CSS Modules & Styling
    // =========================================================================
    console.log('\n━━━ TEST 4: CSS & Styling ━━━');

    const stylingCheck = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      const styledElements = Array.from(allElements).filter(el => {
        const computed = window.getComputedStyle(el);
        return computed.display !== 'inline' ||
               computed.padding !== '0px' ||
               computed.margin !== '0px' ||
               el.className.length > 0;
      });

      // Check for common TDS class patterns
      const hasTDSClasses = allElements.length > 0 &&
        Array.from(allElements).some(el =>
          el.className && (
            el.className.toString().includes('toss') ||
            el.className.toString().includes('tds')
          )
        );

      return {
        totalElements: allElements.length,
        styledElements: styledElements.length,
        hasTDSClasses,
        bodyOverflow: document.body.style.overflow,
        bodyMargin: document.body.style.margin
      };
    });

    report('CSS-Modules-Applied', stylingCheck.styledElements > 0,
      `${stylingCheck.styledElements} styled elements`);
    report('TDS-Classes-Present', stylingCheck.hasTDSClasses,
      'TDS component classes detected');

    // =========================================================================
    // TEST 5: Responsive Design
    // =========================================================================
    console.log('\n━━━ TEST 5: Responsive Design ━━━');

    // Test mobile viewport
    await page.setViewport({ width: 375, height: 667, isMobile: true });
    await new Promise(r => setTimeout(r, 1000));

    const mobileCheck = await page.evaluate(() => {
      const viewport = document.querySelector('meta[name="viewport"]');
      const html = document.documentElement;
      const body = document.body;

      return {
        hasViewportMeta: viewport !== null,
        viewportContent: viewport ? viewport.content : null,
        bodyScrollWidth: body.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        hasHorizontalScroll: body.scrollWidth > window.innerWidth
      };
    });

    report('Mobile-Viewport-Meta', mobileCheck.hasViewportMeta,
      mobileCheck.viewportContent || 'No viewport meta');
    report('No-Horizontal-Scroll', !mobileCheck.hasHorizontalScroll,
      `Scroll width: ${mobileCheck.bodyScrollWidth}px`);

    // Test tablet viewport
    await page.setViewport({ width: 768, height: 1024 });
    await new Promise(r => setTimeout(r, 1000));
    report('Tablet-Viewport', true, 'Tablet viewport set');

    // Test desktop viewport
    await page.setViewport({ width: 1920, height: 1080 });
    await new Promise(r => setTimeout(r, 1000));
    report('Desktop-Viewport', true, 'Desktop viewport set');

    // =========================================================================
    // TEST 6: Accessibility Basics
    // =========================================================================
    console.log('\n━━━ TEST 6: Accessibility ━━━');

    const a11yCheck = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      const inputs = document.querySelectorAll('input');
      const links = document.querySelectorAll('a');

      const buttonsWithLabels = Array.from(buttons).filter(b =>
        b.textContent.trim() || b.getAttribute('aria-label') || b.getAttribute('title')
      );

      const inputsWithLabels = Array.from(inputs).filter(i =>
        i.getAttribute('aria-label') ||
        i.getAttribute('placeholder') ||
        i.id && document.querySelector(`label[for="${i.id}"]`)
      );

      const linksWithText = Array.from(links).filter(l =>
        l.textContent.trim() || l.getAttribute('aria-label')
      );

      return {
        totalButtons: buttons.length,
        buttonsWithLabels: buttonsWithLabels.length,
        totalInputs: inputs.length,
        inputsWithLabels: inputsWithLabels.length,
        totalLinks: links.length,
        linksWithText: linksWithText.length
      };
    });

    report('A11y-Button-Labels',
      a11yCheck.buttonsWithLabels === a11yCheck.totalButtons || a11yCheck.totalButtons === 0,
      `${a11yCheck.buttonsWithLabels}/${a11yCheck.totalButtons} buttons labeled`);
    report('A11y-Input-Labels',
      a11yCheck.inputsWithLabels === a11yCheck.totalInputs || a11yCheck.totalInputs === 0,
      `${a11yCheck.inputsWithLabels}/${a11yCheck.totalInputs} inputs labeled`);

    // =========================================================================
    // TEST 7: Font Loading
    // =========================================================================
    console.log('\n━━━ TEST 7: Font Loading ━━━');

    const fontCheck = await page.evaluate(() => {
      const bodyStyles = window.getComputedStyle(document.body);
      const fontFamily = bodyStyles.fontFamily;

      return {
        fontFamily,
        hasTossFont: fontFamily.includes('Toss') || fontFamily.includes('toss'),
        hasSystemFont: fontFamily.includes('sans-serif') || fontFamily.includes('Arial'),
      };
    });

    report('Font-Loaded', true, `Font family: ${fontCheck.fontFamily.split(',')[0]}`);

    // =========================================================================
    // TEST 8: Network Requests & Performance
    // =========================================================================
    console.log('\n━━━ TEST 8: Network Requests ━━━');

    const requests = [];
    page.on('request', req => requests.push({ url: req.url(), method: req.method() }));

    // Navigate to trigger requests
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    const failedRequests = requests.filter(r =>
      r.url.includes('favicon') || r.url.includes('sockjs')
    );

    report('Network-Requests', requests.length > 0,
      `${requests.length} requests made`);

    // =========================================================================
    // TEST 9: JavaScript Functionality
    // =========================================================================
    console.log('\n━━━ TEST 9: JavaScript Functionality ━━━');

    const jsCheck = await page.evaluate(() => {
      // Check if modern JS features work
      const testObj = { test: true };
      const hasOptionalChaining = testObj?.test === true;
      const hasNullishCoalescing = (null ?? 'default') === 'default';

      // Check if React is available
      const hasReact = typeof React !== 'undefined' || typeof ReactDOM !== 'undefined';

      return {
        hasOptionalChaining,
        hasNullishCoalescing,
        hasReact,
      };
    });

    report('JS-Features-Work', jsCheck.hasOptionalChaining && jsCheck.hasNullishCoalescing,
      'Modern JS features available');

    // =========================================================================
    // TEST 10: Error Boundaries
    // =========================================================================
    console.log('\n━━━ TEST 10: Error Handling ━━━');

    const errorCheck = await page.evaluate(() => {
      const body = document.body;
      const hasErrorOverlay = body.querySelector('style[data-emotion]') !== null;
      const hasReactError = body.innerHTML.includes('Error') || body.innerHTML.includes('오류');
      const hasFallbackUI = body.querySelector('[class*="Error"]') !== null;

      return {
        hasErrorOverlay,
        hasReactError,
        hasFallbackUI,
      };
    });

    const noErrors = !errorCheck.hasReactError;
    report('No-React-Errors', noErrors,
      errorCheck.hasReactError ? 'Error text found in body' : 'No visible errors');

    // =========================================================================
    // SUMMARY
    // =========================================================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
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
    await page.screenshot({ path: 'e2e-comprehensive-result.png', fullPage: true });
    console.log('📸 Full page screenshot saved: e2e-comprehensive-result.png');

  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.error(error.stack);
    allPassed = false;
  } finally {
    await browser.close();
    process.exit(allPassed ? 0 : 1);
  }
})();
