const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/root/.cache/puppeteer/chrome/linux-151.0.7909.0/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=400,850'],
    defaultViewport: { width: 400, height: 850 },
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/worker/contracts/mock-2/sign?debug=done', { waitUntil: 'networkidle0' });
  
  // Wait a little bit for the Lottie animation to render
  await new Promise(r => setTimeout(r, 2000));
  
  await page.screenshot({ path: 'lottie-screenshot.png' });
  await browser.close();
})();
