const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/root/.cache/puppeteer/chrome/linux-151.0.7909.0/chrome-linux64/chrome',
    headless: true,
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

  console.log('--- [Case 3] Auth Failure and Route Guard ---');

  // Test 1: 비로그인 상태로 /employer/contracts/new 직접 접근 → /login 리다이렉트
  try {
    console.log('Test 1: 비로그인 상태에서 employer 페이지 접근 차단');
    const page = await browser.newPage();
    // 세션 비우기 보장
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.evaluate(() => { sessionStorage.clear(); });
    await page.goto('http://localhost:5173/employer/contracts/new', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));
    const url = page.url();
    const redirected = url.includes('/login');
    report('Route-Guard-Employer', redirected, redirected ? `정상 리다이렉트: ${url}` : `차단 실패 - 현재 URL: ${url}`);
    await page.close();
  } catch (err) {
    report('Route-Guard-Employer', false, `에러: ${err.message}`);
  }

  // Test 2: employer로 로그인한 유저가 /worker/contracts 접근 → /login 리다이렉트 (역할 불일치)
  try {
    console.log('Test 2: employer가 worker 페이지 접근 시 차단');
    const page = await browser.newPage();
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.evaluate(() => { sessionStorage.setItem('mock_role', 'employer'); });
    await page.goto('http://localhost:5173/worker/contracts', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));
    const url = page.url();
    // worker 페이지 접근 차단 -> /login 리다이렉트 -> employer 로그인 상태이므로 /employer/dashboard 리다이렉트
    const redirected = url.includes('/login') || url.includes('/employer/dashboard');
    report('Role-Mismatch-Guard', redirected, redirected ? `정상 차단: ${url}` : `역할 불일치 차단 실패 - 현재 URL: ${url}`);
    await page.close();
  } catch (err) {
    report('Role-Mismatch-Guard', false, `에러: ${err.message}`);
  }

  // Test 3: 로그아웃(세션 만료) 후 employer 페이지 재접근 → /login 리다이렉트
  try {
    console.log('Test 3: 세션 만료 후 employer 페이지 재접근 차단');
    const page = await browser.newPage();
    // 먼저 로그인 상태 세팅
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.evaluate(() => { sessionStorage.setItem('mock_role', 'employer'); });
    await page.goto('http://localhost:5173/employer/dashboard', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1500));
    // 세션 삭제 (로그아웃 시뮬레이션)
    await page.evaluate(() => { sessionStorage.removeItem('mock_role'); });
    await page.goto('http://localhost:5173/employer/contracts/new', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));
    const url = page.url();
    const redirected = url.includes('/login');
    report('Session-Expired-Guard', redirected, redirected ? `정상 차단: ${url}` : `세션 만료 차단 실패 - 현재 URL: ${url}`);
    await page.close();
  } catch (err) {
    report('Session-Expired-Guard', false, `에러: ${err.message}`);
  }

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
