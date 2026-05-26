---
name: research-spike
description: Spike/Research workflow for exploring unknowns before committing to implementation. Use when researching, prototyping, doing proof of concept, or when user says "spike", "research", "prototype", "poc", "explore", "investigate".
---

# Spike / Research Workflow

Time-boxed exploration to de-risk a decision by **building** (not just reading). Produces a recommendation + ADR, not production code.

## When to use this skill

- ✅ Need to validate a technical assumption by building
- ✅ Picking between 2+ options and need real comparison
- ✅ De-risking a critical path before committing
- ❌ Want to compare options via docs only → use `/research:web`
- ❌ Already decided on the approach → use `/feature:new`
- ❌ Stuck on a known bug → use `/fix:root-cause`

## Read Architecture First

Detect stack via `~/.claude/architecture/_shared/stack-detection.md`. Skim stack doc to understand current patterns — the spike output should fit the architecture or explicitly say why it doesn't.

---

## Workflow

```
DEFINE → RESEARCH → PROTOTYPE → EVALUATE
   ↑                                  │
   └────── timebox expired ───────────┘
```

---

## Phase 1: DEFINE (15-30 min — never skip)

**Goal:** lock the question, success criteria, timebox. Without these the spike has no exit condition.

### Spike brief

```markdown
## Spike: {short name}

### Question
{ONE specific question — answerable yes/no or "pick A vs B vs C"}

### Why now
{What decision blocks on this answer? When is the decision needed?}

### Options on the table
- Option A: {name + 1 line}
- Option B: {name + 1 line}
- (Option C: only if relevant)

### Success criteria
- [ ] {Specific, observable — e.g., "P95 latency <50ms at 1k req/s"}
- [ ] {e.g., "Integration with X library compiles + 1 test passes"}
- [ ] {e.g., "Estimated migration effort ≤2 sprints"}

### Timebox
- Quick spike: 2-4 hours
- Standard: 1-2 days
- Deep spike: 3-5 days (rare — usually means scope is too big)

### Red flags (stop early if hit)
- Scope creep into productionising
- Option requires breaking architecture rules
- Two options become "obviously the same" after 1 hour
```

### Gate
- [ ] Question is ONE specific question
- [ ] Success criteria are observable (not "feels right")
- [ ] Timebox + red flags written
- [ ] User CONFIRMED brief before starting

---

## Phase 2: RESEARCH (≤25% of timebox)

**Goal:** know enough to prototype intelligently, don't over-read.

Run `/research:web` for the topic if you haven't already. Capture:

- Official docs URLs (read, don't just bookmark)
- Known gotchas / GitHub issues for each option
- Prior art: anyone tried this combo? what was their conclusion?
- Constraints from existing stack (versions, license, infra)

### Gate
- [ ] At least 2 sources per option
- [ ] Known gotchas listed
- [ ] Constraints documented

---

## Phase 3: PROTOTYPE (the bulk of the timebox)

**Goal:** build the smallest thing that answers the question.

### Rules
- **Quick and dirty** — no tests beyond what's needed to verify the question
- **One option at a time** — full prototype for A, then full prototype for B
- **In a sandbox** — separate branch, never merge to main
- **Time-stamped commits** — `spike: A reaches 1k req/s with sync handler` so the timeline is reviewable
- **Stop on red flag** — if scope creeps or hits a wall, do not push through

### What "smallest" means
- Skip auth, skip error handling, skip pagination
- Hardcode config that you'd normally pull from env
- Stub anything not under test
- 1-2 happy-path scenarios is enough to verify success criteria

### Stop early when
- All success criteria met for one option (don't gold-plate)
- All options fail the same criterion (pivot the question)
- Timebox 75% used and not converging (something's wrong — stop, regroup)

### Gate
- [ ] Each option prototyped to the point of answering the question
- [ ] Success criteria measured (numbers, not vibes)
- [ ] Findings captured in spike branch commits

---

## Phase 4: EVALUATE

**Goal:** turn the prototype into a recommendation + ADR.

### Comparison matrix

| Criterion | Option A | Option B | Notes |
|-----------|----------|----------|-------|
| Success criterion 1 (e.g., latency) | 42ms ✅ | 87ms ❌ | A at 1k rps, B saturates earlier |
| Success criterion 2 (e.g., effort) | 1 sprint | 3 sprints | B requires new dependency |
| Fit with architecture | ✅ | ⚠️ Requires port redesign | |
| Risk | low | medium | B unknowns: lib maturity, no LTS |
| Team familiarity | high | low | |

### ADR template

```markdown
# ADR-NNN: {Decision title}

## Status
Accepted / Superseded / Deprecated

## Context
{What problem we faced, what alternatives we considered}

## Decision
{The chosen option}

## Consequences
**Positive:** {gains}
**Negative:** {tradeoffs / debt taken on}

## Spike evidence
{Link to spike branch + key benchmark numbers}
```

### Cleanup
- [ ] Spike branch tagged (`spike/{name}-{date}`) so it can be referenced
- [ ] Spike code NOT merged — production should re-implement properly via `/feature:new`
- [ ] ADR committed to `docs/adr/` (or equivalent)

### Gate
- [ ] Comparison matrix filled with real numbers
- [ ] Recommendation explicit (don't say "both are fine")
- [ ] ADR written
- [ ] Spike branch tagged + NOT merged

---

## Final Report

```markdown
## Spike Complete: {name}

### Question
{From DEFINE}

### Recommendation
**Pick Option {X}** because {top reason backed by spike evidence}

### Evidence
{Benchmark numbers, screenshots, error logs — link to spike branch}

### Next step
- If accepted: `/feature:new` to build it properly
- If rejected: document why + close the question

### Time spent
{Actual vs timebox — note overruns for retrospective}
```

---

## Hard Rules

- **Define before building** — undefined spike = unbounded spike
- **Timebox is sacred** — overrun means the question is wrong, not the answer
- **Throwaway code** — spike branch never merges to main
- **Numbers, not vibes** — recommendation must cite measurements
- **One question per spike** — multiple questions = multiple spikes

---

## Related Skills

| When | Use |
|------|-----|
| Compare options via docs only (no code) | `/research:web` |
| Spike done, ready to implement properly | `/feature:new` |
| Spike revealed a bug to investigate | `/fix:root-cause` |
| Document the ADR as a doc page | `/docs:write` |

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| DEFINE | `@clean-architect` | Frame the question |
| RESEARCH | `@api-designer` | API / integration research |
| RESEARCH | `@db-designer` | Data model research |
| RESEARCH | `@security-audit` | Security implications |
| PROTOTYPE | Stack-specific dev agent | Build the POC |
| EVALUATE | `@clean-architect` | Architecture impact |
| EVALUATE | `@docs-writer` | Write the ADR |
