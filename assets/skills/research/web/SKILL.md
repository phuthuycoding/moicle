---
name: research-web
description: Research solutions on the internet for a given topic or the current conversation context. Use when user says "research", "tìm giải pháp", "search solution", "investigate", "find best practice", "so sánh giải pháp".
args: "[TOPIC]"
---

# Research Solutions

Research solutions on the internet for a specific problem — from an explicit topic argument or by analyzing the current conversation context. **Research and propose only — do NOT implement.**

**ARGUMENTS:** (optional) Topic or question to research. If omitted, analyze the current conversation (recent messages, IDE selection, task at hand) to determine what to research.

## When to use this skill

- ✅ You don't know the right solution / library / pattern yet
- ✅ Need to compare multiple approaches before committing
- ✅ Stack / framework changed and best practices may have shifted
- ❌ You already know the approach → use `/feature:new` or `/fix:hotfix`
- ❌ You want to validate the approach by building → use `/research:spike`
- ❌ Debugging a known bug → use `/fix:root-cause`

---

## Workflow

```
IDENTIFY → DETECT STACK → SEARCH → SYNTHESIZE → PROPOSE
```

---

## Step 1: Identify what to research

### Mode 1 — Argument provided
- Use the argument directly as the topic
- If too broad, narrow it down using project context (stack, architecture, current task) BEFORE searching

### Mode 2 — No argument
- Analyze the current conversation: recent messages, IDE file selection, active task
- Identify: what is the user doing, what problem they hit, what solution they need
- **Summarize the problem back to the user and get confirmation** before burning search budget

### Gate
- [ ] Problem statement clear and confirmed (Mode 2)
- [ ] Scope narrow enough to research in <10 queries

---

## Step 2: Detect project context

Detect the project's tech stack so results can be filtered for relevance.

| File | Stack |
|------|-------|
| `go.mod` | Go (note version from `go` directive) |
| `package.json` | Node.js — inspect dependencies to pick framework (NestJS / Vite+React / Remix / etc.) |
| `pubspec.yaml` | Flutter / Dart |
| `composer.json` | PHP / Laravel |
| `Cargo.toml` | Rust |
| `pyproject.toml` / `requirements.txt` | Python |

Also check `.claude/architecture/` for the architecture doc in use — this shapes which patterns are idiomatic for the project.

### Gate
- [ ] Stack + version identified
- [ ] Architecture context noted (if any)

---

## Step 3: Search the internet

Use **WebSearch** and **WebFetch**.

### Search strategy
1. **Broad first** — overview, best practices, common approaches
2. **Deep dive** — official docs, GitHub issues, Stack Overflow, authoritative blogs
3. **Compare** — if multiple solutions exist, list pros / cons of each

### Source priority
1. Official documentation
2. GitHub issues / release notes (quirks, known bugs)
3. Stack Overflow (accepted answers with high scores)
4. Authoritative blogs (Anthropic, framework authors, well-known engineers)
5. Recent > old — prefer last 2 years unless evergreen

### Search tips
- **Prefer English queries** — richer, more recent results
- Include library + version when version-sensitive (e.g., `nestjs 10 typeorm migrations`)
- Cross-validate across at least 2–3 independent sources
- When sources conflict, prefer most recent + most authoritative; note the conflict

### Gate
- [ ] At least 2 independent sources for the recommendation
- [ ] Sources are < 2 years old (or "evergreen" justified)

---

## Step 4: Synthesize results

Present findings in this format:

```markdown
## Problem
{Short summary of the problem, with project context — stack, constraints, goal}

## Solutions Found

### Solution 1: {Name}
- **Description:** {How it works}
- **Pros:** {...}
- **Cons:** {...}
- **Fit for this project:** {High / Medium / Low — why}
- **Source:** {link}

### Solution 2: {Name} (if applicable)
- ...

## Recommendation
{Which solution fits best and why — reference architecture doc / stack conventions}

## Code Example (if applicable)
{Minimal snippet showing the recommended approach, adapted to the project's stack}

## Caveats / Known Issues
- {Gotcha 1}
- {Gotcha 2}

## References
- {link 1} — {what this source gave us}
- {link 2} — {...}
```

---

## Hard Rules

- **Research and propose — do NOT implement.** Wait for user confirmation before touching code
- **Consider project context:** stack, architecture, conventions. A solution idiomatic in one project can be wrong in another
- **Narrow scope when too broad:** if the topic is too wide (e.g., "how to do auth"), ask the user to narrow it
- **Flag stale answers:** if top answers are 3+ years old and the library has had major versions since, mention it and check release notes
- **No hallucinated APIs:** if uncertain whether a method / option exists, verify in official docs before recommending
- **Cite sources:** every non-trivial claim should have a link

---

## Related Skills

| When | Use |
|------|-----|
| You want to prototype the chosen approach | `/research:spike` |
| You already know the approach and want to implement | `/feature:new` / `/fix:hotfix` |
| You're debugging a known bug (not researching options) | `/fix:root-cause` |
| You want to write the research up as a design doc | `/docs:write` |

---

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| Search | `@docs-writer` | Frame the research output as a design note |
| Synthesize | `@api-designer` | If researching API patterns |
| Synthesize | `@security-audit` | If researching anything auth / crypto / data handling |
