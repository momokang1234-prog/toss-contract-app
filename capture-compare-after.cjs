const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });
  
  await page.goto('http://localhost:5173/');
  await page.evaluate(() => {
    sessionStorage.setItem('mock_role', 'employer');
    sessionStorage.setItem('force_mock', 'true');
  });

  await page.goto('http://localhost:5173/employer/contracts/new?contract-form-wizard=basicInfo', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: '/root/.gemini/antigravity-cli/brain/bfb6bc14-0e2d-467f-a98c-0afe96083982/step1_after.png' });
  
  console.log("Captured step1_after.png");
  await browser.close();
})();
