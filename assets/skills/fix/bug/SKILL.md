---
name: fix-bug
description: Bug fixing workflow with two depths — QUICK (fast fix + rollback plan when cause is clear) and DEEP (systematic root-cause investigation for hard, intermittent, or recurring bugs). Use when fixing bugs, hotfixes, urgent issues, production bugs, or when user says "fix bug", "hotfix", "urgent fix", "production issue", "deep debug", "deep-debug", "trace bug", "find root cause", "hard bug", "investigate bug".
args: "[MODE]"
---

# Bug Fix Workflow

One skill, two depths. Start in **QUICK** when the cause is clear; escalate to **DEEP** when it isn't.

## Pick your mode

| Situation | Mode | Jump to |
|-----------|------|---------|
| Bug is reproducible and root cause is clear (or identifiable in <1h) | **QUICK** | [Mode QUICK](#mode-quick) |
| Bug keeps returning after "fixes", intermittent, vendor internals, race condition, prod ≠ local | **DEEP** | [Mode DEEP](#mode-deep) |

**Escalation rule:** if in QUICK mode the 5 Whys don't converge, or repro fails because it's environment/state-specific → switch to DEEP.

- ❌ Production is down right now → use `/fix-incident` first (triage + comms), then come back here.
- ❌ Bug is on an open PR review → use `/review-code` (ADDRESS mode).
- ❌ Building a new feature → use `/feature-build` (NEW mode).

## Read Architecture First (both modes)

Read `ddd-architecture.md` + the stack-specific doc — the fix must land in the right layer (usecase / handler / infra) per architecture rules. Severity definitions: `~/.claude/architecture/_shared/severity-levels.md` (incident table). QUICK typically covers P2-P4; P1 → start with `/fix-incident`.

---
---

# Mode QUICK

Fast-track bug fix with a rollback plan. Use when the cause is identifiable in under an hour of investigation.

## When to use

- ✅ Bug is reproducible and root cause is clear (or quickly identifiable)
- ✅ Need a fix shipped fast with a rollback plan
- ✅ Severity ranges from low (minor UI) to high (feature broken)
- ❌ Production is down right now → use `/fix-incident` first
- ❌ Bug has been "fixed" multiple times and keeps returning → switch to **Mode DEEP**

## Workflow

```
IDENTIFY → REPRODUCE → FIX → VERIFY → DEPLOY
                          ↑                ↓
                          └── ROLLBACK (if needed)
```

## Phase 1: IDENTIFY (≤15 min)

**Goal:** capture exactly what's broken — no speculation.

### Capture
- Error message / stack trace (verbatim)
- Steps to reproduce
- Expected vs actual behavior
- Environment (prod / staging / dev)
- Affected users (all / subset / specific tenant)
- Recent deploys / config changes (last 24-48h)

### 5 Whys (worked example)
> Q1: Why does checkout fail? A1: `OrderService.calculate` returns NaN.
> Q2: Why NaN? A2: `quantity * price` where price is undefined.
> Q3: Why undefined? A3: New SKUs from supplier feed have null price.
> Q4: Why null? A4: Feed schema added optional `price` field, defaulted to null.
> Q5: Why didn't validation catch it? A5: Import worker skips schema validation for "perf".

→ Root cause: skipped validation in import worker. Fix at the import boundary, not in checkout.

### Gate
- [ ] Error captured verbatim
- [ ] Reproduction steps known (or "intermittent" noted)
- [ ] Severity assigned (P2 / P3 / P4)
- [ ] Root cause identified (switch to **Mode DEEP** if 5 Whys doesn't converge)

## Phase 2: REPRODUCE (≤30 min)

**Goal:** reproduce locally before changing any code.

### Steps
1. Check out the deployed commit (NOT main if main has drifted)
2. Reproduce with the exact data / inputs from Phase 1
3. If you can't reproduce → it's environment-specific. Check:
   - Env vars on prod vs local
   - DB state / data shape
   - Cache / CDN state
   - Runtime version differences

### Gate
- [ ] Reproduced locally on the deployed commit
- [ ] OR documented why local reproduction is impossible + plan to test on staging

## Phase 3: FIX

**Goal:** smallest correct change at the right layer.

### Rules
- Fix at the **root cause**, not the symptom
- Land the fix in the right layer (boundary validation → handler/DTO; business rule → usecase; data shape → infra mapper)
- **Add a regression test first** (RED), then make it pass (GREEN). See `/review-code` (TDD mode).
- Don't refactor on the fix — separate PR
- If the fix requires schema migration, plan it as 2 deploys (compatible code first, then migration)

### Boundary defense
For data-shape bugs (null where not expected, type mismatch from external API): defend at the **trust boundary** (handler / adapter), not inside business logic.

### Gate
- [ ] Regression test added (red → green)
- [ ] Fix is in the right layer (per architecture)
- [ ] No unrelated changes in the PR
- [ ] Existing tests still pass

## Phase 4: VERIFY

**Goal:** confirm fix works without breaking other paths.

### Local
- [ ] Original failure no longer reproducible
- [ ] All tests pass (`{test command}`)
- [ ] Linter clean
- [ ] Build green

### Staging (if available)
- [ ] Deploy to staging
- [ ] Reproduce the failure scenario — should pass
- [ ] Smoke-test adjacent features (anything sharing the code path)
- [ ] Monitor logs for 5-15 min

### Gate
- [ ] Local + staging both verified
- [ ] No regressions in adjacent features

## Phase 5: DEPLOY

### Pre-deploy checklist
- [ ] PR reviewed (`/review-code` SELF + a teammate's PR review)
- [ ] Rollback plan documented (see below)
- [ ] On-call notified
- [ ] CHANGELOG entry

### Rollback plan
Document **before** deploying:
- Rollback method: `revert PR` / `redeploy commit {sha}` / `feature flag off` / `DB migration down`
- Estimated rollback time
- Who has authority to roll back (usually IC or on-call)
- Signal to roll back (specific metric + threshold)

### Deploy steps
1. Deploy via normal pipeline (don't skip CI even under pressure)
2. Watch metrics + logs for the symptom + adjacent code paths
3. Hold deploy attention for at least 1× normal request cycle (15-30 min)

### Gate
- [ ] Deployed successfully
- [ ] Symptom no longer occurring
- [ ] No new errors in monitoring
- [ ] Stakeholders notified

## Phase 6: ROLLBACK (if Phase 5 verify fails)

### When to roll back
- Error rate increases post-deploy
- New error type appears
- Adjacent feature breaks
- Performance degrades meaningfully

### How
1. Announce: "Rolling back {fix} in 60s due to {observation}"
2. Execute: revert / redeploy previous / flip flag / migration down
3. Verify rollback: metrics return to baseline
4. Post-mortem the rollback — what was missed in Phase 3/4?

## Final Report (QUICK)

```markdown
## Hotfix: {short description}

### Root cause
{From Phase 1, 5 Whys final answer}

### Fix
- File: `path/to/file:line`  · Layer: {handler / usecase / infra}
- Approach: {boundary defense / logic correction / data migration}

### Tests
- Regression test: {file:line} — all tests passing

### Deploy
- Deployed: {timestamp}  · Verified: {timestamp + how}
- Rollback plan: {revert / redeploy / flag / migration}

### Severity: {P2 / P3 / P4}  ·  Status: SHIPPED ✅ (or ROLLED BACK + reason)
```

---
---

# Mode DEEP

For bugs that have been "fixed" multiple times and keep coming back, intermittent bugs, or errors deep inside vendor code. **Do not guess** — trace step by step.

## When to use

- ✅ Same bug returns after multiple "fixes"
- ✅ "Sometimes works, sometimes doesn't" — likely hidden state
- ✅ Error inside vendor / framework internals
- ✅ Local vs production behavior differs
- ✅ Race condition / concurrency suspected
- ❌ Bug is well understood, just needs a fix → **Mode QUICK**
- ❌ Production is down with user impact → `/fix-incident` first, then this mode

## Workflow

```
COLLECT → VERIFY → TRACE → ROOT CAUSE → CHECK HIDDEN STATE → FIX → VERIFY
```

**Time budget:** if you've traced for >2 hours with no convergence → stop, write down what you know, ask a teammate. Rabbit holes are real.

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

## Step 2: VERIFY — running code = local code?

Do NOT assume prod = local.

- Identify the deployed commit
- `git diff` deployed vs local
- If they differ → read the deployed version before reasoning further
- Container / image involved? Verify the image tag, not just the source

### Gate
- [ ] Deployed commit identified
- [ ] Local checkout matches OR differences understood

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

## Step 4: ROOT CAUSE — answer 3 questions

1. **Why does it fail?** — the specific technical cause
2. **Why didn't it fail before?** — what changed (deploy, dep, data shape, config, traffic)
3. **Reproduction conditions?** — exact inputs / state that trigger it

If you cannot answer all 3 → return to Step 3.

### Gate
- [ ] All 3 questions answered with **evidence**, not speculation

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

## Final Report (DEEP)

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
- File: `path/to/file:line`  · Layer: {handler / usecase / infra adapter}
- Approach: {boundary defense / type coercion / locking / cache invalidation / etc.}
- Why this is root-cause, not symptom: {explanation}

### Regression test
- File: `path/to/test:line` — reproduces the original failure when fix removed

### Verification
- [x] Original failure no longer reproducible  [x] Normal path works
- [x] Cached path works (if applicable)  [x] Load tested (if concurrency-related)
```

---
---

## Hard Rules (both modes)

- **Reproduce before fixing** — no fix lands without local repro (or a documented reason + staging plan).
- **DO NOT GUESS / DO NOT FIX BEFORE UNDERSTANDING** — trace evidence, never infer from variable names; premature fix = new bug.
- **VERIFY DEPLOYED CODE** — never assume prod = local.
- **Fix at the root, not the symptom** — patching the symptom invites the bug back; defend at trust boundaries.
- **Regression test required** — every fix gets a test that would have caught it.
- **No drive-by refactor** — fix PR is focused; refactor goes in a separate PR.
- **Always have a rollback plan** documented before deploy; don't skip CI under pressure.
- **DEEP specifics:** check cache first for intermittent bugs; check multi-tenancy if SaaS; one root cause per bug; time-box investigation to ~2h before asking for help.

## Related Skills

| When | Use |
|------|-----|
| Production is down right now | `/fix-incident` first, then this skill |
| Bug is on an open PR | `/review-code` (ADDRESS mode) |
| Need to write regression test first | `/review-code` (TDD mode) |
| Self-review before opening PR | `/review-code` (SELF mode) |
| Research how others solved similar bugs | `/research-explore` (WEB mode) |

## Recommended Agents

| Phase / Mode | Agent | Purpose |
|--------------|-------|---------|
| IDENTIFY / TRACE | Stack-specific dev agent, `@code-reviewer` | Read error context / independent call-chain reading |
| Hidden state — DB | `@db-designer` | Schema, indexes, collation, replication |
| Hidden state — concurrency | `@perf-optimizer` | Race, deadlock, async leak |
| Hidden state — security/tenancy | `@security-audit` | Tenant isolation, auth context |
| FIX | Stack-specific dev agent, `@security-audit` | Boundary-defensive fix / security bugs |
| VERIFY | `@test-writer`, `@code-reviewer` | Regression test + quick review |
| DEPLOY | `@devops` | CI/CD + monitoring |
