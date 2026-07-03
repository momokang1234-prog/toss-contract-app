const puppeteer = require('puppeteer');

(async () => {
  console.log('[E2E Test] 네트워크 불안정성 결함 테스트 시작');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const client = await page.target().createCDPSession();
  await client.send('Network.enable');

  console.log('\n--- 1. [Slow 3G] 로딩 스피너(Suspense) 노출 검증 ---');
  // Slow 3G 에뮬레이션
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 2000,
    downloadThroughput: 50 * 1024 / 8,
    uploadThroughput: 50 * 1024 / 8
  });

  // 페이지 이동 후, 데이터 로딩 중 Suspense fallback이 보이는지 확인
  await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });
  
  try {
    await page.evaluate(() => {
      localStorage.setItem('lang_onboarded', '1');
      sessionStorage.setItem('force_mock', 'true');
    });
    // ContractListPage 진입
    await page.goto('http://localhost:5173/employer/contracts', { waitUntil: 'domcontentloaded' });
    
    console.log('[검사] Suspense 로딩 UI (Delay/pulse) 또는 loading-spinner 확인');
    const hasLoader = await page.evaluate(() => {
      return document.body.innerHTML.includes('pulse 1.5s') || document.body.innerHTML.includes('로딩 중');
    });
    
    if (!hasLoader) {
      console.log('❌ [결함 발견] Slow 3G 환경에서 API 지연 시 Suspense 기반 로딩 스피너가 노출되지 않음!');
    } else {
      console.log('✅ 로딩 스피너 정상 노출됨');
    }
  } catch (err) {
    console.log('오류:', err);
  }

  console.log('\n--- 2. [Offline] 에러 바운더리 트리거 및 빈 화면 검증 ---');
  // 완전 오프라인 모드 에뮬레이션
  await client.send('Network.emulateNetworkConditions', {
    offline: true,
    latency: 0,
    downloadThroughput: 0,
    uploadThroughput: 0
  });

  try {
    // 오프라인 상태에서 새로고침 또는 진입
    await page.goto('http://localhost:5173/employer/contracts', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));

    console.log('[검사] ErrorBoundary 동작 여부 확인');
    const hasErrorUI = await page.evaluate(() => {
      return document.body.innerText.includes('⚠️ React Error') || document.body.innerText.includes('새로고침');
    });

    if (!hasErrorUI) {
      console.log('❌ [결함 발견] 오프라인/API 에러 발생 시 ErrorBoundary가 트리거되지 않음!');
    } else {
      console.log('✅ ErrorBoundary가 정상 동작함');
    }

    const hasEmptyState = await page.evaluate(() => {
      return document.body.innerText.includes('아직 작성한 계약서가 없어요');
    });

    if (hasEmptyState) {
      console.log('❌ [결함 발견] API 에러가 났음에도 "아직 작성한 계약서가 없어요"라는 잘못된 정상 빈 화면(Empty State)을 보여줌!');
    }

  } catch (err) {
    console.log('네트워크 에러로 탐색 실패 시:', err.message);
  }

  await browser.close();
  console.log('\n[E2E Test] 테스트 종료');
})();
