const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Launching browser for Case 4 (Business Register)...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/root/.cache/puppeteer/chrome/linux-151.0.7909.0/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  let allPassed = true;
  const results = [];

  function report(name, passed, detail) {
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} ${name}: ${detail}`);
    results.push({ name, passed, detail });
    if (!passed) allPassed = false;
  }

  const page = await browser.newPage();
  
  // 1. 인증 세션 세팅 먼저!
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.evaluate(() => { sessionStorage.setItem('mock_role', 'employer'); });

  // 2. 사업장 등록 페이지 진입
  console.log('\n━━━ 진입 테스트: 사업장 등록 페이지 ━━━');
  await page.goto('http://localhost:5173/employer/business/new', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 2000));

  // 3. 사업자등록번호 입력 스텝 확인
  console.log('\n━━━ Step 1: 사업자등록번호 입력 ━━━');
  const numberText = await page.evaluate(() => document.body.innerText);
  const hasNumberTitle = numberText.includes('사업자등록번호를') && numberText.includes('입력해주세요');
  report('사업자번호-화면진입', hasNumberTitle, hasNumberTitle ? '사업자등록번호 입력 화면 정상 진입' : '화면 텍스트를 찾을 수 없음');

  // 키패드를 통한 사업자등록번호 10자리 입력 (CSS 모듈의 keypadBtn 클래스 대신 텍스트 매칭)
  const digits = '1234567890'.split('');
  for (const digit of digits) {
    await page.evaluate((d) => {
      const btns = Array.from(document.querySelectorAll('button'));
      // keypad 영역의 숫자 버튼: 텍스트가 정확히 한 자리 숫자인 버튼
      const btn = btns.find(b => b.textContent.trim() === d && b.textContent.trim().length === 1);
      if (btn) btn.click();
    }, digit);
    await new Promise(r => setTimeout(r, 100));
  }
  await new Promise(r => setTimeout(r, 500));

  // '확인' 버튼 클릭 (사업자번호 검증)
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('확인'));
    if (btn && !btn.disabled) btn.click();
  });
  await new Promise(r => setTimeout(r, 3000));

  // 4. 사업장 정보 입력 스텝 확인
  console.log('\n━━━ Step 2: 사업장 정보 입력 ━━━');
  const infoText = await page.evaluate(() => document.body.innerText);
  const hasInfoTitle = infoText.includes('사업장 정보를') && infoText.includes('입력해주세요');
  report('사업장정보-화면진입', hasInfoTitle, hasInfoTitle ? '사업장 정보 폼 화면 전환 성공' : '화면 텍스트를 찾을 수 없음. 현재 텍스트: ' + infoText.substring(0, 100));

  if (hasInfoTitle) {
    // TDS TextField에 React 방식으로 값 주입
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      
      inputs.forEach(input => {
        const placeholder = input.placeholder || '';
        let val = '';
        if (placeholder.includes('사업장 이름')) val = '토스 테스트 매장';
        else if (placeholder.includes('대표자 이름')) val = '김토스';
        else if (placeholder.includes('주소')) val = '서울시 강남구 테헤란로 142';
        
        if (val) {
          nativeInputValueSetter.call(input, val);
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    });
    await new Promise(r => setTimeout(r, 500));

    // '등록하기' 버튼 클릭
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('등록하기'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 3000));

    // 5. 완료 및 리다이렉트 검증
    const finalUrl = page.url();
    const redirected = finalUrl.includes('/employer/dashboard');
    report('등록완료-리다이렉트', redirected, redirected ? `대시보드 리다이렉트 성공: ${finalUrl}` : `기대와 다른 URL: ${finalUrl}`);
  } else {
    report('등록완료-리다이렉트', false, 'Step 2 미진입으로 스킵');
  }

  await page.close();

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`총 ${results.length}개 테스트 | 통과: ${results.filter(r => r.passed).length} | 실패: ${results.filter(r => !r.passed).length}`);
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED');
  } else {
    console.log('⚠️  SOME TESTS FAILED');
    results.filter(r => !r.passed).forEach(r => console.log(`  ❌ ${r.name}: ${r.detail}`));
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await browser.close();
  process.exit(allPassed ? 0 : 1);
})();
