---
name: research-web
description: Research solutions on the internet for a given topic or the current conversation context. Use when user says "research", "tìm giải pháp", "search solution", "investigate", "find best practice", "so sánh giải pháp".
args: "[TOPIC]"
---

# Research Solutions

Research solutions on the web for a specific problem. Output: a written recommendation with sources. **Never implement** — wait for user approval, then hand off to `/feature:new` / `/research:spike`.

**ARGUMENTS:** (optional) topic to research. If omitted, infer from current conversation context.

## When to use this skill

- ✅ You don't know the right solution / library / pattern yet
- ✅ Need to compare multiple approaches before committing
- ✅ Stack / framework changed, best practices may have shifted
- ❌ You already know the approach → `/feature:new` or `/fix:hotfix`
- ❌ Want to validate by building → `/research:spike`
- ❌ Debugging a known bug → `/fix:root-cause`

---

## Workflow

```
IDENTIFY → DETECT STACK → SEARCH → SYNTHESIZE → PROPOSE
```

---

## Step 1: IDENTIFY

### Mode 1 — argument provided
- Use the argument as the topic
- If too broad, narrow using project context **before** any search

### Mode 2 — no argument
- Analyze conversation: recent messages, open file, current task
- **Summarize the problem back to user, get confirmation** before burning search budget

### Research budget guide

| Scope | Budget | When to stop |
|-------|--------|--------------|
| Quick lookup (API behavior, error meaning) | 2-3 queries | First authoritative source confirms |
| Solution comparison (2-3 options) | 5-8 queries | Each option has ≥2 independent sources |
| Deep dive (new pattern, unfamiliar domain) | 10-15 queries | Recommendation is defensible |

**Hard cap:** if you hit 15 queries without converging → stop, report what's found + ask user to narrow.

### Gate
- [ ] Problem statement confirmed (Mode 2)
- [ ] Scope narrow enough to fit in budget
- [ ] Budget agreed (default: 5-8 queries)

---

## Step 2: DETECT STACK

Use `~/.claude/architecture/_shared/stack-detection.md` for canonical detection rules.

Capture for filter use:
- Language + version (e.g., `Go 1.22`, `Node 20`, `Dart 3.4`)
- Framework + version (e.g., `NestJS 10`, `Vite 5`, `Laravel 11`)
- Architecture pattern (DDD / hexagonal / etc. — from project's architecture doc)
- Hard constraints (license, runtime, infra — e.g., "must run on Cloudflare Workers")

### Gate
- [ ] Stack + version identified
- [ ] Architecture context noted
- [ ] Hard constraints captured

---

## Step 3: SEARCH

### Strategy
1. **Broad first** — overview, common approaches, "X vs Y" comparisons
2. **Deep dive** — official docs, GitHub issues, release notes, authoritative blogs
3. **Counter-search** — actively look for criticism / failure stories of the leading option

### Source priority

| Priority | Source | Weight |
|----------|--------|--------|
| 1 | Official docs (current version) | Highest |
| 2 | GitHub issues / release notes (project itself) | High — for quirks + known bugs |
| 3 | Stack Overflow accepted answers (high score, recent) | Medium-high |
| 4 | Authoritative blogs (framework authors, well-known engineers) | Medium |
| 5 | Tutorials, course material | Low — risk of outdated patterns |
| 6 | AI-generated content | Skip unless you can verify against #1-#4 |

### Search tips
- **Prefer English queries** — richer index; supplement with framework's primary docs language (e.g., Vietnamese for niche local libs)
- Include library + version when version-sensitive: `nestjs 10 typeorm migrations`
- Quote exact error messages
- Cross-validate ≥2 independent sources before concluding

### When sources conflict

Decision tree:
1. **Different versions?** → trust the one matching project version
2. **One is official docs?** → trust official
3. **Different dates, same authority?** → trust newest, note the change
4. **Same date, different authority?** → trust higher-authority source per priority table
5. **Cannot resolve?** → present both, recommend the lower-risk option, explain trade-off

Always **note the conflict** in the report — don't silently pick one side.

### Gate
- [ ] ≥2 independent sources per option
- [ ] Sources <2 years old (or evergreen explicitly justified)
- [ ] Counter-search done for the leading option

---

## Step 4: SYNTHESIZE

### Comparison matrix (when ≥2 options)

```markdown
| Criterion | Option A | Option B | Option C |
|-----------|----------|----------|----------|
| Maintenance status | active (releases 2025) | last release 2023 | active |
| License | MIT | Apache-2.0 | BSL (commercial) |
| Stack fit ({your stack}) | native support | adapter required | native |
| Performance (cite source) | 8k rps (link) | 5k rps | 12k rps |
| Operational complexity | low | medium | high |
| Community size | 25k stars | 8k stars | 2k stars |
| Known issues | #1234 (workaround exists) | #56 (no fix) | none |
| Migration cost from current | low | medium | high |
```

### Report template

```markdown
## Problem
{One paragraph: what we're solving, stack, constraints, goal}

## Options Considered
{Brief: A, B, C — one line each on what they are}

## Comparison
{matrix above}

## Recommendation
**{Option X}** because {1-2 strongest reasons backed by sources}.

Trade-off: {what we give up by picking X over the runner-up}.

## Pseudo-code (not for direct implementation)
{Minimal sketch showing how X fits the project — adapt before shipping}

## Caveats
- {gotcha 1 with source link}
- {gotcha 2}

## Conflicts in sources
- {if any — what disagreed, how it was resolved}

## References
- {url} — {what this gave us}
- ...
```

### Gate
- [ ] Recommendation is explicit (don't say "both are fine")
- [ ] Trade-off named (what's lost by picking the winner)
- [ ] Every non-trivial claim has a source link
- [ ] Pseudo-code clearly marked as **not** for direct copy-paste

---

## Hard Rules

- **Research and propose — do NOT implement.** Wait for user confirmation
- **Stack context matters** — idiomatic in one project, wrong in another
- **Narrow when too broad** — "how to do auth" → "JWT refresh flow with NestJS + Passport"
- **Flag stale answers** — if top result is 3+ years old and lib has major versions since, check release notes
- **No hallucinated APIs** — verify method / option exists in official docs
- **Cite every non-trivial claim**
- **Note conflicts** between sources, don't silently pick
- **Honor the budget** — 15 queries is the hard cap

---

## Related Skills

| When | Use |
|------|-----|
| Want to validate the chosen approach by prototyping | `/research:spike` |
| Already know the approach, ready to build | `/feature:new` / `/fix:hotfix` |
| Debugging a known bug | `/fix:root-cause` |
| Write up the research as a design doc / ADR | `/docs:write` |

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| Search | `@docs-writer` | Frame output as design note |
| Synthesize (API topics) | `@api-designer` | API pattern depth |
| Synthesize (auth / crypto / data) | `@security-audit` | Security implications |
| Synthesize (perf-sensitive) | `@perf-optimizer` | Benchmark interpretation |
