const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/root/.cache/puppeteer/chrome/linux-151.0.7909.0/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const results = [];
  let allPassed = true;

  function report(name, passed, detail) {
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} ${name}: ${detail}`);
    results.push({ name, passed, detail });
    if (!passed) allPassed = false;
  }

  async function clickCta(page, text) {
    await page.evaluate((txt) => {
      const ctas = document.querySelectorAll('[class*="bottomCta"] button');
      for (const b of ctas) {
        if (b.textContent.includes(txt) && !b.disabled) {
          b.click(); return;
        }
      }
    }, text);
    await new Promise(r => setTimeout(r, 1000));
  }

  async function clickButton(page, text) {
    await page.evaluate((txt) => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.trim() === txt);
      if (btn) btn.click();
    }, text);
    await new Promise(r => setTimeout(r, 500));
  }

  try {
    const page1 = await browser.newPage();
    
    // Auth mock setup
    await page1.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await page1.evaluate(() => {
      sessionStorage.setItem('mock_role', 'employer');
      sessionStorage.removeItem('wiz_form');
    });

    // ============================================
    // Test 1: 정규직 (Full-time) Happy Path
    // ============================================
    console.log('\n━━━ [정규직] 정상 작성 테스트 ━━━');
    await page1.goto('http://localhost:5173/employer/contracts/new', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    
    // Step 1: Basic Info
    console.log('Step 1: Basic Info');
    await page1.type('input[placeholder="예: 홍길동"]', '김정규');
    await page1.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 500));
    await page1.type('input[placeholder="01012345678"]', '01011112222');
    await page1.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 500));
    await clickCta(page1, '다음');

    // Step 2: Work Conditions
    console.log('Step 2: Work Conditions');
    await clickButton(page1, '정규직');
    await page1.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const wp = inputs.find(i => i.placeholder.includes('토스카페 강남점'));
      if (wp) { wp.value = '서울시 강남구'; wp.dispatchEvent(new Event('input', { bubbles: true })); }
    });
    await new Promise(r => setTimeout(r, 500));
    await page1.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const job = inputs.find(i => i.placeholder.includes('매장 관리'));
      if (job) { job.value = '서빙'; job.dispatchEvent(new Event('input', { bubbles: true })); }
    });
    await new Promise(r => setTimeout(r, 500));
    await clickButton(page1, '날짜 선택');
    await clickButton(page1, '확인');
    await clickCta(page1, '다음');

    // Step 3: Work Schedule
    console.log('Step 3: Work Schedule');
    await clickButton(page1, '월');
    await clickButton(page1, '화');
    await clickButton(page1, '수');
    await clickButton(page1, '목');
    await clickButton(page1, '금');
    await clickButton(page1, '선택 완료');
    await clickButton(page1, '모든 요일 같게');
    await page1.evaluate(() => {
      const timeInputs = Array.from(document.querySelectorAll('input[type="time"]'));
      if (timeInputs.length >= 4) {
        timeInputs[0].value = '09:00'; timeInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
        timeInputs[1].value = '18:00'; timeInputs[1].dispatchEvent(new Event('input', { bubbles: true }));
        timeInputs[2].value = '12:00'; timeInputs[2].dispatchEvent(new Event('input', { bubbles: true }));
        timeInputs[3].value = '13:00'; timeInputs[3].dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await new Promise(r => setTimeout(r, 500));
    await page1.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent === '다음' && !b.closest('[class*="bottomCta"]'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 500));
    await clickButton(page1, '일');
    await clickCta(page1, '다음');

    // Step 4: Wage & Insurance
    console.log('Step 4: Wage & Insurance');
    await clickButton(page1, '월급');
    await page1.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const wg = inputs.find(i => i.placeholder && i.placeholder.includes('예: 10000'));
      if (wg) { wg.value = '3000000'; wg.dispatchEvent(new Event('input', { bubbles: true })); }
    });
    await new Promise(r => setTimeout(r, 500));
    await clickButton(page1, '계좌이체');
    await clickButton(page1, '10일');
    await clickCta(page1, '다음');

    // Step 5: Other Conditions
    console.log('Step 5: Other Conditions');
    await clickCta(page1, '다음');

    // Step 6: Final Checklist
    console.log('Step 6: Final Checklist');
    await page1.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input[type="checkbox"]'));
      const cb = inputs.find(i => i.getAttribute('aria-label') === '체크리스트 확인 동의' || i.className.includes('switch'));
      if (cb) { cb.click(); }
      else {
         const switches = Array.from(document.querySelectorAll('[role="switch"]'));
         if (switches.length > 0) switches[0].click();
         else {
           const el = document.querySelector('input[type="checkbox"]');
           if (el) el.click();
         }
      }
    });
    await new Promise(r => setTimeout(r, 500));
    await clickCta(page1, '검증 실행');
    await new Promise(r => setTimeout(r, 1000));

    // Step 7: Preview
    console.log('Step 7: Preview');
    await clickCta(page1, '저장 및 다음');
    await new Promise(r => setTimeout(r, 2000));
    const isSuccess = await page1.evaluate(() => {
      return window.location.href.includes('/employer/contracts/') && window.location.href.length > 30;
    });
    report('정규직 폼 작성 및 저장', isSuccess, isSuccess ? '정상 작성 완료' : '저장 실패');

    await page1.close();


    // ============================================
    // Test 2: 단시간 (Part-time) Happy Path
    // ============================================
    console.log('\n━━━ [단시간] 정상 작성 테스트 ━━━');
    const page2 = await browser.newPage();
    
    // Auth mock setup
    await page2.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await page2.evaluate(() => {
      sessionStorage.setItem('mock_role', 'employer');
      sessionStorage.removeItem('wiz_form');
    });

    await page2.goto('http://localhost:5173/employer/contracts/new', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    console.log('Step 1: Basic Info');
    await page2.type('input[placeholder="예: 홍길동"]', '이알바');
    await page2.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 500));
    await page2.type('input[placeholder="01012345678"]', '01033334444');
    await page2.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 500));
    await clickCta(page2, '다음');

    console.log('Step 2: Work Conditions');
    await clickButton(page2, '단시간');
    await page2.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const wp = inputs.find(i => i.placeholder.includes('토스카페 강남점'));
      if (wp) { wp.value = '서울시 서초구'; wp.dispatchEvent(new Event('input', { bubbles: true })); }
    });
    await new Promise(r => setTimeout(r, 500));
    await page2.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const job = inputs.find(i => i.placeholder.includes('매장 관리'));
      if (job) { job.value = '바리스타'; job.dispatchEvent(new Event('input', { bubbles: true })); }
    });
    await new Promise(r => setTimeout(r, 500));
    await clickButton(page2, '날짜 선택');
    await clickButton(page2, '확인');
    await clickCta(page2, '다음');

    console.log('Step 3: Work Schedule');
    await clickButton(page2, '월');
    await clickButton(page2, '화');
    await clickButton(page2, '선택 완료');
    await clickButton(page2, '모든 요일 같게');
    await page2.evaluate(() => {
      const timeInputs = Array.from(document.querySelectorAll('input[type="time"]'));
      if (timeInputs.length >= 4) {
        timeInputs[0].value = '10:00'; timeInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
        timeInputs[1].value = '14:00'; timeInputs[1].dispatchEvent(new Event('input', { bubbles: true }));
        timeInputs[2].value = '12:00'; timeInputs[2].dispatchEvent(new Event('input', { bubbles: true }));
        timeInputs[3].value = '12:30'; timeInputs[3].dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await new Promise(r => setTimeout(r, 500));
    await page2.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent === '다음' && !b.closest('[class*="bottomCta"]'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 500));
    await clickButton(page2, '일');
    await clickCta(page2, '다음');

    console.log('Step 4: Wage & Insurance');
    await clickButton(page2, '시급');
    await page2.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const wg = inputs.find(i => i.placeholder && i.placeholder.includes('예: 10000'));
      if (wg) { wg.value = '15000'; wg.dispatchEvent(new Event('input', { bubbles: true })); }
    });
    await new Promise(r => setTimeout(r, 500));
    await clickButton(page2, '현금');
    await clickButton(page2, '15일');
    await clickCta(page2, '다음');

    console.log('Step 5: Other Conditions');
    await clickCta(page2, '다음');

    console.log('Step 6: Final Checklist');
    await page2.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input[type="checkbox"]'));
      const cb = inputs.find(i => i.getAttribute('aria-label') === '체크리스트 확인 동의' || i.className.includes('switch'));
      if (cb) { cb.click(); }
      else {
         const switches = Array.from(document.querySelectorAll('[role="switch"]'));
         if (switches.length > 0) switches[0].click();
         else {
           const el = document.querySelector('input[type="checkbox"]');
           if (el) el.click();
         }
      }
    });
    await new Promise(r => setTimeout(r, 500));
    await clickCta(page2, '검증 실행');
    await new Promise(r => setTimeout(r, 1000));

    console.log('Step 7: Preview');
    await clickCta(page2, '저장 및 다음');
    await new Promise(r => setTimeout(r, 2000));
    const isSuccess2 = await page2.evaluate(() => {
      return window.location.href.includes('/employer/contracts/') && window.location.href.length > 30;
    });
    report('단시간 폼 작성 및 저장', isSuccess2, isSuccess2 ? '정상 작성 완료' : '저장 실패');
    
    await page2.close();

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

  } catch (e) {
    console.error(e);
    allPassed = false;
  } finally {
    await browser.close();
    process.exit(allPassed ? 0 : 1);
  }
})();

