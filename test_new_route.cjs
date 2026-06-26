const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/root/.cache/puppeteer/chrome/linux-151.0.7909.0/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5173/employer/contracts/new', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  
  const text = await page.evaluate(() => document.body.innerText);
  console.log('TEXT:', text);
  
  await browser.close();
})();
