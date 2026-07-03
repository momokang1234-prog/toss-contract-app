const puppeteer = require('puppeteer');

(async () => {
  console.log('=== E2E: 계약서 상세 페이지 언어 진단 ===');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/root/.cache/puppeteer/chrome/linux-151.0.7909.0/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  // Step 0: DevBypass로 employer 로그인 + mock 모드 진입
  console.log('[Step 0] DevBypass로 employer 로그인...');
  await page.goto('http://localhost:5173/dev/bypass?role=employer&path=/employer/contracts/mock-1', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Step 1: 현재 상태 진단 — localStorage, i18n.language, DOM 텍스트
  console.log('[Step 1] 현재 상태 진단...');
  const diagnosis1 = await page.evaluate(() => {
    const storedLang = window.localStorage.getItem('app_language');
    const i18nLang = window.__i18n_debug_lang || null;
    const url = window.location.href;
    
    // 계약서 테이블에서 첫 번째 th 텍스트 가져오기
    const ths = Array.from(document.querySelectorAll('th'));
    const thTexts = ths.slice(0, 5).map(th => th.textContent?.trim());
    
    // 제목 텍스트
    const titleEl = document.querySelector('[class*="docTitle"]');
    const titleText = titleEl?.textContent?.trim() || null;
    
    return { storedLang, i18nLang, url, thTexts, titleText };
  });
  console.log('진단 결과:', JSON.stringify(diagnosis1, null, 2));

  // Step 2: localStorage에 'ko' 명시적 설정 후 새로고침
  console.log('[Step 2] localStorage를 "ko"로 설정 후 새로고침...');
  await page.evaluate(() => {
    window.localStorage.setItem('app_language', 'ko');
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  const diagnosis2 = await page.evaluate(() => {
    const storedLang = window.localStorage.getItem('app_language');
    const url = window.location.href;
    
    const ths = Array.from(document.querySelectorAll('th'));
    const thTexts = ths.slice(0, 5).map(th => th.textContent?.trim());
    
    const titleEl = document.querySelector('[class*="docTitle"]');
    const titleText = titleEl?.textContent?.trim() || null;
    
    return { storedLang, url, thTexts, titleText };
  });
  console.log('ko 설정 후 진단 결과:', JSON.stringify(diagnosis2, null, 2));

  // 한국어 검증
  const koTitle = diagnosis2.titleText;
  if (koTitle && koTitle.includes('근 로 계 약 서')) {
    console.log('✅ SUCCESS: 한국어 제목 "근 로 계 약 서" 확인');
  } else {
    console.error(`❌ FAILED: 한국어 제목 기대, 실제: "${koTitle}"`);
  }

  const koThs = diagnosis2.thTexts || [];
  const hasKoreanTh = koThs.some(th => th && (th.includes('성명') || th.includes('계약 유형') || th.includes('연락처')));
  if (hasKoreanTh) {
    console.log('✅ SUCCESS: 한국어 라벨 (성명/계약유형/연락처) 확인');
  } else {
    console.error(`❌ FAILED: 한국어 라벨 미발견. th텍스트: ${JSON.stringify(koThs)}`);
  }

  // Step 3: localStorage를 'en'으로 변경 후 확인
  console.log('[Step 3] localStorage를 "en"으로 설정 후 새로고침...');
  await page.evaluate(() => {
    window.localStorage.setItem('app_language', 'en');
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  const diagnosis3 = await page.evaluate(() => {
    const storedLang = window.localStorage.getItem('app_language');
    
    const ths = Array.from(document.querySelectorAll('th'));
    const thTexts = ths.slice(0, 5).map(th => th.textContent?.trim());
    
    const titleEl = document.querySelector('[class*="docTitle"]');
    const titleText = titleEl?.textContent?.trim() || null;
    
    return { storedLang, thTexts, titleText };
  });
  console.log('en 설정 후 진단 결과:', JSON.stringify(diagnosis3, null, 2));

  // Step 4: 다시 localStorage를 'ko'로 복원 후 확인 (최종)
  console.log('[Step 4] localStorage를 다시 "ko"로 복원 후 새로고침...');
  await page.evaluate(() => {
    window.localStorage.setItem('app_language', 'ko');
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  const diagnosis4 = await page.evaluate(() => {
    const storedLang = window.localStorage.getItem('app_language');
    
    const ths = Array.from(document.querySelectorAll('th'));
    const thTexts = ths.slice(0, 5).map(th => th.textContent?.trim());
    
    const titleEl = document.querySelector('[class*="docTitle"]');
    const titleText = titleEl?.textContent?.trim() || null;
    
    return { storedLang, thTexts, titleText };
  });
  console.log('ko 복원 후 최종 진단:', JSON.stringify(diagnosis4, null, 2));

  const finalTitle = diagnosis4.titleText;
  if (finalTitle && finalTitle.includes('근 로 계 약 서')) {
    console.log('✅ FINAL SUCCESS: ko 복원 후 한국어 제목 정상');
  } else {
    console.error(`❌ FINAL FAILED: ko 복원 후 제목: "${finalTitle}"`);
  }

  // Step 5: getLocale() fallback 테스트 — localStorage 비움
  console.log('[Step 5] localStorage 비우고 새로고침 (fallback 테스트)...');
  await page.evaluate(() => {
    window.localStorage.removeItem('app_language');
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  const diagnosis5 = await page.evaluate(() => {
    const storedLang = window.localStorage.getItem('app_language');
    
    const titleEl = document.querySelector('[class*="docTitle"]');
    const titleText = titleEl?.textContent?.trim() || null;
    
    const ths = Array.from(document.querySelectorAll('th'));
    const thTexts = ths.slice(0, 5).map(th => th.textContent?.trim());
    
    return { storedLang, titleText, thTexts };
  });
  console.log('localStorage 없을 때 진단:', JSON.stringify(diagnosis5, null, 2));

  if (diagnosis5.titleText && diagnosis5.titleText.includes('근 로 계 약 서')) {
    console.log('✅ FALLBACK SUCCESS: localStorage 없어도 한국어 기본값 적용');
  } else {
    console.error(`❌ FALLBACK FAILED: localStorage 없을 때 제목: "${diagnosis5.titleText}"`);
    console.error('>>> getLocale() fallback이 영어를 반환하고 있을 가능성 높음!');
  }

  await browser.close();
  console.log('=== E2E 언어 진단 완료 ===');
})();
