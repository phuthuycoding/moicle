---
name: research-explore
description: Exploration workflow with three modes — WEB (research solutions on the internet, produce a recommendation with sources), SPIKE (time-boxed prototyping to de-risk a decision by building), ONBOARDING (ramp up on a new codebase: structure, conventions, first commit). Use when user says "research", "tìm giải pháp", "search solution", "investigate", "find best practice", "so sánh giải pháp", "spike", "prototype", "poc", "explore", "explain codebase", "onboard me", "new to project", "understand project", "project overview".
args: "[MODE] [TOPIC]"
---

# Explore Workflow

One skill for the three ways to reduce the unknown: read the web, build a throwaway, or learn a codebase.

## Pick your mode

| Situation | Mode | Jump to |
|-----------|------|---------|
| Don't know the right solution / library / pattern yet — compare via docs | **WEB** | [Mode WEB](#mode-web) |
| Need to validate a technical assumption by **building** a prototype | **SPIKE** | [Mode SPIKE](#mode-spike) |
| Joined / returned to a codebase and need to ramp up | **ONBOARDING** | [Mode ONBOARDING](#mode-onboarding) |

**Flow:** WEB (read) → if still unsure, SPIKE (build to validate) → if accepted, `/feature-build` (NEW) to implement properly.

- ❌ Already know the approach → `/feature-build` (NEW) or `/fix-bug`
- ❌ Debugging a known bug → `/fix-bug` (DEEP mode)
- ❌ Generate a full docs site → `/docs-sync`

## Read the project first (all modes)

Detect stack via `~/.claude/architecture/_shared/stack-detection.md` for commands. Then see `~/.claude/architecture/_shared/read-project-first.md`: let the codebase reveal its own pattern — don't preload a DDD lens. (WEB only needs the stack to filter queries; ONBOARDING's whole job is to discover the *real* pattern, so preloading DDD works against it.)

---
---

# Mode WEB

Research solutions on the web for a specific problem. Output: a written recommendation with sources. **Never implement** — wait for user approval, then hand off to `/feature-build` (NEW) or **Mode SPIKE**.

**ARGUMENTS:** (optional) topic to research. If omitted, infer from current conversation context.

## When to use
- ✅ You don't know the right solution / library / pattern yet
- ✅ Need to compare multiple approaches before committing
- ✅ Stack / framework changed, best practices may have shifted
- ❌ You already know the approach → `/feature-build` (NEW) or `/fix-bug` (QUICK)
- ❌ Want to validate by building → **Mode SPIKE**

## Workflow

```
IDENTIFY → DETECT STACK → SEARCH → SYNTHESIZE → PROPOSE
```

## Step 1: IDENTIFY
- **Arg provided:** use it as the topic; if too broad, narrow using project context before any search.
- **No arg:** analyze conversation (recent messages, open file, task), **summarize the problem back to user, get confirmation** before burning search budget.

### Research budget guide

| Scope | Budget | When to stop |
|-------|--------|--------------|
| Quick lookup (API behavior, error meaning) | 2-3 queries | First authoritative source confirms |
| Solution comparison (2-3 options) | 5-8 queries | Each option has ≥2 independent sources |
| Deep dive (new pattern, unfamiliar domain) | 10-15 queries | Recommendation is defensible |

**Hard cap:** 15 queries without converging → stop, report what's found + ask user to narrow.

### Gate
- [ ] Problem statement confirmed (no-arg mode) · Scope narrow enough · Budget agreed (default 5-8)

## Step 2: DETECT STACK

Capture for filter use: language + version, framework + version, architecture pattern (whatever it is — MVC, CRUD, feature-folder, layered, DDD/hexagonal…), hard constraints (license, runtime, infra).

## Step 3: SEARCH

### Strategy
1. **Broad first** — overview, common approaches, "X vs Y" comparisons
2. **Deep dive** — official docs, GitHub issues, release notes, authoritative blogs
3. **Counter-search** — actively look for criticism / failure stories of the leading option

### Source priority

| Priority | Source | Weight |
|----------|--------|--------|
| 1 | Official docs (current version) | Highest |
| 2 | GitHub issues / release notes (project itself) | High — quirks + known bugs |
| 3 | Stack Overflow accepted answers (high score, recent) | Medium-high |
| 4 | Authoritative blogs (framework authors, well-known engineers) | Medium |
| 5 | Tutorials, course material | Low — risk of outdated patterns |
| 6 | AI-generated content | Skip unless verifiable against #1-#4 |

### Search tips
- **Prefer English queries** — richer index; supplement with framework's primary docs language
- Include library + version when version-sensitive; quote exact error messages
- Cross-validate ≥2 independent sources before concluding

### When sources conflict
1. Different versions? → trust the one matching project version
2. One is official docs? → trust official
3. Different dates, same authority? → trust newest, note the change
4. Same date, different authority? → trust higher-authority per priority table
5. Cannot resolve? → present both, recommend lower-risk, explain trade-off

Always **note the conflict** in the report — don't silently pick one side.

### Gate
- [ ] ≥2 independent sources per option · Sources <2 years old (or evergreen justified) · Counter-search done

## Step 4: SYNTHESIZE

### Comparison matrix (when ≥2 options)

```markdown
| Criterion | Option A | Option B | Option C |
|-----------|----------|----------|----------|
| Maintenance status | active (2025) | last release 2023 | active |
| License | MIT | Apache-2.0 | BSL (commercial) |
| Stack fit ({your stack}) | native | adapter required | native |
| Performance (cite source) | 8k rps (link) | 5k rps | 12k rps |
| Operational complexity | low | medium | high |
| Known issues | #1234 (workaround) | #56 (no fix) | none |
| Migration cost | low | medium | high |
```

### Report template

```markdown
## Problem
{What we're solving, stack, constraints, goal}
## Options Considered
{A, B, C — one line each}
## Comparison
{matrix above}
## Recommendation
**{Option X}** because {1-2 strongest reasons backed by sources}.
Trade-off: {what we give up vs the runner-up}.
## Pseudo-code (NOT for direct implementation)
{Minimal sketch — adapt before shipping}
## Caveats
- {gotcha with source link}
## Conflicts in sources
- {what disagreed, how resolved}
## References
- {url} — {what this gave us}
```

### Gate
- [ ] Recommendation explicit (don't say "both are fine") · Trade-off named
- [ ] Every non-trivial claim has a source link · Pseudo-code marked NOT for copy-paste

## Hard Rules (WEB)
- **Research and propose — do NOT implement.** Wait for user confirmation.
- **Stack context matters** — idiomatic in one project, wrong in another.
- **Narrow when too broad**; **flag stale answers**; **no hallucinated APIs**; **cite every non-trivial claim**; **note conflicts**; **honor the budget** (15 query hard cap).

---
---

# Mode SPIKE

Time-boxed exploration to de-risk a decision by **building** (not just reading). Produces a recommendation + ADR, not production code.

## When to use
- ✅ Need to validate a technical assumption by building
- ✅ Picking between 2+ options and need real comparison
- ✅ De-risking a critical path before committing
- ❌ Want to compare options via docs only → **Mode WEB**
- ❌ Already decided on the approach → `/feature-build` (NEW)

## Workflow

```
DEFINE → RESEARCH → PROTOTYPE → EVALUATE
   ↑                                  │
   └────── timebox expired ───────────┘
```

## Phase 1: DEFINE (15-30 min — never skip)

Lock the question, success criteria, timebox. Without these the spike has no exit condition.

```markdown
## Spike: {short name}
### Question
{ONE specific question — yes/no or "pick A vs B vs C"}
### Why now
{What decision blocks on this? When is it needed?}
### Options on the table
- Option A: {name + 1 line}  · Option B: {name + 1 line}
### Success criteria
- [ ] {Specific, observable — e.g., "P95 latency <50ms at 1k req/s"}
- [ ] {e.g., "Integration with X compiles + 1 test passes"}
### Timebox
- Quick: 2-4h · Standard: 1-2d · Deep: 3-5d (rare — scope likely too big)
### Red flags (stop early if hit)
- Scope creep into productionising · Option breaks the project's existing constraints/conventions · Options converge after 1h
```

### Gate
- [ ] ONE specific question · Success criteria observable · Timebox + red flags written · **User CONFIRMED brief**

## Phase 2: RESEARCH (≤25% of timebox)

Run **Mode WEB** for the topic if you haven't already. Capture: official docs URLs (read them), known gotchas / GitHub issues per option, prior art, constraints from existing stack.

### Gate
- [ ] ≥2 sources per option · Known gotchas listed · Constraints documented

## Phase 3: PROTOTYPE (the bulk of the timebox)

Build the smallest thing that answers the question.

- **Quick and dirty** — no tests beyond what's needed to verify the question
- **One option at a time** — full prototype for A, then for B
- **In a sandbox** — separate branch, never merge to main
- **Time-stamped commits** — `spike: A reaches 1k req/s with sync handler`
- **Stop on red flag** — if scope creeps or hits a wall, don't push through

**"Smallest" means:** skip auth/error-handling/pagination, hardcode config, stub anything not under test, 1-2 happy-path scenarios.

**Stop early when:** all criteria met for one option (don't gold-plate) · all options fail the same criterion (pivot the question) · timebox 75% used and not converging.

### Gate
- [ ] Each option prototyped to answer the question · Success criteria measured (numbers, not vibes) · Findings in spike commits

## Phase 4: EVALUATE

### Comparison matrix

| Criterion | Option A | Option B | Notes |
|-----------|----------|----------|-------|
| Success criterion 1 (latency) | 42ms ✅ | 87ms ❌ | A at 1k rps |
| Success criterion 2 (effort) | 1 sprint | 3 sprints | B needs new dep |
| Fit with existing architecture | ✅ | ⚠️ needs structural change | |
| Risk | low | medium | |

### ADR template

```markdown
# ADR-NNN: {Decision title}
## Status
Accepted / Superseded / Deprecated
## Context
{Problem, alternatives considered}
## Decision
{Chosen option}
## Consequences
**Positive:** {gains}  ·  **Negative:** {tradeoffs / debt}
## Spike evidence
{Link to spike branch + key benchmark numbers}
```

### Cleanup
- [ ] Spike branch tagged (`spike/{name}-{date}`)
- [ ] Spike code NOT merged — production re-implements via `/feature-build` (NEW)
- [ ] ADR committed to `docs/adr/` (or equivalent)

### Gate
- [ ] Matrix filled with real numbers · Recommendation explicit · ADR written · Spike branch tagged + NOT merged

## Hard Rules (SPIKE)
- **Define before building** — undefined spike = unbounded spike.
- **Timebox is sacred** — overrun means the question is wrong, not the answer.
- **Throwaway code** — spike branch never merges to main.
- **Numbers, not vibes** — recommendation cites measurements.
- **One question per spike**.

---
---

# Mode ONBOARDING

Ramp up on a new codebase quickly: structure, conventions, where things live, how to make a first change.

## When to use
- ✅ Just joined a project / repo and need to ramp up
- ✅ Returning to a codebase you haven't touched in months
- ✅ Need to give a teammate a structured walkthrough
- ❌ Want to generate full docs site → `/docs-sync`
- ❌ Need to fix a specific bug → `/fix-bug`

## Workflow

```
SCAN → ANALYZE → EXPLAIN → GUIDE (first commit checklist)
```

## Phase 1: SCAN (10-20 min)

```bash
tree -L 2 -I 'node_modules|vendor|dist|build|.git'
ls -la | grep -E "package.json|pubspec.yaml|go.mod|composer.json|Dockerfile|Makefile"
find . -maxdepth 3 -name "README*" -o -name "CONTRIBUTING*" -o -name "ARCHITECTURE*"
git log --oneline -20
git shortlog -sn --since=3months | head -10
```

**Capture:** top-level layout (≤2 levels), tech stack + main deps, existing docs, active contributors + recent themes.

### Gate
- [ ] Stack detected · Top-level structure understood · Existing docs inventoried

## Phase 2: ANALYZE (30-60 min)

### Read in this order
1. `README.md` — purpose + setup
2. `ARCHITECTURE.md` / `CONTRIBUTING.md` if present
3. **One existing module end-to-end** — the smallest representative one. Trace it through whatever layers the project *actually* has (e.g. MVC: route → controller → model → view → test; feature-folder: the feature's own files; DDD: entity → port → usecase → handler → test).
4. How the pieces are wired together (router / DI / event bus registration, imports — however this project connects things)
5. CI config (`.github/workflows/`, `Makefile`) — what's enforced?

**Capture:** architecture pattern, naming conventions, where business logic lives, how errors are returned, test framework + folder convention, how code reaches prod.

### Gate
- [ ] One module read end-to-end · The project's actual structure understood (layers if it has any) · Test + CI conventions known

## Phase 3: EXPLAIN

Produce a 1-page mental model someone else can read.

```markdown
## Project: {name}
### Purpose
{1-2 sentences: business problem}
### Stack
- Language / Framework / DB / Infra
### Architecture
{1 sentence describing the REAL pattern you saw — e.g. "MVC: fat models, thin controllers" / "feature-folders, hooks + services" / "DDD hexagonal — domain-pure, infra implements ports"}
{ascii or mermaid: diagram of the project's actual structure}
### Main parts
| Module / feature / package | Responsibility |
### Where to find things
Fill "Look in" from the REAL paths you found — these rows are prompts, not a required layout.
| If you need to... | Look in (this project) |
|-------------------|------------------------|
| Add a route / endpoint | `{where routes actually live}` |
| Add business logic | `{where this project puts logic — service / model / usecase…}` |
| Add a DB query | `{where data access lives}` |
| Add a test | `{project's test location + naming}` |
### Conventions
- Error handling / Logging / Config / Branch + commit
### Gotchas
- {anything surprising}
```

### Gate
- [ ] 1-page mental model written · "Where to find things" covers ≥5 tasks · ≥1 gotcha documented

## Phase 4: GUIDE — first commit checklist

Unblock the first real change. Pick a "quick win" (≤30 min, one layer, clear success criterion).

- [ ] Local env runs: build + lint + tests all green from a fresh clone
- [ ] Made the change in the right place (per Phase 3 table)
- [ ] Added or updated 1 test
- [ ] Followed naming + error-handling conventions
- [ ] Commit message matches project style (`git log --oneline`)
- [ ] PR description follows template (`.github/PULL_REQUEST_TEMPLATE.md`)
- [ ] Self-reviewed with `/review-code` (SELF mode) before opening PR

**Who to ask:** architecture → tech lead from git shortlog · domain X → recent committer · infra/deploy → ops contact from README.

### Gate
- [ ] Local env verified · First "quick win" task picked · First-commit checklist printed

## Hard Rules (ONBOARDING)
- **Read one module end-to-end before reading 10 partially** — the trace teaches more than skimming.
- **Capture gotchas as you find them** — they vanish from memory in days.
- **First commit ≤30 min** — bigger first changes get rabbit-holed.
- **Don't refactor on day 1** — earn context before changing conventions.

---
---

## Related Skills

| When | Use |
|------|-----|
| Ready to implement after WEB / SPIKE | `/feature-build` (NEW mode) |
| First bug fix to learn the codebase | `/fix-bug` |
| Write up research / ADR / onboarding doc | `/docs-sync` |
| Generate full doc site after onboarding | `/docs-sync` |
| Self-review first commit | `/review-code` (SELF mode) |

## Recommended Agents

| Mode / Phase | Agent | Purpose |
|--------------|-------|---------|
| WEB search | `@docs-writer` | Frame output as design note |
| WEB synthesize | `@api-designer`, `@security-audit`, `@perf-optimizer` | API / security / perf depth |
| SPIKE define / evaluate | `@clean-architect` | Frame the question + architecture impact |
| SPIKE prototype | Stack-specific dev agent | Build the POC |
| ONBOARDING scan / analyze | `@clean-architect`, `@code-reviewer` | Architecture + conventions |
| EXPLAIN / GUIDE | `@docs-writer` | 1-page overview + first-commit checklist |
