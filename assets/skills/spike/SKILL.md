---
name: spike
description: Spike/Research workflow for exploring unknowns before committing to implementation. Use when researching, prototyping, doing proof of concept, or when user says "spike", "research", "prototype", "poc", "explore", "investigate".
---

# Spike/Research Workflow

Time-boxed exploration workflow for investigating unknowns, validating assumptions, and de-risking decisions before committing to full implementation.

## IMPORTANT: Read Architecture First

**Before starting any spike, you MUST read the appropriate architecture reference:**

### Global Architecture Files
```
~/.claude/architecture/
├── clean-architecture.md    # Core principles for all projects
├── flutter-mobile.md        # Flutter + Riverpod
├── react-frontend.md        # React + Vite + TypeScript
├── go-backend.md            # Go + Gin
├── laravel-backend.md       # Laravel + PHP
├── remix-fullstack.md       # Remix fullstack
└── monorepo.md              # Monorepo structure
```

### Project-specific (if exists)
```
.claude/architecture/        # Project overrides
```

**Understand the project structure and patterns before exploring alternatives.**

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| DEFINE | `@clean-architect` | Define research questions based on architecture |
| RESEARCH | `@api-designer` | API/integration research |
| RESEARCH | `@db-designer` | Data model research |
| RESEARCH | `@security-audit` | Security implications |
| PROTOTYPE | `@react-frontend-dev`, `@go-backend-dev`, `@laravel-backend-dev`, `@flutter-mobile-dev`, `@remix-fullstack-dev` | Stack-specific POC |
| EVALUATE | `@clean-architect` | Architecture impact assessment |
| EVALUATE | `@docs-writer` | Document findings |

## Workflow Overview

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ 1. DEFINE│──▶│2. RESEARCH──▶│3. PROTOTYPE──▶│4. EVALUATE│
└──────────┘   └──────────┘   └──────────┘   └──────────┘
     │                                              │
     │          Timebox Expired?                    │
     └──────────────────────────────────────────────┘
                    End & Document
```

---

## Phase 1: DEFINE

**Goal**: Define the question/problem to research and set timebox

### Actions
1. Clarify what's unknown:
   - What decision needs to be made?
   - What assumptions need validation?
   - What technical unknowns exist?

2. **Identify project stack and read architecture doc**

3. Define research question:
   ```
   Good: "Can we integrate Auth0 with our React app without breaking Clean Architecture?"
   Bad: "Research authentication"
   ```

4. Set timebox based on spike type:
   - Quick spike: 2-4 hours
   - Medium spike: 1-2 days
   - Deep spike: 3-5 days
   - **Never exceed 1 week**

5. Define success criteria:
   ```
   Spike is successful when we know:
   - [ ] Criterion 1
   - [ ] Criterion 2
   - [ ] Criterion 3
   ```

### Output
```markdown
## Spike: [Name]

### Type
[Technical/Design/Functional]

### Stack & Architecture
- Stack: [Flutter/React/Go/Laravel/Remix]
- Architecture Doc: [path to architecture file]

### Research Question
[Clear, specific question]

### Why This Spike
[Why we need this research before implementing]

### Timebox
- Duration: [X hours/days]
- Start: [timestamp]
- End: [timestamp]

### Success Criteria
We will know enough when:
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

### Out of Scope
[What we're NOT exploring]
```

### Gate
- [ ] Research question clear and specific
- [ ] Architecture doc identified
- [ ] Timebox set (≤ 1 week)
- [ ] Success criteria defined
- [ ] Out of scope defined

---

## Phase 2: RESEARCH

**Goal**: Gather information and explore options

### Actions
1. **Read relevant architecture docs** for context

2. Research approaches:
   - [ ] Read documentation/specs
   - [ ] Survey existing solutions
   - [ ] Check community best practices
   - [ ] Review similar projects
   - [ ] Consult with team/experts

3. Evaluate against architecture:
   - Does it fit our patterns?
   - Which layers would it affect?
   - Does it respect boundaries?
   - What's the integration complexity?

4. Document findings in real-time:
   ```markdown
   ## Research Log

   ### [Timestamp] - Option 1: [Name]
   **Source**: [link/person]
   **Pros**:
   - Pro 1
   - Pro 2

   **Cons**:
   - Con 1
   - Con 2

   **Architecture Fit**: [Good/Moderate/Poor]
   - [Notes on how it fits our architecture]

   ### [Timestamp] - Option 2: [Name]
   ...
   ```

5. Track time spent vs timebox

### Research Output
```markdown
## Research Findings

### Options Explored
1. **Option 1**: [brief description]
   - Architecture fit: [assessment]
   - Complexity: [Low/Medium/High]
   - Risk: [Low/Medium/High]

2. **Option 2**: [brief description]
   - Architecture fit: [assessment]
   - Complexity: [Low/Medium/High]
   - Risk: [Low/Medium/High]

### Architecture Impact
**Affected Layers**: [list from architecture doc]
**Pattern Changes**: [any changes to current patterns]
**Dependencies**: [new dependencies needed]

### Initial Recommendation
[Which option looks most promising and why]
```

### Gate
- [ ] Multiple options explored (at least 2-3)
- [ ] Architecture impact assessed
- [ ] Pros/cons documented
- [ ] Still within timebox

---

## Phase 3: PROTOTYPE

**Goal**: Build quick proof of concept to validate approach

### Principles
1. **Quick & Dirty** - Don't worry about code quality
2. **Focused** - Prove one thing only
3. **Throwaway** - Code will likely be discarded
4. **Time-boxed** - Stop when time is up

### Actions
1. **Read architecture doc** for the affected areas

2. Set prototype scope:
   ```markdown
   ## Prototype Scope
   **Proving**: [the one thing we're validating]
   **NOT proving**: [everything else]
   **Time**: [X hours from total timebox]
   ```

3. Build minimal POC:
   - Create in separate branch/directory
   - Follow architecture patterns where reasonable
   - Mark as prototype:
     ```
     // PROTOTYPE - NOT PRODUCTION CODE
     // Spike: [spike name]
     ```

4. Test the critical path only:
   - Does it work?
   - Does it integrate?
   - Are there blockers?

5. Document observations:
   ```markdown
   ## Prototype Observations

   ### What Worked
   - [observation 1]
   - [observation 2]

   ### What Didn't Work
   - [issue 1]
   - [issue 2]

   ### Surprises
   - [unexpected finding 1]
   - [unexpected finding 2]

   ### Blockers Found
   - [blocker 1]
   - [blocker 2]
   ```

### Prototype Output
```markdown
## Prototype Results

### Implementation
- Branch/Location: [path]
- Time Spent: [X hours]
- Status: [Working/Partially Working/Not Working]

### Key Learnings
1. [learning 1]
2. [learning 2]
3. [learning 3]

### Architecture Compliance
- Fits patterns: [Yes/No/Partially]
- Issues found: [list]
- Workarounds needed: [list]

### Effort Estimate (if proceeding)
- [Rough T-shirt size: XS/S/M/L/XL]
- [Based on: what you learned]
```

### Gate
- [ ] Prototype proves/disproves key assumption
- [ ] Blockers identified
- [ ] Effort estimated
- [ ] Still within timebox (if not, stop and document)

---

## Phase 4: EVALUATE

**Goal**: Assess results and make recommendation

### Actions
1. **Review findings against architecture doc**

2. Assess each option:
   ```markdown
   ## Option Assessment

   ### Option 1: [Name]
   **Architecture Fit**: ⭐⭐⭐⭐⭐ (5/5)
   - [why it fits/doesn't fit]

   **Complexity**: ⭐⭐⭐ (3/5)
   - [complexity assessment]

   **Risk**: ⭐⭐ (2/5 - lower is better)
   - [risk assessment]

   **Effort**: [T-shirt size]
   - [effort justification]

   **Prototype Result**: [Successful/Partial/Failed]
   ```

3. Make recommendation:
   ```markdown
   ## Recommendation

   ### Choice: [Option X]

   ### Reasoning
   1. [reason 1]
   2. [reason 2]
   3. [reason 3]

   ### Trade-offs Accepted
   - [trade-off 1]
   - [trade-off 2]

   ### Risks & Mitigations
   - Risk: [risk 1]
     Mitigation: [how to mitigate]
   - Risk: [risk 2]
     Mitigation: [how to mitigate]

   ### Implementation Plan (High-Level)
   1. [phase 1]
   2. [phase 2]
   3. [phase 3]

   ### Next Steps
   - [ ] Next step 1
   - [ ] Next step 2
   - [ ] Next step 3
   ```

4. Create decision record:
   ```markdown
   # ADR: [Decision Title]

   Date: [date]
   Status: Proposed

   ## Context
   [What led to this spike]

   ## Decision
   [What we decided]

   ## Consequences
   - Positive: [list]
   - Negative: [list]
   - Neutral: [list]

   ## Alternatives Considered
   - Option A: [brief + why rejected]
   - Option B: [brief + why rejected]
   ```

### Final Deliverable
```markdown
## Spike Summary: [Name]

**Duration**: [actual time spent] / [timebox]
**Date**: [start] - [end]
**Stack**: [stack]
**Researcher**: [name/team]

### Question Answered
[Original research question]

### Answer
[Clear answer based on findings]

### Recommendation
[Clear recommendation with reasoning]

### Supporting Evidence
- Research: [key findings]
- Prototype: [what we built and learned]
- Architecture: [how it fits]

### Confidence Level
[High/Medium/Low] - [why]

### Next Actions
1. [ ] Action 1
2. [ ] Action 2
3. [ ] Action 3

### Artifacts
- Research notes: [link]
- Prototype code: [link/path]
- Decision record: [link]
```

### Gate
- [ ] Recommendation clear and justified
- [ ] Risks identified and mitigated
- [ ] Decision record created
- [ ] Prototype cleaned up or archived
- [ ] Findings documented

---

## Quick Reference

### Architecture Docs
| Stack | Doc |
|-------|-----|
| All | `clean-architecture.md` |
| Flutter | `flutter-mobile.md` |
| React | `react-frontend.md` |
| Go | `go-backend.md` |
| Laravel | `laravel-backend.md` |
| Remix | `remix-fullstack.md` |
| Monorepo | `monorepo.md` |

### Spike Types

| Type | Purpose | Example |
|------|---------|---------|
| **Technical** | Validate technical feasibility | Can we use WebSockets with our architecture? |
| **Design** | Explore design options | What's the best state management for this feature? |
| **Functional** | Understand requirements | How should offline sync work? |

### Timebox Guidelines

| Complexity | Timebox | Output |
|------------|---------|--------|
| Quick | 2-4 hours | Research + decision |
| Medium | 1-2 days | Research + small POC + decision |
| Deep | 3-5 days | Research + full POC + ADR |
| **Max** | **1 week** | **Stop and reassess** |

### When to Stop Early
- ✅ Success criteria met early
- ✅ Clear blocker found (no point continuing)
- ✅ Obvious answer emerged
- ❌ Timebox expired (stop and document)

### Red Flags
- 🚩 Spike extending beyond 1 week
- 🚩 Writing production-quality code
- 🚩 Scope creeping beyond research question
- 🚩 Not documenting findings
- 🚩 Trying to prove pre-decided solution

### Success Criteria
Spike is successful when:
1. Research question answered (even if answer is "no")
2. Clear recommendation made
3. Risks identified
4. Architecture impact understood
5. Findings documented
6. Completed within timebox

### Prototype Cleanup
After spike:
```bash
# Archive prototype
git branch -D spike/[name]  # Delete branch
# OR move to /experiments directory
mkdir -p experiments/spike-[name]
mv [prototype] experiments/spike-[name]/

# Update README
echo "## Spike: [name]" >> experiments/README.md
echo "Result: [recommendation]" >> experiments/README.md
echo "Date: [date]" >> experiments/README.md
```

---

## Templates

### Quick Spike Template (2-4 hours)
```markdown
# Spike: [Name]

## Question
[Clear question]

## Research (2 hours)
- [ ] Option 1 research
- [ ] Option 2 research
- [ ] Documentation review

## Decision (30 min)
- Recommendation: [choice]
- Reasoning: [why]

## Next Steps
- [ ] Next action
```

### Full Spike Template (3-5 days)
```markdown
# Spike: [Name]

## Define (Day 1)
- Question: [clear question]
- Success criteria: [list]
- Timebox: [X days]

## Research (Day 1-2)
- Options explored: [list]
- Architecture impact: [assessment]

## Prototype (Day 2-3)
- What: [what we're building]
- Result: [what we learned]

## Evaluate (Day 4-5)
- Recommendation: [choice]
- ADR: [link]
- Next steps: [list]
```
