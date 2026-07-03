# Multi-Agent Coordination and Dispatch Protocol

This document defines the standard collaboration procedures for splitting tasks among specialized expert agents based on the conclusions analyzed by the Intent Analyzer, and for facilitating mutual cooperation and consensus.

## 1. Dependency Map by Agent
Defines the sequential relationships and collaboration points between each agent.

```mermaid
graph TD
    IntentAnalyzer[Intent Analyzer] -->|1. Split & Route| UX[ux-auditor]
    IntentAnalyzer -->|1. Split & Route| Robust[robustness-auditor]
    UX -->|Hand over UI/UX design guidelines| Dev[toss-app-dev-*]
    Robust -->|Hand over exception handling & state validation rules| Dev
    Dev -->|2. Request implementation code review| QA[functional-qa]
    QA -->|3. Feed back test & verification results| IntentAnalyzer
```
