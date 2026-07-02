const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/root/.cache/puppeteer/chrome/linux-151.0.7909.0/chrome-linux64/chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 812 }); // Mobile viewport
    console.log('Navigating to ContractFormPage...');
    const response = await page.goto('http://localhost:5173/employer/contracts/new', { waitUntil: 'networkidle0', timeout: 15000 });
    
    // Wait for the button or some text to appear
    await new Promise(r => setTimeout(r, 2000));
    
    const screenshotPath = '/root/.gemini/antigravity-cli/brain/3ac6ac48-2168-47a0-b600-4418f6baea07/contract-form-screenshot.png';
    await page.screenshot({ path: screenshotPath });
    console.log(`Screenshot saved to ${screenshotPath}`);
    
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
