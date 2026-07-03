const puppeteer = require('puppeteer');

(async () => {
  console.log('=== E2E: 계약서 상세 페이지 다국어 & 세부 서식 검증 ===');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/root/.cache/puppeteer/chrome/linux-151.0.7909.0/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  const verifyLang = async (lang, expectedTitle, expectedWageSuffix, expectedDatePart, expectedStatusText, mockId = 'mock-1') => {
    console.log(`\n--- [테스트 언어: ${lang}] ---`);
    
    // DevBypass로 진입하여 특정 언어로 설정 (우선 상세 페이지에서 상세 검증)
    await page.goto(`http://localhost:5173/dev/bypass?role=employer&path=/employer/contracts/${mockId}`, { waitUntil: 'networkidle2' });
    await page.evaluate((l) => {
      window.localStorage.setItem('app_language', l);
    }, lang);
    
    // 설정 적용을 위해 새로고침
    await page.reload({ waitUntil: 'networkidle2' });
    
    // docTitle 엘리먼트가 렌더링될 때까지 대기
    await page.waitForSelector('[class*="docTitle"]', { timeout: 10000 });

    const result = await page.evaluate(() => {
      // 1. 문서 제목
      const titleEl = document.querySelector('[class*="docTitle"]');
      const titleText = titleEl?.textContent?.trim() || null;
      
      // 2. 문서 작성일
      const dateEl = document.querySelector('[class*="docDate"]');
      const dateText = dateEl?.textContent?.trim() || null;
      
      // 3. 기본 임금 행 텍스트
      const ths = Array.from(document.querySelectorAll('th'));
      const baseWageTh = ths.find(th => th.textContent?.includes('기본 임금') || th.textContent?.includes('Base Wage') || th.textContent?.includes('Lương cơ bản'));
      const wageText = baseWageTh?.nextElementSibling?.textContent?.trim() || null;

      return { titleText, dateText, wageText };
    });

    console.log(`[상세 페이지 결과]`, JSON.stringify(result, null, 2));

    // 검증 1: 제목
    if (result.titleText && result.titleText.replace(/\s+/g, '').includes(expectedTitle.replace(/\s+/g, ''))) {
      console.log(`✅ 제목 성공: "${result.titleText}" 에 "${expectedTitle}" 포함됨 (공백 무시)`);
    } else {
      console.error(`❌ 제목 실패: 기대값 "${expectedTitle}", 실제 "${result.titleText}"`);
      process.exit(1);
    }

    // 검증 2: 임금 접미사
    if (result.wageText && result.wageText.includes(expectedWageSuffix)) {
      console.log(`✅ 임금 성공: "${result.wageText}" 에 "${expectedWageSuffix}" 포함됨`);
    } else {
      console.error(`❌ 임금 실패: 기대값 "${expectedWageSuffix}", 실제 "${result.wageText}"`);
      process.exit(1);
    }

    // 검증 3: 로케일 날짜
    if (result.dateText && result.dateText.includes(expectedDatePart)) {
      console.log(`✅ 날짜 성공: "${result.dateText}" 에 "${expectedDatePart}" 포함됨`);
    } else {
      console.error(`❌ 날짜 실패: 기대값 "${expectedDatePart}", 실제 "${result.dateText}"`);
      process.exit(1);
    }

    // 목록 페이지로 DevBypass 진입하여 배지(status badge) 검증
    await page.goto(`http://localhost:5173/dev/bypass?role=employer&path=/employer/contracts`, { waitUntil: 'networkidle2' });
    
    // 배지 엘리먼트가 보일 때까지 대기
    try {
      await page.waitForSelector('[data-tds-mobile-component="Badge"]', { timeout: 10000 });
    } catch (e) {
      const bodyHtml = await page.evaluate(() => document.body.innerHTML);
      console.error('❌ 배지 대기 실패. Body HTML:', bodyHtml);
      process.exit(1);
    }

    const listResult = await page.evaluate(() => {
      const badges = Array.from(document.querySelectorAll('[data-tds-mobile-component="Badge"]'));
      return badges.map(b => b.textContent?.trim());
    });

    console.log(`[목록 페이지 배지 수집]`, listResult);

    if (listResult.some(text => text && text.includes(expectedStatusText))) {
      console.log(`✅ 배지 성공: 수집된 배지 중 "${expectedStatusText}"가 존재함`);
    } else {
      console.error(`❌ 배지 실패: 기대값 "${expectedStatusText}"를 수집된 목록 ${JSON.stringify(listResult)} 에서 찾을 수 없음`);
      process.exit(1);
    }
  };

  try {
    // 1. 한국어 검증 (mock-1: 작성 중)
    await verifyLang('ko', '근 로 계 약 서', '원', '2026년 6월 1일', '작성 중', 'mock-1');

    // 2. 영어 검증 (mock-1: Drafting)
    await verifyLang('en', 'EMPLOYMENT CONTRACT', 'KRW (원)', 'June 1, 2026', 'Drafting', 'mock-1');

    // 3. 베트남어 검증 (mock-1: Đang soạn)
    await verifyLang('vi', 'H Ợ P Đ Ồ N   L A O Đ Ộ N G', 'KRW (원)', '2026', 'Đang soạn', 'mock-1');

    // 4. 영어 검증 (mock-2: Pending Sign) - mock-2 created_at 은 2026-06-20 이므로 June 20, 2026 이 됨
    await verifyLang('en', 'EMPLOYMENT CONTRACT', 'KRW (원)', 'June 20, 2026', 'Pending Sign', 'mock-2');

    console.log('\n🎉 모든 다국어 E2E 테스트 검증 성공!');
  } catch (err) {
    console.error('❌ E2E 테스트 실행 중 오류 발생:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
