---
name: deep-debug
description: Deep bug investigation workflow for hard-to-trace errors. Systematic root cause analysis — no guessing, no blind fixes. Use when user says "deep debug", "deep-debug", "trace bug", "find root cause", "hard bug", "investigate bug".
---

# Deep Bug Investigation Workflow

For hard bugs that have been "fixed" multiple times without success. DO NOT guess — trace step by step to the root cause.

## Step 1: Collect evidence

Record exactly, DO NOT interpret:

- Exact error message
- Stack trace: file, line number, call chain
- Which environment is affected (production/staging/local)
- Happens every time or only in certain cases

## Step 2: Verify the code that is actually running

DO NOT assume the code on production = the code on local.

- Identify the exact version/commit currently deployed
- Compare it against the code you are reading locally
- If they DIFFER → read the deployed version before analyzing further

## Step 3: Trace the execution path

This is the most important step. Go from entry point → to the failing line. Trace EVERY step, DO NOT skip.

### 3a. Entry point → Error line

- Where does the request/event/job enter from?
- Which function calls which function? Follow the stack trace exactly.
- How is data passed through each layer?

### 3b. Where does the data at the failing line come from?

- Where is the faulty variable created/loaded from?
- Loaded directly from source (DB, API) or from cache/session?
- Does it go through serialize → unserialize?
- Does it go through any transform/convert?

### 3c. Type & state at the moment of failure

- What is the actual type of the variable? (string, object, null, enum...)
- What type does the code expect?
- Why does the actual type differ from the expected one?

### 3d. Framework internals (when the error is inside vendor/library)

- Read the source code at the EXACT line number from the stack trace
- Trace backwards: who calls that method, and with what arguments
- What condition drives the code into the failing branch

## Step 4: Find the root cause — Answer 3 questions

1. **Why does it fail?** — The specific technical cause
2. **Why didn't it fail before?** — What changed
3. **Reproduction conditions?** — When it fails, when it doesn't

If you can't answer all 3 → go back to Step 3, trace further.

## Step 5: Check hidden state sources

"Sometimes works, sometimes doesn't" bugs are usually caused by hidden state. Check in this order:

### Cache / Serialization

- Does the object pulled from cache lose any internal state? (transient fields, lazy-loaded properties, runtime caches)
- Does stale cache contain the old data format while new code expects the new format?
- Does serialize/unserialize change the type? (int↔float, null handling, enum↔string)

### Database / Storage

- Do collation/encoding affect comparisons?
- Do default values in the DB match the code's expectations?
- Has the schema been updated on production yet?

### Runtime cache / Compiled cache

- Any compiled/cached config, routes, or views that haven't been cleared?
- Does the bytecode cache (OPcache, compiled assets) serve the old file?
- Does CDN/proxy cache serve a stale asset?

### Environment

- Are env vars on production correct/complete?
- Does the runtime version (PHP, Node, Go, Python, etc.) differ from local?
- Do dependency versions differ?

## Step 6: Fix

Only fix once you have answered the 3 questions from Step 4. The fix must:

- Address the root cause, not the symptom
- Handle the edge case discovered (stale cache, type mismatch)
- Be defensive at data boundaries (cache, DB, external API) — not in internal logic
- Not break the normal code path in order to patch an edge case

## Step 7: Verify

- Reproduce the failure conditions from Step 4 → confirm the fix works
- Check the normal code path still works
- If cache-related → test both fresh load and cached load
- Verify against the actually deployed version (repeat Step 2)

## IMPORTANT

- **DO NOT GUESS** — Trace evidence, do not infer from variable names or "maybe it's..."
- **DO NOT FIX BEFORE UNDERSTANDING** — Fixing without knowing the root cause = creating a new bug
- **VERIFY DEPLOYED CODE** — Always check the running version, never assume production = local
- **CHECK CACHE FIRST** — Most "sometimes works, sometimes doesn't" bugs come from stale cached state
- **ONE ROOT CAUSE** — Every bug has one root cause. If multiple possibilities remain → trace further
