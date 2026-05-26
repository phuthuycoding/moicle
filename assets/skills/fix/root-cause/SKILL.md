---
name: fix-root-cause
description: Deep bug investigation workflow for hard-to-trace errors. Systematic root cause analysis — no guessing, no blind fixes. Use when user says "deep debug", "deep-debug", "trace bug", "find root cause", "hard bug", "investigate bug".
---

# Deep Bug Investigation

For bugs that have been "fixed" multiple times and keep coming back, intermittent bugs, or errors deep inside vendor code. **Do not guess** — trace step by step.

## When to use this skill

- ✅ Same bug returns after multiple "fixes"
- ✅ "Sometimes works, sometimes doesn't" — likely hidden state
- ✅ Error inside vendor / framework internals
- ✅ Local vs production behavior differs
- ✅ Race condition / concurrency suspected
- ❌ Bug is well understood, just needs a fix → `/fix:hotfix`
- ❌ Production is down with user impact → `/fix:incident` first, then this skill

---

## Workflow

```
COLLECT → VERIFY → TRACE → ROOT CAUSE → CHECK HIDDEN STATE → FIX → VERIFY
```

**Time budget:** if you've traced for >2 hours with no convergence → stop, write down what you know, ask a teammate. Rabbit holes are real.

---

## Step 1: COLLECT — capture evidence exactly

Record **verbatim**, do not interpret:

- Exact error message (copy-paste, don't paraphrase)
- Stack trace: file, line, full call chain
- Affected environment (prod / staging / local)
- Frequency: always / intermittent / specific input / specific user
- Timing: started exactly when? aligns with a deploy / cron / data change?

### Gate
- [ ] Error captured verbatim
- [ ] Stack trace captured (or noted absent)
- [ ] Frequency known
- [ ] Timing noted (helps narrow "what changed")

---

## Step 2: VERIFY — running code = local code?

Do NOT assume prod = local.

- Identify the deployed commit
- `git diff` deployed vs local
- If they differ → read the deployed version before reasoning further
- Container / image involved? Verify the image tag, not just the source

### Gate
- [ ] Deployed commit identified
- [ ] Local checkout matches OR differences understood

---

## Step 3: TRACE — entry to failure, every step

The single most important step. Skip nothing.

### 3a. Entry → error line
- Where does the request / event / job enter? (route, listener, cron, queue handler)
- Which function calls which? Follow stack trace exactly
- How does data flow between layers?

### 3b. Where does faulty data come from?
- Created locally or loaded from DB / API / cache / session?
- Goes through serialize / deserialize?
- Goes through any transform / map / cast?

### 3c. Type + state at the moment of failure
- Actual runtime type (use a debugger or log)
- Expected type
- Why do they differ?

### 3d. Vendor / framework internals
- Open the vendor source at the EXACT line from the stack trace
- Trace backwards: who calls this method, with what args?
- What condition routes execution into the failing branch?

### Debugging tools

Use the right tool, not just `console.log`:

| Tool | When |
|------|------|
| **Debugger breakpoint** | Step through suspect code, inspect locals |
| **Conditional breakpoint** | Stop only when `x == nil` / `id == 42` |
| **Logpoint** (debugger) | Inject log without modifying source — useful in prod-like envs |
| **Memory / heap profiler** | Suspected memory leak or unbounded growth |
| **CPU profiler** | Slow path / hot loop |
| **Network trace** (Wireshark, browser devtools) | Wire-level issue with external API |
| **strace / dtruss** | Syscall-level (file, network) on Unix |
| **Time-travel debugger** (rr, Replay) | Hard non-determinism, race conditions |
| **Distributed tracing** (OpenTelemetry, Jaeger) | Cross-service latency or error origin |

### Gate
- [ ] Full call chain documented
- [ ] Source of faulty data identified
- [ ] Actual vs expected type / state recorded

---

## Step 4: ROOT CAUSE — answer 3 questions

1. **Why does it fail?** — the specific technical cause
2. **Why didn't it fail before?** — what changed (deploy, dep, data shape, config, traffic)
3. **Reproduction conditions?** — exact inputs / state that trigger it

If you cannot answer all 3 → return to Step 3.

### Gate
- [ ] All 3 questions answered with **evidence**, not speculation

---

## Step 5: HIDDEN STATE — check 6 sources

"Sometimes works, sometimes doesn't" bugs live here.

### 5a. Cache / serialization
- Cached object lost transient fields / lazy-loaded properties?
- Stale cache has OLD shape; new code expects NEW shape?
- Serialize / deserialize changes types? (int↔float, null handling, enum↔string, date timezone)

### 5b. Database / storage
- Collation / encoding affecting comparisons (e.g., case-insensitive collation hiding duplicates)?
- DB default values mismatch with code expectations (null vs empty string)?
- Schema on prod vs schema in code (migration not applied)?
- **Read replica lag** — write to primary, read from replica returns stale data?

### 5c. Concurrency / async
- **Race condition** — two requests modifying shared state simultaneously
- **Deadlock / livelock** — lock acquired but never released
- **Goroutine / async leak** — handler returned but background work continues
- **Request context cancelled** while async work depended on it
- **Channel / queue overflow** — messages dropped silently
- Use logs with nanosecond timestamps + request IDs to reconstruct the timeline

### 5d. Runtime / compiled cache
- OPcache / bytecode cache serving old file
- Compiled config / routes / views not cleared after deploy
- CDN / proxy cache serving stale asset
- Browser cache / service worker

### 5e. Environment
- Env vars on prod correct + complete?
- Runtime version (Node 20 vs 18, Go 1.22 vs 1.21) differs from local?
- Dependency versions differ (lockfile drift, transitive update)?

### 5f. Multi-tenancy (SaaS-specific)
- **Tenant ID leak** — query missing `WHERE tenant_id = ?`
- Cache key missing tenant prefix → tenant A sees tenant B's data
- Background job inherits wrong tenant context
- Connection pool reused across tenants without reset

### Gate
- [ ] All 6 categories considered (write N/A if not applicable)
- [ ] At least one category identified as the hidden state source (or explicitly ruled out)

---

## Step 6: FIX

Only after Step 4 is answered. The fix MUST:

- Address **root cause**, not symptom
- Be defensive at **trust boundaries** (cache, DB, external API, user input) — NOT in internal logic
- Handle the specific edge case found, without breaking the normal path
- Be small + reviewable
- Land in the correct layer (per `~/.claude/architecture/ddd-architecture.md`)

### Boundary defense pattern
For data-shape bugs from external sources: validate / coerce at the adapter, not inside business logic.

### Gate
- [ ] Fix targets root cause
- [ ] Defended at the boundary
- [ ] Normal code path not regressed

---

## Step 7: VERIFY

- Reproduce the Step 4 conditions → confirm fix works
- Normal code path still works
- Cache-related → test fresh load AND cached load
- Concurrency-related → reproduce under **load test** (10-100x normal concurrency)
- Verify against the deployed version (repeat Step 2)
- Add a **regression test** in the appropriate layer

### Gate
- [ ] Original failure no longer reproducible
- [ ] Normal flow works
- [ ] Cached / serialized paths both work (if applicable)
- [ ] Load-tested if concurrency-related
- [ ] Regression test added

---

## Final Report

```markdown
## Bug: {short description}

### Root Cause
{Specific technical cause from Step 4 Q1}

### Why it didn't fail before
{What changed: deploy / dependency / data shape / config / traffic / runtime}

### Reproduction
{Exact steps + data + environment}

### Hidden state source
{Cache / DB / Concurrency / Runtime / Env / Multi-tenant — or "none"}

### Fix
- File: `path/to/file:line`
- Layer: {handler / usecase / infra adapter}
- Approach: {boundary defense / type coercion / locking / cache invalidation / etc.}
- Why this is root-cause, not symptom: {explanation}

### Regression test
- File: `path/to/test:line`
- Reproduces the original failure when fix removed

### Verification
- [x] Original failure no longer reproducible
- [x] Normal path works
- [x] Cached path works (if applicable)
- [x] Load tested (if concurrency-related)
```

---

## Hard Rules

- **DO NOT GUESS** — trace evidence, never infer from variable names
- **DO NOT FIX BEFORE UNDERSTANDING** — premature fix = new bug
- **VERIFY DEPLOYED CODE** — never assume prod = local
- **CHECK CACHE FIRST** for intermittent bugs
- **CHECK MULTI-TENANCY** if SaaS-style
- **ONE ROOT CAUSE per bug** — if multiple possibilities remain, trace further
- **TIME-BOX investigation** — if >2 h without convergence, ask for help
- **REGRESSION TEST required** — fix without test = bug returns

---

## Related Skills

| When | Use |
|------|-----|
| Bug is understood, just needs a fix | `/fix:hotfix` |
| Production is down | `/fix:incident` (then this skill after mitigation) |
| Write regression test after fix | `/review:tdd` |
| Research how others solved similar bugs | `/research:web` |

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| Trace | `@code-reviewer` | Independent reading of call chain |
| Hidden state — DB | `@db-designer` | Schema, indexes, collation, replication |
| Hidden state — concurrency | `@perf-optimizer` | Race, deadlock, async leak |
| Hidden state — security/tenancy | `@security-audit` | Tenant isolation, auth context |
| Fix | Stack-specific dev agent | Boundary-defensive fix |
| Verify | `@test-writer` | Regression test |
