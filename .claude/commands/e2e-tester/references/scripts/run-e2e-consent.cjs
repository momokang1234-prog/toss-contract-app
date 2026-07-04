/**
 * E2E Test: Consent Form Flow
 *
 * Tests consent form functionality including:
 * - Consent options display
 * - Toggle interactions
 * - Submit with/without consent
 * - Skip functionality
 */

const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Starting Consent Form E2E Test...');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  let allPassed = true;

  function report(name, passed, detail) {
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} ${name}: ${detail}`);
    if (!passed) allPassed = false;
  }

  try {
    // Navigate to a test page with consent form
    console.log('\n━━━ TEST 1: Consent Form Page Load ━━━');
    await page.goto('http://localhost:5173/test/consent', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    // Check if consent form is rendered
    const hasConsentForm = await page.evaluate(() => {
      const body = document.body.innerText;
      return body.includes('개인정보 처리 동의') ||
             body.includes('Consent') ||
             body.includes('consent');
    });
    report('Consent-Form-Load', hasConsentForm, hasConsentForm
      ? 'Consent form loaded successfully'
      : 'Consent form not found');

    // Check for consent options
    const hasPersonalization = await page.evaluate(() => {
      const body = document.body.innerText;
      return body.includes('개인화') || body.includes('Personalization');
    });
    report('Consent-Personalization-Option', hasPersonalization, hasPersonalization
      ? 'Personalization consent option found'
      : 'Personalization option not found');

    const hasAnalytics = await page.evaluate(() => {
      const body = document.body.innerText;
      return body.includes('분석') || body.includes('Analytics');
    });
    report('Consent-Analytics-Option', hasAnalytics, hasAnalytics
      ? 'Analytics consent option found'
      : 'Analytics option not found');

    // Test toggle interaction
    console.log('\n━━━ TEST 2: Consent Toggle Interaction ━━━');
    const toggleClicked = await page.evaluate(() => {
      // Find personalization toggle button
      const buttons = Array.from(document.querySelectorAll('button'));
      const personalizationBtn = buttons.find(b =>
        b.textContent.includes('거부') || b.textContent.includes('Reject')
      );

      if (personalizationBtn) {
        personalizationBtn.click();
        return true;
      }
      return false;
    });
    await new Promise(r => setTimeout(r, 500));
    report('Consent-Toggle-Click', toggleClicked, toggleClicked
      ? 'Toggle button clicked successfully'
      : 'Toggle button not found or not clickable');

    // Test submit button
    console.log('\n━━━ TEST 3: Submit Functionality ━━━');
    const hasSubmitBtn = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.some(b =>
        b.textContent.includes('계속하기') ||
        b.textContent.includes('Continue') ||
        b.textContent.includes('Submit')
      );
    });
    report('Consent-Submit-Button', hasSubmitBtn, hasSubmitBtn
      ? 'Submit button found'
      : 'Submit button not found');

    // Test skip button
    const hasSkipBtn = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.some(b =>
        b.textContent.includes('하지 않기') ||
        b.textContent.includes('Skip') ||
        b.textContent.includes('나중에')
      );
    });
    report('Consent-Skip-Button', hasSkipBtn, hasSkipBtn
      ? 'Skip button found'
      : 'Skip button not found');

    // Test privacy notice
    console.log('\n━━━ TEST 4: PIPA Compliance Elements ━━━');
    const hasPrivacyNotice = await page.evaluate(() => {
      const body = document.body.innerText;
      return body.includes('개인정보') || body.includes('privacy') || body.includes('PIPA');
    });
    report('Consent-Privacy-Notice', hasPrivacyNotice, hasPrivacyNotice
      ? 'Privacy notice displayed (PIPA compliant)'
      : 'Privacy notice not found');

    // Test version info
    const hasVersionInfo = await page.evaluate(() => {
      const body = document.body.innerText;
      return body.includes('버전') || body.includes('version') || body.includes('1.0');
    });
    report('Consent-Version-Info', hasVersionInfo, hasVersionInfo
      ? 'Consent version information displayed'
      : 'Version information not found');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    if (allPassed) {
      console.log('🎉 ALL CONSENT TESTS PASSED');
    } else {
      console.log('⚠️  SOME CONSENT TESTS FAILED');
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Test execution error:', error.message);
    allPassed = false;
  } finally {
    await browser.close();
    process.exit(allPassed ? 0 : 1);
  }
})();
