/**
 * toss-contract-app 전체 플로우 시뮬레이션
 *
 * 실행: npx tsx simulation/run-simulation.ts
 *
 * Mock 모드로 실행되므로 Supabase/백엔드 불필요.
 * Vite dev server가 실행 중이어야 함 (기본 localhost:5173).
 *
 * 사전 준비:
 *   VITE_SUPABASE_URL="https://placeholder.supabase.co" VITE_SUPABASE_ANON_KEY="placeholder" npx vite dev --port 5173
 *
 * PORT 환경변수로 dev server 포트 지정 가능: PORT=5174 npx tsx simulation/run-simulation.ts
 */
import puppeteer, { type Browser, type Page } from "puppeteer";

const PORT = parseInt(process.env.PORT || "5173", 10);
const BASE = `http://localhost:${PORT}`;
const SCREENSHOT_DIR = "output/simulation";

async function ss(page: Page, name: string) {
  await page.screenshot({ path: `${SCREENSHOT_DIR}/${name}.png`, fullPage: true });
}

async function clickButton(page: Page, text: string) {
  const buttons = await page.$$("button");
  for (const b of buttons) {
    const label = await b.evaluate(el => el.textContent?.trim() ?? "");
    if (label.includes(text)) {
      await b.click();
      return;
    }
  }
  throw new Error(`Button containing "${text}" not found`);
}

async function fillField(page: Page, placeholder: string, value: string) {
  const input = await page.waitForSelector(`input[placeholder*="${placeholder}"]`, { timeout: 3000 }).catch(() => null);
  if (input) {
    await input.click({ clickCount: 3 });
    await input.type(value, { delay: 30 });
  }
}

async function employerFlow(browser: Browser) {
  console.log("\n=== [1/2] 사장(고용주) 플로우 ===\n");

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });

  // 1. 로그인
  console.log("1. 로그인 페이지 → 사장님으로 로그인");
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle2" });
  await ss(page, "01-login-page");
  await clickButton(page, "사장님으로 시작하기");
  await page.waitForNavigation({ waitUntil: "networkidle2" });
  await ss(page, "02-dashboard");
  // 2. 사업장 등록
  console.log("2. 사업장 등록");
  await page.goto(`${BASE}/employer/business/new`, { waitUntil: "networkidle2" });
  // Step 1: 키패드로 사업자등록번호 입력
  for (const digit of "1234567890") {
    await page.evaluate((d) => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent?.trim() === d);
      if (btn) (btn as HTMLButtonElement).click();
    }, digit);
    await new Promise(r => setTimeout(r, 80));
  }
  await ss(page, "03-business-number");
  await clickButton(page, "확인");
    await new Promise(r => setTimeout(r, 500));

  // Step 2: 사업장 정보 입력
  await fillField(page, "사업장 이름", "맛있는카페");
  await fillField(page, "대표자 이름", "김사장");
  await fillField(page, "주소", "서울시 강남구");
  await fillField(page, "02-1234-5678", "0212345678");
  await ss(page, "04-business-info");
  await clickButton(page, "등록하기");
  await new Promise(r => setTimeout(r, 1000));
  await ss(page, "05-business-done");

  // 3. 대시보드
  console.log("3. 대시보드 확인");
  await page.goto(`${BASE}/employer/dashboard`, { waitUntil: "networkidle2" });
  await ss(page, "06-dashboard");
  // 4. 계약서 작성
  console.log("4. 계약서 작성 시작");
  await page.goto(`${BASE}/employer/contracts/new`, { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 1000));
  await ss(page, "06-contract-form");

  // 5. 계약서 목록
  console.log("5. 계약서 목록");
  await page.goto(`${BASE}/employer/contracts`, { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 1000));
  await ss(page, "07-contract-list");

  // 6. 계약서 상세 (Mock 데이터)
  console.log("6. 계약서 상세 + 전송");
  await page.goto(`${BASE}/employer/contracts/mock-1`, { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 1000));
  await ss(page, "08-contract-detail");
  try {
    await clickButton(page, "전송");
    await new Promise(r => setTimeout(r, 500));
    await ss(page, "09-contract-sent");
  } catch {
    console.log("   (전송 버튼 없음 — 이미 전송된 상태)");
  }

  await page.close();
  console.log("✅ 사장 플로우 완료\n");
}

async function workerFlow(browser: Browser) {
  console.log("\n=== [2/2] 근로자 플로우 ===\n");

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });

  // 1. 근로자 로그인
  console.log("1. 근로자 로그인");
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle2" });
  await clickButton(page, "근로자로 시작하기");
  await page.waitForNavigation({ waitUntil: "networkidle2" });
  await ss(page, "10-worker-login");

  // 2. 계약서 목록
  console.log("2. 근로자 계약서 목록");
  await page.goto(`${BASE}/worker/contracts`, { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 1000));
  await ss(page, "11-worker-contract-list");

  // 3. 계약서 상세 확인
  console.log("3. 계약서 상세 확인");
  await page.goto(`${BASE}/worker/contracts/mock-1`, { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 1000));
  await ss(page, "12-worker-contract-detail");

  // 4. 서명 페이지
  console.log("4. 서명 페이지");
  await page.goto(`${BASE}/worker/contracts/mock-1/sign`, { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 1000));
  await ss(page, "13-worker-sign");

  // 5. 서명 완료 후 확인
  console.log("5. 서명 완료 후 계약서 확인");
  await page.goto(`${BASE}/worker/contracts/mock-1`, { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 1000));
  await ss(page, "14-worker-contract-final");

  await page.close();
  console.log("✅ 근로자 플로우 완료\n");
}

async function main() {
  const { mkdir } = await import("node:fs/promises");
  await mkdir(SCREENSHOT_DIR, { recursive: true });

  console.log("🚀 toss-contract-app 시뮬레이션 시작\n");
  console.log(`   BASE URL: ${BASE}`);
  console.log(`   스크린샷: ${SCREENSHOT_DIR}/`);

  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 80,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    await employerFlow(browser);
    await workerFlow(browser);
    console.log("\n🎉 전체 시뮬레이션 완료!");
    console.log(`   스크린샷: ${SCREENSHOT_DIR}/`);
  } catch (err) {
    console.error("❌ 시뮬레이션 실패:", err);
  } finally {
    await browser.close();
  }
}

main();
