능 구현 계획

> 대상: 사용자 행동 기록, 유입 경로 래퍼럴, 연락처 권한, 계약서 PDF 뷰어
> 작성일: 2026-06-19
---

## 리뷰 보드 판정 요약

**참여 전문가:** Supabase · Mini-app/Granite · UX/보안 (3인 합의)

### 합의 사항
- **Analytics 백엔드:** Toss 내부 로그를 1순위, Supabase는 도메인 이벤트(저빈도)만 보조 수집
- **PDF 생성:** 클라이언트(jspdf) 유지 — Deno Edge Function에서 CJK 폰트/Puppeteer 불가
- **연락처 사용처:** 사장님(employer) 계약서 전송 시만 (근로자는 `USER_PHONE` scope로 이미 취득)
- **Import 경로:** 전부 `@apps-in-toss/web-framework`로 통일 (`web-analytics` 직접 import 금지)
- **권한 설정:** `granite.config.ts`에 `contacts: read`만 추가, 나머지 API는 권한 불필요

### 수정 반영 (HIGH)
- [x] 환경 감지 3분기 유틸 추가 (`toss` | `sandbox` | `browser`)
- [x] Import 경로 전체 `@apps-in-toss/web-framework`로 교체
- [x] PDF 뷰어 버전 체크 → `isMinVersionSupported()` 사용
- [x] 연락처 권한 요청 전 pre-permission prompt 필수
- [x] `fetchContacts` 페이지네이션 + 에러 처리 추가

### 수정 반영 (MEDIUM)
- [x] Tracking: funnel 이동은 `click`만, `screen`은 진입 1회만; 근로자 익명화
- [x] PDF 버튼 "계약서 보관" 통합 + 바텀시트 (보기/저장/공유)
- [x] PDF 생성 중 로딩 스피너
- [x] UTM `encodeURIComponent()` 명시화
- [x] `deliveries` 테이블 UTM 컬럼 마이그레이션

---

## 0. 선행 작업: 환경 감지 유틸 (모든 기능의 의존성)

### 왜 필요한가
- Bridge API(`fetchContacts`, `openPDFViewer`, `saveBase64Data`, `getSchemeUri`)는 Toss 앱 내 WebView에서만 동작
- 샌드박스(`IS_SANDBOX=1`)와 로컬 브라우저(`localhost:5173`)에서는 mock/fallback 필요
- `getOperationalEnvironment()`는 브라우저 환경에서 throw 하므로 try-catch로 `browser` 감지

### 구현
```
src/utils/environment.ts
```
```typescript
import { getOperationalEnvironment } from '@apps-in-toss/web-framework';

export function getEnvironment(): 'toss' | 'sandbox' | 'browser' {
  try {
    const env = getOperationalEnvironment();
    return env; // 'toss' | 'sandbox'
  } catch {
    return 'browser'; // localhost dev, 단순 브라우저 접속
  }
}

export function isTossApp(): boolean {
  return getEnvironment() === 'toss';
}
```

### 사용처
- `contacts.ts`: toss 외 → 직접 입력만 제공
- `pdfViewer.ts`: toss 외 → 웹 폴백 (`pdf.save()`)
- `pdfShare.ts`: toss 외 → 일반 `<a download>` 폴백
- `referrer.ts`: browser → deeplink 없음 → referrer 미설정
- `tracking.ts`: sandbox/browser → console.log만

---

## 1. 사용자 행동 기록 (User Behavior Tracking)

### 현황
- `Analytics.click()` 이 일부 페이지(Dashboard 등)에서만 사용 중
- `@apps-in-toss/web-framework`에서 `Analytics.screen`, `.click`, `.impression` 제공
- `eventLog` bridge 로 임의 이벤트 로깅 가능

### 구현 방향

**A. 트래킹 유틸 래퍼 작성**
```
src/utils/tracking.ts
```
- `Analytics.screen()`, `.click()`, `.impression()` 호출을 감싸는 헬퍼
- 환경별 분기: toss → Analytics API 호출, sandbox/browser → console.log만
- 공통 파라미터 (role 등) 자동 주입 — **근로자 행동은 익명화** (user_id/device_id 제외)
- 기존 `DashboardPage.tsx` 의 직접 Analytics 호출도 이 래퍼로 리팩토링

```typescript
import { Analytics } from '@apps-in-toss/web-framework'; // ← web-analytics 아님
```

**B. 주요 화면/이벤트 식별**

| 화면 | log_name (screen) | 주요 click 이벤트 |
|------|-------------------|------------------|
| 로그인 | `auth_login` | `login_submit`, `login_dev_bypass` |
| 대시보드 | `employer_dashboard` | `dashboard_new_contract`, `dashboard_contract_card` |
| 계약서 작성 | `contract_form_{step}` | `form_next`, `form_prev`, `form_save_draft` |
| 계약서 상세 | `contract_detail` | `detail_send`, `detail_cancel`, `detail_share` |
| 근로자 서명 | `worker_contract_sign` | `sign_next`, `sign_complete` |
| 계약서 목록 | `contract_list` | `list_contract_card`, `list_filter` |

**C. 로깅 규칙 (리뷰 반영)**
- `screen` 이벤트: 각 화면 **최초 진입 시 1회만** (`useEffect` 마운트 시)
- funnel 단계 이동: `click` 이벤트로만 수집 (중복 screen 로그 방지)
- 근로자 경로: `user_id`, `device_id` 파라미터 제외 (익명화)
- 백엔드 수집: Toss 내부 로그 우선, "계약서 생성 완료" 등 도메인 이벤트만 선택적 Supabase 전송

---

## 2. 유입 경로 래퍼럴 (Referrer / Traffic Source)

### 현황
- `getSchemeUri()` 로 초기 deeplink URI 취득 가능 (`src/App.tsx` L89)
- 현재 `?path=` 파라미터만 파싱 중
- UTM 파라미터 파싱 로직 없음

### 구현 방향

**A. deeplink URI 확장**
```
intoss://bossimclockedin?path=/contract/123&utm_source=share&utm_medium=message&utm_campaign=v1
```
- 공유 링크 생성 시 `encodeURIComponent()`로 UTM 값 인코딩 명시 (한글 캠페인명 대응)
- `URLSearchParams` 는 자동 디코딩하므로 수신 측은 추가 처리 불필요

**B. UTM 파싱 — 하이브리드 저장 (리뷰 반영)**
```
src/utils/referrer.ts
```
- `getSchemeUri()` 에서 UTM 파라미터 추출 (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`)
- **클라이언트:** `ReferrerContext` + `sessionStorage` (TTL 30분) 로 analytics enrichment
- **서버:** `contracts-send` Edge Function 호출 시 `utm_*` 파라미터 함께 전송 → `deliveries` 테이블에 저장

**C. DB 마이그레이션 (리뷰 반영)**
```sql
-- supabase/migrations/xxx_add_utm_to_deliveries.sql
ALTER TABLE public.deliveries
  ADD COLUMN utm_source TEXT,
  ADD COLUMN utm_medium TEXT,
  ADD COLUMN utm_campaign TEXT;
```
> 캠페인별 계약서 전환율 분석을 위해 DB 영속화 필요 (sessionStorage만으로는 앱 재시작 시 소멸)

**D. Context 연동**
```
src/contexts/ReferrerContext.tsx
```
- 앱 진입 시 1회 파싱, `sessionStorage` 에 30분 TTL 부여
- `useReferrer()` hook 제공
- tracking 유틸에서 공통 파라미터로 참조

---

## 3. 연락처 권한 (Contact Permission)

### 현황
- `granite.config.ts` 의 `permissions: []` — 연락처 권한 미선언
- `fetchContacts` API 이용 가능 (`@apps-in-toss/web-framework`)
- 근로자 전화번호는 Toss 로그인 `USER_PHONE` scope로 이미 자동 채움 (`ContractSignPage.tsx` L43)

### 구현 방향

> **판정: 사장님(employer) 계약서 전송 시만 사용** — 근로자 경로에서는 불필요

**A. granite.config.ts 권한 선언**
```typescript
permissions: [
  { name: 'contacts', access: 'read' }
]
```

**B. Pre-permission prompt (리뷰 반영 — 필수)**
`openPermissionDialog()` 호출 전에 **반드시** 설명 시트 표시:
- 바텀시트 or 알럿: "사장님의 연락처에서 근로자 번호를 빠르게 찾을 수 있어요"
- 사전 설명 없이 네이티브 다이얼로그 호출 시 거부율 60~80%
- 사용자가 "아니오" 선택 시 권한 요청 스킵

**C. 연락처 접근 유틸**
```
src/utils/contacts.ts
src/hooks/useContacts.ts
```
```typescript
import { fetchContacts } from '@apps-in-toss/web-framework';

// 권한 상태 확인
const status = await fetchContacts.getPermission();
// 'allowed' | 'denied' | 'notDetermined'

// 권한 요청 다이얼로그 (pre-permission 이후에만 호출)
const result = await fetchContacts.openPermissionDialog();
// 'allowed' | 'denied'

// 연락처 검색 (페이지네이션 처리 필수 — 리뷰 반영)
const response = await fetchContacts({
  size: 20, offset: 0,
  query: { contains: '김' }
});
// response.result: Array<{ name: string; phoneNumber: string }>
// response.nextOffset: number | null
// response.done: boolean
// → nextOffset/null → done 체크로 무한 스크롤 구현

// 에러 처리: FetchContactsPermissionError catch → 직접 입력 안내
```

**D. UI 통합 포인트 — 사장님만**
- `Step1BasicInfo` (계약서 작성 1단계): 전화번호 입력 필드 옆 "연락처에서 선택" 버튼
- 권한 거부 / toss 앱 외 환경: fallback 안내 + 직접 입력 유도

---

## 4. 파일 저장 > 계약서 PDF 저장

### 현황
- `src/utils/pdf.ts` — `html2canvas-pro` + `jspdf` 로 클라이언트 PDF 생성
- `contract_pdf_url` 컬럼 존재하나 미사용
- `saveBase64Data` API (web-framework) 로 기기에 파일 저장 가능

### 구현 방향

**A. PDF 생성 → Base64 변환**
```
src/utils/pdfShare.ts
```
- 기존 `downloadContractPDF()` 의 jspdf output → Base64 인코딩
- `finally` 블록에서 **메모리 해제** 필수 (리뷰 반영 — DOM/Canvas/Base64/jsPDF 4중 복제 방지)
- 생성 중 **로딩 스피너** 표시 (1~3초 소요, 리뷰 반영)

```typescript
import { saveBase64Data } from '@apps-in-toss/web-framework';

async function saveContractToDevice(contract: Contract) {
  const env = getEnvironment();
  if (env === 'browser') {
    // 폴백: 일반 브라우저 다운로드
    return downloadContractPDF(contract);
  }

  const base64 = await generateContractBase64(contract);
  try {
    await saveBase64Data({
      data: base64,
      fileName: `근로계약서_${contract.id}.pdf`,
      mimeType: 'application/pdf'
    });
  } finally {
    base64 = null; // 메모리 해제
  }
}
```

**B. 서버 보관 (Phase 2)**
> 1단계에서는 클라이언트 생성 + 기기 저장만. 이후 "이메일 전송" 또는 "장기 보관" 기능 시 Storage 업로드 추가

---

## 5. PDF 뷰어 (Native PDF Viewer)

### 현황
- `openPDFViewer` bridge API 이용 가능 (Toss app >= 5.261.0)
- 기존에는 웹 기반 미리보기(ContractPreview 컴포넌트)만 존재

### 구현 방향

**A. PDF 뷰어 호출 유틸**
```
src/utils/pdfViewer.ts
```
```typescript
import { openPDFViewer, isMinVersionSupported } from '@apps-in-toss/web-framework';

// 버전 체크 (리뷰 반영 — 수동 파싱 대신 API 사용)
const canOpenPDFViewer = isMinVersionSupported({
  android: '5.261.0',
  ios: '5.261.0'
});

if (canOpenPDFViewer && isTossApp()) {
  const result = await openPDFViewer({
    data: base64PdfString,
    filename: '근로계약서.pdf'
  });
  // result: 'CLOSE'
}
```

**B. 에러 핸들링**
| 에러 코드 | 대응 |
|-----------|------|
| `INVALID_REQUEST` | 파라미터 검증 로직 추가 |
| `INVALID_DATA` | PDF 데이터 무결성 검사 |
| `PDF_VIEWER_ERROR` | 폴백: `pdf.save()` 다운로드 유도 |
| `UNSUPPORTED_APP_VERSION` | 앱 업데이트 안내 + 폴백 |

**C. "계약서 보관" 통합 UI (리뷰 반영)**
> "PDF 보기" + "PDF 저장"을 별도 버튼이 아닌 하나로 통합

```
[계약서 보관] → 바텀시트:
  "어떻게 보관하시겠어요?"
  [PDF로 보기]  [기기에 저장]  [공유하기]
```
- `completed` 상태에서만 노출
- 바텀시트 내 `PDF로 보기` → `openPDFViewer`
- 바텀시트 내 `기기에 저장` → `saveBase64Data`
- 바텀시트 내 `공유하기` → 기존 `share()` API

**D. 환경별 폴백**
| 환경 | PDF 보기 | PDF 저장 |
|------|----------|----------|
| Toss 앱 (≥ 5.261) | `openPDFViewer` | `saveBase64Data` |
| Toss 앱 (< 5.261) | `pdf.save()` 폴백 | `saveBase64Data` |
| 샌드박스 | `pdf.save()` 폴백 | `<a download>` 폴백 |
| 브라우저 | `pdf.save()` 폴백 | `<a download>` 폴백 |

---

## 6. 전체 파일 구조 (추가/변경 예정)

```
src/
├── utils/
│   ├── environment.ts      # [NEW] 환경 감지 (toss/sandbox/browser)
│   ├── tracking.ts         # [NEW] Analytics 래퍼 (web-framework import)
│   ├── referrer.ts         # [NEW] UTM 파싱 유틸
│   ├── contacts.ts         # [NEW] 연락처 접근 유틸 (pagination + 에러 처리)
│   ├── pdfViewer.ts        # [NEW] PDF 뷰어 호출 (isMinVersionSupported)
│   └── pdfShare.ts         # [NEW] PDF 저장 (Base64 + 메모리 해제)
├── contexts/
│   └── ReferrerContext.tsx  # [NEW] 유입 경로 Context (30분 TTL)
└── hooks/
    └── useContacts.ts      # [NEW] 연락처 권한/조회 hook (pre-permission 포함)

granite.config.ts            # [EDIT] permissions: [{ name: 'contacts', access: 'read' }]
supabase/migrations/
  └── xxx_add_utm_to_deliveries.sql  # [NEW] deliveries 테이블 UTM 컬럼 추가
```

---

## 7. 구현 우선순위 (리뷰 반영 수정)

| 순서 | 기능 | 의존성 | 복잡도 | 비고 |
|------|------|--------|--------|------|
| **0** | **환경 감지 유틸** | 없음 | 낮음 | **모든 기능의 선행 의존성** |
| 1 | PDF 뷰어 | 환경 감지, Base64 변환 | 낮음 | `isMinVersionSupported()` |
| 2 | PDF 저장 | 환경 감지, Base64 변환 | 낮음 | "계약서 보관" 통합 UI |
| 3 | 사용자 행동 기록 | 환경 감지 | 중간 | import 경로 교체, 기존 코드 리팩토링 |
| 4 | 유입 경로 래퍼럴 | 환경 감지, tracking | 낮음 | deliveries UTM 컬럼 마이그레이션 포함 |
| 5 | 연락처 권한 | 환경 감지, granite.config | 중간 | pre-permission prompt 필수 |

---

## 8. 크로스 도메인 영향 (리뷰 반영)

### Supabase ↔ Mini-app
- `deliveries` UTM 컬럼 추가 시, `contracts-send` Edge Function 파라미터에 `utm_source/medium/campaign` 전달
- `ReferrerContext` 값을 Edge Function 호출 시 함께 전송
- Analytics를 Supabase로 보조 수집 시 `autoRefreshToken: false` 설정과 충돌 → JWT 갱신 로직 필요 (Phase 2)

### Mini-app ↔ Vite
- Bridge API 들은 `localhost:5173`에서 미동작 → `vite.config.ts`에 mock 플러그인 또는 `IS_SANDBOX` 분기 필요
- `jspdf` 는 이미 번들 포함 → 폴백 시 추가 빌드 설정 불필요

### 향후 고려 (LOW)
- `auth-token` Edge Function `referrer` 파라미터 → `ReferrerContext` 연동
- PDF 생성 OffscreenCanvas 렌더링 (메모리 최적화)
- JWT 토큰 자동 갱신 (현재 `autoRefreshToken: false`)

---

## 9. 오픈 질문 (리뷰 후 상태)

1. ~~**행동 기록 백엔드**~~ → **해결:** Toss 내부 로그 1순위, 도메인 이벤트만 Supabase 보조
2. ~~**연락처 사용 시점**~~ → **해결:** 사장님 계약서 전송 시만
3. ~~**PDF 생성 방식**~~ → **해결:** 클라이언트(jspdf) 유지, 서버 보관은 Phase 2
4. **래퍼럴 범위:** 공유 링크(share) 외에 토스 앱 내 피드/배너 유입도 추적 대상인지?
