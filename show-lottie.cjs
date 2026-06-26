const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Launching visual browser to show Lottie animation...');
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 400, height: 850 },
    executablePath: '/root/.cache/puppeteer/chrome/linux-151.0.7909.0/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=400,850'],
  });

  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
    await page.goto('http://localhost:5173/worker/contracts/mock-2/sign?debug=done', { waitUntil: 'domcontentloaded' });
    
    console.log('✅ 서명 완료 (Lottie 애니메이션) 페이지 진입 성공!');
    console.log('화면을 감상하세요! (10초 뒤 닫힙니다)');
    
    // 사용자가 애니메이션을 볼 수 있도록 10초 대기
    await new Promise(r => setTimeout(r, 10000));
  } catch (error) {
    console.error('테스트 에러 발생:', error);
  } finally {
    await browser.close();
  }
})();
