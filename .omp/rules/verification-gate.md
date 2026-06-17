name: verification-gate
type: always
description: "UI 변경 시 브라우저 확인 없이 완료 선언 금지"


# Verification Gate

## Do not declare "done" without evidence

| Verification Type | Minimum Evidence | Counterexample (Insufficient) |
|------------------|------------------|-------------------------------|
| UI/Layout Change | Browser screenshot or Gemini Vision check | "TSC 0 errors" |
| Text/Spacing/Font | Actual rendered check (after dev server `--force` restart) | "Added the code" |
| CSS/Style Change | Inspect the element in browser | "Build passed" |
| Logic Change | Relevant test case passes | "Code review done" |
| Server/Environment Change | Verify HTTP response with `curl` | "Process checked" |

## Required checklist for UI changes

1. Is the dev server serving the latest code? (restart with `--force` or check HMR)
2. Did you actually open the changed page in a browser?
3. Does the changed element render as intended? (screenshot or Gemini Vision)
4. Are there any other pages broken by the change? (check at least 1 other page)

## "TSC OK" is not UI verification

TypeScript compiler does not verify CSS, layout, text overlap, style conflicts, or whether spacing renders.
TSC pass ≠ UI is correct. Always accompany it with a browser check.
