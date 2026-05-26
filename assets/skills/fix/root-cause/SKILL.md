---
name: fix-root-cause
description: Deep bug investigation workflow for hard-to-trace errors. Systematic root cause analysis — no guessing, no blind fixes. Use when user says "deep debug", "deep-debug", "trace bug", "find root cause", "hard bug", "investigate bug".
---

# Deep Bug Investigation

For hard bugs that have been "fixed" multiple times without success. **DO NOT guess** — trace step by step to the root cause.

## When to use this skill

- ✅ Same bug keeps coming back after multiple "fixes"
- ✅ "Sometimes works, sometimes doesn't" — likely hidden state
- ✅ Error is inside a vendor library / framework internals
- ✅ Local and production behave differently
- ❌ Bug is well understood and just needs a fix → use `/fix:hotfix`
- ❌ Production is currently down with users impacted → use `/fix:incident` first, deep-debug after mitigation

---

## Workflow

```
COLLECT → VERIFY → TRACE → ROOT CAUSE → CHECK HIDDEN STATE → FIX → VERIFY
```

---

## Step 1: Collect evidence

Record exactly, **do NOT interpret**:

- Exact error message
- Stack trace: file, line number, call chain
- Which environment is affected (production / staging / local)
- Happens every time or only in certain cases

### Gate
- [ ] Error message captured verbatim
- [ ] Stack trace captured (or "no stack trace" noted)
- [ ] Reproduction frequency known

---

## Step 2: Verify the code that is actually running

**DO NOT assume production code = local code.**

- Identify the exact version / commit currently deployed
- Compare it against the code you are reading locally
- If they DIFFER → read the deployed version before analyzing further

### Gate
- [ ] Deployed commit identified
- [ ] Local checkout matches deployed commit (or differences noted)

---

## Step 3: Trace the execution path

The most important step. Go from entry point → failing line. Trace **EVERY** step, **DO NOT skip**.

### 3a. Entry point → error line
- Where does the request / event / job enter from?
- Which function calls which? Follow the stack trace exactly
- How is data passed through each layer?

### 3b. Where does the faulty data come from?
- Where is the faulty variable created / loaded from?
- Loaded directly from source (DB, API) or from cache / session?
- Does it go through serialize → unserialize?
- Does it go through any transform / convert step?

### 3c. Type & state at the moment of failure
- What is the actual type of the variable? (string, object, null, enum...)
- What type does the code expect?
- Why does the actual type differ from the expected one?

### 3d. Framework internals (when error is inside vendor / library)
- Read the source code at the EXACT line number from the stack trace
- Trace backwards: who calls that method, with what arguments?
- What condition drives the code into the failing branch?

### Gate
- [ ] Full call chain from entry → failure documented
- [ ] Source of faulty data identified
- [ ] Actual vs expected type / state recorded

---

## Step 4: Find the root cause — answer 3 questions

1. **Why does it fail?** — the specific technical cause
2. **Why didn't it fail before?** — what changed
3. **Reproduction conditions?** — when it fails, when it doesn't

If you cannot answer all 3 → return to Step 3, trace further.

### Gate
- [ ] All 3 questions answered with evidence (not speculation)

---

## Step 5: Check hidden state sources

"Sometimes works, sometimes doesn't" bugs are usually caused by hidden state. Check in this order:

### Cache / Serialization
- Does the cached object lose internal state? (transient fields, lazy-loaded properties)
- Does stale cache contain the old data format while new code expects the new format?
- Does serialize / unserialize change the type? (int↔float, null handling, enum↔string)

### Database / Storage
- Do collation / encoding affect comparisons?
- Do default values in the DB match the code's expectations?
- Has the schema been updated on production yet?

### Runtime / Compiled cache
- Any compiled / cached config, routes, or views not cleared?
- Does the bytecode cache (OPcache, compiled assets) serve the old file?
- Does CDN / proxy cache serve a stale asset?

### Environment
- Are env vars on production correct and complete?
- Does the runtime version (PHP, Node, Go, Python...) differ from local?
- Do dependency versions differ?

### Gate
- [ ] All 4 categories considered (even if N/A — write that down)

---

## Step 6: Fix

Only fix once you have answered the 3 questions from Step 4. The fix MUST:

- Address the root cause, not the symptom
- Handle the edge case discovered (stale cache, type mismatch)
- Be defensive at data boundaries (cache, DB, external API) — NOT in internal logic
- NOT break the normal code path in order to patch an edge case

### Gate
- [ ] Fix targets root cause, not symptom
- [ ] Normal code path not regressed

---

## Step 7: Verify

- Reproduce the failure conditions from Step 4 → confirm the fix works
- Check the normal code path still works
- If cache-related → test BOTH fresh load and cached load
- Verify against the actually deployed version (repeat Step 2)

### Gate
- [ ] Original failure no longer reproducible
- [ ] Normal flow still works
- [ ] Cached / serialized paths both tested (if applicable)

---

## Final Report

```markdown
## Bug: {short description}

### Root Cause
{Answer to "why does it fail" — the actual technical cause}

### Why it didn't fail before
{What changed: deploy, dependency, data shape, config}

### Reproduction
{Exact steps to reproduce}

### Fix
- File: `path/to/file:line`
- Change: {what changed and why this addresses root cause, not symptom}

### Hidden state source
{Cache / Storage / Runtime / Env — or "none"}

### Verification
- [x] Original failure no longer reproducible
- [x] Normal path works
- [x] Cached path works (if applicable)
```

---

## Hard Rules

- **DO NOT GUESS** — trace evidence, do not infer from variable names or "maybe it's..."
- **DO NOT FIX BEFORE UNDERSTANDING** — fixing without knowing the root cause = creating a new bug
- **VERIFY DEPLOYED CODE** — always check the running version, never assume production = local
- **CHECK CACHE FIRST** — most "sometimes works, sometimes doesn't" bugs come from stale cached state
- **ONE ROOT CAUSE** — every bug has one root cause. If multiple possibilities remain → trace further

---

## Related Skills

| When | Use |
|------|-----|
| Bug is understood, just needs a fix | `/fix:hotfix` |
| Production is down, users impacted | `/fix:incident` |
| Need to write a regression test after the fix | `/review:tdd` |
| Need to research how others solved similar bugs | `/research:web` |

---

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| Step 3 (trace) | `@code-reviewer` | Independent reading of call chain |
| Step 5 (hidden state) | `@db-designer` | Schema / collation / index checks |
| Step 6 (fix) | Stack-specific dev agent | Implement defensive fix at boundary |
| Step 7 (verify) | `@test-writer` | Regression test for the failing condition |
