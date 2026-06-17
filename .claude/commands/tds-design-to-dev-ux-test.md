---
description: Proposing, comparing, or generating UI layout alternatives for toss-contract-app screens using @toss/tds-mobile components. Produces 5-layout proposals (bottom-sheet, full-page, list-detail, modal, funnel), then on selection emits a full design spec for implementation agents. Use when: designing screens, comparing UI patterns, laying out forms or pages, TDS component selection.
---

# TDS Design — UI Design Proposal + Spec Generation Skill

Based on the `@toss/tds-mobile` v2.4.0 component ecosystem of `toss-contract-app`,
generates 5 minimal-token UI design proposals, and when the user selects one,
outputs the **full design spec** as JSON so that implementation agents can write the code.

## Principles

1. **Proposals are token-minimal**: Only component combinations shown, no HTML/CSS code
2. **Spec is context-maximal**: After selection, includes intent, componentTree, stateBindings, interactions, referenceFiles
3. **5 proposals**: One per different layout pattern (bottom-sheet, full-page, list-detail, modal, funnel)
4. **History preserved**: Proposals and specs stored in `server/ux-test-sessions/` with prefix `design-`
5. **Versioning (Crucial)**: When modifying an existing design, clone previous JSON to a new timestamp file
6. **Selection → Implementation separation**: Skill only handles proposals + spec generation. Code writing handled by agents.

## TDS Component Reference
See `.omp/skills/tds-design-to-dev-ux-test/references/tds-components.md` for component props and usage patterns.

## Procedure

### Step 1: Generate Proposals (Token-Minimal)

Upon receiving a user request:

1. **Read relevant code**: Understand the target page, components, and hooks
2. **Generate 5 proposals**: Each using a different layout pattern. Format:

```json
{
  "taskId": "basicInfo-form",
  "page": "/employer/contracts/new",
  "proposals": [
    { "id": "A", "pattern": "bottom-sheet", "components": ["BottomSheet","TextField","Spacing","Button"], "layout": "stack", "description": "One-line description", "estimatedTokens": 120 },
    { "id": "B", "pattern": "full-page", "components": [...], "layout": "...", "description": "...", "estimatedTokens": 0 },
    { "id": "C", "pattern": "list-detail", "components": [...], "layout": "...", "description": "...", "estimatedTokens": 0 },
    { "id": "D", "pattern": "modal", "components": [...], "layout": "...", "description": "...", "estimatedTokens": 0 },
    { "id": "E", "pattern": "funnel", "components": [...], "layout": "...", "description": "...", "estimatedTokens": 0 }
  ]
}
```

3. **Save**: `server/ux-test-sessions/design-{timestamp}.json`
4. **Delegate for Mock Previews**: Pass the design JSON to the `toss-app-dev:toss-mini-app` agent to create 5 temporary mock React components (VariantA.tsx ~ VariantE.tsx).
5. **Output to user**: Inform the user that 5 mock proposals are ready. Ask them to preview and select one.

### Step 1.5: Modify Existing Proposals

If the user requests changes to an existing proposal:
1. **Create new version**: Generate a new timestamp
2. **Clone**: Copy the previous `design-*.json` as `server/ux-test-sessions/design-{new_timestamp}.json`
3. **Modify**: Apply changes ONLY to the cloned file.

### Step 2: Generate Full Design Spec (After Selection)

When the user selects a proposal (e.g., "Choose B"):

1. **Deep read existing code**: Understand the detailed structure, state, and hooks of the files to be modified
2. **Generate full spec** — see `.omp/skills/tds-design-to-dev-ux-test/references/spec-schema.md`

The spec includes 7 context areas:
- **intent**: Why this design (1-2 sentences)
- **uxEvaluation**: UX evaluation including philosophy/intent, expected usability impact, Pros & Cons mapped to UX theories (Hick's Law, Fitts's Law, Miller's Law) and Toss-specific UX theories (F/Z-Pattern, Thumb Zone, Single-Purpose Screens)
- **componentTree**: Parent-child relationships + props + bindTo
- **stateBindings**: Which state connects to which component
- **interactions**: Tab/click actions + error handling
- **referenceFiles**: Paths to existing code files to modify
- **rejectedAlternatives**: Why other proposals were not chosen

3. **Save**: `server/ux-test-sessions/design-spec-{timestamp}.json`

### Step 3: Delegate to Implementation Agent

Delegate the full spec to the `toss-app-dev:toss-mini-app` agent to modify `{referenceFiles}` according to the design spec.

## Prohibitions

- Do not generate HTML/CSS code directly in Step 1 (proposals)
- Do not propose custom UI that is not a `@toss/tds-mobile` component
- Do not generate more than 5 proposals
- Do not write implementation code directly (delegate to agents)
- Do not omit intent, rejectedAlternatives, or the mandatory uxEvaluation block from the spec
- Do not write pros/cons in uxEvaluation without grounding in specific named UX theories
- Do not violate TDS UX principles: ensure single-purpose screens and strictly avoid dark patterns

## References
- `.omp/skills/tds-design-to-dev-ux-test/references/tds-components.md` — TDS component props and usage patterns
- `.omp/skills/tds-design-to-dev-ux-test/references/spec-schema.md` — Design spec JSON schema definition
- `.omp/skills/tds-design-to-dev-ux-test/references/ux-theory.md` — UX theories and principles for the uxEvaluation block
