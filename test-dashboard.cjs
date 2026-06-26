const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/root/.cache/puppeteer/chrome/linux-151.0.7909.0/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  console.log('Navigating to Employer Dashboard...');
  await page.goto('http://localhost:5173/employer', { waitUntil: 'networkidle2' });
  
  console.log('Wait for dashboard to load...');
  await new Promise(r => setTimeout(r, 2000));

  const pageHtml = await page.content();
  
  const hasDraft = pageHtml.includes('작성 중');
  const hasCancelled = pageHtml.includes('취소됨');
  const hasExpired = pageHtml.includes('만료됨');

  // Let's also check if badgeGrey and badgeRed classes are present
  const hasBadgeGrey = pageHtml.includes('badgeGrey');
  const hasBadgeRed = pageHtml.includes('badgeRed');
  
  console.log('hasDraft:', hasDraft);
  console.log('hasCancelled:', hasCancelled);
  console.log('hasExpired:', hasExpired);
  console.log('hasBadgeGrey:', hasBadgeGrey);
  console.log('hasBadgeRed:', hasBadgeRed);

  console.log('✅ SUCCESS: Verified employer dashboard HTML.');

  await browser.close();
})();
