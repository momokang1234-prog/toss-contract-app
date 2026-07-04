/**
 * Full User Flow E2E Test: toss-contract-app
 *
 * Tests the complete user journey from landing to contract completion
 */

const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Starting Full User Flow E2E Test...');

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
    // FLOW 1: Landing → Language Onboarding → Login
    // =========================================================================
    console.log('\n━━━ FLOW 1: Landing & Onboarding ━━━');

    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));

    const currentUrl = page.url();
    const isLanguagePage = currentUrl.includes('/language');
    report('Flow1-Landing-Redirect', isLanguagePage, 'Redirected to language onboarding');

    if (isLanguagePage) {
      // Select Korean and confirm
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const confirmBtn = buttons.find(b => b.textContent.trim() === '확인');
        if (confirmBtn) confirmBtn.click();
      });
      await new Promise(r => setTimeout(r, 2000));

      const isLogin = page.url().includes('/login');
      report('Flow1-Language-Complete', isLogin, 'Language onboarding completed');
    }

    // =========================================================================
    // FLOW 2: Login Page Elements
    // =========================================================================
    console.log('\n━━━ FLOW 2: Login Page ━━━');

    const loginElements = await page.evaluate(() => {
      const title = document.querySelector('h1, h2, h3');
      const buttons = Array.from(document.querySelectorAll('button'));
      const featureItems = document.querySelectorAll('[role="listitem"]');

      return {
        title: title ? title.textContent : null,
        buttonCount: buttons.length,
        featureCount: featureItems.length,
        buttonTexts: buttons.map(b => b.textContent).filter(t => t),
      };
    });

    report('Flow2-Has-Title', !!loginElements.title, `Title: "${loginElements.title}"`);
    report('Flow2-Features-Displayed', loginElements.featureCount >= 3,
      `Found ${loginElements.featureCount} features`);
    report('Flow2-Start-Button', loginElements.buttonTexts.some(t => t.includes('시작하기')),
      'Start button available');

    // =========================================================================
    // FLOW 3: Mock Login Flow
    // =========================================================================
    console.log('\n━━━ FLOW 3: Mock Login Flow ━━━');

    // Clear any previous session state for fresh login
    await page.evaluate(() => {
      sessionStorage.clear();
      // Keep lang_onboarded to avoid redirect loop
      localStorage.setItem('lang_onboarded', '1');
    });
    await new Promise(r => setTimeout(r, 500));

    // Reload after clearing session
    await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));

    // Check if IS_MOCK is properly set
    const mockCheck = await page.evaluate(() => {
      // Check if VITE_TOSS_CLIENT_ID is set (which determines IS_MOCK)
      return {
        tossClientIdSet: typeof window !== 'undefined' && 'importMeta' in window,
      };
    });
    console.log('  → Mock check:', mockCheck);

    // Find and click the start button
    const startButton = await page.$('button');
    if (startButton) {
      await startButton.click();
      console.log('  → Clicked start button');
    } else {
      console.log('  → No button found');
    }

    // Wait for login to process and UI to update
    await new Promise(r => setTimeout(r, 2500));

    // Check if role selection bottom sheet appeared OR if navigated away
    const loginState = await page.evaluate(() => {
      // Check for TDS BottomSheet using multiple selectors
      const bottomSheets = document.querySelectorAll('[class*="Bottom"]');
      const fixedOverlays = document.querySelectorAll('[style*="position: fixed"]');
      const roleSelectionText = document.body.textContent.includes('역할') &&
                                document.body.textContent.includes('시작할까요');

      const url = window.location.href;

      return {
        hasBottomSheet: bottomSheets.length > 0 || fixedOverlays.length > 0,
        hasRoleSelectionText: roleSelectionText,
        url: url,
        onDashboard: url.includes('/employer/dashboard') || url.includes('/worker/contracts'),
        onLogin: url.includes('/login'),
        bodyText: document.body.textContent.substring(0, 200),
      };
    });

    const loginSuccess = loginState.hasBottomSheet ||
                        loginState.hasRoleSelectionText ||
                        loginState.onDashboard;

    report('Flow3-Login-Response', loginSuccess,
      loginState.hasBottomSheet || loginState.hasRoleSelectionText ? 'Role selection appeared' :
      loginState.onDashboard ? 'Navigated to dashboard' :
      `Still on login. Body: ${loginState.bodyText.substring(0, 50)}...`);

    if (loginState.hasBottomSheet || loginState.hasRoleSelectionText) {
      // Select employer role - find the specific option element
      console.log('  → Searching for specific role option...');

      // Find the element that contains ONLY "사장님으로 시작하기"
      const clickResult = await page.evaluate(() => {
        const allElements = document.querySelectorAll('*');
        let clicked = false;

        for (const el of allElements) {
          const text = el.textContent || '';

          // Look for element with exactly "사장님으로 시작하기" or with it as main text
          if (text.includes('사장님으로 시작하기') &&
              !text.includes('근로자로 시작하기') &&
              text.length < 50) {

            console.log('Found candidate:', {
              tag: el.tagName,
              text: text,
              className: el.className,
            });

            // Try multiple click methods
            try {
              // Method 1: Direct click
              el.click();
              clicked = true;
              console.log('Clicked via direct click');
            } catch (e) {
              // Method 2: Dispatch mouse event
              el.dispatchEvent(new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
              }));
              clicked = true;
              console.log('Clicked via dispatchEvent');
            }
            break;
          }
        }

        return clicked;
      });

      console.log('  → Click result:', clickResult);

      // Wait for navigation - React state updates take time
      await new Promise(r => setTimeout(r, 4000));

      // Check result
      const finalUrl = page.url();
      const onDashboard = finalUrl.includes('/employer/dashboard');
      report('Flow3-Navigate-Dashboard', onDashboard, `Navigated to: ${finalUrl}`);

      if (!onDashboard) {
        const finalState = await page.evaluate(() => ({
          url: window.location.href,
          isAuthenticated: sessionStorage.getItem('mock_role') !== null,
          userRole: sessionStorage.getItem('mock_role') || sessionStorage.getItem('user_role'),
        }));
        report('Flow3-Final-State', finalState.isAuthenticated,
          `Auth: ${finalState.isAuthenticated}, Role: ${finalState.userRole}`);
      }
    }

    // =========================================================================
    // FLOW 4: Page Layout & Components
    // =========================================================================
    console.log('\n━━━ FLOW 4: Page Layout Check ━━━');

    const layoutCheck = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      const images = Array.from(document.querySelectorAll('img'));
      const buttons = Array.from(document.querySelectorAll('button'));
      const inputs = Array.from(document.querySelectorAll('input'));

      const styledElements = Array.from(allElements).filter(el => {
        const computed = window.getComputedStyle(el);
        return computed.display !== 'inline' ||
               computed.padding !== '0px' ||
               computed.margin !== '0px';
      });

      return {
        totalElements: allElements.length,
        styledElements: styledElements.length,
        images: images.length,
        buttons: buttons.length,
        inputs: inputs.length,
        bodyOverflow: document.body.style.overflow,
      };
    });

    report('Flow4-Elements-Styled', layoutCheck.styledElements > 0,
      `${layoutCheck.styledElements} styled elements`);
    report('Flow4-No-Horizontal-Scroll', layoutCheck.bodyOverflow !== 'auto',
      `Overflow: ${layoutCheck.bodyOverflow || 'none'}`);

    // =========================================================================
    // FLOW 5: Accessibility Check
    // =========================================================================
    console.log('\n━━━ FLOW 5: Accessibility ━━━');

    const a11yCheck = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      const listItems = document.querySelectorAll('[role="listitem"]');
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');

      const buttonsWithLabels = Array.from(buttons).filter(b =>
        b.textContent.trim() || b.getAttribute('aria-label')
      );

      const listItemsWithText = Array.from(listItems).filter(li =>
        li.textContent.trim()
      );

      return {
        buttonsWithLabels: buttonsWithLabels.length,
        totalButtons: buttons.length,
        listItemsWithText: listItemsWithText.length,
        totalListItems: listItems.length,
        headingCount: headings.length,
      };
    });

    report('Flow5-Buttons-Accessible',
      a11yCheck.buttonsWithLabels === a11yCheck.totalButtons,
      `${a11yCheck.buttonsWithLabels}/${a11yCheck.totalButtons} buttons labeled`);
    report('Flow5-ListItems-Accessible',
      a11yCheck.listItemsWithText === a11yCheck.totalListItems,
      `${a11yCheck.listItemsWithText}/${a11yCheck.totalListItems} items labeled`);
    report('Flow5-Has-Headings', a11yCheck.headingCount > 0,
      `Found ${a11yCheck.headingCount} headings`);

    // =========================================================================
    // FLOW 6: Mobile Responsiveness
    // =========================================================================
    console.log('\n━━━ FLOW 6: Mobile Responsiveness ━━━');

    const viewports = [
      { width: 375, height: 667, name: 'iPhone SE' },
      { width: 390, height: 844, name: 'iPhone 13' },
      { width: 768, height: 1024, name: 'iPad' },
    ];

    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height, isMobile: true });
      await new Promise(r => setTimeout(r, 500));

      const mobileCheck = await page.evaluate(() => {
        const body = document.body;
        return {
          scrollWidth: body.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        };
      });

      const noOverflow = mobileCheck.scrollWidth <= mobileCheck.clientWidth + 1;
      report(`Flow6-Mobile-${vp.name}`, noOverflow,
        `${vp.name}: ${mobileCheck.scrollWidth}x${mobileCheck.clientWidth}px`);
    }

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
    await page.screenshot({ path: 'e2e-full-flow-result.png', fullPage: true });
    console.log('📸 Full page screenshot saved: e2e-full-flow-result.png');

  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.error(error.stack);
    allPassed = false;
  } finally {
    await browser.close();
    process.exit(allPassed ? 0 : 1);
  }
})();
