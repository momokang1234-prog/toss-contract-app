# 🎯 법정 규칙 검증 엔진 연동 및 체크리스트 UI 고도화 플로우

이 문서는 `toss-contract-app`의 MVP 출시에 가장 핵심이 되는 **법정 규칙 검증 엔진(`validation.ts`) 연동** 작업의 구현 계획을 담고 있습니다. 법률적 단정이나 경고가 아닌, 사장님이 서명 전 스스로 점검해볼 수 있도록 **"부드럽고 챙겨주는 뉘앙스(Helpful Suggestions)"**를 유지하는 것이 핵심입니다.

---

## 📌 1. 목표 및 기조 (Goals & Nuance)

- **단일 진실 공급원 사용**: 현재 `FinalChecklistStep.tsx`에 하드코딩된 시간 계산 로직과 3가지 임시 검증 로직을 제거하고, `validation.ts`의 `validateLaborContract()`를 호출하도록 통합합니다.
- **법률적 조언(Advice) 지양**: "법 위반입니다", "오류입니다" 등의 직접적이고 강압적인 메시지 대신, "이런 부분을 한 번 더 챙겨보세요" 형태로 제안하여 서비스 제공자(토스 앱)의 법적 책임을 최소화하고 유저 경험을 부드럽게 가져갑니다.
- **자율 수정 유도**: 검증에 걸린 항목에 대해 [수정하기] 버튼을 연결하여 쉽게 바로잡을 수 있도록 동선을 유지합니다.

---

## 🏗️ 2. 상세 구현 계획

### Step 1: `FinalChecklistStep.tsx` 리팩토링 및 엔진 호출
현재 `FinalChecklistStep.tsx` 내에서 수행되는 자체 시간/임금 계산 코드를 제거하고, 상위 훅(`useContractForm.ts`)에서 주입받은 `buildContractData(form)`를 통해 `validateLaborContract`를 실행합니다.

```typescript
// 변경 전 (현재)
let weeklyMinutes = 0;
// (복잡한 자체 시간/휴게 계산 로직)
if (insufficientBreak) { guideItems.push(...) }

// 변경 후 (계획)
const contractData = buildContractData(form, businesses[0].id);
const { errors, warnings } = validateLaborContract(contractData);
```

### Step 2: 엔진 결과(ErrorCode) → 제안형 메시지 매핑 (Nuance Mapping)
`validation.ts`에서 반환되는 엄격한 `code`를 사용자 친화적인 안내문으로 변환하는 매퍼(Mapper)를 구현합니다.

| `validation.ts` 에러/경고 코드 | 기존 엄격한 메시지 예시 | 🔄 **부드러운 제안형 메시지로 변환** | 수정 동선 연결 |
|--------------------------------|-------------------------|--------------------------------------|----------------|
| `BELOW_MINIMUM_WAGE` | 최저임금(10,030원)에 미달합니다. | **최저임금 확인**: 올해 최저시급(10,030원) 기준에 맞게 책정되었는지 한 번 더 확인해보세요. | 임금 입력 (`wageTypeAmount`) |
| `INSUFFICIENT_BREAK` | 8시간 이상 시 60분 이상 필요. | **휴게시간 확인**: 4시간 일하면 30분, 8시간 일하면 1시간 이상의 휴게시간이 잘 포함되어 있는지 챙겨보세요. | 근무시간 입력 |
| `MISSING_WEEKLY_HOLIDAY` | 주휴일을 부여해야 합니다. | **주휴일 확인**: 주 15시간 이상 일하는 직원은 개근 시 주휴일(주휴수당)이 발생해요. 설정된 주휴일이 적절한지 챙겨보세요. | 주휴일 입력 |
| `HOLIDAY_OVERLAP_WORKDAY` | 주휴일이 근무일에 포함됨. | **근무일과 주휴일 겹침**: 쉬기로 한 주휴일이 일하는 요일에 포함되어 있지 않은지 확인해보세요. | 근무요일 입력 (`workDays`) |
| `MISSING_PAID_LEAVE` / `MISSING_SOCIAL_INSURANCE` | 연차/4대보험 조항 미포함. | **필수 조항 점검**: 연차 유급휴가, 4대보험, 퇴직금 관련 조항이 누락되지 않았는지 점검해보세요. | 4대보험 조항 스텝 이동 |

### Step 3: UI 렌더링 유지보수
현재 적용된 `TDS-Mobile` 컴포넌트의 유려한 UI 트리를 그대로 재활용합니다.
- 회색 박스 바탕, 💡 아이콘
- "서명 전, 이런 부분들을 챙겨보세요" 헤더 문구 유지
- `editStep`을 이용한 BottomSheet 수정 동선(`wageTypeAmount`, `workDays` 등) 유지 및 보강

---

## 🛠 3. 작업 순서 (Task Breakdown)

1. [x] **`src/domain/contract/buildContractData.ts` 추출 및 확인**: 폼 데이터를 API 스키마로 변환하는 함수 로직을 `FinalChecklistStep` 내부에서 안전하게 호출할 수 있게 정리합니다.
2. [x] **코드 맵핑(Mapping) 객체 생성**: `FinalChecklistStep.tsx` 상단에 `SUGGESTION_MESSAGES` 맵핑 딕셔너리를 작성합니다.
3. [x] **검증 로직 교체**: 기존 자체 계산 코드를 지우고 `validateLaborContract` 반환값을 순회하며 `guideItems` 배열을 채우도록 로직을 작성합니다.
4. [x] **수정 동선(editTarget) 매핑**: 각 규칙별로 어떤 입력 필드/스텝을 수정해야 하는지 연결합니다 (예: `BELOW_MINIMUM_WAGE` -> `wageTypeAmount` 바텀시트 활성화).
5. [x] **개발 서버 띄우고 수동 테스트**: 여러 가지 폼 데이터를 일부러 불완전하게 입력(시급 9000원, 휴게시간 없음 등)하고 최종 화면에서 뉘앙스가 부드러운 가이드가 뜨는지 시각적으로 확인합니다.
