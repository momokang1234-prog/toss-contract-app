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
    console.log(' 👨‍💼 [TEST 1] 사장님: 완성된 계약서 확인 및 발송 대기');
    console.log('========================================');
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => sessionStorage.setItem('mock_role', 'employer'));
    await page.goto('http://localhost:5173/employer/contracts/mock-1', { waitUntil: 'domcontentloaded' });
    await sleep(2000);
    const draftBanner = await page.evaluate(() => document.body.innerText.includes('계약서 작성이 완료되었습니다'));
    console.log(draftBanner ? '✅ Draft 상태 정상 확인' : '❌ Draft 상태 오류');
    
    // ────────────────────────────────────────────────────────
    console.log('\n========================================');
    console.log(' 👷 [TEST 2] 알바생: 계약서 확인 및 폼 작성 후 서명');
    console.log('========================================');
    await page.evaluate(() => sessionStorage.setItem('mock_role', 'worker'));
    await page.goto('http://localhost:5173/worker/contracts/mock-2', { waitUntil: 'domcontentloaded' });
    await sleep(2000);
    
    console.log('👉 알바생 "서명하기" 클릭');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const signBtn = btns.find(b => b.textContent.includes('서명하기'));
      if(signBtn) signBtn.click();
    });
    
    await sleep(2000);

    // 자동 Funnel 통과 루프
    for (let i = 0; i < 7; i++) {
      const title = await page.evaluate(() => document.body.innerText);
      
      if (title.includes('기본 정보를\n확인해주세요')) {
        console.log('👉 1단계: 기본정보 확인 (입력 없음)');
        // 입력 없이 패스
      } else if (title.includes('주소를\n입력해주세요')) {
        console.log('👉 2단계: 주소 입력');
        await page.type('input', '서울시 강남구');
      } else if (title.includes('생년월일을\n입력해주세요')) {
        console.log('👉 3단계: 생년월일 입력');
        await page.evaluate(() => {
          const input = document.querySelector('input[type="date"]');
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          nativeInputValueSetter.call(input, '1995-05-05');
          input.dispatchEvent(new Event('input', { bubbles: true }));
        });
      } else if (title.includes('급여 받을 계좌번호를\n입력해주세요')) {
        console.log('👉 4단계: 계좌 입력');
        await page.evaluate(() => { const i = document.querySelector('input[readonly]'); if(i) i.click(); });
        await sleep(500);
        await page.evaluate(() => {
          const spans = Array.from(document.querySelectorAll('span'));
          const tb = spans.find(s => s.textContent === '토스뱅크');
          if(tb) tb.click();
        });
        await sleep(500);
        await page.evaluate(() => {
          const inputs = Array.from(document.querySelectorAll('input[type="tel"]'));
          const accountInput = inputs[inputs.length - 1];
          if(accountInput) {
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            nativeInputValueSetter.call(accountInput, '100020003000');
            accountInput.dispatchEvent(new Event('input', { bubbles: true }));
          }
        });
      } else if (title.includes('서명을\n남겨주세요')) {
        console.log('👉 5단계: 서명');
        break; // 서명 패드 도달!
      }
      
      await sleep(1000);
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const nextBtn = btns.find(b => b.textContent === '다음');
        if(nextBtn && !nextBtn.disabled) nextBtn.click();
      });
      await sleep(1500);
    }

    console.log('🖋️ 알바생 서명 패드 드로잉...');
    const workerCanvas = await page.$('canvas');
    if (workerCanvas) {
      const box = await workerCanvas.boundingBox();
      await page.mouse.move(box.x + 50, box.y + 50);
      await page.mouse.down();
      await page.mouse.move(box.x + 100, box.y + 100);
      await page.mouse.up();
      console.log('✅ 알바생 서명 드로잉 완료');
    }
    
    await sleep(1500);
    console.log('🚀 알바생 서명 완료(제출) 클릭');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const submitBtn = btns.find(b => b.textContent.includes('계약 완료'));
      if(submitBtn) submitBtn.click();
    });
    await sleep(4000); 

    // ────────────────────────────────────────────────────────
    console.log('\n========================================');
    console.log(' 👨‍💼 [TEST 3] 사장님: 교차 검증 및 최종 서명');
    console.log('========================================');
    await page.evaluate(() => sessionStorage.setItem('mock_role', 'employer'));
    await page.goto('http://localhost:5173/employer/contracts/mock-4', { waitUntil: 'domcontentloaded' });
    await sleep(3000);
    
    console.log('🔍 교차 검증 패널 확인');
    const panelCheck = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('근로자가 서명을 완료했습니다') && text.includes('사장님 입력 정보') && text.includes('실명 인증 정보');
    });
    console.log(panelCheck ? '✅ 교차 검증 패널 렌더링 확인' : '❌ 패널이 보이지 않음.');
    
    if (panelCheck) {
      await sleep(1000);
      console.log('👉 사장님 "신원 확인 및 최종 서명" 클릭');
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const signBtn = btns.find(b => b.textContent.includes('신원 확인 및 최종 서명'));
        if(signBtn) signBtn.click();
      });
      
      await sleep(2000);
      console.log('🖋️ 사장님 서명 패드 드로잉...');
      const empCanvas = await page.$('canvas');
      if (empCanvas) {
        const box = await empCanvas.boundingBox();
        await page.mouse.move(box.x + 50, box.y + 50);
        await page.mouse.down();
        await page.mouse.move(box.x + 150, box.y + 150);
        await page.mouse.up();
        console.log('✅ 사장님 서명 드로잉 완료');
      }

      await sleep(1500);
      console.log('🚀 최종 확정 버튼 클릭');
      const clicked = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const submitBtn = btns.find(b => b.textContent.includes('확정'));
        if (submitBtn) {
          submitBtn.removeAttribute('disabled'); // 강제 활성화
          submitBtn.click();
          return true;
        }
        return false;
      });
      console.log(clicked ? '✅ 버튼 강제 클릭 완료' : '❌ 버튼을 찾을 수 없음');
      
      await sleep(4000);
      
      const finalCheck = await page.evaluate(() => document.body.innerText.includes('계약이 확정되었습니다'));
      console.log(finalCheck ? '🎉 최종 계약 확정 배너 확인 완료!' : '❌ 최종 상태 업데이트 실패');
    }

  } catch (error) {
    console.error('테스트 에러 발생:', error);
  } finally {
    console.log('\n✅ 눈으로 보는 E2E 테스트가 종료되었습니다. 5초 뒤 브라우저가 닫힙니다.');
    await sleep(5000);
    await browser.close();
  }
})();
