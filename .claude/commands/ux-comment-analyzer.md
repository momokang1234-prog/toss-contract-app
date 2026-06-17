---
description: Parses and analyzes component-level comments left by users in the UX Test Workspace's Xray mode, and generates actionable implementation plans for UI adjustments. Use when the user requests to process or implement changes based on UX test comments.
---

# UX Comment Analyzer Playbook

## Core Philosophy
The UX Test Workspace (`http://localhost:5173/dev/ux-test`) features an "Xray" mode. In this mode, users can click on specific UI components within the simulated iframes and leave contextual comments or feedback (e.g., "Change this button to primary color", "Add 16px padding here").

This skill acts as the bridge between **User Feedback (Comments)** and **Code Implementation**.

## When to use this skill
- When the user says they left a comment in the UX Test page and wants it fixed.
- When the user asks to "process the Xray comments" or "apply feedback from the simulator".
- When you need to extract the UI/UX feedback captured during a test session and translate it into a technical fix.

## Procedure

### 1. Locate the Comments
Identify where the comments are stored. Comments are typically captured as part of the `StateSnapshot` under `issues` or within `server/ux-test-sessions/`.
- Scan the most recent test session payloads.
- Identify the `targetComponent`, `filePath`, and `commentText`.

### 2. Analyze Intent & Context
For each comment:
- **Map to Code**: Locate the exact React component in `src/` referenced by the comment.
- **Understand the Ask**: Is it a styling change (CSS/Emotion)? A layout change? A logic fix? A new prop?
- **Verify TDS Guidelines**: If the comment asks for a design change, ensure it aligns with the Toss Design System (TDS) constraints before applying.

### 3. Generate Implementation Plan & Route
- **Draft the Fix**: Formulate the exact code changes needed.
- **Dispatch**:
  - For simple, localized styling/prop changes: Apply the changes directly.
  - For complex state logic or cross-file architectural changes: Delegate to the appropriate subagent (e.g., `toss-app-dev:toss-mini-app`).
- **Validate**: Advise the user to refresh the UX Test Workspace to verify the fix.

## Hand-off Format for Implementation Agents
When delegating a comment fix to another agent, use this strict format:

```text
# Context: UX Test Xray Comment
# Target Component: [File Path e.g., src/components/Button.tsx]
# User Comment: "[Verbatim text]"

# Required Change:
- [Clear instruction of what needs to be changed in the code]
- [Any TDS or layout constraints to follow]
```
