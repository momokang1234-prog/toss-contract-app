# Plan: OMP ↔ Vertex AI `gemini-2.5-flash` 요청 양식 정렬

## 문제 진단

OMP가 `thinkingConfig.thinkingLevel`을 주입하지만,
`gemini-2.5-flash` Vertex AI endpoint는 `thinkingLevel`을 지원하지 않고 `thinkingBudget`만 지원함.

```
OMP catalog:  gemini-2.5-flash reasoning: ["minimal","low","medium","high"]
                                  → thinkingConfig.thinkingLevel: "HIGH"  ← 400
Vertex AI accepts:                → thinkingConfig.thinkingBudget: 16384  ← 200
                                  → (없음)                                ← 200
```

## Phase 1 — 전역 기본값 변경 (즉시 적용)

```bash
omp config set defaultThinkingLevel auto
```

**효과:** suffix 없는 `/model google-vertex/gemini-2.5-flash` 호출 시 thinking 미주입 → 200

**한계:** 명시적 `:high` suffix는 여전히 `thinkingLevel` 주입 → 400

---

## Phase 2 — 모델별 오버라이드 (완전 해결)

`~/.omp/agent/models.yml`:

```yaml
providers:
  google-vertex:
    modelOverrides:
      gemini-2.5-flash:
        reasoning: false
```

**효과:** `gemini-2.5-flash`에 모든 thinking config 주입 차단.
`:high` suffix 붙여도 thinking 무시됨.

**트레이드오프:** thinking budget 방식으로도 사용 불가.
Gemini thinking이 필요하면 `gemini-2.5-pro`로 대체.

---

## Phase 3 — OMP 카탈로그 이슈 보고 (근본 원인)

OMP 번들 `models.json`의 `gemini-2.5-flash` 항목이
Vertex AI에서 실제로 지원하지 않는 `thinkingLevel`을
지원한다고 잘못 표기.

→ https://github.com/can1357/oh-my-pi/issues/new

---

## 최종 권장 구성

```
omp config set defaultThinkingLevel auto
# + models.yml modelOverrides (Phase 2)
# + .env 에 GOOGLE_VERTEX_LOCATION=asia-northeast3 유지
# → /model google-vertex/gemini-2.5-flash 정상 작동
```
