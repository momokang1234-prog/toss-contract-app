const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Launching browser for Case 9 E2E Test...');
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

  // Alert 처리
  page.on('dialog', async dialog => {
    await dialog.accept();
  });
  
  try {
    // 1. 인증 세션 세팅
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.evaluate(() => { sessionStorage.setItem('mock_role', 'employer'); });

    // 2. 계약서 상세 진입 후, 모달 띄우기
    await page.goto('http://localhost:5173/employer/contracts/mock-1', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1000));

    // 계약서 상세 진입 후, 인라인으로 모달 띄우기 (윈도우 디버그 함수 사용)
    await page.evaluate(() => {
      if (typeof window.__openCompletionModal === 'function') {
        window.__openCompletionModal();
      }
    });
    await new Promise(r => setTimeout(r, 2000));

    // 3. 발송 모달/공유 UI 확인
    const modalText = await page.evaluate(() => document.body.innerText);
    const hasModal = modalText.includes('계약서 완성') || modalText.includes('공유하시겠어요') || modalText.includes('근로자에게 전송');
    report('발송모달-노출', hasModal, hasModal ? '발송/공유 UI 확인됨' : '발송 모달을 찾을 수 없음');

    if (hasModal) {
      // 4. 공유하기/전송 버튼 클릭
      const btnResult = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const shareBtn = btns.find(b => b.textContent.includes('공유하기'));
        const sendBtn = btns.find(b => b.textContent.includes('전송'));
        
        if (shareBtn) { shareBtn.click(); return '공유하기 버튼 클릭 완료'; }
        if (sendBtn) { sendBtn.click(); return '전송 버튼 클릭 완료'; }
        return '전송 버튼을 찾을 수 없음';
      });
      report('공유버튼-클릭', btnResult.includes('완료'), btnResult);
    }

    // 5. 계약 상태 텍스트 확인 (계약서가 정상적으로 로드되었는지)
    const pageContent = await page.evaluate(() => document.body.innerText);
    const hasContractContent = pageContent.includes('계약서') || pageContent.includes('근로자') || pageContent.includes('계약 조건');
    report('상세페이지-렌더링', hasContractContent, hasContractContent ? '계약서 상세 페이지 정상 렌더링' : '페이지 콘텐츠 미발견');

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
