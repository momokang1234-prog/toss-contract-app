---
name: intent-analyzer
description: Reframe user requests by questioning assumptions, uncovering the ultimate objective (the 'Why'), and proposing optimal alternative candidates instead of blindly executing the proposed path.
---
# Intent Analyzer playbook

## Core Philosophy: Goal-Centric Navigation (A-to-B Reframing)
When a user requests to go from **Point A** (assumed starting state) to **Point B** (proposed destination/solution):
1. **Question the Starting State (A)**: The user's assumption of where the system currently stands or what the root cause is might be incorrect. Cross-check the codebase.
2. **Question the Destination (B)**: Going to B might be unnecessary, overly complex, or counterproductive to the actual objective.
3. **Extract the Ultimate Goal (The "Why")**: Identify what the user hopes to accomplish or build once they reach B. The user is looking for a finished outcome, not just the path itself.
4. **Propose Alternative Candidates (1 to 5)**: Provide 5 alternative routes that accomplish the ultimate goal more safely, cleanly, or idiomatically within the project's architecture, labeled numerically from 1 to 5.

---

## When to use this skill
- When a user request specifies a concrete technical solution (Point B) but the underlying business logic or goal is unclear.
- When the user's instructions contain typos, incorrect file references, or suboptimal technical directions due to a lack of codebase knowledge.
- When you need to cross-check constraints like labor laws, security policies (RLS), design guidelines (TDS), or state machine boundaries before proceeding.
- When recommending or dispatching specialized subagents (`ux-auditor`, `robustness-auditor`, `functional-qa`, `toss-app-dev-supabase`, etc.) to collaborate.

---

## Procedure

### 1. Apply the A-to-B Reframing Protocol
Analyze the user request to separate the proposed solution from the actual goal:
- **Analyze Point A (Current State)**: Inspect the current files/components to see if the user's premise of the starting point is correct.
- **Identify Point B (Proposed Path)**: Note the user's requested changes.
- **Uncover the "Why" (Ultimate Goal)**: Ask: *"What will the user gain by doing this?"*
- **Generate Alternatives**: Draft 5 cleaner/safer candidates (1 to 5) to present to the user.

### 2. Verify Against the 8 Refinement Perspectives
Ensure the proposed paths and alternatives are evaluated through these 8 lenses:
1. **User Communication & Cognitive Gap**: Clarify vague requests, check for typos, and use `/grill-me` for deep alignment.
2. **Codebase Context & Technical Alignment**: Map to physical files using [mapping.md](skill://intent-analyzer/references/mapping.md).
3. **Architecture & Risk Control**: Guard state machines, RLS, and auth limits.
4. **Actionable Execution**: Outline clear goals, roles, states, and files.
5. **Legal & Policy Compliance**: Check labor laws and digital contract regulations.
6. **UX & Persona Integrity**: Preserve target boundaries between Employer (사장님) and Worker (근로자) flows.
7. **Technical Debt & Maintainability**: Avoid inline styles, code duplication, and state bloating.
8. **History & Context Synchronization**: Prevent regressions and sync with active db migrations.

### 3. Present Refined Intent & Alternatives to the User
Do not execute immediately. Output an analysis using the following structured format to ensure clear hand-off to the user and subagents:

```markdown
### Intent Analysis Report

**[Current State (Point A)]**
- Brief analysis of the user's assumed starting state vs actual codebase state.

**[Identified Goal (The "Why")]**
- The true business or UX objective extracted from the request.

**[Proposed Alternatives]**
- **Candidate 1 (Recommended):** [Name of approach]
  - Details and "Why" it is better.
- **Candidate 2:** [Name of approach]
  - Details and "Why" it is a viable alternative.
- **Candidate 3:** [Name of approach]
  - Details and "Why" it might be chosen.
- **Candidate 4:** [Name of approach]
  - Details and "Why" it might be chosen.
- **Candidate 5:** [Name of approach]
  - Details and "Why" it might be chosen.

**[Keyword Bucket]**
- **Semantic Similarity Match (의도 유사 단어군):**
  - [Term 1] (Similarity Score: e.g., 0.92) - Short definition/relevance.
  - [Term 2] (Similarity Score: e.g., 0.85) - Short definition/relevance.
- **Domain/Technical Terms (전문 및 더 정확한 용어):**
  - [Technical Term A] - A more precise replacement for [colloquial/vague term].
  - [Technical Term B] - A more precise replacement for [colloquial/vague term].
- **Conceptual Hierarchy (개념의 계층 구조):**
  - **상위 개념 (Broader Concept):** [High-level umbrella category]
    - **현재 수준 개념 (Current Level):** [The core feature/concept being addressed]
      - **하위 개념 및 원소 (Narrower Concepts & Elements):** [Specific elements/properties contained within the current level concept]

**[Target Subagents]**
- List of specialized agents needed for Candidate 1 (e.g., `ui-builder`, `toss-app-dev-supabase`).
```
### 4. Apply Multi-Agent Coordination Protocol
Once the direction is agreed upon:
- Refer to [routing-protocol.md](skill://intent-analyzer/references/routing-protocol.md) for task delegation.
- Define handshake and discussion points between agents.

---

## 8 Perspectives for Intent Verification & Refinement

For detailed actions and goals for each perspective, refer to:
[8-perspectives.md](skill://intent-analyzer/references/8-perspectives.md)

1. **User Communication & Cognitive Gap**
2. **Codebase Context & Technical Alignment**
3. **Architecture & Risk Control**
4. **Actionable Execution**
5. **Legal & Policy Compliance**
6. **UX & Persona Integrity**
7. **Technical Debt & Maintainability**
8. **History & Context Synchronization**

---

## Reference
- `skill://intent-analyzer/examples/reframing-examples.md` — Few-shot examples of analyzing and reframing requests.
- `skill://intent-analyzer/references/8-perspectives.md` — Detailed guide to the 8 verification lenses.
- `skill://intent-analyzer/references/classification.md` — Detailed guide to request classification and routing criteria.
- `skill://intent-analyzer/references/mapping.md` — Reference map of codebase files and directories.
- `skill://intent-analyzer/references/routing-protocol.md` — Protocol for multi-agent coordination, task dispatch, and consensus.
