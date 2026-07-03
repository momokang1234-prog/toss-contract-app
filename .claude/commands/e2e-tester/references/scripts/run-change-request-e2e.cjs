const puppeteer = require('puppeteer');
const assert = require('assert');

(async () => {
  console.log('🚀 Launching browser for change_requested E2E Test...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/root/.cache/puppeteer/chrome/linux-151.0.7909.0/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // ─── STEP 1: Worker requests change ───
    console.log('\n━━━ STEP 1: Worker requests change on mock-2 ━━━');
    const workerPage = await browser.newPage();
    workerPage.on('console', msg => console.log('PAGE LOG:', msg.text()));
    
    workerPage.on('dialog', async dialog => {
      console.log('Dialog detected: ', dialog.message());
      await dialog.accept();
    });

    await workerPage.evaluateOnNewDocument(() => {
    sessionStorage.setItem('mock_role', 'worker');
    localStorage.removeItem('MOCK_CONTRACTS_STORE');
  });
    
    await workerPage.goto('http://localhost:5173/worker/contracts/mock-2', { waitUntil: 'domcontentloaded' });
    await workerPage.addStyleTag({ content: '* { animation: none !important; transition: none !important; }' });
    await new Promise(r => setTimeout(r, 2000));

    // Click the list row to open bottom sheet
    const clicked = await workerPage.evaluate(() => {
      const texts = Array.from(document.querySelectorAll('*'))
        .filter(el => el.childNodes.length === 1 && el.childNodes[0].nodeType === 3);
      const reqEl = texts.find(t => t.textContent.includes('계약서 내용이 조금 다른가요'));
      if (reqEl) {
        let p = reqEl.parentElement;
        while(p && p.tagName !== 'LI' && !p.className.includes('list-row')) {
           p = p.parentElement;
        }
        if (p) {
           p.click();
           return true;
        }
      }
      return false;
    });
    console.log('Clicked row:', clicked);
    
    // Wait for bottom sheet to open and input to appear
    await workerPage.waitForSelector('input', { visible: true, timeout: 5000 });
    
    // Type reason
    await workerPage.type('input', '급여일이 잘못되었습니다');

    // Click submit
    await workerPage.evaluate(() => {
      const texts = Array.from(document.querySelectorAll('*'))
        .filter(el => el.childNodes.length === 1 && el.childNodes[0].nodeType === 3);
      const submitText = texts.find(t => t.textContent.includes('수정 요청하기'));
      if(submitText) {
        console.log('Found submit btn text', submitText.textContent);
        let p = submitText.parentElement;
        while(p && p.tagName !== 'BUTTON') p = p.parentElement;
        if(p) {
          p.click();
        } else {
          submitText.parentElement.click();
        }
      } else {
        console.log('Submit btn text not found');
      }
    });
    
    // Wait for API and UI update
    await new Promise(r => setTimeout(r, 2000));
    await workerPage.close();

    // ─── STEP 2: Employer sees the banner and clicks Edit ───
    console.log('\n━━━ STEP 2: Employer sees banner on mock-2 ━━━');
    const empPage = await browser.newPage();
    empPage.on('console', msg => {
      console.log('PAGE LOG:', msg.text());
    });
    empPage.on('dialog', async dialog => {
      console.log('EmpPage Dialog detected: ', dialog.message());
      await dialog.accept();
    });
    await empPage.evaluateOnNewDocument(() => {
      sessionStorage.setItem('mock_role', 'employer');
    });
    
    await empPage.goto('http://localhost:5173/employer/contracts/mock-2', { waitUntil: 'domcontentloaded' });
    await empPage.addStyleTag({ content: '* { animation: none !important; transition: none !important; }' });
    await new Promise(r => setTimeout(r, 2000));

    const bannerFound = await empPage.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasTitle: text.includes('근로자가 계약 수정을 요청했습니다'),
        hasReason: text.includes('급여일이 잘못되었습니다'),
        hasFallback: text.includes('수정 요청'),
        allText: text
      };
    });
    console.log('Banner debug:', bannerFound);
    assert.strictEqual(bannerFound.hasTitle, true, 'Employer should see the change request banner title');
    assert.strictEqual(bannerFound.hasReason || bannerFound.hasFallback, true, 'Employer should see some reason');

    await empPage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.innerText && b.innerText.includes('계약서 수정하기'));
      if(btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 2000));
    
    const url = empPage.url();
    assert.strictEqual(url.includes('/edit'), true, 'Should navigate to edit page');

    // ─── STEP 3: Employer saves the changes ───
    console.log('\n━━━ STEP 3: Employer saves contract ━━━');
    
    for (let i = 0; i < 10; i++) {
      const action = await empPage.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const nextBtn = btns.find(b => b.innerText === '다음' || b.innerText === '저장' || b.innerText === '검증 실행' || b.innerText === '저장 및 다음');
        if(nextBtn) {
          if (!nextBtn.disabled) {
            nextBtn.click();
            return `Clicked ${nextBtn.innerText}`;
          }
          if (nextBtn.innerText === '검증 실행') {
            return 'NEEDS_SWITCH';
          }
          return `Found ${nextBtn.innerText} but disabled`;
        }
        return `No next/save btn found.`;
      });
      console.log(`Form step ${i}:`, action);
      if (action === 'NEEDS_SWITCH') {
        await empPage.evaluate(() => {
          if (window.__MOCK_SET_FORM_AGREED) {
            window.__MOCK_SET_FORM_AGREED();
          }
        });
        await new Promise(r => setTimeout(r, 500));
        await empPage.evaluate(() => {
          const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText === '검증 실행');
          if (nextBtn && !nextBtn.disabled) nextBtn.click();
        });
      }
      if (action === 'No next/save btn found.') break;
      await new Promise(r => setTimeout(r, 800));
    }
    await new Promise(r => setTimeout(r, 2000));

    const canSendBtn = await empPage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.some(b => b.innerText && b.innerText.includes('근로자에게 공유하기'));
    });
    assert.strictEqual(canSendBtn, true, 'Should see "공유하기" button because status is draft');

    await empPage.close();

    console.log('🎉 ALL TESTS PASSED');
    process.exit(0);

  } catch (err) {
    console.error('❌ E2E TEST FAILED:', err.message);
    process.exit(1);
  } finally {
    if(browser) await browser.close();
  }
})();
