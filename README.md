# 📋 토스 근로계약서

토스 앱에서 사용하는 근로계약서 작성·전송·서명·관리 서비스입니다.  
사장님이 계약서를 작성하면 근로자에게 스마트 메시지로 전송하고, 근로자는 앱에서 서명까지 완료할 수 있어요.

> **[쇼케이스 페이지](https://momokang1234-prog.github.io/toss-contract-app/showcase.html)**  
> 모든 페이지 스크린샷과 기능 현황을 한눈에 확인할 수 있어요.

---

## 🛠 기술 스택

| 구분 | 기술 |
|------|------|
| 프레임워크 | [Apps-in-Toss WebView SDK](https://developers-apps-in-toss.toss.im/) (`@apps-in-toss/web-framework`) |
| UI | [TDS Mobile](https://toss.im/slash) (`@toss/tds-mobile` 2.4.0) |
| 라우팅 | React Router v7 |
| 언어 | TypeScript 5.5 |
| 빌드 | Vite 6 |
| 백엔드 | Supabase (Mock 모드: `IS_MOCK=true` 로컬 전환) |
| 검증 | Zod (`validateLaborContract`) |
| PDF | jsPDF + html2canvas-pro |
| 폰트 | Tossface (토스 이모지) · Pretendard |

---

## 🚀 시작하기

```bash
# 설치
yarn install        # 또는 npm install

# 개발 서버 (Mock 모드)
yarn dev            # → http://localhost:5173

# 타입 체크
yarn typecheck

# 빌드
yarn build
```

### Mock 모드

기본적으로 `IS_MOCK=true`로 동작하며 Supabase 없이 모든 기능을 테스트할 수 있어요.  
Mock 데이터는 `src/hooks/useContracts.ts`에 내장되어 있습니다.

실제 Supabase 연동 시 `.env`에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`를 설정하세요.

---

## 📱 페이지 구조

### 🔐 공통

| 페이지 | 경로 | 설명 |
|--------|------|------|
| 로그인 | `/login` | Mock 인증, '근로계약서' 브랜드 화면 |
| 딥링크 | `/contract/:id` | 계약서 공유 링크 수신 처리 |
| 404 | `*` | 페이지 없음 |

### 🏢 사장님

| 페이지 | 경로 | 설명 |
|--------|------|------|
| 대시보드 | `/employer/dashboard` | 통계 카드 (전체·작성중·전송됨·서명완료) |
| 계약서 작성 | `/employer/contracts/new` | **7단계 위자드** |
| 계약 목록 | `/employer/contracts` | ContractCard 리스트 + 상태 배지 |
| 계약서 상세 | `/employer/contracts/:id` | 상태별 액션 (전송·취소·확정·PDF) |
| 계약 이력 | `/employer/contracts/:id/history` | 타임라인 뷰 |
| 사업장 등록 | `/employer/business/new` | 사업자등록번호·상호·대표자·주소 |

### 👤 근로자

| 페이지 | 경로 | 설명 |
|--------|------|------|
| 내 계약 목록 | `/worker/contracts` | 받은 계약서 리스트 |
| 계약서 검토 | `/worker/contracts/:id` | 내용 확인 + auto-viewed 전환 |
| 전자서명 | `/worker/contracts/:id/sign` | Canvas 서명 + 3D 완료 애니메이션 |

---

## 🔄 계약서 상태 머신

```
draft  ──[전송]──→  sent  ──[열람]──→  viewed  ──[서명]──→  signed  ──[확정]──→  completed
  │                  │                  │                  │
  └──[취소]──→  cancelled         [취소]──→ cancelled    [취소]──→ cancelled
```

| 상태 | 의미 | 가능한 액션 |
|------|------|-----------|
| `draft` | 작성 완료, 미전송 | 전송 · 취소 |
| `sent` | 근로자에게 발송됨 | 취소 |
| `viewed` | 근로자가 열람함 | 취소 |
| `signed` | 근로자 서명 완료 | 확정 · 취소 |
| `completed` | 계약 확정 완료 | PDF 다운로드 |
| `cancelled` | 취소됨 | — |
| `expired` | 유효기간 만료 | — |

---

## ✍️ 7단계 계약서 작성 위자드

1. **근로자 정보** — 이름·전화번호·주소
2. **계약 조건** — 계약유형(정규직/단시간/기간제)·근무장소·직무·시작일·종료일
3. **임금** — 급여형태(시급/일급/주급/월급)·금액·지급방법·지급일(매월 1~30일/말일)
4. **근무 시간** — 근무요일·주휴일·시작/종료·휴게 시작/종료
5. **근로조건** — 연차유급휴가(5인 미만 설명)·4대보험(상세 의무가입 기준)·퇴직금
6. **법정 검증** — `validateLaborContract()` 실행, 오류·경고 표시
7. **최종 확인** — 모든 입력값 요약 카드 + 저장

---

## 📁 프로젝트 구조

```
src/
├── App.tsx                        # 라우터 설정
├── main.tsx                       # 진입점
├── contexts/
│   └── AuthContext.tsx            # Mock 인증 (userRole, userKey)
├── hooks/
│   ├── useContracts.ts           # 계약 CRUD + Mock 데이터
│   └── useBusiness.ts            # 사업장 정보
├── pages/
│   ├── auth/LoginPage.tsx        # 로그인
│   ├── employer/
│   │   ├── DashboardPage.tsx      # 대시보드
│   │   ├── ContractFormPage.tsx   # 7단계 위자드
│   │   ├── ContractListPage.tsx   # 계약 목록
│   │   ├── ContractDetailPage.tsx # 상세 + 액션
│   │   ├── ContractHistoryPage.tsx# 이력 타임라인
│   │   └── BusinessFormPage.tsx   # 사업장 등록
│   ├── worker/
│   │   ├── ContractListPage.tsx   # 근로자 계약 목록
│   │   ├── ContractDetailPage.tsx # 근로자 계약 검토
│   │   └── ContractSignPage.tsx   # 전자서명
│   └── shared/                    # 공통 (Deeplink, NotFound)
├── components/
│   ├── delivery/SendContractSheet.tsx  # 전송 바텀시트 (스마트 메시지·공유·링크복사)
│   ├── contract/ContractCard.tsx       # 계약 카드
│   ├── ContractResult.tsx              # 완료 화면
│   └── shared/ContentContainer.tsx     # 레이아웃 컨테이너
├── domain/
│   └── contract/
│       ├── schema.ts             # Zod 스키마
│       └── validation.ts         # 근로기준법 검증 엔진
├── utils/pdf.ts                  # PDF 생성 (jsPDF)
├── api/
│   ├── supabase.ts               # Supabase 클라이언트
│   └── smart-messenger.ts        # 스마트 메시지 API (프로덕션)
└── types/roles.ts                # 역할 타입
```

---

## 🔌 연동 포인트 (Production)

### 스마트 메시지 API

계약서 전송 시 토스 스마트 메시지로 Push·SMS·인박스 발송:

```
POST https://apps-in-toss-api.toss.im/api-partner/v1/apps-in-toss/messenger/send-message
```

- `templateSetCode`: 토스 콘솔에서 발급받은 템플릿 코드
- `context`: `{ workerName, contractLink }`
- `x-toss-user-key`: 토스 로그인 인증 키

### Supabase

```sql
-- contracts 테이블
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id),
  worker_name TEXT NOT NULL,
  worker_phone TEXT NOT NULL,
  -- ...
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 🎨 디자인

- **TDS Mobile** 2.4.0 컴포넌트 (Top, Button, TextField, Switch, SegmentedControl, Badge, List)
- **Tossface** 토스 이모지 폰트 (jsdelivr CDN)
- **static.toss.im** 3D 일러스트 (point-blue2/green2, check-success)
- **Pretendard** 본문 폰트

### 3D 일러스트 적용 현황

| 페이지 | 일러스트 |
|--------|---------|
| 대시보드 | point-blue2 + point-purple2 배경 |
| 계약서 작성 | point-blue2 + point-green2 헤더 |
| 계약 완료 | 3D check-success |
| 전자서명 완료 | 3D check-success + 자동 이동 |

---

## 🧪 검증 엔진

`src/domain/contract/validation.ts` — 근로기준법 기반 검증:

- 최저임금 검증 (2026년 기준 10,030원)
- 근로시간 제한 (주 52시간)
- 휴게시간 의무 (4시간 이상 30분, 8시간 이상 1시간)
- 주휴일 의무
- 연차유급휴가 (5인 이상 의무)
- 사회보험 의무가입 기준

---

## 🔗 원격 접속

Tailscale Mesh VPN으로 어디서든 접속:

```
http://100.109.112.102:5173                    # Tailscale IP
http://192.168.0.3:5173                         # 로컬 WiFi
http://localhost:5173                            # 로컬
```

---

## 📜 라이선스

Private — 토스 앱인토스 파트너사 프로젝트
