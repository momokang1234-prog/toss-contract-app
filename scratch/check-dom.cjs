const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/root/.cache/puppeteer/chrome/linux-151.0.7909.0/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  // Set storage and navigate
  await page.goto('http://localhost:5173/employer/contracts/new');
  await page.evaluate(() => sessionStorage.setItem('force_mock', 'true'));
  await page.goto('http://localhost:5173/employer/contracts/new?contract-form-wizard=employerSignature');
  
  await new Promise(r => setTimeout(r, 1000)); // wait for render
  
  const html = await page.evaluate(() => {
    return document.body.innerHTML;
  });
  
  console.log(html);
  await browser.close();
})();
