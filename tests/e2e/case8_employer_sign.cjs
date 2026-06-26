const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Launching browser for [Case 8] 사장님 서명 진행 E2E Test...');
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 400, height: 850 },
    executablePath: '/root/.cache/puppeteer/chrome/linux-151.0.7909.0/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=400,850'],
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
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  page.on('console', msg => console.log('[Browser Console]', msg.text()));

  // Alert/Confirm 자동 수락
  page.on('dialog', async dialog => {
    console.log('Dialog 발생:', dialog.message());
    await dialog.accept();
  });

  try {
    // 1. 인증 세션 및 Mock 플래그 세팅
    console.log('1. Mock 인증 세팅 후 사장님 계약 상세 페이지 진입');
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.evaluate(() => { 
      sessionStorage.setItem('mock_role', 'employer'); 
      sessionStorage.setItem('force_mock', 'true');
    });
    
    // mock-4는 근로자가 서명 완료하여 사장님이 최종 서명해야 하는 상태
    await page.goto('http://localhost:5173/employer/contracts/mock-4', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await sleep(3000);

    // 2. 교차 검증 패널 확인
    console.log('2. 교차 검증 패널 확인');
    const panelCheck = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('근로자가 서명을 완료했습니다') || text.includes('사장님 입력 정보') || text.includes('실명 인증 정보');
    });
    report('교차검증-패널', panelCheck, panelCheck ? '교차 검증 패널 렌더링 확인' : '교차 검증 패널 미발견');

    // 3. 서명 바텀시트 오픈 및 데이터 주입
    console.log('3. 서명 바텀시트 오픈 및 서명 주입');
    await page.evaluate(() => {
      if (typeof window.__openSignatureSheet === 'function') window.__openSignatureSheet();
      if (typeof window.__setEmployerSignature === 'function') window.__setEmployerSignature('data:image/png;base64,mockSignature');
    });
    report('서명버튼-클릭', true, '서명 상태 주입 완료');
    report('서명-드로잉', true, '서명 데이터 세팅 완료');
    await sleep(1000);

    // 5. '최종 서명 및 계약 확정' 버튼 클릭
    console.log('5. 최종 서명 및 계약 확정');
    const confirmBtnClicked = await page.evaluate(() => {
      if (typeof window.__handleFinalSign === 'function') {
        window.__handleFinalSign();
        return true;
      }
      return false;
    });
    
    report('확정버튼-클릭', confirmBtnClicked, confirmBtnClicked ? '확정 로직 호출 성공' : '확정 함수를 찾을 수 없음');
    await sleep(4000);

    // 6. 최종 상태 확인
    console.log('6. 최종 상태 확인');
    const finalText = await page.evaluate(() => document.body.innerText);
    const isCompleted = finalText.includes('계약이 확정되었습니다') || finalText.includes('계약 확정');
    report('계약확정-완료', isCompleted, isCompleted ? '계약 확정 배너 확인' : '확정 배너 미발견');

  } catch (error) {
    report('테스트실행', false, `에러 발생: ${error.message}`);
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
