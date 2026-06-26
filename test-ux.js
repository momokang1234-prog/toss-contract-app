const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/dev/ux-test', { waitUntil: 'networkidle2' });
  
  // Find iframe for worker list
  const iframes = await page.$$('iframe');
  console.log(`Found ${iframes.length} iframes`);
  
  for (const iframe of iframes) {
    const src = await iframe.evaluate(el => el.src);
    if (src.includes('worker/contracts') && !src.includes('mock-1')) {
      console.log('Found worker contracts iframe:', src);
      const frame = await iframe.contentFrame();
      await frame.waitForSelector('body');
      const html = await frame.evaluate(() => document.body.innerText);
      console.log('Iframe text content:');
      console.log(html);
    }
  }
  
  await browser.close();
})();
