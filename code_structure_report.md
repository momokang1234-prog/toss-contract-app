# 🔍 Codebase Structure, Dependency, and Complexity Audit Report
**Project:** `/root/toss-contract-app`  
**Date:** June 24, 2026  
**Auditor:** Antigravity CLI Agent  

---

## 📊 Executive Summary

This report consolidates the results of a comprehensive static analysis audit conducted on the `/root/toss-contract-app` codebase. The audit focuses on codebase structure, physical file dependencies, unused modules (orphans), dependency loops, and function-level complexity bottlenecks.

### **Key Findings:**
1. **Zero Circular Dependencies:** `madge` confirmed that the codebase has **no circular dependencies** (`✔ No circular dependency found!`). This indicates a clean, unidirectional flow of imports.
2. **Orphan Modules (22 files):** There are 22 orphan files not imported by other source files. Notably, **9 components and domain utilities are completely unused**, representing dead code.
3. **Complexity Hotspots:** Four primary functions exceed standard complexity thresholds (CCN ≥ 10, length ≥ 50 lines). The worst offender is `createContract` in `useContracts.ts` with a Cyclomatic Complexity (CCN) of **49**, driven heavily by mixed database/mock logic and logical nullish coalescing.
4. **Codebase Size Profile:** Tokei reported **272,344 lines** across **375 files**. However, the vast majority is composed of React Native JavaScript bundles under `temp_ait/` (~180k LOC) and UX test sessions under `server/ux-test-sessions/` (~45k lines of JSON). The actual source code (`src/` and `supabase/`) is compact and highly focused.

---

## 📂 1. Codebase Structure (File Tree)

The following represents the active source code layout for the React frontend (`src/`) and the Supabase backend (`supabase/`), excluding temporary builds and development configuration folders.

```
=== src (Frontend React App) ===
├── App.tsx
├── api
│   ├── __tests__
│   │   └── smart-messenger.test.ts
│   ├── smart-messenger.ts
│   ├── supabase.ts
│   └── toss-auth.ts
├── components
│   ├── AuthScreen.tsx
│   ├── BusinessVerify.tsx
│   ├── ContractResult.tsx
│   ├── ErrorBoundary.tsx
│   ├── SignaturePad.tsx
│   ├── auth
│   │   └── RoleGuard.tsx
│   ├── contract
│   │   ├── ContractCard.module.css
│   │   ├── ContractCard.tsx
│   │   ├── ContractDocument.module.css
│   │   ├── ContractDocument.tsx
│   │   ├── ContractPreview.tsx
│   │   ├── ContractStatusBadge.tsx
│   │   ├── DocumentReceiptTracker.module.css
│   │   └── DocumentReceiptTracker.tsx
│   ├── dev
│   │   └── XrayPicker.tsx
│   ├── funnel
│   │   ├── FunnelQuestion.module.css
│   │   └── FunnelQuestion.tsx
│   └── shared
│       ├── ContentContainer.module.css
│       ├── ContentContainer.tsx
│       ├── HeroMarquee.module.css
│       ├── HeroMarquee.tsx
│       ├── LanguagePicker.module.css
│       └── LanguagePicker.tsx
├── contexts
│   └── AuthContext.tsx
├── dev
│   ├── DevBridge.tsx
│   ├── LogInterceptor.ts
│   ├── StateBridgeProvider.tsx
│   ├── UXTestAPI.ts
│   └── UXTestTypes.ts
├── domain
│   └── contract
│       ├── __tests__
│       │   ├── schema.test.ts
│       │   └── validation.test.ts
│       ├── converter.ts
│       ├── index.ts
│       ├── laborRules.ts
│       ├── schema.ts
│       └── validation.ts
├── hooks
│   ├── __tests__
│   │   └── useContracts.test.ts
│   ├── useBusiness.ts
│   ├── useContracts.ts
│   └── useContracts.ts.orig
├── i18n
│   ├── index.ts
│   ├── locales
│   │   ├── en.json
│   │   ├── id.json
│   │   ├── km.json
│   │   ├── ko.json
│   │   ├── mn.json
│   │   ├── ne.json
│   │   ├── th.json
│   │   ├── uz.json
│   │   ├── vi.json
│   │   └── zh.json
│   └── useLanguage.ts
├── index.css
├── main.tsx
├── pages
│   ├── auth
│   │   ├── LoginPage.module.css
│   │   └── LoginPage.tsx
│   ├── dev
│   │   ├── BusinessVariant[A-E].tsx (5 files)
│   │   ├── CommentBoundary.tsx
│   │   ├── ContractDocumentPreview.tsx
│   │   ├── ContractListVariant[A-E].tsx (5 files)
│   │   ├── FormProposal[1-3].tsx (3 files)
│   │   ├── FormStepLabelVariant[A-C].tsx (3 files)
│   │   ├── FormVariant[A-E].tsx (5 files)
│   │   ├── IconsCatalogPage.tsx
│   │   ├── LoginVariant[A-E].tsx (5 files)
│   │   ├── UXTestPage.tsx
│   │   └── WorkerVariant[A-E].tsx (5 files)
│   ├── employer
│   │   ├── BusinessFormPage.module.css
│   │   ├── BusinessFormPage.tsx
│   │   ├── BusinessManagePage.module.css
│   │   ├── BusinessManagePage.tsx
│   │   ├── ContractDetailPage.module.css
│   │   ├── ContractDetailPage.tsx
│   │   ├── ContractFormPage.module.css
│   │   ├── ContractFormPage.tsx
│   │   ├── ContractHistoryPage.module.css
│   │   ├── ContractHistoryPage.tsx
│   │   ├── ContractListPage.module.css
│   │   ├── ContractListPage.tsx
│   │   ├── ContractTimelinePage.module.css
│   │   ├── ContractTimelinePage.tsx
│   │   ├── DashboardPage.module.css
│   │   ├── DashboardPage.tsx
│   │   └── contract-form
│   │       ├── ContractFormProgress.tsx
│   │       ├── __tests__
│   │       │   └── buildContractData.test.ts
│   │       ├── buildContractData.ts
│   │       ├── formatSchedule.ts
│   │       ├── hooks
│   │       │   └── useContractForm.ts
│   │       ├── steps
│   │       │   ├── FieldLabel.tsx
│   │       │   ├── FinalChecklistStep.tsx
│   │       │   ├── ParentalConsentStep.tsx
│   │       │   ├── Step1BasicInfo.tsx
│   │       │   ├── Step2WorkConditions.tsx
│   │       │   ├── Step3WorkSchedule.tsx
│   │       │   ├── Step4WageInsurance.tsx
│   │       │   ├── Step5OtherConditions.tsx
│   │       │   └── Step6Preview.tsx
│   │       └── types.ts
│   ├── shared
│   │   ├── DeeplinkHandler.module.css
│   │   ├── DeeplinkHandler.tsx
│   │   ├── DevBypass.tsx
│   │   ├── DevGalleryPage.module.css
│   │   ├── DevGalleryPage.tsx
│   │   ├── LanguageOnboarding.tsx
│   │   ├── LanguageSettings.tsx
│   │   ├── NotFoundPage.module.css
│   │   └── NotFoundPage.tsx
│   └── worker
│       ├── ContractDetailPage.module.css
│       ├── ContractDetailPage.tsx
│       ├── ContractListPage.module.css
│       ├── ContractListPage.tsx
│       ├── ContractSignPage.module.css
│       └── ContractSignPage.tsx
├── styles
│   └── tossface.css
├── types
│   └── roles.ts
├── utils
│   ├── badgeUtils.ts
│   ├── errorHandler.ts
│   ├── format.ts
│   ├── labels.ts
│   ├── pdf.ts
│   ├── pdfGenerator.ts
│   └── sanitize.ts
└── vite-env.d.ts

=== supabase (Backend Functions & Migrations) ===
├── functions
│   ├── _shared
│   │   └── solapi.ts
│   ├── auth-token
│   │   └── index.ts
│   ├── contracts-cancel
│   │   └── index.ts
│   ├── contracts-complete
│   │   └── index.ts
│   ├── contracts-expire
│   │   └── index.ts
│   ├── contracts-reject
│   │   └── index.ts
│   ├── contracts-send
│   │   └── index.ts
│   ├── contracts-sign
│   │   └── index.ts
│   └── contracts-view
│       └── index.ts
└── migrations
    ├── 001_initial_schema.sql
    ├── 002_rls_policies.sql
    ├── 004_expire_cron.sql
    ├── 005_add_sent_at.sql
    ├── 006_secure_rpc_functions.sql
    ├── 007_add_other_conditions.sql
    ├── 008_work_schedule.sql
    ├── 009_add_alimtalk_delivery.sql
    ├── 010_minor_consent.sql
    └── 011_add_profile_birthday.sql
```

---

## 📈 2. Lines of Code (LoC) Metric

Analysis from `tokei` over all files detected in the repository:

| Language | Files | Lines | Code | Comments | Blanks |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **JavaScript** | 21 | 184,023 | 181,774 | 251 | 1,998 |
| **JSON** | 22 | 46,575 | 46,575 | 0 | 0 |
| **TSX (React Components)** | 86 | 9,576 | 8,616 | 240 | 720 |
| **TypeScript (Logic/APIs)** | 68 | 8,281 | 6,578 | 730 | 973 |
| **SVG** | 67 | 3,347 | 2,798 | 549 | 0 |
| **CSS** | 25 | 1,493 | 1,282 | 32 | 179 |
| **SQL (Supabase)** | 15 | 747 | 552 | 123 | 72 |
| **Markdown** | 23 | 8,591 | 0 | 5,604 | 2,987 |
| **Others** | 48 | 512 | 267 | 21 | 224 |
| **Total** | **375** | **272,344** | **256,442** | **8,350** | **7,552** |

> [!NOTE]
> **Source vs. Auto-Generated Code:**  
> - **JavaScript:** The massive count of lines (~181k code lines) originates from built RN app bundles extracted under `temp_ait/` (`bundle.ios.0_72_6.js`, `bundle.android.0_84_0.js`, etc.) representing ~180k lines of compiled bundle files.
> - **JSON:** ~45k lines of JSON come from accumulated session logs under `server/ux-test-sessions/*.json` used in simulated workspace UX testing.
> - **Actual Source Code:** Excluding auto-generated assets, the active React + TypeScript source code contains **~15,200 LOC** of high-level code, showing that the contract app remains highly maintainable and clean.

---

## 🔗 3. Import Dependencies Analysis

### **Circular Dependency Loop Check**
`madge --extensions ts,tsx src/ --circular` returned:
```bash
✔ No circular dependency found!
```
- **Analysis:** This is a strong indicator of clean software boundaries. There are no import-level circularities in the client code, which prevents runtime loading loops and simplifies unit testing.

### **Orphan Modules Check**
`madge --extensions ts,tsx src/ --orphans` returned 22 files. We categorize these orphans below:

#### **A. Entry Points & Dev Configs (Expected Orphans)**
- `main.tsx` (App bootstrapper)
- `vite-env.d.ts` (Global TypeScript definitions)

#### **B. Test Files (Expected Orphans)**
- `api/__tests__/smart-messenger.test.ts`
- `domain/contract/__tests__/schema.test.ts`
- `domain/contract/__tests__/validation.test.ts`
- `hooks/__tests__/useContracts.test.ts`
- `pages/employer/contract-form/__tests__/buildContractData.test.ts`

#### **C. Dead / Unused UI Components (Potential Code Waste)**
*These files are defined in the workspace but never imported or referenced in active routes or layouts.*
1. `components/AuthScreen.tsx` — Legacy/unused auth shell.
2. `components/BusinessVerify.tsx` — Unused verification view.
3. `components/ContractResult.tsx` — Unused contract result layout.
4. `components/auth/RoleGuard.tsx` — Role checking component, completely unreferenced.
5. `components/contract/ContractCard.tsx` — Unused custom card component.
6. `components/contract/ContractPreview.tsx` — Card preview UI not imported.
7. `components/contract/ContractStatusBadge.tsx` — Status badge template not used (routes/pages render status inline or with local badges).
8. `components/shared/ContentContainer.tsx` — Layout wrapper.
9. `components/shared/HeroMarquee.tsx` — Unused marquee element.

#### **D. Dead / Unused Domain and Pages Files**
1. `domain/contract/index.ts` — Serves as a standard directory export map, but pages import submodules (`validation`, `schema`) directly.
2. `domain/contract/converter.ts` — Unused domain data formatter.
3. `pages/employer/contract-form/steps/FieldLabel.tsx` — Step form label not imported in form wizards.
4. `pages/employer/contract-form/steps/ParentalConsentStep.tsx` — Unused step. (Note: Worker-side consent is handled locally inside `ContractSignPage.tsx` via a custom component `LocalParentalConsentStep` instead of this shared file).
5. `types/roles.ts` — Unused role type file.
6. `utils/format.ts` — Unreferenced format helper.

---

## ⚡ 4. Function Complexity Hotspots

Lizard ran Cyclomatic Complexity (CCN) and function length analysis on typescript files (`lizard src/ -l typescript --CCN 10 --length 50 -w`). The warning hotspots are analyzed below:

| File Path | Function Name | NLOC | CCN | Length | Analysis & Refactoring Suggestions |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `src/hooks/useContracts.ts` | `createContract` | 58 | **49** | 62 | **High Risk:** Contains both mock-mode mapping logic and real Supabase client insert logic. Includes 22 logical nullish coalescing (`??`) operator evaluations. <br>**Refactor:** Extract mock storage behavior to a standalone mock service provider, keeping `useContracts` focused purely on remote endpoints. |
| `src/domain/contract/validation.ts` | `validateLaborContract` | 149 | **26** | 184 | **High Risk:** Houses all legal labor rule evaluations in a single sequence of procedural condition checks. <br>**Refactor:** Separate validation rules into dedicated rule-specific validators (e.g., `validateWeeklyHoliday`, `validateWorkingHours`, `validateWages`) and compose them inside a pipeline. |
| `src/pages/employer/contract-form/hooks/useContractForm.ts` | `validateStep` | 50 | **28** | 50 | **High Risk:** High branch count checking the validation requirements for every individual page step in the wizard. <br>**Refactor:** Move validation rules for each step into the step definitions or step hook configurations, reducing `validateStep` to a registry lookup. |
| `src/pages/employer/contract-form/buildContractData.ts` | `buildContractData` | 40 | **15** | 44 | **Medium Risk:** Map state variables to contract entity properties.<br>**Refactor:** Extract default mappings or define schema converters to offload logical branching. |
| `src/hooks/useContracts.ts` | `generateContractHtml` | 51 | 3 | 53 | **Low Risk:** Contains a long HTML template literal string for rendering contracts. Safe to leave as-is, though moving the HTML templates to a dedicated templates directory would clean up the hook. |

---

## 🛡️ 5. Key Code Health Risks

### **1. Mixed Business and Mock Logic (High Risk)**
- **Files:** `src/hooks/useContracts.ts`
- **Impact:** The hook contains heavy `if (IS_MOCK)` conditionals in `createContract` (CCN 49) and `fetchContracts`. This mixes testing mock logic with live network logic, leading to fragile deployments where dev modifications can easily break prod code.
- **Remediation:** Implement a clean repository pattern or provider strategy: `ContractRepository` gets concrete classes `MockContractRepository` and `SupabaseContractRepository`. Switch them at boot time.

### **2. Monolithic Legal Rule Engine (High Risk)**
- **Files:** `src/domain/contract/validation.ts` (`validateLaborContract` - CCN 26)
- **Impact:** Any updates to labor laws (like minor worker age threshold changes or wage calculation adjustments) require editing this monolithic function, which is prone to regression bugs.
- **Remediation:** Shift to a rule-engine design where validators are registered in an array (`[MinorAgeRule, OvertimeLimitRule, MinimumWageRule]`). Loop over the rule array to calculate the validations, lowering complexity from 26 to 1 per class.

### **3. Dead Code Accumulation (Medium Risk)**
- **Files:** 9 unused UI components/steps listed in Orphans.
- **Impact:** Code bloat, higher mental overhead, and confusion for new developers.
- **Remediation:** Remove the identified dead files (e.g., `AuthScreen.tsx`, `BusinessVerify.tsx`, `RoleGuard.tsx`, `ContractCard.tsx`, and the unused `ParentalConsentStep.tsx`) to reduce file clutter.
