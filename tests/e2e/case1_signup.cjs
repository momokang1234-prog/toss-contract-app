const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Launching visual browser for E2E Test...');
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 400, height: 850 },
    executablePath: '/root/.cache/puppeteer/chrome/linux-151.0.7909.0/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=400,850'],
    slowMo: 50
  });

  const page = await browser.newPage();
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  page.on('dialog', async dialog => {
    console.log('Alert 팝업 발생:', dialog.message());
    await dialog.accept();
  });

  try {
    console.log('\n========================================');
    console.log(' 👨‍💼 [TEST Case 1] 신규 사장님 회원가입 (Mock Flow 검증)');
    console.log('========================================');
    
    // 세션 초기화 후 로그인 페이지 진입
    await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => sessionStorage.clear());
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(1000);

    console.log('👉 "시작하기" 버튼 클릭');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const startBtn = btns.find(b => b.textContent.includes('시작하기'));
      if(startBtn) startBtn.click();
    });
    
    await sleep(1000);

    console.log('👉 바텀시트에서 "사장님으로 시작하기" 클릭');
    await page.evaluate(() => {
      // span 태그 등에 텍스트가 렌더링되므로 텍스트로 엘리먼트 찾기
      const els = Array.from(document.querySelectorAll('*'));
      const empBtn = els.find(el => el.textContent === '사장님으로 시작하기');
      if(empBtn) empBtn.click();
    });

    await sleep(2000);

    const currentUrl = page.url();
    console.log('현재 진입 URL:', currentUrl);
    
    if (currentUrl.includes('/employer/dashboard') || currentUrl.includes('/employer/business/new')) {
      console.log('✅ SUCCESS: 사장님 홈(대시보드 또는 온보딩) 화면 진입 성공');
    } else {
      console.log('❌ FAILED: 올바른 화면으로 리다이렉트되지 않았습니다.');
    }

  } catch (error) {
    console.error('❌ FAILED: 테스트 에러 발생 -', error);
  } finally {
    console.log('\n✅ 눈으로 보는 E2E 테스트가 종료되었습니다. 3초 뒤 브라우저가 닫힙니다.');
    await sleep(3000);
    await browser.close();
  }
})();
