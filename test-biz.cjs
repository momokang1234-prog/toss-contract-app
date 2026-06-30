const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/employer/business/new');
  await new Promise(r => setTimeout(r, 2000));
  
  // type 1234567890
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text === '1') await btn.click();
  }
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text === '2') await btn.click();
  }
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text === '3') await btn.click();
  }
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text === '4') await btn.click();
  }
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text === '5') await btn.click();
  }
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text === '6') await btn.click();
  }
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text === '7') await btn.click();
  }
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text === '8') await btn.click();
  }
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text === '9') await btn.click();
  }
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text === '0') await btn.click();
  }

  await new Promise(r => setTimeout(r, 1000));

  // Find "다음" or "인증하기" button
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text === '다음') {
      await btn.click();
      console.log('Clicked 다음');
    }
  }

  await new Promise(r => setTimeout(r, 3000));
  const html = await page.content();
  if (html.includes('정상 사업자입니다') || html.includes('휴/폐업') || html.includes('국세청에 등록되지 않은')) {
    console.log('NTS API Call Success!');
  } else {
    console.log('NTS API Failed or UI did not update.');
  }

  // screenshot
  await page.screenshot({ path: 'biz-test.png' });
  await browser.close();
})();
