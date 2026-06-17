# 8 Perspectives for Intent Verification & Refinement

This document details the 8 lenses through which the `intent-analyzer` must evaluate user requests and proposed solutions.

### 1. User Communication & Cognitive Gap
* **Goal**: Bridge the gap between what the user typed and what they actually want to achieve.
* **Actions**:
  * Decipher typos, vague sentences (e.g., "this page is broken"), or incomplete context.
  * Question the proposed method if it seems inefficient; separate the *What* (Goal) from the *How* (Method).
  * If the direction remains highly ambiguous or controversial, recommend invoking the `/grill-me` slash command.

### 2. Codebase Context & Technical Alignment
* **Goal**: Align the user's request with the actual physical files and logical architecture.
* **Actions**:
  * Cross-reference files using [mapping.md](skill://intent-analyzer/references/mapping.md) to ensure changes are made in the correct place.
  * Correct user assumptions when they suggest editing a page component for logic that actually lives in a custom hook.

### 3. Architecture & Risk Control
* **Goal**: Protect the core state machine, authentication logic, and security configurations.
* **Actions**:
  * Assess the Risk Level: High (DB schema, RLS, Auth), Medium (Forms, Validation), or Low (Styles, Docs).
  * Stop execution if the proposed change violates critical contract state transition paths (e.g., bypassing `signed` to `completed`).
  * Enforce workspace rules (e.g., TDS Mobile guidelines).

### 4. Actionable Execution
* **Goal**: Format the refined intent into a concrete, executable plan.
* **Actions**:
  * Extract key entities: Roles (Employer/Worker), States (`draft`, `sent`, etc.), and Files.
  * Define explicit boundaries for the tasks to make them easily delegable to subagents.

### 5. Legal & Policy Compliance
* **Goal**: Validate that contract operations conform to Labor Standards Act and Electronic Signature policies.
* **Actions**:
  * Highlight potential violations, such as creating a contract without mandatory legal clauses or setting wages below the legal minimum.
  * Ensure the digital signing process retains legal binding integrity.

### 6. UX & Persona Integrity
* **Goal**: Prevent design fragmentation and maintain role-specific mental models.
* **Actions**:
  * Ensure Employer views do not leak Worker functionalities (e.g., a Worker editing the wage field).
  * Review mobile UI layout changes against TDS component guidelines to prevent layout breakage on small viewports.

### 7. Technical Debt & Maintainability
* **Goal**: Refuse quick hacks that degrade the codebase's long-term health.
* **Actions**:
  * Prevent inline styles, component duplication, state bloating, or magic values.
  * Recommend refactoring or leveraging existing shared utilities/hooks instead of writing custom logic from scratch.

### 8. History & Context Synchronization
* **Goal**: Maintain consistency with past architectural decisions and active development status.
* **Actions**:
  * Identify conflicts with previously merged code, style systems, or design guidelines.
  * Ensure database changes align correctly with active Supabase migration files.
