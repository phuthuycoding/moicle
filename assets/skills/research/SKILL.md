---
name: research
description: Research solutions on the internet for a given topic or the current conversation context. Use when user says "research", "tìm giải pháp", "search solution", "investigate", "find best practice", "so sánh giải pháp".
args: "[TOPIC]"
---

# Research Solutions

Research solutions on the internet for a specific problem — either from an explicit topic argument or by analyzing the current conversation context.

**ARGUMENTS:** (optional) Topic or question to research. If omitted, analyze the current conversation (recent messages, IDE selection, task at hand) to determine what to research.

---

## Step 1: Identify What to Research

### Mode 1: Argument provided
- Use the argument directly as the research topic.
- If the argument is too broad, narrow it down using project context (stack, architecture, current task) before searching.

### Mode 2: No argument
- Analyze the current conversation: recent messages, IDE file selection, active task
- Identify: what is the user doing, what problem they hit, what solution they need
- **Summarize the problem back to the user and get confirmation** before burning search budget

---

## Step 2: Detect Project Context

Before researching, detect the project's tech stack so results can be filtered for relevance:

| File | Stack |
|------|-------|
| `go.mod` | Go (note version from `go` directive) |
| `package.json` | Node.js — inspect dependencies to pick framework (NestJS / Vite+React / Remix / etc.) |
| `pubspec.yaml` | Flutter / Dart |
| `composer.json` | PHP / Laravel |
| `Cargo.toml` | Rust |
| `pyproject.toml` / `requirements.txt` | Python |

Also check `.claude/architecture/` for the architecture doc in use — this shapes which patterns are idiomatic for the project.

---

## Step 3: Research on the Internet

Use **WebSearch** and **WebFetch** to find solutions.

### Search strategy
1. **Broad first**: Overview, best practices, common approaches
2. **Deep dive**: Read official docs, GitHub issues, Stack Overflow, authoritative blog posts
3. **Compare alternatives**: If multiple solutions exist, list pros/cons of each

### Source priority
1. Official documentation
2. GitHub issues / release notes (for quirks and known-bug context)
3. Stack Overflow (accepted answers with high scores)
4. Authoritative blogs (Anthropic, framework authors, well-known engineers)
5. Recent articles > old articles — prefer results within the last 2 years unless the topic is evergreen

### Search tips
- **Prefer English queries** — results are richer and more recent
- Include library + version when the topic is version-sensitive (e.g., `nestjs 10 typeorm migrations`)
- Cross-validate across at least 2–3 independent sources before concluding
- When results conflict, prefer the most recent + most authoritative source and note the conflict

---

## Step 4: Synthesize Results

Present the findings in this format:

```markdown
## Problem
{Short summary of the problem being solved, with project context — stack, constraints, goal}

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
{Which solution fits best for this project and why — reference architecture doc / stack conventions}

## Code Example (if applicable)
{Minimal snippet showing the recommended approach, adapted to the project's stack and conventions}

## Caveats / Known Issues
- {Gotcha 1}
- {Gotcha 2}

## References
- {link 1} — {what this source gave us}
- {link 2} — {...}
```

---

## Rules

- **Research and propose — do NOT implement.** Wait for user confirmation before touching code.
- **Consider project context:** tech stack, architecture, conventions. A solution that is idiomatic in one project can be wrong in another.
- **Narrow scope when too broad:** if the topic is too wide (e.g., "how to do auth"), ask the user to narrow it (e.g., "JWT refresh flow with NestJS + TypeORM").
- **Flag stale answers:** if the top answers are old (3+ years) and the library has had major versions since, mention it and check release notes.
- **No hallucinated APIs:** if you're uncertain whether a method/option exists, verify in official docs before recommending.
- **Cite sources:** every non-trivial claim should have a link.

---

## When to Use Other Skills Instead

| Situation | Use instead |
|-----------|-------------|
| You're debugging a known bug (not researching options) | `deep-debug` |
| You want to prototype a chosen approach | `spike` |
| You already know the approach and want to implement it | `new-feature` / `hotfix` |
| You want to write up the research as a design doc | `documentation` |
