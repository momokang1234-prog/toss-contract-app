# toss-contract-app 구조 분석 보고서

**생성일**: 2026-06-13  
**분석 도구**: tre, tokei, madge, lizard

---

## 1. 프로젝트 개요

```
프로젝트 루트: toss-contract-app
분석 대상:   src/ (프론트엔드), server/src/ (백엔드)
제외 대상:   base-directory-tree/, node_modules/, .git/
```

디렉토리 구조는 `01-tree.txt` 참조. 주요 구조:
- `src/` — React + TypeScript 프론트엔드 (Toss 미니앱)
- `server/src/` — Express + TypeScript 백엔드
- `supabase/functions/` — Supabase Edge Functions
- `docs/` — 감사 문서, 인증 문서
- `public/` — 정적 에셋 (은행 아이콘, 스크린샷)

---

## 2. 코드 통계 (tokei)

| 언어 | 파일 수 | 코드 라인 | 주석 | 공백 |
|------|---------|-----------|------|------|
| TypeScript | 53 | 4,755 | 572 | 673 |
| TSX | 34 | 3,265 | 31 | 278 |
| JSON | 8 | 30,439 | 0 | 0 |
| SVG | 33 | 944 | 183 | 0 |
| SQL | 7 | 436 | 99 | 52 |
| CSS | 16 | 377 | 6 | 53 |
| JavaScript | 2 | 120 | 16 | 20 |
| YAML | 2 | 89 | 0 | 10 |
| 기타 (Python, Dockerfile, TOML, Plain Text) | 5 | 83 | 7 | 20 |
| HTML (인라인 CSS/JS 포함) | 7 | 394 (3,786 인라인) | 8 | 16 |
| Markdown (인라인 코드블록 포함) | 13 | 0 (303 인라인) | 4,150 | 1,967 |
| **합계** | **180** | **44,597** | **5,734** | **3,377** |

**총 라인**: 53,708

**주요 관찰**:
- TypeScript + TSX가 전체 비-JSON 코드의 80.5% (8,020 / 9,959)를 차지
- JSON 30,439라인은 대부분 `package-lock.json` 등 자동 생성물
- 주석률: TypeScript 10.7%, SQL 18.5%, JS 11.8%

---

## 3. 의존성 분석 (madge)

### 3.1 순환 의존성

✅ **순환 의존성 없음** — `03-madge-circular.txt` 확인 결과, 73개 파일에서 순환 참조가 발견되지 않음.

### 3.2 고아 파일 (Orphans)

총 **21개 파일**이 다른 모듈에서 import되지 않음 (`04-madge-orphans.txt`):

| 카테고리 | 파일 |
|----------|------|
| 진입점 | `main.tsx` |
| 타입 정의 | `types/roles.ts`, `vite-env.d.ts` |
| API | `api/smart-messenger.ts` |
| 도메인 | `domain/contract/converter.ts`, `domain/contract/index.ts` |
| 컴포넌트 | `components/AuthScreen.tsx`, `BusinessVerify.tsx`, `ContractResult.tsx`, `auth/RoleGuard.tsx`, `contract/ContractPreview.tsx`, `contract/ContractStatusBadge.tsx`, `shared/ContentContainer.tsx` |
| Contract Form Steps | `Step1BasicInfo.tsx` ~ `Step4WageInsurance.tsx` (4개) |
| 테스트 | `hooks/__tests__/useContracts.test.ts`, `domain/contract/__tests__/schema.test.ts`, `domain/contract/__tests__/validation.test.ts` |

**참고**: `main.tsx`와 `vite-env.d.ts`는 진입점/환경 파일이므로 orphan이 자연스럽고, 테스트 파일도 import 대상이 아님. Contract Form Step 컴포넌트들은 동적 import일 가능성 높음. `converter.ts`와 `RoleGuard.tsx`는 사용되지 않는 코드일 수 있으므로 확인 권장.

---

## 4. 복잡도 분석 (lizard)

**설정**: CCN ≥ 10, 길이 ≥ 50 라인  
**총 경고**: 15건 (`06-lizard.txt`)

### 4.1 심각도 높은 경고 (CCN ≥ 15)

| 함수 | 파일 | NLOC | CCN | 길이 |
|------|------|------|-----|------|
| `createContract` | `src/hooks/useContracts.ts:347` | 56 | **49** 🔴 | 60 |
| `validateStep` | `src/pages/employer/contract-form/hooks/useContractForm.ts:138` | 85 | **44** 🔴 | 85 |
| `(anonymous) — auth route` | `server/src/routes/auth.ts:287` | 92 | **30** 🔴 | 119 |
| `validateLaborContract` | `src/domain/contract/validation.ts:83` | 141 | **25** 🔴 | 174 |
| `handleSubmit` | `src/pages/employer/contract-form/hooks/useContractForm.ts:224` | 48 | 12 | 49 |

### 4.2 심각도 높은 경고 (길이 ≥ 100)

| 함수 | 파일 | NLOC | CCN | 길이 |
|------|------|------|-----|------|
| `useContractForm` | `src/pages/employer/contract-form/hooks/useContractForm.ts:37` | 42 | 1 | **258** 🔴 |
| `(anonymous) — test` | `src/domain/contract/__tests__/validation.test.ts:49` | 25 | 1 | **231** 🔴 |
| `validateLaborContract` | `src/domain/contract/validation.ts:83` | 141 | 25 | **174** 🔴 |
| `(anonymous) — auth route` | `server/src/routes/auth.ts:287` | 92 | 30 | **119** 🔴 |
| `baseCSS` | `src/utils/pdf.ts:26` | 105 | 1 | **107** 🔴 |

### 4.3 중간 경고

| 함수 | 파일 | NLOC | CCN | 길이 |
|------|------|------|-----|------|
| `(anonymous) — transfers route` | `server/src/routes/transfers.ts:51` | 63 | 6 | 76 |
| `useContracts` | `src/hooks/useContracts.ts:267` | 11 | 1 | 79 |
| `useBusiness` | `src/hooks/useBusiness.ts:84` | 10 | 1 | 78 |
| `generatePrintableHTML` | `src/utils/pdf.ts:132` | 64 | 4 | 65 |
| `(anonymous) — transactions route` | `server/src/routes/transactions.ts:43` | 22 | 4 | 56 |
| `generateContractHtml` | `src/hooks/useContracts.ts:213` | 51 | 3 | 53 |
| `downloadContractPDF` | `src/utils/pdf.ts:352` | 45 | 3 | 56 |

### 4.4 리팩터링 우선순위

1. **`createContract` (CCN 49)** — 극도로 높은 분기 복잡도. 계약 생성 로직을 작은 함수로 분해 필요.
2. **`validateStep` (CCN 44)** — 각 Step별 검증을 별도 함수로 추출.
3. **`useContractForm` (길이 258)** — hook이 과도하게 비대함. 하위 hook으로 분리.
4. **`validateLaborContract` (CCN 25, 길이 174)** — 검증 규칙을 개별 함수/파일로 분리.
5. **auth route (CCN 30, 길이 119)** — 라우터 핸들러가 너무 많은 책임을 가짐.

---

## 5. 종합 평가

| 지표 | 상태 | 비고 |
|------|------|------|
| 순환 의존성 | ✅ 양호 | 0건 |
| 코드 규모 | 중소형 | TS+TSX 8,020라인 |
| 고아 파일 | ⚠️ 주의 | 21개 (진입점/테스트 제외시 약 14개 검토 필요) |
| 복잡도 | 🔴 개선 필요 | CCN 25+ 4건, 길이 100+ 5건 |

**총평**: 순환 의존성이 없는 점은 긍정적이나, 특정 함수(`createContract`, `validateStep`)의 순환 복잡도가 비정상적으로 높고, `useContractForm` hook의 길이가 과도함. 계약 검증 로직(`validateLaborContract`)과 인증 라우터도 리팩터링 대상.

---

## 6. 산출물 목록

| 파일 | 설명 |
|------|------|
| `01-tree.txt` | 디렉토리 트리 |
| `02-tokei.txt` | 코드 통계 |
| `03-madge-circular.txt` | 순환 의존성 검사 |
| `04-madge-orphans.txt` | 고아 파일 목록 |
| `05-dep-graph.svg` | 의존성 그래프 (SVG) |
| `06-lizard.txt` | 복잡도 분석 |
| `report.md` | 본 보고서 |
