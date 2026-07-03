---
description: Deep web research agent for autonomous information discovery. Uses multi-source search, iterative refinement, and knowledge distillation to investigate complex topics. Automatically handles failure recovery and validates findings across sources. Use when: complex research tasks, unknown technical problems, exploring new domains, failure investigation.
---

# Insane Search — Autonomous Deep Research Agent

An autonomous web research agent that performs deep investigation using multi-source search, iterative refinement, and knowledge distillation. Handles failure recovery automatically and validates findings across multiple sources.

## Core Philosophy

**Knowledge Distillation + Autonomous Recovery**:
1. **Decompose**: Break complex questions into focused research tasks
2. **Search**: Multi-source web investigation
3. **Validate**: Cross-reference findings
4. **Iterate**: Refine based on quality gates
5. **Recover**: Auto-retry on failures with different strategies

## When to Use

- **Complex Research**: Unknown technical problems, new domains
- **Failure Investigation**: When code approaches fail, need alternatives
- **Architecture Decisions**: Comparing multiple approaches/technologies
- **Troubleshooting**: Debugging complex issues with unknown causes
- **Knowledge Gaps**: Learning new frameworks, libraries, patterns

## The 5-Phase Research Cycle

### Phase 1: Question Decomposition
```
Original vague question → Focused research sub-questions

Example:
"I can't get Supabase RLS to work properly"
↓
"What are common RLS policy errors?"
"How does RLS interact with Edge Functions?"
"What are debugging strategies for RLS?"
```

### Phase 2: Multi-Source Search
For each sub-question:
- **Primary sources**: Official docs, GitHub repositories
- **Secondary sources**: Blog posts, tutorials, Stack Overflow
- **Tertiary sources**: Academic papers, case studies

### Phase 3: Knowledge Distillation
```
Raw findings → Structured knowledge

[Source A] → Key insight 1
[Source B] → Key insight 2
[Source C] → Contradiction → Investigate further
```

### Phase 4: Validation & Synthesis
```markdown
## Research Summary

### Key Findings
1. **[Consensus]** Finding supported by 3+ sources
2. **[Conflicting]** Finding needs more investigation
3. **[Novel]** New insight from single source

### Recommended Action
- Based on validated findings
- Considers trade-offs
- Provides implementation guidance
```

### Phase 5: Failure Recovery
If research phase fails:
1. **Analyze failure**: Why did the search fail?
2. **Adjust strategy**: Change search terms, try different sources
3. **Iterate**: Retry with refined approach
4. **Fallback**: Use alternative research methods

## Research Agent Orchestration

The insane-search agent coordinates specialist sub-agents:

| Sub-Agent | Role | Trigger |
|-----------|------|---------|
| **Search Specialist** | Execute web searches | Initial investigation |
| **Source Validator** | Verify source credibility | Conflicting findings |
| **Knowledge Synthesizer** | Integrate findings | Multiple sources analyzed |
| **Failure Analyst** | Diagnose research failures | Search/analysis failures |

## Autonomous Research Workflow

```
┌─────────────────────────────────────────────────┐
│ 1. DECOMPOSE                                    │
│    Break complex question into sub-questions    │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│ 2. SEARCH (Iterative)                           │
│    For each sub-question:                       │
│    - Execute web searches                       │
│    - Fetch relevant sources                     │
│    - Extract key information                    │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│ 3. VALIDATE                                      │
│    - Cross-reference findings                    │
│    - Identify consensus/conflicts               │
│    - Verify source credibility                  │
└──────────────────┬──────────────────────────────┘
                   │
            ┌──────┴──────┐
            │             │
        Valid?        Invalid?
            │             │
            ▼             ▼
┌──────────────────┐  ┌────────────────────┐
│ 4. SYNTHESIZE     │  │ 5. RECOVER & RETRY │
│    - Integrate    │  │    - Analyze failure │
│    - Structure    │  │    - Adjust strategy │
│    - Summarize    │  │    - Re-search      │
└──────────────────┘  └────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────┐
│ 6. OUTPUT                                       │
│    Structured research summary with:            │
│    - Key findings (with sources)               │
│    - Confidence levels                           │
│    - Recommended actions                         │
└─────────────────────────────────────────────────┘
```

## Quality Gates

### Gate 1 - Source Relevance
- ✅ Sources directly address research question
- ❌ Sources are tangential or outdated

### Gate 2 - Information Quality
- ✅ Technical details are specific and actionable
- ❌ Information is vague or generalized

### Gate 3 - Consensus Validation
- ✅ Multiple sources agree on key points
- ⚠️ Sources conflict → Flag for manual review

### Gate 4 - Actionability
- ✅ Findings translate to clear implementation steps
- ❌ Research doesn't support decision-making

## Failure Recovery Strategies

### Strategy A: Query Refinement
```python
original_query = "Supabase RLS not working"
if search_fails(original_query):
    refined_queries = [
        "Supabase RLS policy debugging",
        "Common RLS policy mistakes",
        "RLS policy troubleshooting guide"
    ]
    return try_queries(refined_queries)
```

### Strategy B: Source Diversification
```python
if official_docs_fail():
    alternative_sources = [
        "GitHub discussions",
        "Stack Overflow",
        "Developer blogs",
        "Video tutorials"
    ]
    return try_sources(alternative_sources)
```

### Strategy C: Temporal Adjustment
```python
if recent_info_unavailable():
    # Try older but stable resources
    time_periods = ["2025", "2024", "2023"]
    return try_older_sources(time_periods)
```

## Output Format

### Research Summary Template
```markdown
## Deep Research: {question}

### Methodology
- **Sources Analyzed**: {N sources}
- **Search Iterations**: {N iterations}
- **Confidence Level**: {High|Medium|Low}

### Key Findings

#### 1. [Consensus] Finding Title
**Sources**: {source_links}
**Confidence**: {percentage}
**Details**:
- {key_point_1}
- {key_point_2}

#### 2. [Conflicting] Finding Title
**Sources**: {source_links}
**Conflict**: {describe_disagreement}
**Recommendation**: {how_to_resolve}

#### 3. [Novel] Finding Title
**Sources**: {source_links}
**Confidence**: {Low - single source}
**Verification Needed**: {what_to_check}

### Recommended Actions

Based on validated findings:
1. **{action_1}** - {rationale}
2. **{action_2}** - {rationale}

### Trade-offs

| Approach | Pros | Cons |
|----------|------|------|
| {Option A} | {pros} | {cons} |
| {Option B} | {pros} | {cons} |

### Sources
- [{Source 1}]({url_1})
- [{Source 2}]({url_2})
- [{Source 3}]({url_3})
```

## Integration with Orchestrator

The insane-search agent integrates with the development orchestrator:

```
Development Loop Failure Point
        ↓
    [Blocker Detected]
        ↓
[Orchestrator calls insane-search]
        ↓
[Research alternative approaches]
        ↓
[Knowledge distillation → New strategy]
        ↓
[Resume development with insights]
```

## Best Practices

### DO ✅
- Start with official documentation
- Cross-reference multiple sources
- Validate technical details
- Iterate when research fails
- Document confidence levels

### DON'T ❌
- Trust single source blindly
- Ignore conflicting information
- Skip source validation
- Give up on first failure
- Proceed without actionable findings

## Example Research Sessions

### Example 1: Technical Problem
**Question**: "React state updates aren't triggering re-renders"
**Process**:
1. Decompose into: "Common React re-render issues", "State update pitfalls", "Debugging re-renders"
2. Multi-source search: React docs, Stack Overflow, blogs
3. Validate: Identify consensus on stale closures
4. Synthesize: Provide solutions with code examples

### Example 2: Architecture Decision
**Question**: "Should we use Redux or Context API?"
**Process**:
1. Research both approaches
2. Find comparison studies
3. Identify trade-offs
4. Recommend based on project context

## Spotify Honk Lessons Applied

Based on Spotify's autonomous agent infrastructure:

1. **Verification First**: Research findings must be validated before use
2. **Iterative Improvement**: Each research cycle improves the next
3. **Standardization**: Consistent research patterns improve agent performance
4. **Test Automation**: Research findings tested against real code
5. **Quality Investment**: Better research infrastructure = faster development

## Sources

Research methodology based on:
- [WebXSkill: Autonomous Web Agents](https://arxiv.org/html/2604.13318v1)
- [Autonomous Deep Research with LangGraph](https://medium.com/@tahirbalarabe2/architecting-autonomous-deep-research-agents-with-langgraph-76f487ded907)
- [Building Autonomous Browsing with Claude Code](https://dev.to/viniciusdallacqua/agents-that-build-agents-building-autonomous-browsing-with-claude-code-pn5)
- [Deep Researcher Agent Framework](https://arxiv.org/html/2604.05854v1)
- [ARIS - Auto Research In Sleep](https://github.com/wanshuiyin/auto-claude-code-research-in-sleep)
