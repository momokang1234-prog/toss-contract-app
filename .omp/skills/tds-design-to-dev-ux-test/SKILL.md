---
name: tds-design-to-dev-ux-test
description: >
  Proposing, comparing, or generating UI layout alternatives for toss-contract-app screens using
  @toss/tds-mobile components. Produces 5-layout proposals (bottom-sheet, full-page, list-detail, modal, funnel),
  then on selection emits a full design spec (intent, componentTree, stateBindings, interactions, referenceFiles,
  rejectedAlternatives) for implementation agents. Use when: designing screens, comparing UI patterns,
  laying out forms or pages, TDS component selection.
---

# TDS Design — UI Design Proposal + Spec Generation Skill

Based on the `@toss/tds-mobile` v2.4.0 component ecosystem of `toss-contract-app`,
generates 5 minimal-token UI design proposals, and when the user selects one,
outputs the **full design spec** as JSON so that
implementation agents (`toss-app-dev:*`) can write the code.

## Principles

1. **Proposals are token-minimal**: Only component combinations shown, no HTML/CSS code
2. **Spec is context-maximal**: After selection, includes intent, componentTree, stateBindings, interactions, referenceFiles
3. **5 proposals**: One per different layout pattern (bottom-sheet, full-page, list-detail, modal, funnel)
4. **History preserved**: Proposals and specs MUST be stored in the `server/ux-test-sessions` directory with the prefix `design-` (e.g., `server/ux-test-sessions/design-{timestamp}.json`).
5. **Versioning (Crucial)**: If modifying or refining an existing design, you MUST clone the previous JSON file into a new file with a new timestamp (e.g., `design-{new_timestamp}.json`), and perform modifications ONLY on the cloned file to preserve history.
6. **Selection → Implementation separation**: Skill only handles proposals + spec generation. Code writing is handled by existing agents.
7. **Handover to Implementation Agent**: After the final design spec (JSON) is confirmed, you MUST pass this JSON data to the implementation agent and instruct them to generate the actual code if necessary.

## TDS Component Reference

For component props and usage patterns, see the separate reference document:
→ `skill://tds-design-to-dev-ux-test/references/tds-components.md`

## Procedure

### Step 1: Generate Proposals (Token-Minimal)

Upon receiving a user request:

1. **Read relevant code**: Use `read`/`search` to understand the target page, components, and hooks
2. **Generate 5 proposals**: Each using a different layout pattern. (Exception: Do not force patterns that violate context, such as an immediate bottom-sheet upon entry). Format:

```json
{
  "taskId": "basicInfo-form",
  "page": "/employer/contracts/new",
  "proposals": [
    { "id": "A", "pattern": "bottom-sheet", "components": ["BottomSheet","TextField","Spacing","Button"], "layout": "stack", "description": "One-line description", "estimatedTokens": 120 },
    { "id": "B", "pattern": "full-page", ... },
    { "id": "C", "pattern": "list-detail", ... },
    { "id": "D", "pattern": "modal", ... },
    { "id": "E", "pattern": "funnel", ... }
  ]
}
```

3. **Save**: `server/ux-test-sessions/design-{timestamp}.json`
4. **Delegate for Mock Previews**: BEFORE asking the user to choose, you MUST pass the `design-{timestamp}.json` to the implementation agent (`toss-app-dev:toss-mini-app`). Instruct the agent to:
   - Create 5 temporary mock React components (e.g., `VariantA.tsx` ~ `VariantE.tsx`) based on the proposals.
   - Update `App.tsx` and `UXTestPage.tsx` so the 5 proposals can be visually previewed dynamically in the UX Test Workspace.
5. **Output to user**: Inform the user that the 5 mock proposals have been generated and visually applied to the UX Test Workspace. Ask them to preview the designs and select one.

### Step 1.5: Modify Existing Proposals (If requested)

If the user requests changes to an existing proposal:
1. **Create new version**: Generate a new timestamp `{new_timestamp}`
2. **Clone**: Copy the previous `design-*.json` as `server/ux-test-sessions/design-{new_timestamp}.json`
3. **Modify**: Apply the changes ONLY to the cloned file.
4. **Output to user**: Summary of the changes made in the new version.

### Step 2: Generate Full Design Spec (After Selection)

When the user selects a proposal (e.g., "Choose B"):

1. **Deep read existing code**: Understand the detailed structure, state, and hooks of the files to be modified
2. **Generate full spec** — see separate document for spec schema:
   → `skill://tds-design-to-dev-ux-test/references/spec-schema.md`

The spec includes 7 context areas:
- **intent**: Why this design (1-2 sentences)
- **uxEvaluation**: Mandatory UX evaluation including philosophy/intent, expected usability impact, and Pros & Cons mapped to explicit UX theories (e.g. Hick's Law, Fitts's Law, Miller's Law) and Toss-specific UX theories (F/Z-Pattern, Thumb Zone, Single-Purpose Screens)

   For UX theory grounding (spacing hierarchy, typography scales, thumb-zone strategy, F/Z visual patterns, dark-pattern prohibition), see:
   → `skill://tds-design-to-dev-ux-test/references/ux-theory.md`
- **componentTree**: Parent-child relationships + props + bindTo
- **stateBindings**: Which state connects to which component
- **interactions**: Tab/click actions + error handling
- **referenceFiles**: Paths to existing code files to modify
- **rejectedAlternatives**: Why other proposals were not chosen

3. **Save**: `server/ux-test-sessions/design-spec-{timestamp}.json`

### Step 3: Delegate to Implementation Agent

Delegate the full spec to the `toss-app-dev:toss-mini-app` agent:

```
assignment: "Modify {referenceFiles} according to the following design spec.
Spec: {DesignSpec JSON full}
Import TDS components from @toss/tds-mobile and follow existing patterns."
```

The agent reads `referenceFiles` with `read` and writes code according to the spec.
After writing, the `toss-app-dev:vite` agent validates the build.

## Prohibitions

- Do not generate HTML/CSS code directly in Step 1 (proposals)
- Do not propose custom UI that is not a `@toss/tds-mobile` component
- Do not generate more than 5 proposals
- Do not write implementation code directly (delegate to agents)
- Do not omit intent, rejectedAlternatives, or the mandatory uxEvaluation block from the spec
- Do not write pros and cons in the uxEvaluation block without grounding them in specific, named UX theories (e.g., Hick's Law, Fitts's Law, Miller's Law) and Toss-specific UX theories (F/Z-Pattern, Thumb Zone, Single-Purpose Screens)
- Do not violate TDS UX principles: ensure single-purpose screens and strictly avoid dark patterns (e.g., no immediate bottom sheets on entry)

## References

- `skill://tds-design-to-dev-ux-test/references/tds-components.md` — TDS component props and usage patterns
- `skill://tds-design-to-dev-ux-test/references/spec-schema.md` — Design spec JSON schema definition
- `skill://tds-design-to-dev-ux-test/references/ux-theory.md` — UX theories and principles for the uxEvaluation block
