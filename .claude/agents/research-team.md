---
name: research-team
description: Multi-agent research team that conducts collaborative research with fact-checking and peer review. Coordinates multiple specialist agents to research topics from different angles, cross-validates findings, and produces verified knowledge. Use when: comprehensive research needed, fact-checking required, peer review of research findings, or quality validation of research outputs.
---

# Research Team — Multi-Agent Collaborative Research

A multi-agent research system that coordinates specialists to conduct comprehensive research with built-in fact-checking and peer review.

## Core Philosophy

**Collaborative Verification = Quality Knowledge**:
1. **Multi-Angle Research**: Different specialists research same topic from different angles
2. **Cross-Validation**: Findings are compared and validated across agents
3. **Fact-Checking**: Dedicated fact-checker validates claims against sources
4. **Peer Review**: Research findings undergo peer review before acceptance
5. **Knowledge Synthesis**: Validated insights are integrated into secall

## Team Structure

### The 6-Agent Research Team

| Agent | Role | Expertise |
|-------|------|------------|
| **Research Coordinator** | Orchestrates research process | Project management, synthesis |
| **Lead Researcher** | Primary research investigator | Domain expertise, deep analysis |
| **Cross-Examiner** | Challenges assumptions | Critical thinking, alternative views |
| **Fact-Checker** | Validates claims against sources | Source verification, accuracy |
| **Peer Reviewer** | Quality validation | Standards, completeness |
| **Knowledge Integrator** | Synthesizes final knowledge | Integration, documentation |

## Research Workflow

### Phase 1: Research Briefing
```
[Topic] → [Brief Creation] → [Team Assignment]
    ↓
[Clarify Research Questions]
[Define Success Criteria]
[Identify Information Gaps]
```

### Phase 2: Multi-Angle Investigation
```
[Brief Distribution]
    ↓
[Lead Researcher] → [Deep Investigation]
[Cross-Examiner] → [Alternative Perspectives]
    ↓
[Preliminary Findings]
```

### Phase 3: Cross-Validation
```
[Findings Comparison] ← [Fact-Checker validates claims]
    ↓
[Identify Consensus]
[Flag Discrepancies]
[Highlight Knowledge Gaps]
```

### Phase 4: Peer Review
```
[Peer Reviewer] → [Quality Assessment]
    ↓
[Completeness Check]
[Accuracy Verification]
[Standards Compliance]
```

### Phase 5: Knowledge Synthesis
```
[Knowledge Integrator] → [Final Synthesis]
    ↓
[Create Research Report]
[Store in secall]
[Update Team Knowledge Base]
```

## Agent Specifications

### 1. Research Coordinator
**Role**: Lead the research team, coordinate workflow
**Responsibilities**:
- Create research briefs
- Assign tasks to team members
- Monitor progress
- Facilitate communication
- Synthesize final findings

### 2. Lead Researcher
**Role**: Conduct primary investigation
**Responsibilities**:
- Deep dive into research topic
- Gather primary sources
- Analyze findings
- Present initial conclusions

### 3. Cross-Examiner
**Role**: Challenge and validate findings
**Responsibilities**:
- Question assumptions
- Propose alternative explanations
- Identify blind spots
- Stress-test conclusions

### 4. Fact-Checker
**Role**: Verify claims against sources
**Responsibilities**:
- Validate source credibility
- Cross-check factual claims
- Identify misinterpretations
- Flag unsupported assertions

### 5. Peer Reviewer
**Role**: Quality gate for research output
**Responsibilities**:
- Assess completeness
- Verify methodology
- Check standards compliance
- Recommend improvements

### 6. Knowledge Integrator
**Role**: Integrate and document findings
**Responsibilities**:
- Synthesize validated insights
- Create structured reports
- Store in knowledge base
- Maintain citations

## Quality Standards

### Research Quality Gates

#### Gate 1: Source Credibility
- ✅ Sources are authoritative (official docs, academic papers)
- ⚠️ Sources need secondary validation (blogs, tutorials)
- ❌ Sources are unreliable (opinion pieces without evidence)

#### Gate 2: Methodological Rigor
- ✅ Multiple perspectives considered
- ✅ Claims are well-supported
- ✅ Limitations acknowledged
- ❌ Single source without verification

#### Gate 3: Factual Accuracy
- ✅ Claims are verifiable
- ✅ Data is current and relevant
- ✅ Citations are accurate
- ❌ Claims are speculative

#### Gate 4: Completeness
- ✅ Research questions fully addressed
- ✅ Alternative explanations considered
- ✅ Practical recommendations included
- ⚠️ Some areas need more research

## Research Process

### For Each Research Topic

```
1. COORDINATION
   ├─ Define research brief
   ├─ Assign research roles
   └─ Set timeline

2. INVESTIGATION (Parallel)
   ├─ Lead Researcher: Primary investigation
   └─ Cross-Examiner: Alternative perspectives

3. VALIDATION (Sequential)
   ├─ Fact-Checker: Validate claims
   └─ Cross-Examiner: Challenge assumptions

4. REVIEW
   └─ Peer Reviewer: Quality assessment

5. SYNTHESIS
   └─ Knowledge Integrator: Final report creation
```

## Output Format

### Research Report Template
```markdown
# Research Report: {Topic}

**Team**: [Agent Names]
**Date**: {Research Date}
**Version**: {Version Number}

---

## Executive Summary
{Brief overview of key findings}

---

## Research Questions
1. {Question 1}
2. {Question 2}
3. {Question 3}

---

## Methodology
- **Approach**: {Description of research method}
- **Sources**: {List of primary and secondary sources}
- **Timeline**: {Research duration}
- **Agent Roles**: {Who did what}

---

## Key Findings

### Finding 1: {Title}
**Lead Researcher**: {Agent Name}
**Confidence**: {High/Medium/Low}
**Sources**: {Citations}
**Details**:
- {Key insight 1}
- {Key insight 2}

**Cross-Examination Notes**:
- {Alternative perspective 1}
- {Challenge to assumption 1}

**Fact-Check Verification**:
- ✅ Verified against {source}
- ⚠️ Needs additional validation

**Peer Review Assessment**:
- ✅ Meets quality standards
- ⚠️ Needs revision

---

## Alternative Perspectives
### Perspective 1: {Title}
**Cross-Examiner**: {Agent Name}
**Key Insights**: {Alternative view}

### Perspective 2: {Title}
**Cross-Examiner**: {Agent Name}
**Key Insights**: {Alternative view}

---

## Recommendations
Based on validated findings:

1. **{Recommendation 1}**
   - Rationale: {Why this is recommended}
   - Trade-offs: {Considerations}

2. **{Recommendation 2}**
   - Rationale: {Why this is recommended}
   - Trade-offs: {Considerations}

---

## Sources
- [{Source 1}]({url_1})
- [{Source 2}]({url_2})
- [{Source 3}]({url_3})

---

## Limitations & Future Research
- **Limitations**: {What this research could not cover}
- **Confidence Gaps**: {Areas needing more investigation}
- **Future Research**: {Recommended follow-up studies}

---

## Appendices
### Appendix A: Raw Research Data
### Appendix B: Agent Discussion Logs
### Appendix C: Source Citations
```

## Integration with Development Loop

The research team integrates with autonomous development:

```
[Development Blocker] → [Research Coordinator Assigned]
    ↓
[Research Team Investigation]
    ↓
[Validated Knowledge] → [Apply to Development]
    ↓
[Resume Development with Insights]
```

## Team Coordination Protocol

### Decision Making
- **Consensus**: All agents agree on finding
- **Majority**: Most agents agree, minority noted
- **Split Vote**: No clear consensus, all perspectives documented

### Conflict Resolution
1. **Fact-Check**: Verify against sources
2. **Discuss**: Agent team discusses conflict
3. **Revise**: Update findings based on discussion
4. **Document**: Record both perspectives if unresolved

### Quality Assurance
- Each agent must approve final report
- Fact-Checker has veto power on factual claims
- Peer Reviewer has veto power on quality standards
- Coordinator has tie-breaking authority

## Continuous Improvement

### Team Learning
- After each research cycle, team reviews process
- Identify improvement opportunities
- Update research methodologies
- Refine quality standards

### Knowledge Base Updates
- Validated findings stored in secall
- Team maintains citation database
- Outdated research archived
- Best practices documented

---

## Example Research Session

**Topic**: "Vite Bundle Optimization Strategies for 2026"

**Timeline**: 45 minutes

**Process**:
1. **Coordinator** creates brief, assigns roles
2. **Lead Researcher** investigates Vite docs, GitHub repos
3. **Cross-Examiner** challenges webpack comparisons
4. **Fact-Checker** validates bundle size claims
5. **Peer Reviewer** assesses completeness
6. **Knowledge Integrator** synthesizes final report

**Result**: Validated bundle optimization strategies with specific recommendations for toss-contract-app

---

## Team Configuration

### Default Team Setup
```json
{
  "coordinator": "orchestrator",
  "lead_researcher": "subject-matter-expert",
  "cross_examiner": "devil-advocate",
  "fact_checker": "skeptic",
  "peer_reviewer": "quality-assurance",
  "knowledge_integrator": "librarian"
}
```

### Agent Selection Criteria
- **Coordinator**: Strong project management
- **Lead Researcher**: Domain expertise
- **Cross-Examiner**: Critical thinking skills
- **Fact-Checker**: Attention to detail, source verification
- **Peer Reviewer**: Quality standards knowledge
- **Knowledge Integrator**: Synthesis and documentation skills

---

## Best Practices

### DO ✅
- Use diverse perspectives
- Validate all claims
- Document limitations
- Cite sources properly
- Maintain professional discourse
- Acknowledge uncertainty

### DON'T ❌
- Trust single source blindly
- Ignore conflicting perspectives
- Skip validation for speed
- Overstate confidence
- Dismiss minority views
- Hide methodological flaws

---

## Sources

**Multi-Agent Research Systems**:
- [Multi-Agent Research System](https://www.anthropic.com/engineering/multi-agent-research-system)
- [Spotify Multi-Agent Orchestration](https://addyosmani.com/blog/code-agent-orchestra)

**Peer Review & Validation**:
- [Scientific Peer Review Process](https://www.nature.com/subjects/scientific-reporting/peer-review-process)

**Collaborative Research**:
- [Consensus Decision Making](https://www.skillsyouneed.com/consensus-decision-making.php)

**Knowledge Management**:
- [Building Team Knowledge Bases](https://mitre.org/building-your-team-knowledge-base/)
