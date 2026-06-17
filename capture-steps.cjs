const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  
  await page.goto('http://localhost:5173/login');
  await page.evaluate(() => {
    sessionStorage.setItem('toss_token', 'mock_token');
    localStorage.setItem('toss_user_key', 'mock_employer');
  });

  // Inject a mock to bypass validation logic completely by intercepting the validateStep function
  await page.evaluateOnNewDocument(() => {
    // We can't easily intercept the hook, but we can intercept the funnel query param manually
    // Let's just click '다음' and hope we filled enough, or we just screenshot the steps as they are
    // Wait, the query param `?contract-form-wizard=workConditions` DID work in the log, but why did it render Step 1?
    // Because useFunnel in @use-funnel/browser might use URL hash or standard query. The default is `?funnel-step=` usually!
  });

  const steps = ['basicInfo', 'workConditions', 'workSchedule', 'wageInsurance', 'finalChecklist', 'preview', 'employerSignature'];
  for (let i = 0; i < steps.length; i++) {
    // The id is 'contract-form-wizard', so the query param is `?contract-form-wizard=workConditions`
    // Let's try hash instead or check what useFunnel uses.
    await page.goto(`http://localhost:5173/employer/contracts/new?contract-form-wizard=${steps[i]}`);
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: `public/screenshots/real-step${i+1}.png` });
  }

  await browser.close();
})();
