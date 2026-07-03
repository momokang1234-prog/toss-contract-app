---
name: visual-e2e-test-generator
description: Generating and debugging visual (non-headless) Puppeteer E2E tests for React and TDS-mobile applications so users can watch the execution.
---
# Visual E2E Test Generator Playbook

## When to use this skill
- The user requests a visual E2E test, or explicitly mentions "내가 볼 수 있게 테스트" (a test I can watch), "headless: false", or "시연용 E2E".
- You are debugging an existing E2E test that interacts with complex UI components like TDS BottomSheets, Funnels, or HTML Canvas.

## Puppeteer Configuration Rules
Always setup the browser with visual observation settings:
```javascript
const browser = await puppeteer.launch({
  headless: false,
  defaultViewport: { width: 400, height: 850 },
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=400,850'],
  slowMo: 50 // crucial for human observation and allowing React state to catch up
});
const sleep = ms => new Promise(r => setTimeout(r, ms));
```

## React & TDS Interaction Hacks

### 1. React Input Events (nativeInputValueSetter)
When modifying uncontrolled or state-bound React inputs via Puppeteer's `page.evaluate()`, standard `input.value = 'x'` will NOT trigger React's `onChange`. You MUST bypass the React setter:
```javascript
await page.evaluate(() => {
  const input = document.querySelector('input[type="date"]');
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  nativeInputValueSetter.call(input, '1995-05-05');
  input.dispatchEvent(new Event('input', { bubbles: true }));
});
```
*Note: If possible, prefer `page.type('selector', 'text')` as it handles this automatically, but `nativeInputValueSetter` is required for specialized inputs.*

### 2. Bypassing Animation Issues (BottomSheets & Modals)
When interacting with elements inside a TDS `BottomSheet` or similar animated portal:
- Elements might not be instantly clickable or might be obscured during the slide-up animation.
- Do NOT rely entirely on `button.click()`. If the UI blocks the click due to animation, force it by removing the `disabled` attribute and clicking directly in `page.evaluate`:
```javascript
const clicked = await page.evaluate(() => {
  const submitBtn = Array.from(document.querySelectorAll('button'))
    .find(b => b.textContent.includes('확정'));
  if (submitBtn) {
    submitBtn.removeAttribute('disabled'); // bypass any transient state issues
    submitBtn.click();
    return true;
  }
  return false;
});
```

### 3. Drawing on Canvas (Signature Pad)
To simulate a user drawing on a `<canvas>` element:
```javascript
const canvas = await page.$('canvas');
if (canvas) {
  const box = await canvas.boundingBox();
  await page.mouse.move(box.x + 50, box.y + 50);
  await page.mouse.down();
  await page.mouse.move(box.x + 100, box.y + 100);
  await page.mouse.up();
}
```

## Test Flow Recommendations
- Print highly visible console logs (`console.log('👉 [TEST 1] ...')`) so the observer can follow what the bot is attempting to do in the terminal alongside the browser.
- Handle unexpected alerts aggressively so the visual test doesn't hang forever:
```javascript
page.on('dialog', async dialog => {
  console.log('Alert 팝업 발생:', dialog.message());
  await dialog.accept();
});
```
- **Self-Verification via Screenshot (MANDATORY)**: Before closing the browser, you MUST take a screenshot of the final UI state so that you (the agent) can verify it visually. Do not just blindly trust that the code executed properly.
```javascript
// Leave the browser open for the user to verify, and take a screenshot for yourself
await sleep(5000);
await page.screenshot({ path: 'final_state_capture.png' });
await browser.close();
```
- **Agent Action After Test**: After the test completes, you MUST use the `view_file` tool to open `final_state_capture.png`. Check the visual output with your own eyes before telling the user the test was successful.
