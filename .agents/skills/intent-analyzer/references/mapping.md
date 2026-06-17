# Codebase Structure Mapping Reference

This file provides a quick reference mapping between the logical components of the Toss Contract application and their physical source files.

## 1. Directory Overview

| Directory | Purpose | Key Files |
|---|---|---|
| `/src/pages` | Top-level screen components. | `ContractFormPage.tsx`, `ContractDetailPage.tsx`, `DashboardPage.tsx` |
| `/src/components` | Reusable UI widgets and layout containers. | `SignaturePad.tsx`, `LegalCheckNotice.tsx` |
| `/src/contexts` | Global application state (Auth, Contract Context). | `AuthContext.tsx`, `ContractContext.tsx` |
| `/src/hooks` | Business logic, validators, and backend hooks. | `useContractForm.ts`, `useContractState.ts` |
| `/src/utils` | Shared helper functions (labor law validation, formatting). | `laborLawValidator.ts`, `formatter.ts` |
| `/supabase` | Database configuration, migrations, and functions. | `migrations/`, `functions/` |

---

## 2. Feature-to-File Reference Map

### A. Authentication & Role Selection
- **Role selection & guard**: `/src/pages/RoleSelectPage.tsx` & `/src/components/RoleGuard.tsx`
- **Session context & login**: `/src/contexts/AuthContext.tsx`
- **Deeplink handling**: `/src/components/DeeplinkHandler.tsx`

### B. Employer Workflow (사장님)
- **Business registration**: `/src/pages/BusinessRegistrationPage.tsx`
- **Contract creation form**: `/src/pages/ContractFormPage.tsx`
- **Employer dashboard**: `/src/pages/EmployerDashboard.tsx`
- **Legal Validation rules**: `/src/utils/laborLawValidator.ts`

### C. Worker Workflow (근로자)
- **Worker contract list / detail**: `/src/pages/WorkerContractDetail.tsx`
- **Signature page**: `/src/pages/WorkerSignaturePage.tsx`
- **Rejection/Revisal request**: `/src/pages/ContractRejectionPage.tsx`

### D. System & Shared
- **Main routing**: `/src/App.tsx` & `/src/main.tsx`
- **Global CSS & variables**: `/src/index.css`
- **Type definitions**: `/src/types/contract.ts` & `/src/types/auth.ts`
