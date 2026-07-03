const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Launching browser for Network Fault Analysis...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/root/.cache/puppeteer/chrome/linux-151.0.7909.0/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  let allPassed = true;
  const results = [];

  function report(name, passed, detail) {
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} ${name}: ${detail}`);
    results.push({ name, passed, detail });
    if (!passed) allPassed = false;
  }

  console.log('\n━━━ [Case 10] 네트워크 결함 모사 검증 (Slow 3G & Offline) ━━━');
  const page = await browser.newPage();

  // Mock Session Injection
  await page.evaluateOnNewDocument(() => {
    sessionStorage.setItem('mock_role', 'employer');
    localStorage.setItem('lang_onboarded', '1');
  });

  const client = await page.target().createCDPSession();
  await client.send('Network.enable');

  try {
    // 1. Slow 3G 모사: 지연된 로딩(Loading Spinner) 노출 확인
    console.log('⏳ Emulating Slow 3G network...');
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 400 * 1024 / 8,
      uploadThroughput: 400 * 1024 / 8,
      latency: 2000,
    });

    // Navigate without awaiting completely so we can catch the loading state
    const gotoPromise = page.goto('http://localhost:5173/employer/dashboard', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait a brief moment to let the DOM initialize the loading state
    await new Promise(r => setTimeout(r, 500));
    
    const loadingText = await page.evaluate(() => document.body.innerText);
    const hasLoadingSpinner = loadingText.includes('로딩') || loadingText.includes('불러오는 중');
    
    if (hasLoadingSpinner) {
      report('네트워크-Slow3G', true, 'Slow 3G 환경에서 로딩 스피너 정상 노출 확인');
    } else {
      report('네트워크-Slow3G', false, '로딩 스피너 텍스트를 찾을 수 없음');
      console.log(`[DEBUG] Current text during load:\n${loadingText.substring(0, 200)}`);
    }

    // Wait for the page to finish loading under Slow 3G
    await gotoPromise;

    // 2. Offline 모사: 에러 바운더리 노출 확인
    console.log('🔌 Emulating Offline network...');
    await client.send('Network.emulateNetworkConditions', {
      offline: true,
      downloadThroughput: 0,
      uploadThroughput: 0,
      latency: 0,
    });

    // Attempt to reload or navigate while offline
    try {
      await page.goto('http://localhost:5173/employer/dashboard', { waitUntil: 'domcontentloaded', timeout: 10000 });
    } catch (e) {
      // Offline might throw navigation error directly in Puppeteer
      console.log(`[DEBUG] Navigation error as expected: ${e.message}`);
    }

    // Evaluate again to see if React Error Boundary or Offline Error is rendered
    // If the browser shows its native offline page (net::ERR_INTERNET_DISCONNECTED), we need to handle that,
    // but the task asks for React Error Boundary or loading spinner.
    // Let's trigger a client-side navigation or fetch to trigger Error Boundary instead.
    
    // To trigger React ErrorBoundary, we can try to click something or run a script that fetches data
    // Let's turn offline on *after* page load, then try to trigger a refetch.
    
    // Restore network to load page properly first
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: -1,
      uploadThroughput: -1,
      latency: 0,
    });
    await page.goto('http://localhost:5173/employer/dashboard', { waitUntil: 'networkidle2', timeout: 30000 });

    // Now go offline
    await client.send('Network.emulateNetworkConditions', {
      offline: true,
      downloadThroughput: 0,
      uploadThroughput: 0,
      latency: 0,
    });

    // Click on "새 계약서 작성" to trigger route change or fetch
    console.log('🖱️ Clicking element to trigger network request while offline...');
    const btnClicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, a, div'));
      const btn = btns.find(b => b.textContent?.includes('새 계약서 작성') || b.textContent?.includes('계약서 작성') || b.textContent?.includes('시작하기'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    // Wait a bit for error to propagate
    await new Promise(r => setTimeout(r, 2000));

    const pageTextAfterClick = await page.evaluate(() => document.body.innerText);
    const hasErrorBoundary = pageTextAfterClick.includes('React Error') || pageTextAfterClick.includes('에러') || pageTextAfterClick.includes('Error') || pageTextAfterClick.includes('실패');

    if (hasErrorBoundary) {
      report('네트워크-오프라인', true, '오프라인 환경에서 에러 바운더리 또는 에러 메시지 정상 노출 확인');
    } else {
      report('네트워크-오프라인', false, '오프라인 환경 에러 바운더리가 노출되지 않음');
      console.log(`[DEBUG] Current text after click:\n${pageTextAfterClick.substring(0, 300)}`);
    }

  } catch (error) {
    report('네트워크-시나리오-에러', false, error.message);
  } finally {
    await page.close();
  }

  // ─── SUMMARY ───
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
